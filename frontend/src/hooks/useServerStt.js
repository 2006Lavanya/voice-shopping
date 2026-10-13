import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api.js";

/**
 * Optional push-to-talk recording that is transcribed by the backend (POST /api/assistant/transcribe), which
 * detects the spoken language itself (Tamil / English / Tanglish). Used when:
 *   - the backend has STT_API_KEY configured (GET /api/assistant/capabilities), AND
 *   - the language is "Auto", or the browser has no built-in speech recognition (Firefox, Safari ...).
 * No API key is ever in the browser. Recording stops by itself after a short silence.
 */
const SILENCE_MS = 1300; // stop this long after the shopper stops talking
const MAX_MS = 12000;
const NO_SPEECH_MS = 6000;
const LEVEL = 0.02;

const pickMime = () => ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";

const useServerStt = ({ onResult, onError } = {}) => {
  const [available, setAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const recorderRef = useRef(null);
  const resourcesRef = useRef({ stream: null, ctx: null, raf: 0 });
  const cbRef = useRef({ onResult, onError });
  cbRef.current = { onResult, onError };

  useEffect(() => {
    let alive = true;
    const capable = typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
    if (!capable) return undefined;
    api
      .get("/assistant/capabilities")
      .then(({ data }) => alive && setAvailable(Boolean(data?.serverStt)))
      .catch(() => {}); // backend without the feature / offline: simply stay unavailable
    return () => {
      alive = false;
    };
  }, []);

  const release = useCallback(() => {
    const r = resourcesRef.current;
    cancelAnimationFrame(r.raf);
    r.stream?.getTracks().forEach((t) => t.stop());
    try {
      r.ctx?.close();
    } catch {
      /* ignore */
    }
    resourcesRef.current = { stream: null, ctx: null, raf: 0 };
  }, []);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      cbRef.current.onError?.(err?.name === "NotAllowedError" ? "not-allowed" : "audio-capture");
      return;
    }
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    let heardSpeech = false;
    rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
    rec.onstop = async () => {
      release();
      setIsRecording(false);
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      if (!heardSpeech || blob.size < 1500) return cbRef.current.onError?.("no-speech");
      setIsUploading(true);
      try {
        const { data } = await api.post("/assistant/transcribe", blob, { headers: { "Content-Type": blob.type.split(";")[0] || "audio/webm" } });
        if (!data?.text?.trim()) cbRef.current.onError?.("no-speech");
        else cbRef.current.onResult?.(data);
      } catch (err) {
        cbRef.current.onError?.(err.response?.status === 503 ? "stt-unavailable" : "network");
      } finally {
        setIsUploading(false);
      }
    };
    recorderRef.current = rec;
    resourcesRef.current.stream = stream;

    // simple voice-activity detection: stop after a pause that follows speech
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      resourcesRef.current.ctx = ctx;
      const buf = new Float32Array(analyser.fftSize);
      const startedAt = Date.now();
      let lastVoice = startedAt;
      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const rms = Math.sqrt(buf.reduce((a, b) => a + b * b, 0) / buf.length);
        const now = Date.now();
        if (rms > LEVEL) {
          heardSpeech = true;
          lastVoice = now;
        }
        const quiet = now - lastVoice;
        if ((heardSpeech && quiet > SILENCE_MS) || now - startedAt > MAX_MS || (!heardSpeech && now - startedAt > NO_SPEECH_MS)) return stop();
        resourcesRef.current.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      heardSpeech = true; // no audio analysis available: rely on the manual stop button / MAX_MS timer
      window.setTimeout(stop, MAX_MS);
    }
    rec.start();
    setIsRecording(true);
  }, [release, stop]);

  useEffect(() => () => {
    try {
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    release();
  }, [release]);

  return { available, isRecording, isUploading, start, stop };
};

export default useServerStt;

import { useState, useRef, useCallback, useEffect } from "react";
import { describeSpeechError, guessSpeechLang, hasTamil, pickVoice, splitBySpeechLanguage, toSpeakable } from "../utils/speech.js";

/**
 * Custom hook wrapping the browser's Web Speech API (SpeechRecognition) and
 * SpeechSynthesis for a full voice-in / voice-out experience.
 * Handles: start/stop listening, live transcript, language switching ("auto" follows the language the
 * shopper last spoke), recognition confidence, specific error messages, unsupported-browser fallback and
 * speaking responses back to the user with the right Tamil / English voice.
 *
 * @param language  BCP-47 code ("en-IN", "ta-IN" ...) or "auto"
 * @param options   { autoLang }  recognition language to use while language === "auto"
 */
const useVoiceRecognition = (language = "en-US", { autoLang = "en-IN" } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [missingVoice, setMissingVoice] = useState(null); // e.g. "ta-IN" when the device has no Tamil voice
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  const recLang = language === "auto" ? autoLang : language;

  // Voices load asynchronously in Chrome; keep the list fresh so Tamil / English voices can be chosen.
  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return undefined;
    const load = () => {
      voicesRef.current = synth.getVoices() || [];
    };
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => synth.removeEventListener?.("voiceschanged", load);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = recLang;

    recognition.onresult = (event) => {
      let text = "";
      let conf = null;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        if (event.results[i].isFinal && typeof event.results[i][0].confidence === "number") conf = event.results[i][0].confidence;
      }
      setTranscript(text);
      if (conf !== null) setConfidence(conf);
    };

    recognition.onerror = (event) => {
      setError(describeSpeechError(event.error, recLang.startsWith("ta") ? "ta" : "en"));
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    };
  }, [recLang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    setConfidence(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // recognition might already be running - ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
  }, []);

  // Speaks text aloud. Returns a promise that resolves when speech has FINISHED
  // (hands-free mode waits for it so the mic never hears the assistant).
  // Mixed Tamil + English sentences are spoken in runs: Tamil words with a Tamil voice, product names / brands
  // with an English voice, so "iPhone 15" is not read letter by letter by a Tamil voice.
  const speak = useCallback(
    (text, langOverride) =>
      new Promise((resolve) => {
        const synth = window.speechSynthesis;
        if (!synth || !text) return resolve();
        try {
          const main = langOverride || (language === "auto" ? guessSpeechLang(text, autoLang) : language);
          const spoken = toSpeakable(text, main);
          if (!spoken) return resolve();
          // Tamil text is split by script; any other language is spoken as one piece in that language.
          const segments = hasTamil(spoken) ? splitBySpeechLanguage(spoken) : [{ lang: /^ta/.test(main) ? "en-IN" : main, text: spoken }];

          synth.cancel();
          const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices() || [];
          let missing = null;
          let done = false;
          let timer;
          const finish = () => {
            if (done) return;
            done = true;
            window.clearTimeout(timer);
            resolve();
          };
          const speakAt = (i) => {
            if (done) return;
            if (i >= segments.length) return finish();
            const seg = segments[i];
            const utterance = new SpeechSynthesisUtterance(seg.text);
            utterance.lang = seg.lang;
            utterance.rate = seg.lang.startsWith("ta") ? 0.95 : 1;
            const voice = pickVoice(voices, seg.lang);
            if (voice) utterance.voice = voice;
            else if (voices.length && seg.lang.startsWith("ta")) missing = seg.lang;
            utterance.onend = () => speakAt(i + 1);
            utterance.onerror = finish; // cancelled / interrupted: stop the whole queue
            synth.speak(utterance);
          };
          setMissingVoice(null);
          timer = window.setTimeout(finish, Math.min(30000, 2500 + spoken.length * 110)); // safety net
          speakAt(0);
          if (missing) setMissingVoice(missing);
        } catch {
          resolve();
        }
      }),
    [language, autoLang]
  );

  return { isListening, transcript, confidence, error, setError, isSupported, missingVoice, startListening, stopListening, speak, setTranscript };
};

export default useVoiceRecognition;

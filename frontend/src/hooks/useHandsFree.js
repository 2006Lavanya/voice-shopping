import { useCallback, useEffect, useRef, useState } from "react";
import { describeSpeechError, isDuplicateCommand } from "../utils/speech.js";

const DUPLICATE_WINDOW_MS = 2500;
const NO_SPEECH_BEFORE_FLIP = 2;

/**
 * Continuous hands-free speech recognition.
 *
 * - The browser needs ONE click (Start Hands-Free) to grant the microphone.
 * - After that it keeps listening, even while you navigate between pages (the hook lives in the
 *   global VoiceProvider, not in a page).
 * - While a command is being processed AND the assistant is speaking its answer, the mic is paused
 *   (so it never hears itself), then it resumes automatically when onCommand's promise settles.
 * - language "auto": listens in `autoLang` (Tamil or English, whichever the shopper used last) and switches to the
 *   other one after repeated silence, via options.onFlipLang(). The browser can only listen in one language at a time.
 * - The same sentence arriving twice (Chrome re-emits results) is ignored, and so is anything options.shouldIgnore()
 *   says is the assistant's own voice picked up by the microphone.
 * - onCommand(text, { confidence, source }) - confidence is the recogniser's own score (0 / null = unknown).
 */
const useHandsFree = (language = "en-IN", onCommand, { autoLang = "en-IN", onFlipLang, shouldIgnore, uiLanguage = "en" } = {}) => {
  const recRef = useRef(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const listeningRef = useRef(false);
  const timerRef = useRef(null);
  const effective = language === "auto" ? autoLang : language;
  const langRef = useRef(effective);
  const onCommandRef = useRef(onCommand);
  const flipRef = useRef(onFlipLang);
  const ignoreRef = useRef(shouldIgnore);
  const uiLangRef = useRef(uiLanguage);
  const autoRef = useRef(language === "auto");
  const noSpeechRef = useRef(0);
  const lastCommandRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    onCommandRef.current = onCommand;
    flipRef.current = onFlipLang;
    ignoreRef.current = shouldIgnore;
    uiLangRef.current = uiLanguage;
    autoRef.current = language === "auto";
  }, [onCommand, onFlipLang, shouldIgnore, uiLanguage, language]);

  const scheduleStart = useCallback((delay = 400) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const rec = recRef.current;
      if (!rec || !activeRef.current || busyRef.current || listeningRef.current) return;
      try {
        rec.lang = langRef.current;
        rec.start();
      } catch {
        // "already started" - the watchdog / next onend will retry
        scheduleStart(600);
      }
    }, delay);
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return undefined;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = langRef.current;

    rec.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event) => {
      if (busyRef.current) return;
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalText += ` ${text}`;
        else interim += text;
      }
      const command = finalText.trim();
      if (command) {
        noSpeechRef.current = 0;
        // Chrome sometimes re-emits the same final result, and the mic can hear the assistant's own voice: ignore both.
        if (isDuplicateCommand(lastCommandRef.current, command, DUPLICATE_WINDOW_MS) || ignoreRef.current?.(command)) {
          setTranscript("");
          return;
        }
        lastCommandRef.current = { text: command, at: Date.now() };
        let confidence = null;
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal && typeof event.results[i][0]?.confidence === "number" && event.results[i][0].confidence > 0) confidence = event.results[i][0].confidence;
        }
        busyRef.current = true;
        setIsBusy(true);
        setTranscript(command);
        try {
          rec.stop(); // pause the mic while we think + speak
        } catch {
          /* ignore */
        }
        Promise.resolve()
          .then(() => onCommandRef.current?.(command, { confidence, source: "handsfree" }))
          .catch(() => {})
          .finally(() => {
            busyRef.current = false;
            setIsBusy(false);
            scheduleStart(500);
          });
      } else if (interim.trim()) {
        setTranscript(interim.trim());
      }
    };

    rec.onerror = (event) => {
      const ui = uiLangRef.current === "ta" ? "ta" : "en";
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        // Heard nothing in this language for a while: in auto mode try the other language (Tamil <-> English).
        noSpeechRef.current += 1;
        if (autoRef.current && noSpeechRef.current >= NO_SPEECH_BEFORE_FLIP) {
          noSpeechRef.current = 0;
          flipRef.current?.();
        }
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        activeRef.current = false;
        setIsActive(false);
        setError(describeSpeechError(event.error, ui));
        return;
      }
      if (event.error === "network") {
        setError(`${describeSpeechError("network", ui)} ${ui === "ta" ? "மீண்டும் முயற்சிக்கிறேன்..." : "Retrying..."}`);
        return;
      }
      setError(describeSpeechError(event.error, ui));
    };

    rec.onend = () => {
      listeningRef.current = false;
      setIsListening(false);
      if (activeRef.current && !busyRef.current) scheduleStart(350);
    };

    recRef.current = rec;

    // Watchdog: Chrome sometimes ends recognition silently - make sure we are always listening when active.
    const watchdog = window.setInterval(() => {
      if (activeRef.current && !busyRef.current && !listeningRef.current) scheduleStart(100);
    }, 4000);

    return () => {
      window.clearInterval(watchdog);
      window.clearTimeout(timerRef.current);
      rec.onstart = rec.onresult = rec.onerror = rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
      listeningRef.current = false;
    };
  }, [scheduleStart]);

  // Language changed (picked, or "auto" switched Tamil <-> English): restart recognition so it is used (stays active).
  useEffect(() => {
    langRef.current = effective;
    if (activeRef.current && recRef.current && listeningRef.current) {
      try {
        recRef.current.stop(); // onend restarts it with the new language
      } catch {
        /* ignore */
      }
    }
  }, [effective]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setError(null);
    setTranscript("");
    noSpeechRef.current = 0;
    activeRef.current = true;
    setIsActive(true);
    if (!listeningRef.current && !busyRef.current) {
      try {
        recRef.current.lang = langRef.current;
        recRef.current.start();
      } catch {
        scheduleStart(300);
      }
    }
  }, [scheduleStart]);

  const stop = useCallback(() => {
    activeRef.current = false;
    busyRef.current = false;
    setIsActive(false);
    setIsBusy(false);
    setIsListening(false);
    window.clearTimeout(timerRef.current);
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  return { isActive, isListening, isBusy, transcript, error, isSupported, start, stop };
};

export default useHandsFree;

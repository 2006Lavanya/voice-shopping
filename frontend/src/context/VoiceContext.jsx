import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useVoiceRecognition from "../hooks/useVoiceRecognition.js";
import useHandsFree from "../hooks/useHandsFree.js";
import useServerStt from "../hooks/useServerStt.js";
import { describeSpeechError, isEcho } from "../utils/speech.js";
import { VOICE_LANGUAGES } from "../services/voiceCommandService.js";
import api from "../services/api.js";
import { useCart } from "./CartContext.jsx";
import { useWishlist } from "./WishlistContext.jsx";
import { useTheme } from "./ThemeContext.jsx";
import { useI18n } from "./I18nContext.jsx";

const VoiceContext = createContext(null);

// Central place that wires the voice recognition hook + the backend AI assistant
// together, so any component (navbar mic, floating assistant, voice search page,
// or the text chatbot widget) can send a message through the exact same pipeline
// and get a reply in whatever language the user is speaking/typing.
//
// The actual "understanding" (intent detection, multilingual matching, cart/wishlist
// actions, FAQ answers) happens on the backend at POST /api/assistant/message - see
// backend/src/services/assistantEngine.js. The frontend's job is just to: capture
// speech/text, send it, show + speak the reply, and refresh local state (cart/wishlist)
// if the backend tells us an action happened.
export const VoiceProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();
  const { fetchWishlist } = useWishlist();
  const { setMode, setAccent, openThemePanel } = useTheme();
  const { lang: uiLang, setLang: setUiLang } = useI18n();

  // "auto" (default): no manual language choice needed - the reply follows what the shopper says, and the
  // recogniser follows the language they used last (Tamil <-> English).
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("voiceshop_lang") || "auto";
    } catch {
      return "auto";
    }
  });
  const [autoLang, setAutoLang] = useState(() => (uiLang === "ta" ? "ta-IN" : "en-IN"));
  const flipAutoLang = useCallback(() => setAutoLang((prev) => (prev === "ta-IN" ? "en-IN" : "ta-IN")), []);
  const languageRef = useRef(language);
  languageRef.current = language;
  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    try {
      localStorage.setItem("voiceshop_lang", code);
    } catch {
      /* ignore */
    }
  }, []);
  // Pages (e.g. Checkout) can register handlers so voice can drive them:
  //   intercept(text) -> string | undefined   (runs BEFORE the backend; used for dictation such as address entry)
  //   onAction(uiAction) -> string | undefined (runs for actions the backend returns; the string is spoken)
  const uiHandlersRef = useRef(new Set());
  const registerUiHandler = useCallback((handler) => {
    uiHandlersRef.current.add(handler);
    return () => uiHandlersRef.current.delete(handler);
  }, []);

  // Choosing a site language also switches the speech-recognition language
  // (English -> en-IN, Tamil -> ta-IN, Tanglish -> en-IN, because Tanglish is spoken/typed with English letters).
  const uiLangRef = useRef(uiLang);
  useEffect(() => {
    if (uiLangRef.current === uiLang) return;
    uiLangRef.current = uiLang;
    if (languageRef.current === "auto") {
      setAutoLang(uiLang === "ta" ? "ta-IN" : "en-IN");
      return;
    }
    setLanguage(uiLang === "ta" ? "ta-IN" : "en-IN");
  }, [uiLang, setLanguage]);

  const [visibleProductIds, setVisibleProductIds] = useState([]); // products currently on screen (for "add the second one")
  const stopHandsFreeRef = useRef(() => {});
  const contextRef = useRef({});
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | listening | processing | responded
  const [lastResponse, setLastResponse] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // {from: "user"|"assistant", text}[]
  const [localError, setLocalError] = useState(null);

  // Conversation memory sent with every command so follow-ups work ("yes", "the second one", "under 50000", "this").
  const pendingRef = useRef(null); // a question we asked and are waiting for an answer to
  const focusRef = useRef(null); // { id, at }  the product we were just talking about
  const lastSearchRef = useRef(null); // { data, at } the last search (terms + price) for follow-ups
  const lastStyleRef = useRef(null); // "en" | "ta" | "tl"  language of the last reply
  const lastSpokenRef = useRef(null); // { text, at }  what the assistant last said aloud (echo protection)
  const statusRef = useRef("idle");

  const { isListening, transcript, confidence, error, isSupported, missingVoice, startListening, stopListening, speak, setTranscript } =
    useVoiceRecognition(language, { autoLang });

  // What the shopper is looking at - sent with every command so "add THIS to cart" works.
  useEffect(() => {
    const m = location.pathname.match(/^\/products\/([a-f0-9]{24})/i);
    contextRef.current = {
      productId: m ? m[1] : null,
      lastProductIds: visibleProductIds.length ? visibleProductIds : (searchResults || []).map((p) => p._id),
      path: location.pathname,
    };
  }, [location.pathname, visibleProductIds, searchResults]);

  // Speech language for text composed in the browser (checkout guidance etc.)
  const localSpeechLang = uiLang === "ta" ? "ta-IN" : "en-IN";

  // Applies the "uiAction" a backend reply may carry (theme, language, list/grid view, checkout steps).
  // Returns a string when the page wants a different sentence spoken (e.g. checkout guidance).
  const applyUiAction = useCallback(
    async (action) => {
      if (!action) return undefined;
      switch (action.type) {
        case "SET_THEME_MODE":
          setMode(action.value);
          return undefined;
        case "SET_THEME_ACCENT":
          setAccent(action.value);
          return undefined;
        case "OPEN_THEME_PANEL":
          openThemePanel();
          return undefined;
        case "SET_LANGUAGE":
          setUiLang(action.value);
          return undefined;
        case "SET_VIEW":
          try {
            localStorage.setItem("voiceshop_view", action.value);
          } catch {
            /* ignore */
          }
          window.dispatchEvent(new CustomEvent("voiceshop:view", { detail: action.value }));
          return undefined;
        case "CHECKOUT": {
          for (const h of uiHandlersRef.current) {
            if (h.onAction) {
              const out = await h.onAction(action);
              if (out !== undefined) return out;
            }
          }
          // Not on the checkout page yet: remember payment/delivery choice for when it opens
          if (action.pending) {
            try {
              sessionStorage.setItem("voiceshop_pending_checkout", JSON.stringify(action));
            } catch {
              /* ignore */
            }
          }
          return undefined;
        }
        default:
          return undefined;
      }
    },
    [setMode, setAccent, openThemePanel, setUiLang]
  );

  // Sends any message (spoken or typed) to the backend assistant and applies the result.
  const processCommand = useCallback(
    async (rawText, meta = {}) => {
      if (!rawText || !rawText.trim()) return;
      setStatus("processing");
      setChatHistory((prev) => [...prev, { from: "user", text: rawText }]);

      try {
        // 1) Page-level interceptors (e.g. dictating a new delivery address on the checkout page)
        for (const h of uiHandlersRef.current) {
          if (h.intercept) {
            const local = await h.intercept(rawText);
            if (typeof local === "string") {
              setLastResponse(local);
              setChatHistory((prev) => [...prev, { from: "assistant", text: local }]);
              setStatus("responded");
              await speak(local, localSpeechLang);
              return;
            }
          }
        }

        const now = Date.now();
        const requestContext = { ...contextRef.current };
        if (focusRef.current && now - focusRef.current.at < 5 * 60_000) requestContext.focusProductId = focusRef.current.id;
        if (lastSearchRef.current && now - lastSearchRef.current.at < 3 * 60_000) requestContext.lastSearch = lastSearchRef.current.data;
        if (pendingRef.current) requestContext.pending = pendingRef.current;
        if (lastStyleRef.current) requestContext.lastStyle = lastStyleRef.current;
        if (meta.confidence > 0) requestContext.sttConfidence = meta.confidence; // 0 / missing = recogniser didn't say

        const { data } = await api.post("/assistant/message", { message: rawText, lang: language, uiLang, context: requestContext });

        // Remember the conversation state for the next turn.
        pendingRef.current = data.pendingAction || null;
        if (data.detected?.style) lastStyleRef.current = data.detected.style;
        const focusId = data.focusProduct?._id || data.affectedProduct?._id;
        if (focusId) focusRef.current = { id: focusId, at: now };
        if (data.searchContext) lastSearchRef.current = { data: data.searchContext, at: now };
        if (languageRef.current === "auto") {
          // follow the language the shopper used; if we could not understand them, try the other recogniser language
          if (data.unclear) flipAutoLang();
          else if (data.detected?.style === "ta" || data.detected?.style === "tl") setAutoLang("ta-IN");
          else if (data.detected?.style === "en") setAutoLang("en-IN");
        }

        setSearchResults(data.products || null);

        // 2) Theme / language / view / checkout-step actions
        const spoken = await applyUiAction(data.uiAction);
        const replyText = spoken || data.replyText;
        const replyLang = spoken ? localSpeechLang : data.lang;

        setLastResponse(replyText);
        setChatHistory((prev) => [...prev, { from: "assistant", text: replyText }]);

        // Keep Cart / Wishlist screens in sync with what the backend just changed.
        if (data.changed?.includes("cart")) await fetchCart();
        if (data.changed?.includes("wishlist")) await fetchWishlist();

        if (data.redirectTo) navigate(data.redirectTo);
        if (data.changed?.includes("orders")) {
          // the orders pages re-fetch when the assistant cancels an order
          window.dispatchEvent(new CustomEvent("voiceshop:orders-changed"));
          window.setTimeout(() => window.dispatchEvent(new CustomEvent("voiceshop:orders-changed")), 500);
        }

        setStatus("responded");
        // Wait until the answer has been spoken (hands-free resumes listening only after this).
        lastSpokenRef.current = { text: replyText, at: Date.now() };
        await speak(replyText, replyLang);
        lastSpokenRef.current = { text: replyText, at: Date.now() };
        if (data.stopListening) stopHandsFreeRef.current();
      } catch (err) {
        const tamil = lastStyleRef.current === "ta" || (!lastStyleRef.current && uiLang === "ta");
        const offline = !err.response;
        const message = offline
          ? tamil ? "சர்வருடன் இணைக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்." : "I couldn't reach the server. Please check your connection and try again."
          : err.response?.data?.message || (tamil ? "மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்." : "Sorry, something went wrong. Please try again.");
        setLastResponse(message);
        setChatHistory((prev) => [...prev, { from: "assistant", text: message }]);
        setStatus("responded");
        await speak(message, tamil ? "ta-IN" : "en-IN");
      }
    },
    [language, uiLang, localSpeechLang, navigate, fetchCart, fetchWishlist, speak, applyUiAction, flipAutoLang]
  );

  // Hands-free: ignore the assistant's own voice picked up by the microphone.
  const shouldIgnoreCommand = useCallback((command) => {
    const spoken = lastSpokenRef.current;
    return Boolean(spoken && Date.now() - spoken.at < 8000 && isEcho(command, spoken.text));
  }, []);

  const handsFree = useHandsFree(language, processCommand, {
    autoLang,
    onFlipLang: flipAutoLang,
    shouldIgnore: shouldIgnoreCommand,
    uiLanguage: uiLang === "ta" ? "ta" : "en",
  });

  // Optional server-side recording (auto Tamil/English detection) - only when the backend has it configured.
  const uiErrorLang = uiLang === "ta" ? "ta" : "en";
  const stt = useServerStt({
    onResult: (data) => {
      setTranscript(data.text);
      if (languageRef.current === "auto" && data.language) setAutoLang(data.language === "ta-IN" ? "ta-IN" : "en-IN");
      processCommand(data.text, { confidence: data.confidence, source: "server-stt" });
    },
    onError: (code) => {
      setStatus("idle");
      setLocalError(code === "stt-unavailable" ? "Server speech recognition is unavailable right now." : describeSpeechError(code, uiErrorLang));
    },
  });
  useEffect(() => {
    stopHandsFreeRef.current = handsFree.stop;
  }, [handsFree.stop]);

  const useServerRecognition = stt.available && (language === "auto" || !isSupported);

  const handleStart = useCallback(() => {
    handsFree.stop(); // only one microphone session at a time
    setStatus("listening");
    setLastResponse("");
    setSearchResults(null);
    setLocalError(null);
    if (useServerRecognition) stt.start();
    else startListening();
  }, [startListening, handsFree.stop, useServerRecognition, stt.start]);

  const handleStop = useCallback(() => {
    if (stt.isRecording) {
      stt.stop(); // uploads, then onResult() processes it
      return;
    }
    stopListening();
    if (transcript.trim()) {
      processCommand(transcript, { confidence, source: "mic" });
    } else {
      setStatus("idle");
      setLocalError(describeSpeechError("no-speech", uiErrorLang));
    }
  }, [stopListening, transcript, confidence, processCommand, stt.isRecording, stt.stop, uiErrorLang]);

  // Browser recognition ended by itself (the shopper stopped talking): send what was heard, once.
  statusRef.current = status;
  const wasListeningRef = useRef(false);
  useEffect(() => {
    if (wasListeningRef.current && !isListening && statusRef.current === "listening") {
      if (transcript.trim()) processCommand(transcript, { confidence, source: "mic" });
      else {
        setStatus("idle");
        setLocalError(describeSpeechError("no-speech", uiErrorLang));
      }
    }
    wasListeningRef.current = isListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTranscript("");
    setLastResponse("");
  }, [setTranscript]);

  const clearChatHistory = useCallback(() => setChatHistory([]), []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: VOICE_LANGUAGES,
      assistantOpen,
      setAssistantOpen,
      status,
      isListening: isListening || stt.isRecording,
      transcript,
      error: error || localError,
      isSupported: isSupported || stt.available,
      autoLang,
      missingVoice,
      serverStt: stt.available,
      lastResponse,
      searchResults,
      chatHistory,
      clearChatHistory,
      handleStart,
      handleStop,
      processCommand, // also used directly by the typed chatbot widget
      reset,
      speak,
      handsFree,
      setVisibleProductIds,
      registerUiHandler,
    }),
    [
      language,
      assistantOpen,
      status,
      isListening,
      stt.isRecording,
      stt.available,
      localError,
      autoLang,
      missingVoice,
      transcript,
      error,
      isSupported,
      lastResponse,
      searchResults,
      chatHistory,
      clearChatHistory,
      handleStart,
      handleStop,
      processCommand,
      reset,
      speak,
      handsFree,
      setLanguage,
      registerUiHandler,
    ]
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
};

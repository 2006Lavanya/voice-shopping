import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaTimes, FaStop, FaPaperPlane } from "react-icons/fa";
import { useVoice } from "../context/VoiceContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";

// Floating assistant button (bottom-right) that opens a combined voice + text
// chatbot modal. This is the app's headline feature: speak OR type a command,
// see + hear the result, in any of the six supported languages.
const VoiceAssistant = () => {
  const {
    assistantOpen, setAssistantOpen, status, isListening, transcript, error,
    isSupported, lastResponse, chatHistory, processCommand, handleStart, handleStop,
    reset, language, languages, setLanguage,
  } = useVoice();

  const { t } = useI18n();
  const [typedMessage, setTypedMessage] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!assistantOpen) reset();
  }, [assistantOpen, reset]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory, lastResponse]);

  const handleSendTyped = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    processCommand(typedMessage);
    setTypedMessage("");
  };

  return (
    <>
      <button
        onClick={() => setAssistantOpen(true)}
        aria-label={t("va.open")}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-brand-pink to-brand-pinkDark shadow-cardHover flex items-center justify-center text-white text-2xl hover:scale-110 transition"
      >
        <span className="absolute inset-0 rounded-full bg-brand-pink animate-pulseRing" />
        <FaMicrophone className="relative" />
      </button>

      {assistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={t("va.title")} onClick={() => setAssistantOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[26rem] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[85vh]"
          >
            <button onClick={() => setAssistantOpen(false)} aria-label={t("va.close")} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700">
              <FaTimes />
            </button>

            <h3 className="text-lg font-bold text-center mb-1">🤖 {t("va.title")}</h3>
            <p className="text-center text-sm text-zinc-500 mb-3">{t("va.sub")}</p>

            <select
              aria-label={t("nav.voiceLang")}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mb-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-2"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            {/* Conversation history */}
            <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto min-h-[140px] max-h-64 space-y-2 mb-3 pr-1">
              {chatHistory.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-6">
                  {t("va.hint")}
                </p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] text-sm rounded-2xl px-3 py-2 ${
                      msg.from === "user"
                        ? "bg-brand-pink text-white rounded-br-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {status === "processing" && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-3 py-2 text-sm text-zinc-400">...</div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}

            {/* Text input (chatbot) */}
            <form onSubmit={handleSendTyped} className="flex items-center gap-2 mb-2">
              <input
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={t("va.placeholder")}
                aria-label={t("va.placeholder")}
                className="flex-1 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
              <button type="submit" className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center shrink-0" aria-label={t("va.send")}>
                <FaPaperPlane size={14} />
              </button>
            </form>

            {/* Mic button (voice) */}
            {isSupported ? (
              <button
                onClick={isListening ? handleStop : handleStart}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium text-white transition ${
                  isListening ? "bg-red-500 animate-pulse" : "bg-brand-pink hover:bg-brand-pinkDark"
                }`}
              >
                {isListening ? <FaStop size={12} /> : <FaMicrophone size={12} />}
                {isListening ? t("va.stop") : status === "processing" ? t("va.processing") : t("va.speak")}
              </button>
            ) : (
              <p className="text-xs text-zinc-400 text-center">
                {t("va.unsupported")}
              </p>
            )}
            {transcript && isListening && (
              <p className="text-xs text-zinc-400 text-center mt-2">{t("va.listening", { text: transcript })}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;

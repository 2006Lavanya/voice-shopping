import { useState } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";
import { useVoice } from "../context/VoiceContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

const EXAMPLE_COMMANDS = [
  "Search for laptop",
  "Show HP laptops",
  "Find smartphones under 50000",
  "Add HP laptop to wishlist",
  "Open my cart",
  "Go to checkout",
  "Show my orders",
  "Clear my cart",
];

const VoiceSearch = () => {
  const {
    status, isListening, transcript, error, isSupported, lastResponse,
    searchResults, handleStart, handleStop, language, languages, setLanguage, processCommand,
  } = useVoice();
  const [typedMessage, setTypedMessage] = useState("");

  const handleSendTyped = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    processCommand(typedMessage);
    setTypedMessage("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">🎙️ Voice Search</h1>
        <p className="text-zinc-500 mt-2">Speak naturally to search, filter and shop hands-free.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8 max-w-lg mx-auto text-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-6 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-4 py-2"
        >
          {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>

        {!isSupported ? (
          <p className="text-red-500 text-sm py-8">
            Voice recognition isn't supported in this browser. Please type your request below, or use Chrome/Edge for voice.
          </p>
        ) : (
          <>
            <button
              onClick={isListening ? handleStop : handleStart}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl mx-auto transition ${
                isListening ? "bg-red-500 animate-pulse" : "bg-brand-pink hover:scale-105"
              }`}
            >
              {isListening ? <FaStop /> : <FaMicrophone />}
            </button>
            <p className="mt-5 font-medium text-zinc-600 dark:text-zinc-300">
              {status === "listening" && "Listening..."}
              {status === "processing" && "Processing..."}
              {status === "idle" && "Tap to start speaking"}
              {status === "responded" && "Done!"}
            </p>
            {transcript && <p className="mt-3 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">You said: "{transcript}"</p>}
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            {lastResponse && (
              <p className="mt-3 text-sm bg-brand-light dark:bg-zinc-800 border border-brand-pink/30 rounded-xl p-3">
                <span className="text-brand-pink font-medium">Assistant: </span>{lastResponse}
              </p>
            )}
          </>
        )}

        <form onSubmit={handleSendTyped} className="flex items-center gap-2 mt-6">
          <input
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="...or type your request here"
            className="flex-1 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button type="submit" className="w-11 h-11 rounded-full bg-brand-black text-white flex items-center justify-center shrink-0" aria-label="Send message">
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>

      <div className="mt-10">
        <h3 className="font-semibold text-center mb-4">Try saying:</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_COMMANDS.map((cmd) => (
            <span key={cmd} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-300">
              "{cmd}"
            </span>
          ))}
        </div>
      </div>

      {searchResults && (
        <div className="mt-12">
          <h3 className="font-semibold mb-4">Voice Search Results</h3>
          {searchResults.length === 0 ? (
            <EmptyState icon="🔍" title="No matches found" subtitle="Try a different voice command." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {searchResults.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;

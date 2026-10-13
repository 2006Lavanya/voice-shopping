import { useMemo } from "react";
import { FaMicrophone, FaStop, FaVolumeUp, FaLanguage, FaShieldAlt, FaBolt, FaShoppingCart, FaHeart, FaSearch } from "react-icons/fa";
import { useVoice } from "../context/VoiceContext.jsx";

const examples = [
  { icon: FaSearch, text: "Search for HP laptops under 60000" },
  { icon: FaShoppingCart, text: "Add iPhone 15 to my cart" },
  { icon: FaHeart, text: "Add Samsung phone to my wishlist" },
  { icon: FaShoppingCart, text: "Open my cart" },
  { icon: FaLanguage, text: "iphone 15 cart la add pannu" },
  { icon: FaLanguage, text: "ஐபோன் 15 ஐ கார்ட்டில் சேர்" },
];

const HandsFree = () => {
  const { language, setLanguage, languages, processCommand, chatHistory, speak, handsFree } = useVoice();
  const { isActive, isListening, isBusy, transcript, error, isSupported, start, stop } = handsFree;

  // Conversation shown in the activity panel comes straight from the shared chat history.
  const activity = useMemo(
    () => chatHistory.slice(-10).map((m, i) => ({ type: m.from, text: m.text, time: String(i) })),
    [chatHistory]
  );

  const statusText = useMemo(() => {
    if (!isSupported) return "Voice recognition is not supported in this browser";
    if (isBusy) return "Working on it…";
    if (isListening) return "Listening… speak naturally";
    if (isActive) return "Hands-free is ON — starting microphone…";
    return "Hands-free mode is off";
  }, [isActive, isListening, isBusy, isSupported]);

  const handleExample = (text) => processCommand(text);
  if (!isSupported) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <FaMicrophone className="mx-auto text-4xl text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Hands-Free Voice is not supported</h1>
          <p className="text-zinc-600">Please use the latest Google Chrome or Microsoft Edge and allow microphone access.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-brand-pinkDark text-white p-7 sm:p-10 shadow-2xl">
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-brand-pink/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.05fr_.95fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide">
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-zinc-400"}`} />
              HANDS-FREE SHOPPING
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-5 leading-tight">Shop without touching the screen.</h1>
            <p className="mt-4 text-white/70 max-w-xl leading-7">
              Turn on Hands-Free Mode once, then speak naturally. VoiceShop continuously listens for shopping commands and can search products, update your cart or wishlist, open pages and answer through voice.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={isActive ? stop : start}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold transition ${isActive ? "bg-white text-red-600" : "bg-brand-pink hover:bg-brand-pinkDark text-white"}`}
              >
                {isActive ? <FaStop /> : <FaMicrophone />}
                {isActive ? "Stop Hands-Free" : "Start Hands-Free"}
              </button>
              <button
                onClick={() => speak("Hands-free shopping is ready. Tell me what you want to buy.")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 font-semibold"
              >
                <FaVolumeUp /> Test Voice
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              {statusText}
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold">Voice language</p>
                <p className="text-xs text-white/60 mt-1">Choose the language you speak</p>
              </div>
              <FaLanguage className="text-2xl text-brand-pink" />
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 bg-black/30 border border-white/15 text-white outline-none"
            >
              {languages.map((item) => <option key={item.code} value={item.code} className="text-black">{item.label}</option>)}
            </select>
            <div className="mt-5 rounded-2xl bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50 font-bold">Live transcript</p>
              <p className="mt-2 min-h-10 text-sm text-white/90">{transcript || "Your speech will appear here…"}</p>
            </div>
            {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
          <FaBolt className="text-brand-pink text-xl mb-3" />
          <h2 className="font-bold">Continuous listening</h2>
          <p className="text-sm text-zinc-500 mt-1">Stays ON while you move between pages. Say "stop listening" to turn it off.</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
          <FaVolumeUp className="text-brand-pink text-xl mb-3" />
          <h2 className="font-bold">Voice response</h2>
          <p className="text-sm text-zinc-500 mt-1">The existing assistant speaks the response back in your selected language.</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
          <FaShieldAlt className="text-brand-pink text-xl mb-3" />
          <h2 className="font-bold">You control the mic</h2>
          <p className="text-sm text-zinc-500 mt-1">One click to start (browser rule). Mic pauses while the assistant talks so it never hears itself.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-6 mt-6">
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
          <h2 className="text-xl font-bold">Try these commands</h2>
          <p className="text-sm text-zinc-500 mt-1 mb-4">These examples use the same assistant pipeline as the floating voice button.</p>
          <div className="space-y-3">
            {examples.map(({ icon: Icon, text }) => (
              <button key={text} onClick={() => handleExample(text)} className="w-full flex items-center gap-3 text-left rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 hover:border-brand-pink hover:bg-brand-pink/5 transition">
                <span className="w-9 h-9 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0"><Icon /></span>
                <span className="text-sm font-medium">{text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Live activity</h2>
              <p className="text-sm text-zinc-500">Hands-free commands and assistant responses</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
              {isActive ? "ACTIVE" : "OFF"}
            </span>
          </div>
          <div className="min-h-[280px] max-h-[360px] overflow-y-auto space-y-3">
            {activity.length === 0 && <p className="text-sm text-zinc-400 text-center py-20">No commands yet. Start Hands-Free and speak a command.</p>}
            {activity.map((item, index) => (
              <div key={`${item.time}-${index}`} className={`flex ${item.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${item.type === "user" ? "bg-brand-pink text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                  <p className="text-xs opacity-60 mb-1">{item.type === "user" ? "You" : "VoiceShop"} · {item.time}</p>
                  <p className="text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandsFree;

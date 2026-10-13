import { FaMicrophone, FaStop } from "react-icons/fa";
import { useVoice } from "../context/VoiceContext.jsx";

// Small floating pill visible on EVERY page while hands-free mode is on.
const HandsFreeIndicator = () => {
  const { handsFree, transcript } = useVoice();
  if (!handsFree.isActive) return null;
  const label = handsFree.isBusy ? "Working…" : handsFree.isListening ? "Listening…" : "Starting mic…";
  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-[80vw] flex items-center gap-3 rounded-full bg-zinc-900 text-white pl-4 pr-2 py-2 shadow-2xl border border-white/10">
      <span className={`w-2.5 h-2.5 rounded-full ${handsFree.isListening ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
      <div className="min-w-0">
        <p className="text-xs font-semibold flex items-center gap-1"><FaMicrophone /> Hands-free · {label}</p>
        {transcript && <p className="text-[11px] text-white/60 truncate">“{transcript}”</p>}
      </div>
      <button onClick={handsFree.stop} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shrink-0" aria-label="Stop hands-free">
        <FaStop size={11} />
      </button>
    </div>
  );
};

export default HandsFreeIndicator;

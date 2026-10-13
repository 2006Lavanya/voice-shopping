import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const FAQS = [
  { q: "How does voice shopping work?", a: "Tap the microphone icon in the navbar or the floating assistant button, speak a command like 'search for laptops under 60000', and the app will parse your request and show matching results." },
  { q: "Which browsers support voice search?", a: "Voice recognition uses the Web Speech API, which works best in Google Chrome and Microsoft Edge on desktop, and Chrome on Android. Safari and Firefox have limited support." },
  { q: "Is Cash on Delivery available?", a: "Yes, COD is available for all orders. You can also pay via UPI, Card, or other online payment methods (running in sandbox/test mode)." },
  { q: "How do I track my order?", a: "Go to 'My Orders' from your profile menu and click on any order to see its live tracking timeline." },
  { q: "Can I cancel an order?", a: "Yes, orders can be cancelled from the Order Details page as long as they haven't been shipped yet." },
  { q: "How do I change my language for voice commands?", a: "Use the language selector in the navbar or inside the voice assistant popup to switch between English, Tamil, Hindi, Telugu, Malayalam and Kannada." },
];

const Help = () => {
  const [open, setOpen] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Help & FAQ</h1>
      <p className="text-zinc-500 mb-8">Find answers to common questions about VoiceShop.</p>
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-medium text-sm">{f.q}</span>
              <FaChevronDown className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-5 pb-5 text-sm text-zinc-500">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Help;

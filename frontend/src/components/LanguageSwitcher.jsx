import { FaGlobe } from "react-icons/fa";
import toast from "react-hot-toast";
import { useI18n } from "../context/I18nContext.jsx";

/**
 * English | தமிழ் | Tanglish switch. Changes the whole UI instantly and (via VoiceContext)
 * the voice-recognition language and the language the assistant answers in.
 * variant="pill" (navbar) | "segmented" (settings page)
 */
const LanguageSwitcher = ({ variant = "pill" }) => {
  const { lang, setLang, languages, t } = useI18n();

  const choose = (code) => {
    if (code === lang) return;
    setLang(code);
    toast.success(languages.find((l) => l.code === code)?.label || code, { id: "lang-toast", icon: "🌐" });
  };

  if (variant === "segmented") {
    return (
      <div className="inline-flex rounded-full border border-zinc-200 dark:border-zinc-700 p-1" role="group" aria-label={t("lang.title")}>
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => choose(l.code)}
            aria-pressed={lang === l.code}
            className={`px-3 py-1.5 rounded-full text-sm transition ${lang === l.code ? "bg-brand-pink text-white font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-brand-pink"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 text-xs overflow-hidden" role="group" aria-label={t("nav.siteLang")}>
      <FaGlobe className="mx-2 text-zinc-400" aria-hidden="true" />
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => choose(l.code)}
          aria-pressed={lang === l.code}
          title={l.label}
          className={`px-2 py-1.5 font-semibold transition ${lang === l.code ? "bg-brand-pink text-white" : "text-zinc-500 hover:text-brand-pink"}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

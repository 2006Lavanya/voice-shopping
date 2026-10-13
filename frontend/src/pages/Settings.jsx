import { FaMoon, FaSun, FaBell, FaLock, FaPalette, FaGlobe } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext.jsx";
import { useVoice } from "../context/VoiceContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import ThemeControls from "../components/ThemeControls.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages } = useVoice();
  const { t } = useI18n();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-card divide-y divide-zinc-100 dark:divide-zinc-800">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <FaSun className="text-brand-pink" /> : <FaMoon className="text-brand-pink" />}
            <div>
              <p className="font-medium text-sm">{t("settings.dark")}</p>
              <p className="text-xs text-zinc-400">{t("settings.darkSub")}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label={t("settings.dark")}
            className={`w-12 h-6 rounded-full transition relative ${theme === "dark" ? "bg-brand-pink" : "bg-zinc-300"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${theme === "dark" ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <FaGlobe className="text-brand-pink" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">{t("settings.siteLang")}</p>
              <p className="text-xs text-zinc-400">{t("settings.siteLangSub")}</p>
            </div>
          </div>
          <LanguageSwitcher variant="segmented" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <FaPalette className="text-brand-pink" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">{t("settings.theme")}</p>
              <p className="text-xs text-zinc-400">{t("settings.themeSub")}</p>
            </div>
          </div>
          <ThemeControls />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <FaBell className="text-brand-pink" />
            <div>
              <p className="font-medium text-sm">{t("settings.voiceLang")}</p>
              <p className="text-xs text-zinc-400">{t("settings.voiceLangSub")}</p>
            </div>
          </div>
          <select aria-label={t("settings.voiceLang")} value={language} onChange={(e) => setLanguage(e.target.value)} className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1.5 bg-transparent">
            {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 p-5">
          <FaLock className="text-brand-pink" />
          <div>
            <p className="font-medium text-sm">{t("settings.security")}</p>
            <p className="text-xs text-zinc-400">{t("settings.securitySub")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

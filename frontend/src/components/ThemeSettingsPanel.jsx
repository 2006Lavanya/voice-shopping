import { useEffect, useRef } from "react";
import { FaTimes, FaPalette } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import ThemeControls from "./ThemeControls.jsx";

/** Slide-over "Theme Settings" panel. Opens from the navbar palette button or by voice ("open theme settings"). */
const ThemeSettingsPanel = () => {
  const { panelOpen, closeThemePanel } = useTheme();
  const { t } = useI18n();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!panelOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && closeThemePanel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen, closeThemePanel]);

  if (!panelOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label={t("theme.title")}>
      <div className="absolute inset-0 bg-black/40 animate-pop" onClick={closeThemePanel} aria-hidden="true" />
      <aside className="relative w-full max-w-sm h-full bg-white dark:bg-zinc-950 shadow-2xl p-6 overflow-y-auto animate-slideIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FaPalette className="text-brand-pink" aria-hidden="true" /> {t("theme.title")}
          </h2>
          <button
            ref={closeRef}
            onClick={closeThemePanel}
            aria-label={t("theme.close")}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>
        <ThemeControls />
      </aside>
    </div>
  );
};

export default ThemeSettingsPanel;

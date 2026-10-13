import { useState, useEffect } from "react";
import { FaSun, FaMoon, FaDesktop, FaCheck, FaUndo } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { isHex, contrastText } from "../utils/themeColors.js";

/**
 * Reusable theme controls (mode + accent colour + custom colour + preview).
 * Used inside the slide-over panel AND on the Settings page, so there is one implementation.
 */
const ThemeControls = () => {
  const { mode, setMode, accent, setAccent, presets, resetTheme } = useTheme();
  const { t } = useI18n();
  const [hexInput, setHexInput] = useState(accent.hex);

  useEffect(() => setHexInput(accent.hex), [accent.hex]);

  const modes = [
    { id: "light", icon: FaSun, label: t("theme.light") },
    { id: "dark", icon: FaMoon, label: t("theme.dark") },
    { id: "system", icon: FaDesktop, label: t("theme.system") },
  ];

  const applyHex = (value) => {
    const v = value.startsWith("#") ? value : `#${value}`;
    setHexInput(v);
    if (isHex(v)) setAccent(v);
  };

  return (
    <div className="space-y-6">
      {/* Mode */}
      <section aria-labelledby="theme-mode-label">
        <h3 id="theme-mode-label" className="text-sm font-semibold mb-2">{t("theme.mode")}</h3>
        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="theme-mode-label">
          {modes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition ${
                mode === id
                  ? "border-brand-pink bg-brand-pink/10 text-brand-pink font-semibold"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-brand-pink"
              }`}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Accent colours */}
      <section aria-labelledby="theme-color-label">
        <h3 id="theme-color-label" className="text-sm font-semibold mb-2">{t("theme.colors")}</h3>
        <div className="grid grid-cols-5 gap-3" role="group" aria-labelledby="theme-color-label">
          {presets.map((p) => {
            const selected = accent.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setAccent(p.id); toast.success(t("theme.toast"), { id: "theme-toast" }); }}
                aria-pressed={selected}
                aria-label={t(`theme.c.${p.id}`)}
                title={t(`theme.c.${p.id}`)}
                style={{ backgroundColor: p.hex, color: contrastText(p.hex) }}
                className={`w-full aspect-square rounded-full flex items-center justify-center shadow transition hover:scale-110 ${
                  selected ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900" : ""
                }`}
              >
                {selected && <FaCheck size={12} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom colour */}
      <section aria-labelledby="theme-custom-label">
        <h3 id="theme-custom-label" className="text-sm font-semibold mb-2">{t("theme.custom")}</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accent.hex.length === 7 ? accent.hex : "#EC4899"}
            onChange={(e) => applyHex(e.target.value)}
            aria-label={t("theme.pick")}
            className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
          />
          <input
            value={hexInput}
            onChange={(e) => applyHex(e.target.value.trim())}
            maxLength={7}
            spellCheck="false"
            aria-label={t("theme.hex")}
            placeholder={t("theme.hex")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-zinc-50 dark:bg-zinc-800 uppercase tracking-wide ${
              isHex(hexInput) ? "border-zinc-200 dark:border-zinc-700" : "border-red-400"
            }`}
          />
        </div>
      </section>

      {/* Live preview */}
      <section aria-labelledby="theme-preview-label">
        <h3 id="theme-preview-label" className="text-sm font-semibold mb-2">{t("theme.preview")}</h3>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900 flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand-pink text-white">{t("theme.sampleTag")}</span>
          <span className="font-bold text-brand-pink">₹1,299</span>
          <button type="button" tabIndex={-1} className="ml-auto px-4 py-1.5 rounded-full bg-brand-pink hover:bg-brand-pinkDark text-white text-sm font-medium">
            {t("theme.sampleBtn")}
          </button>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">{t("theme.saved")}</p>
        <button
          type="button"
          onClick={resetTheme}
          className="shrink-0 flex items-center gap-1 text-xs text-zinc-500 hover:text-brand-pink"
        >
          <FaUndo size={10} aria-hidden="true" /> {t("theme.reset")}
        </button>
      </div>
    </div>
  );
};

export default ThemeControls;

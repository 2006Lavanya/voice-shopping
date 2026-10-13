import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { translate, LANG_CODES } from "../i18n/index.js";

/**
 * Site language: "en" (English) | "ta" (Tamil) | "tl" (Tanglish = Tamil in English letters).
 * Saved in localStorage (voiceshop_ui_lang) and restored on refresh. The voice assistant reads it too,
 * so replies come back in the same language the shopper chose.
 */
const I18nContext = createContext(null);

export const UI_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ta", label: "தமிழ்", short: "த" },
  { code: "tl", label: "Tanglish", short: "TL" },
];

const readLang = () => {
  try {
    const l = localStorage.getItem("voiceshop_ui_lang");
    return LANG_CODES.includes(l) ? l : "en";
  } catch {
    return "en";
  }
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(readLang);

  useEffect(() => {
    document.documentElement.lang = lang === "ta" ? "ta" : lang === "tl" ? "ta-Latn" : "en";
    try {
      localStorage.setItem("voiceshop_ui_lang", lang);
    } catch {
      /* private mode */
    }
  }, [lang]);

  const setLang = useCallback((l) => setLangState(LANG_CODES.includes(l) ? l : "en"), []);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, languages: UI_LANGUAGES }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

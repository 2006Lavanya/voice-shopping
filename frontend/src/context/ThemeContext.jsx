import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ACCENT_PRESETS, DEFAULT_ACCENT, buildAccent, presetAccent, isHex } from "../utils/themeColors.js";

/**
 * Theme state: mode (light | dark | system) + accent colour (preset or custom hex).
 * Everything is saved in localStorage and re-applied on load:
 *   voiceshop_theme  -> "light" | "dark" | "system"      (same key as before, so old saved values still work)
 *   voiceshop_accent -> JSON { id, hex, rgb, dark, light }
 * index.html contains a tiny script that applies both BEFORE React renders (no flash on refresh).
 *
 * Backward compatible: `theme` ("light" | "dark", the resolved value) and `toggleTheme()` still work.
 */
const ThemeContext = createContext(null);

const MODES = ["light", "dark", "system"];
const systemDark = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const readMode = () => {
  try {
    const m = localStorage.getItem("voiceshop_theme");
    return MODES.includes(m) ? m : "light";
  } catch {
    return "light";
  }
};

const readAccent = () => {
  try {
    const a = JSON.parse(localStorage.getItem("voiceshop_accent") || "null");
    if (a && isHex(a.hex)) return a.id && a.id !== "custom" ? presetAccent(a.id) : buildAccent(a.hex);
  } catch {
    /* fall through */
  }
  return DEFAULT_ACCENT;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(readMode);
  const [accent, setAccentState] = useState(readAccent);
  const [prefersDark, setPrefersDark] = useState(systemDark);
  const [panelOpen, setPanelOpen] = useState(false);

  const theme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // follow the OS setting while mode === "system"
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return undefined;
    const onChange = (e) => setPrefersDark(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // apply + persist light/dark
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("voiceshop_theme", mode);
    } catch {
      /* private mode */
    }
  }, [theme, mode]);

  // apply + persist accent colour
  useEffect(() => {
    const st = document.documentElement.style;
    st.setProperty("--brand-rgb", accent.rgb);
    st.setProperty("--brand-dark-rgb", accent.dark);
    st.setProperty("--brand-light-rgb", accent.light);
    st.setProperty("--brand-pink", accent.hex);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", accent.hex);
    try {
      localStorage.setItem("voiceshop_accent", JSON.stringify(accent));
    } catch {
      /* private mode */
    }
  }, [accent]);

  const setMode = useCallback((m) => setModeState(MODES.includes(m) ? m : "light"), []);
  const toggleTheme = useCallback(() => setModeState(theme === "dark" ? "light" : "dark"), [theme]);

  /** accepts a preset id ("blue") or a custom hex ("#14B8A6") */
  const setAccent = useCallback((idOrHex) => {
    if (isHex(idOrHex)) setAccentState(buildAccent(idOrHex));
    else if (ACCENT_PRESETS.some((p) => p.id === idOrHex)) setAccentState(presetAccent(idOrHex));
  }, []);

  const resetTheme = useCallback(() => {
    setModeState("light");
    setAccentState(DEFAULT_ACCENT);
  }, []);

  const value = useMemo(
    () => ({
      theme, toggleTheme, mode, setMode, accent, setAccent, resetTheme, presets: ACCENT_PRESETS,
      panelOpen, openThemePanel: () => setPanelOpen(true), closeThemePanel: () => setPanelOpen(false),
    }),
    [theme, toggleTheme, mode, setMode, accent, setAccent, resetTheme, panelOpen]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

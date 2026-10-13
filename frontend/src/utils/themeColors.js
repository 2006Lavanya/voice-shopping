// Colour helpers for the Theme Settings feature.
// A theme accent is stored as three space-separated RGB triplets (Tailwind "rgb(var(--x) / <alpha>)" format):
//   rgb   -> main accent        (buttons, links, badges)
//   dark  -> darker hover shade
//   light -> very light tint    (soft backgrounds)

export const ACCENT_PRESETS = [
  { id: "pink", hex: "#EC4899", dark: "190 24 93", light: "253 242 248" }, // the original VoiceShop look
  { id: "blue", hex: "#2563EB" },
  { id: "green", hex: "#059669" },
  { id: "red", hex: "#DC2626" },
  { id: "orange", hex: "#EA580C" },
  { id: "purple", hex: "#7C3AED" },
  { id: "teal", hex: "#0D9488" },
  { id: "amber", hex: "#D97706" },
  { id: "slate", hex: "#475569" },
];

export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || "").trim());

export const hexToRgb = (hex) => {
  const h = String(hex).replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
};

const hslToRgb = ([h, s, l]) => {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)].map((v) => Math.round(v * 255));
};

const triplet = (rgb) => rgb.join(" ");

/** Build the three CSS variable values for any hex colour. */
export const buildAccent = (hex, id = "custom") => {
  const preset = ACCENT_PRESETS.find((p) => p.hex.toLowerCase() === String(hex).toLowerCase() && p.dark);
  const base = hexToRgb(hex);
  if (preset) return { id, hex: preset.hex, rgb: triplet(base), dark: preset.dark, light: preset.light };
  const [h, s, l] = rgbToHsl(base);
  const dark = hslToRgb([h, Math.min(1, s * 1.05), Math.max(0.12, l * 0.74)]);
  const light = base.map((c) => Math.round(c * 0.07 + 255 * 0.93));
  return { id, hex: String(hex).toUpperCase(), rgb: triplet(base), dark: triplet(dark), light: triplet(light) };
};

export const presetAccent = (id) => {
  const p = ACCENT_PRESETS.find((x) => x.id === id) || ACCENT_PRESETS[0];
  return buildAccent(p.hex, p.id);
};

export const DEFAULT_ACCENT = presetAccent("pink");

/** Readable text colour (black/white) for a given background hex. */
export const contrastText = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#111111" : "#FFFFFF";
};

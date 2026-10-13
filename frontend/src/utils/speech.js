/**
 * speech.js - small pure helpers for the voice assistant (no React, no browser APIs), so they can be unit tested.
 */

const TAMIL = /[\u0b80-\u0bff]/;
const LATIN_LETTER = /[A-Za-z]/;

export const hasTamil = (text) => TAMIL.test(String(text || ""));

/** Language to speak a piece of text in when the caller doesn't say: Tamil letters => ta-IN, otherwise en-IN. */
export const guessSpeechLang = (text, fallback = "en-IN") => (hasTamil(text) ? "ta-IN" : LATIN_LETTER.test(String(text || "")) ? "en-IN" : fallback);

/**
 * Makes text pleasant for a speech engine without changing what the screen shows:
 *  - "₹79,900" is read as "79,900 rupees" / "79,900 ரூபாய்" (voices otherwise skip or mispronounce the symbol)
 *  - "#AB12CD34" -> "AB12CD34", "×" -> "x", emoji / decorative symbols removed
 */
export const toSpeakable = (text, lang = "en-IN") => {
  const rupee = String(lang).startsWith("ta") || hasTamil(text) ? "ரூபாய்" : "rupees";
  return String(text || "")
    .replace(/₹\s?([\d,]+(?:\.\d+)?)/g, (_, n) => `${n} ${rupee}`)
    .replace(/#(?=[A-Za-z0-9])/g, "")
    .replace(/×/g, " x ")
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Splits a sentence into runs that should be spoken with different voices.
 * "iPhone 15 உங்கள் கார்ட்டில் சேர்க்கப்பட்டது." -> [{en-IN "iPhone 15"}, {ta-IN "உங்கள் கார்ட்டில் சேர்க்கப்பட்டது."}]
 * Pure-English or pure-Tamil text returns a single segment. Numbers / punctuation stick to the run before them.
 */
export const splitBySpeechLanguage = (text, { tamil = "ta-IN", english = "en-IN" } = {}) => {
  const tokens = String(text || "").split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const langOf = (t) => (TAMIL.test(t) ? tamil : LATIN_LETTER.test(t) ? english : null);
  let current = langOf(tokens.find((t) => langOf(t))) || english;
  const segments = [];
  for (const t of tokens) {
    const l = langOf(t) || current; // neutral token (digits, punctuation) stays in the current run
    const last = segments[segments.length - 1];
    if (last && last.lang === l) last.text += ` ${t}`;
    else segments.push({ lang: l, text: t });
    current = l;
  }
  return segments;
};

const norm = (l) => String(l || "").replace("_", "-").toLowerCase();

/** Best installed voice for a language: exact locale, then same language; prefers network "Google"/"Natural" voices. */
export const pickVoice = (voices, lang) => {
  const list = Array.isArray(voices) ? voices : [];
  const want = norm(lang);
  const base = want.split("-")[0];
  const score = (v) => {
    const l = norm(v.lang);
    let s = 0;
    if (l === want) s += 10;
    else if (l.split("-")[0] === base) s += 5;
    else return -1;
    if (/google|natural|neural|online/i.test(v.name || "")) s += 3;
    if (v.localService === false) s += 1;
    return s;
  };
  let best = null;
  let bestScore = -1;
  for (const v of list) {
    const s = score(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
};

export const normalizeForCompare = (text) =>
  String(text || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();

/**
 * Hands-free safety: was the "command" the microphone just heard really the assistant's own voice?
 * True when the heard words are (mostly) a piece of what we just spoke.
 */
export const isEcho = (heard, spoken) => {
  const h = normalizeForCompare(heard);
  const s = normalizeForCompare(spoken);
  if (!h || !s) return false;
  if (s.includes(h) && h.split(" ").length >= 2) return true;
  const hw = h.split(" ");
  const sw = new Set(s.split(" "));
  return hw.length >= 3 && hw.filter((w) => sw.has(w)).length / hw.length >= 0.8;
};

/** Same sentence heard twice in a row (Chrome sometimes re-emits a final result)? */
export const isDuplicateCommand = (a, b, withinMs, now = Date.now()) => Boolean(a && b && normalizeForCompare(a.text) === normalizeForCompare(b) && now - a.at < withinMs);

/** Friendly, specific message for a SpeechRecognition error code. */
export const describeSpeechError = (code, lang = "en") => {
  const ta = lang === "ta";
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return ta ? "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது. முகவரிப் பட்டியில் உள்ள பூட்டு படத்தை அழுத்தி மைக்கை அனுமதித்து மீண்டும் முயற்சிக்கவும்." : "Microphone access is blocked. Click the lock icon in the address bar, allow the microphone, then try again.";
    case "audio-capture":
      return ta ? "மைக்ரோஃபோன் கிடைக்கவில்லை. மைக்கை இணைத்து மீண்டும் முயற்சிக்கவும்." : "No microphone was found. Plug one in and try again.";
    case "network":
      return ta ? "பேச்சு சேவையை அடைய முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்." : "The speech service can't be reached. Check your internet connection.";
    case "no-speech":
      return ta ? "எதுவும் கேட்கவில்லை. மீண்டும் சொல்லுங்கள்." : "I didn't hear anything. Please try again.";
    case "language-not-supported":
      return ta ? "இந்த உலாவி இந்த மொழிக்கு ஆதரவு தரவில்லை." : "This browser doesn't support that speech language.";
    default:
      return ta ? `குரல் பிழை: ${code}` : `Voice error: ${code}`;
  }
};

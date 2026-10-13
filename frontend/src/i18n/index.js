import { D, LANG_CODES } from "./translations.js";

const INDEX = { en: 0, ta: 1, tl: 2 };

/** Pure translate function (also used by tests): falls back to English, then to the key itself. */
export const translate = (lang, key, vars) => {
  const row = D[key];
  if (!row) return key;
  let s = row[INDEX[lang] ?? 0] || row[0] || key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
  return s;
};

export { D, LANG_CODES };

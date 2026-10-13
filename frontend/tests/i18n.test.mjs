// Verifies every UI string exists in English, Tamil and Tanglish with matching {placeholders}.
import { D } from "../src/i18n/translations.js";
import { translate } from "../src/i18n/index.js";

let bad = 0;
const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
for (const [key, row] of Object.entries(D)) {
  const problems = [];
  if (!Array.isArray(row) || row.length !== 3) problems.push("needs exactly 3 languages");
  else {
    row.forEach((s, i) => { if (!s || !String(s).trim()) problems.push(`lang ${i} empty`); });
    if (new Set(row.map(ph)).size !== 1) problems.push("placeholders differ");
    if (!/[\u0b80-\u0bff]/.test(row[1])) problems.push("Tamil text has no Tamil script");
    if (/[\u0b80-\u0bff]/.test(row[2])) problems.push("Tanglish must use English letters only");
  }
  if (problems.length) { bad++; console.log("✗", key, problems.join("; ")); }
}
const n = Object.keys(D).length;
console.log(bad ? `${bad} problem(s)` : `✓ all ${n} keys have English + Tamil + Tanglish`);
console.log(translate("en", "p.found", { n: 5 }), "|", translate("ta", "p.found", { n: 5 }), "|", translate("tl", "p.found", { n: 5 }));
console.log(translate("tl", "does.not.exist"), translate("xx", "card.addToCart"));
process.exit(bad ? 1 : 0);

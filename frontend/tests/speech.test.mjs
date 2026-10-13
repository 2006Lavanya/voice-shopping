import { toSpeakable, splitBySpeechLanguage, pickVoice, isEcho, isDuplicateCommand, guessSpeechLang, describeSpeechError } from "../src/utils/speech.js";
let bad = 0;
const ok = (l, c, e) => { if (!c) bad += 1; console.log(c ? "✓" : "✗", l, c ? "" : JSON.stringify(e)); };

ok("₹ read as rupees (EN)", toSpeakable("iPhone 15 costs ₹79,900.", "en-IN") === "iPhone 15 costs 79,900 rupees.", toSpeakable("iPhone 15 costs ₹79,900.", "en-IN"));
ok("₹ read as ரூபாய் (TA)", toSpeakable("iPhone 15 விலை ₹79,900.", "ta-IN") === "iPhone 15 விலை 79,900 ரூபாய்.");
ok("order # and emoji removed", toSpeakable("Order #AB12CD34 ✅ done", "en-IN") === "Order AB12CD34 done");
ok("price digits preserved exactly", toSpeakable("₹1,23,456.50", "en-IN").startsWith("1,23,456.50"));

const seg = splitBySpeechLanguage("iPhone 15 உங்கள் கார்ட்டில் சேர்க்கப்பட்டது.");
ok("mixed sentence -> en run then ta run", seg.length === 2 && seg[0].lang === "en-IN" && seg[0].text === "iPhone 15" && seg[1].lang === "ta-IN", seg);
ok("pure Tamil -> one segment", splitBySpeechLanguage("சரி, முடிந்தது").length === 1);
ok("pure English -> one segment", splitBySpeechLanguage("Done. Added to cart.").length === 1 && splitBySpeechLanguage("Done. Added to cart.")[0].lang === "en-IN");
ok("number after Tamil stays with Tamil", splitBySpeechLanguage("மொத்தம் 5000 ரூபாய்").length === 1);
ok("guess lang", guessSpeechLang("வணக்கம்") === "ta-IN" && guessSpeechLang("hello") === "en-IN");

const voices = [{ name: "Alex", lang: "en-US" }, { name: "Google हिन्दी", lang: "hi-IN" }, { name: "Google தமிழ்", lang: "ta-IN", localService: false }, { name: "Google UK English", lang: "en-GB" }, { name: "Rishi", lang: "en-IN" }];
ok("picks Tamil voice", pickVoice(voices, "ta-IN").name === "Google தமிழ்");
ok("picks exact en-IN over other English", pickVoice(voices, "en-IN").name === "Rishi");
ok("falls back to same language", pickVoice(voices, "en-AU") !== null);
ok("no voice -> null (no crash)", pickVoice([{ name: "Alex", lang: "en-US" }], "ta-IN") === null && pickVoice([], "ta-IN") === null && pickVoice(undefined, "ta-IN") === null);

ok("echo: heard part of own reply", isEcho("added to your cart", "Done! iPhone 15 added to your cart."));
ok("echo: real new command is not echo", !isEcho("show me laptops", "Done! iPhone 15 added to your cart."));
ok("echo: single word not treated as echo", !isEcho("cart", "Opening your cart."));
const now = 10_000;
ok("duplicate within window", isDuplicateCommand({ text: "Add to cart!", at: now - 1000 }, "add to cart", 2500, now));
ok("not duplicate after window", !isDuplicateCommand({ text: "add to cart", at: now - 5000 }, "add to cart", 2500, now));
ok("error text Tamil / English", /மைக்ரோஃபோன்/.test(describeSpeechError("not-allowed", "ta")) && /Microphone/.test(describeSpeechError("not-allowed")));
console.log(bad ? `\n${bad} FAILED` : "\nAll speech util checks passed"); process.exit(bad ? 1 : 0);

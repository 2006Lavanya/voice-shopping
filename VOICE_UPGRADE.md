# Voice upgrade (v4): Tamil / English / Tanglish understanding

Only the voice layer changed. Login, products, cart, wishlist, checkout, payments, orders, reviews, admin, themes,
routes and the database models are untouched.

## How it works

1. **Listening.** Browser speech recognition (Chrome / Edge) as before. A new language choice, **Auto (Tamil + English)**, is the
   default. A browser can only listen in one language at a time, so Auto listens in the language you used last and switches
   to the other after repeated silence or a reply it could not understand. Optional: configure server speech-to-text
   (below) and Auto uses real per-sentence language detection for the mic button.
2. **Language of the reply = language of what you just said**, decided per sentence (`backend/src/services/languageDetect.js`):
   Tamil script (also Tamil + English mixed) -> Tamil, Tamil in English letters ("enakku laptop venum") -> Tanglish,
   English -> English. The site / speech language you selected is used only to break ties on one-word input.
3. **Understanding.** The existing engine + new `voiceIntents.js` combine several cues (an order word + a status cue, a cancel cue + an
   order word ...) and tolerate recognition slips ("ordar", "cancle", "ad this to cart", "wheres my order"), rather than exact phrases.
   New intents: price question, order status, order cancel, yes / no.
4. **Context.** Each command carries the page, the product just discussed, the last search (so "under 50000" refines it), the
   last question asked, and the recogniser's confidence. "this", "that item", "the second one" are resolved from that.
5. **Safety.** The assistant asks instead of acting when:
   - recognition confidence was low (cart/wishlist change, place/confirm order),
   - a product name was only a sounds-like guess,
   - "that item" could be several things, or "buy laptop" matches many products (it shows results and asks which),
   - cancelling an order: it **always** asks first and only says "cancelled" after the order was really saved as Cancelled,
     using the same eligibility rule as the Cancel button (not after Shipped / Out for Delivery / Delivered).
   Unclear sentences get a short clarification question in the same language.
6. **Speaking.** Replies are spoken with the Tamil voice for Tamil words and the English voice for product names / brands inside the same
   sentence; "₹79,900" is read as "79,900 rupees / ரூபாய்". If your device has no Tamil voice a warning flag is exposed (`missingVoice`).
7. **Hands-free.** Same continuous mode. Duplicate results and the assistant's own voice picked up by the mic are ignored.

## Setup

```bash
# backend
cd backend && cp .env.example .env   # first time only, then edit values
npm install
npm run seed        # first time only
npm start           # http://localhost:5000
npm test

# frontend (second terminal)
cd frontend && cp .env.example .env  # first time only
npm install
npm run dev         # http://localhost:5173
npm test
npm run build
```

### Optional: server speech-to-text (automatic Tamil/English detection, also works in Firefox / Safari)

Add to `backend/.env` (any OpenAI-compatible transcription API; the key never reaches the browser):

```
STT_API_KEY=your-key
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
STT_MODEL=whisper-1
```

Leave `STT_API_KEY` empty to keep using browser recognition only. Endpoints: `GET /api/assistant/capabilities`, `POST /api/assistant/transcribe`.
Server STT applies to the mic button (push-to-talk). Hands-free mode uses browser recognition.

## Files changed / added

Backend: `services/languageDetect.js` (new), `services/voiceIntents.js` (new), `controllers/assistantVoice.js` (new),
`controllers/assistantStt.js` (new), `controllers/assistantController.js`, `controllers/orderController.js` (exports the cancel rule),
`services/assistantEngine.js` (filler words, pronouns, variants), `services/catalogMatcher.js` (+`matchQuality`),
`services/commandExtras.js` (language choice), `routes/assistantRoutes.js`, `.env.example`, `package.json` (test script),
tests: `voice.nlu`, `voice.controller`, `stt` (new); `extras.test`, `extras.controller.test` (updated, see below).

Frontend: `context/VoiceContext.jsx`, `hooks/useVoiceRecognition.js`, `hooks/useHandsFree.js`, `hooks/useServerStt.js` (new),
`utils/speech.js` (new), `services/voiceCommandService.js` (+Auto option), `pages/MyOrders.jsx` and `pages/OrderDetails.jsx`
(refresh when the assistant cancels an order), `package.json` (test script), `tests/speech.test.mjs` (new).

## Behaviour changes you should know about

- English speech now gets an English reply even when the site language is Tamil/Tanglish (it used to follow the site language).
  Five older test assertions that required the opposite were rewritten to the new rule.
- "I want to buy a laptop" now searches and asks which one, instead of adding the top laptop to the cart and opening checkout.
  "buy iphone 15 now" (one clear product) still works as before.
- The mic button now sends what it heard when you stop talking, without needing a second click.
- Unknown words with no search verb (e.g. gibberish) get a clarification question instead of 24 random results.

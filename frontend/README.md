# VoiceShop Frontend

React + Vite single-page app for the Voice Enabled Online Shopping System.

## Setup
```powershell
npm install
copy .env.example .env
npm run dev
```

App runs on `http://localhost:5173`. Requires the backend running (see `backend/README.md`).

## Structure
```
src/
├── components/    Reusable UI (Navbar, ProductCard, VoiceAssistant, route guards, etc.)
├── pages/         One file per route, incl. pages/admin/ for the admin panel
├── layouts/       MainLayout (customer site) and AdminLayout (dashboard shell)
├── context/       Auth, Cart, Wishlist, Voice, Theme — global state via Context API
├── hooks/         useVoiceRecognition (Web Speech API wrapper), useDebounce
├── services/      api.js (Axios client), voiceCommandService.js (voice command parser)
└── utils/         formatCurrency and other small helpers
```

## Key files for the voice feature
- `src/hooks/useVoiceRecognition.js` — wraps `SpeechRecognition` / `SpeechSynthesis`
- `src/services/voiceCommandService.js` — parses transcripts into `{ intent, product, brand, category, maxPrice }`
- `src/context/VoiceContext.jsx` — wires recognition + parser + app actions (search, cart, navigation) together
- `src/components/VoiceAssistant.jsx` — the floating mic button + modal UI
- `src/pages/VoiceSearch.jsx` — dedicated full-page voice search experience

See the root README.md for full setup and troubleshooting instructions.

## Hands-Free Mode

The frontend now includes a dedicated `/hands-free` page. Click **Start Hands-Free** once to grant microphone permission, then the browser continuously listens and automatically restarts recognition after each speech session. Final voice commands are sent through the existing `/api/assistant/message` pipeline, so product search, cart, wishlist, navigation and voice responses reuse the same assistant logic.

Supported voice languages remain English, Tamil, Hindi, Telugu, Malayalam and Kannada. Chrome/Edge are recommended because continuous Web Speech recognition support varies by browser.

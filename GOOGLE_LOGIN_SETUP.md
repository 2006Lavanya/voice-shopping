# Google Login – Client ID epdi edukkanum (5 nimisham, free)

Client ID-ah code-la irundhu generate panna mudiyaathu. Adhu **unga Google account**-la mattum create aagum.

1. https://console.cloud.google.com/ -> Google account-la login.
2. Top-left project dropdown -> **New Project** -> name: `voiceshop` -> Create.
3. Left menu -> **APIs & Services -> OAuth consent screen**
   - User type: **External** -> Create
   - App name: VoiceShop, support email: unga email, developer email: unga email -> Save.
   - **Test users** -> Add Users -> neenga login panna pora Gmail ids-ah add pannunga (publish pannaama irundha, ithula irukkura ids mattum login panna mudiyum).
4. **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** -> Add URI:
       `http://localhost:5173`
       (Vite vera port-la run aana, andha exact URL-um add pannunga, e.g. `http://localhost:5174`)
     (Redirect URIs thevai illai.)
   - Create -> **Client ID** copy pannunga (`1234-abcd.apps.googleusercontent.com`).
5. Rendu .env files-layum **same ID** paste pannunga:
   - `backend/.env`  -> `GOOGLE_CLIENT_ID=1234-abcd.apps.googleusercontent.com`
   - `frontend/.env` -> `VITE_GOOGLE_CLIENT_ID=1234-abcd.apps.googleusercontent.com`
6. Backend + frontend rendayum **stop panni thirumba start** pannunga (.env change aana restart venum).
7. Login page-la "Sign in with Google" button ippo real-ah work aagum.

Common errors
- `Error 400: origin_mismatch` -> step 4-la origin exact-ah (http, port sahitham) add pannala.
- `Access blocked: app not verified / 403 access_denied` -> step 3 Test users-la unga Gmail-ah add pannala.
- Button varala -> `.env` save aachaa, frontend restart pannineengala check pannunga (Login page-la grey "Sign in with Google" button thaan therinja, Client ID innum load aagala).

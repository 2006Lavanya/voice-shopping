# VoiceShop – epdi run pannanum

## Thevai
- Node.js 18+ (https://nodejs.org)
- MongoDB (local: https://www.mongodb.com/try/download/community  **illa** free MongoDB Atlas connection string)
- Chrome illa Edge (voice-ku mukkiyam; Firefox-la speech recognition illa)

## 1. Backend
```bash
cd backend
npm install
# backend/.env-la MONGO_URI check pannunga (default: mongodb://127.0.0.1:27017/voice_shopping)
npm run seed     # 300+ products, 14 categories, demo users load aagum  (thirumba run pannina data reset aagum)
npm run dev      # http://localhost:5000
```
Test (DB thevai illa):  `npm test`

## 2. Frontend (vera terminal)
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

## 3. Login
- Demo user: `demo@voiceshop.com` / `Demo@12345`
- Admin: `admin@voiceshop.com` / `Admin@12345`  (http://localhost:5173/admin/login)
- Google login: GOOGLE_LOGIN_SETUP.md paarunga.

## 4. Hands-free mode
1. Login pannunga (cart/wishlist-ku login thevai).
2. Navbar -> **Hands-Free** -> **Start Hands-Free** (oru click mattum – browser rule) -> mic permission **Allow**.
3. Ippo pesunga. Mic **ellaa pages-layum on-ah irukkum** (left-bottom-la green pill therium). Assistant pesumbodhu mic pause aagum, mudinjadhum thaana resume aagum.
4. Niruthanum na: "stop listening" / "நிறுத்து" sollunga illa pill-la red button.
5. Language dropdown-la English (India) / Tamil / Hindi / Telugu / Kannada / Malayalam select pannunga.

## Sollalaam (ellam work aagum)
| Sollunga | Aagurathu |
|---|---|
| add iPhone 15 to cart / iphone 15 cart la add pannu / ஐபோன் 15 ஐ கார்ட்டில் சேர் | Cart-la add |
| add Samsung phone to wishlist / wishlist la podu / விஷ்லிஸ்ட்டில் சேர் | Wishlist-la add |
| add 2 boat earbuds to cart / ரெண்டு ... சேர் | Quantity 2 |
| search laptops under 60000 / 60000 க்கு கீழ் லேப்டாப் காட்டு | Search + results page |
| add the second one to cart | Screen-la 2-vadhu product |
| add this to cart (product page-la) | Andha product |
| remove iPhone from cart / cart la irundhu edu | Cart-la irundhu remove |
| clear my cart / cart ah kaali pannu / empty wishlist | Clear |
| buy iphone 15 now | Cart-la add + checkout |
| open cart / wishlist kaattu / my orders / go to checkout / go home | Navigation |
| delivery eppadi? / coupon? / payment? | FAQ (andha language-la reply) |
| stop listening | Hands-free off |

## Notes
- Prices: real-world INR rates (approximate). Maarum – Admin panel-la ya `backend/src/seed/extraProducts.js`-la edit panni `npm run seed`.
- Tamil/Telugu... voice **reply** (speaker) – ungal OS/browser-la andha language voice install-ah irukkanum (Windows: Settings > Time & language > Speech; Android Chrome-la irukkum). Illana text reply therium, voice English voice-la varalam.
- Speech recognition Chrome-la Google server use pannum -> internet venum.

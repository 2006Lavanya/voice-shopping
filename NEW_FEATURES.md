# VoiceShop - New Enhancements (v3)

Everything below was **added on top of** the working project. Existing files keep their behaviour; the original
voice engine still runs for every sentence the new layer does not recognise.

## After unzipping: re-seed once
```bash
cd backend && npm install && npm run seed     # adds the new categories/products (437 products, 24 categories)
cd ../frontend && npm install && npm run dev
```
`npm run seed` rebuilds the catalogue (as it always did). Nothing else changes: same ports, same `.env`, no new dependencies.

## 1. Product management
* **125 new products** in `backend/src/seed/moreProducts.js` across the 10 required categories
  (Electronics, Fashion, Grocery, Home & Kitchen, Beauty & Personal Care, Sports, Books, Toys, Mobile Accessories, Computers).
  New categories: Grocery, Home & Kitchen, Beauty & Personal Care, Sports, Toys, Mobile Accessories, Computers.
* Every product has name, description, price (+ MRP/discount), category, stock, rating and its **own REAL photo**.
  Photos are looked up by each product's own name (brand + model) and loaded in the shopper's browser (internet needed,
  like the original Unsplash photos). The original catalogue's real Unsplash photos are kept for the first product that uses
  them; the old drawn tiles and repeated photos are replaced by real photos. Offline option: `IMAGE_SOURCE=generated` in
  `backend/.env` gives drawn illustrations instead; `UNIQUE_IMAGES=false` leaves the original images untouched.
* **Grid / List view** toggle on the Products page (saved in the browser; voice: "list view", "grid view"). Mobile friendly
  (2 columns, 1 column on very small screens in grid view; wide row cards in list view).
* Cards show category, rating, description, price, discount and a stock badge (In stock / Only N left / Out of stock).

## 2. Theme customization
* **Theme Settings panel** (palette icon in the navbar, also embedded in *Settings*): Light / Dark / System, 9 colour presets,
  custom colour picker + hex input, live preview, reset.
* The whole site recolours instantly (Tailwind brand colours are now CSS variables).
* Saved in `localStorage` (`voiceshop_theme`, `voiceshop_accent`) and applied **before** React renders (no flash on refresh).
* Voice: "dark mode", "light mode", "change theme to blue", "open theme settings".

## 3. Multi-language (English / Tamil / Tanglish)
* Switch anytime with the **EN | த | TL** switch in the navbar (or Settings). Saved across refreshes.
* UI text translates (navbar, home, products, cards, cart, checkout, settings, assistant, footer; all strings live in
  `frontend/src/i18n/translations.js` as `[English, Tamil, Tanglish]` triples).
* The assistant **answers in the selected language** and switching also sets the speech-recognition language.
* Search works in all three: "iphone", "ஐபோன்", "arisi" (rice), "paal" (milk), "samsng" (typo)...

## 4. Advanced voice assistant (`backend/src/services/commandExtras.js`)
| Say (English / Tanglish / Tamil) | What happens |
|---|---|
| Add Samsung Galaxy S25 to cart / Samsung Galaxy S25 cart la add pannu / iPhone ah cart la podu | add to cart (original engine, unchanged) |
| Add this product | adds the product on screen (original engine) |
| Increase quantity / quantity kootu / எண்ணிக்கையை அதிகப்படுத்து | +1 (or "by 2", "iphone quantity by 2") |
| Reduce quantity / quantity kuraichu / எண்ணிக்கையை குறை | -1 (removes the item at 0) |
| Set quantity to 3 | exact quantity (capped by stock) |
| How many items are in cart? / cart la evlo items irukku | count + `cart total` -> amount |
| Show cart, Remove product, Empty cart | original engine |
| Checkout / Check out pannu / Proceed to checkout | opens checkout |

Cart commands update the cart and the header badge instantly.

## 5. Voice checkout & payment flow
On the checkout page: **Continue / Next** -> **Confirm address** (or "use the second address", "add new address" - the assistant
asks name, phone, street, city, state, pincode and fills the form as you speak) -> **Standard / Express delivery** ->
**Cash on delivery / UPI payment / Credit card / Debit card / Net banking** -> review screen -> **Place order / Confirm order**.
Each step moves automatically and the assistant speaks guidance for the next one. "Back" goes back; "apply coupon WELCOME10" works.
Saying a payment method on another page ("UPI payment pannu") takes you to checkout and remembers the choice.
Safety: "Confirm order" never skips delivery/payment; the order is placed on the review step.

## 6. AI shopping assistant
* Voice or API: **recommendations**, **trending**, **similar products**, **frequently bought together**, **recently viewed**
  ("recommend a laptop", "show trending products", "show similar products", "frequently bought together", "recently viewed products").
* Product page: *Frequently bought together* bundle (tick items, add all) and *Similar products* row.
* Home: *Recommended for you* now uses `/api/recommendations/for-you` (browsing + wishlist + orders; falls back to the old endpoint).
* New API: `GET /api/recommendations/{trending|similar/:id|frequently-bought/:id|for-you}`, `GET /api/products/meta/suggest?q=`.

## 7. Search
Text + voice, fuzzy (typos), multi-language, category search ("grocery", "toys"), price phrases ("laptops under 50000").
Type-ahead suggestions in the navbar (keyboard accessible). The old search is untouched: the fuzzy matcher only runs when the
normal query finds nothing.

## 8. UI / accessibility
Animations (fade-up, slide-in, pop; respects *reduced motion*), skeleton loaders, toast notifications, skip-to-content link,
visible focus ring, ARIA labels/roles (combobox, dialog, switch, aria-pressed/current), responsive layouts.

## Tests (all offline, no database needed)
```bash
cd backend  && npm test        # engine 66 + controller 10 + new intents 110 + new controller flows + search/catalogue checks
cd frontend && npm test        # every UI string has English + Tamil + Tanglish
```

## Honest notes
* Only the reply wording of *new* commands is trilingual; the original FAQ answers keep their existing languages.
  Hindi/Telugu/Malayalam/Kannada voice input from the original project still works.
* Pages not listed above (login, profile, admin, order details...) are still English.
* Tanglish speech: browsers transcribe Tamil speech either in Tamil script or Latin letters; both are understood.

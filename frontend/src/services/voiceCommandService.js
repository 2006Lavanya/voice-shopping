/**
 * voiceCommandService.js
 * ----------------------
 * A reusable, extensible voice-command parser for the Voice Shopping System.
 * Given a raw recognized transcript, it identifies the user's intent and any
 * relevant entities (product, brand, category, price, quantity) so the app
 * can act on it (search, add to cart, navigate, checkout, etc).
 *
 * To add a new command: add a pattern to COMMAND_PATTERNS below - no other
 * code needs to change, keeping the architecture easy to extend.
 */

export const INTENTS = {
  PRODUCT_SEARCH: "PRODUCT_SEARCH",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  REMOVE_FROM_WISHLIST: "REMOVE_FROM_WISHLIST",
  OPEN_CART: "OPEN_CART",
  CLEAR_CART: "CLEAR_CART",
  GO_TO_CHECKOUT: "GO_TO_CHECKOUT",
  SHOW_ORDERS: "SHOW_ORDERS",
  BUY_NOW: "BUY_NOW",
  GO_HOME: "GO_HOME",
  OPEN_WISHLIST: "OPEN_WISHLIST",
  OPEN_PROFILE: "OPEN_PROFILE",
  UNKNOWN: "UNKNOWN",
};

const BRANDS = [
  "hp", "dell", "lenovo", "apple", "samsung", "oneplus", "redmi", "realme",
  "sony", "boat", "jbl", "nike", "adidas", "puma", "titan", "fossil", "noise",
  "levi's", "levis", "h&m", "anker", "lakme", "mamaearth", "nykaa", "philips",
  "prestige", "lg", "fastrack", "wildhorn", "caprese", "allen solly",
];

const CATEGORIES = [
  "electronics", "mobiles", "mobile", "phone", "smartphone", "laptops", "laptop",
  "fashion", "beauty", "home appliances", "appliances", "accessories", "shoes",
  "watches", "watch",
];

// Extracts a numeric price from phrases like "under 50000", "below ₹60000", "less than 20k"
const extractPrice = (text) => {
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const numMatch = text.match(/(?:under|below|less than|within)\s*₹?\s*(\d[\d,]*)/i);
  if (numMatch) return parseInt(numMatch[1].replace(/,/g, ""), 10);
  return null;
};

const extractBrand = (text) => {
  const found = BRANDS.find((b) => text.includes(b));
  return found ? found.replace(/\b\w/g, (c) => c.toUpperCase()) : null;
};

const extractCategory = (text) => {
  const found = CATEGORIES.find((c) => text.includes(c));
  return found || null;
};

// Pulls out the likely "product" keyword by stripping command words, brand and price phrases
const extractProductKeyword = (text, brand, category) => {
  let cleaned = text
    .replace(/\b(search for|search|find|show me|show|get me|get|look for|i want)\b/gi, "")
    .replace(/\b(under|below|less than|within)\s*₹?\s*[\d,]+k?\b/gi, "")
    .replace(/\b(add|remove|to|from|the|my|this|a|an)\b/gi, "")
    .replace(/\b(cart|wishlist)\b/gi, "")
    .trim();

  if (brand) cleaned = cleaned.replace(new RegExp(brand, "i"), "").trim();
  if (category) cleaned = cleaned.replace(new RegExp(category, "i"), "").trim();

  return cleaned.replace(/\s+/g, " ").trim() || null;
};

/**
 * Main entry point. Takes the raw recognized transcript and returns a
 * structured command object: { intent, product, brand, category, maxPrice, raw }
 */
export const parseVoiceCommand = (transcript) => {
  const text = transcript.toLowerCase().trim();
  const raw = transcript;

  // --- Navigation / cart / checkout / order intents (checked first - these are exact-ish phrases) ---
  if (/\b(open|go to|show)\b.*\bcart\b/.test(text)) {
    return { intent: INTENTS.OPEN_CART, raw };
  }
  if (/\bclear\b.*\bcart\b/.test(text)) {
    return { intent: INTENTS.CLEAR_CART, raw };
  }
  if (/\b(checkout|proceed to checkout|go to checkout)\b/.test(text)) {
    return { intent: INTENTS.GO_TO_CHECKOUT, raw };
  }
  if (/\b(my orders|show my orders|order history|track my order)\b/.test(text)) {
    return { intent: INTENTS.SHOW_ORDERS, raw };
  }
  if (/\b(buy this|buy now|purchase this)\b/.test(text)) {
    return { intent: INTENTS.BUY_NOW, raw };
  }
  if (/\b(go home|home page|go to home)\b/.test(text)) {
    return { intent: INTENTS.GO_HOME, raw };
  }
  if (/\b(open|show|go to)\b.*\bwishlist\b/.test(text)) {
    return { intent: INTENTS.OPEN_WISHLIST, raw };
  }
  if (/\b(open|show|go to)\b.*\b(profile|account)\b/.test(text)) {
    return { intent: INTENTS.OPEN_PROFILE, raw };
  }

  const brand = extractBrand(text);
  const category = extractCategory(text);
  const maxPrice = extractPrice(text);

  // --- Cart / wishlist item intents ---
  if (/\bremove\b.*\bwishlist\b/.test(text)) {
    return { intent: INTENTS.REMOVE_FROM_WISHLIST, product: extractProductKeyword(text, brand, category), brand, category, raw };
  }
  if (/\bremove\b.*\bcart\b/.test(text) || /\bremove\b/.test(text) && !/\bwishlist\b/.test(text) && /\bcart\b/.test(text)) {
    return { intent: INTENTS.REMOVE_FROM_CART, product: extractProductKeyword(text, brand, category), brand, category, raw };
  }
  if (/\badd\b.*\bwishlist\b/.test(text)) {
    return { intent: INTENTS.ADD_TO_WISHLIST, product: extractProductKeyword(text, brand, category), brand, category, raw };
  }
  if (/\badd\b.*\bcart\b/.test(text)) {
    return { intent: INTENTS.ADD_TO_CART, product: extractProductKeyword(text, brand, category), brand, category, raw };
  }

  // --- Default: treat as a product search (covers "search for X", "find X", "show X", "X under Y") ---
  if (/\b(search|find|show|get|look for)\b/.test(text) || brand || category || maxPrice) {
    return {
      intent: INTENTS.PRODUCT_SEARCH,
      product: extractProductKeyword(text, brand, category),
      brand,
      category,
      maxPrice,
      raw,
    };
  }

  return { intent: INTENTS.UNKNOWN, raw };
};

// Builds a friendly, spoken confirmation for a parsed command result
export const buildVoiceResponse = (command, resultCount) => {
  switch (command.intent) {
    case INTENTS.PRODUCT_SEARCH: {
      const parts = [];
      if (command.brand) parts.push(command.brand);
      if (command.product) parts.push(command.product);
      if (command.category) parts.push(command.category);
      const subject = parts.join(" ") || "products";
      const priceText = command.maxPrice ? ` under ₹${command.maxPrice.toLocaleString("en-IN")}` : "";
      return resultCount > 0
        ? `Here are ${resultCount} results for ${subject}${priceText}.`
        : `Sorry, I couldn't find any ${subject}${priceText}.`;
    }
    case INTENTS.ADD_TO_CART:
      return "Done! The item has been added to your cart.";
    case INTENTS.REMOVE_FROM_CART:
      return "Removed the item from your cart.";
    case INTENTS.ADD_TO_WISHLIST:
      return "Added to your wishlist.";
    case INTENTS.REMOVE_FROM_WISHLIST:
      return "Removed from your wishlist.";
    case INTENTS.OPEN_CART:
      return "Opening your cart.";
    case INTENTS.CLEAR_CART:
      return "Your cart has been cleared.";
    case INTENTS.GO_TO_CHECKOUT:
      return "Taking you to checkout.";
    case INTENTS.SHOW_ORDERS:
      return "Here are your orders.";
    case INTENTS.BUY_NOW:
      return "Let's get that ordered for you.";
    case INTENTS.GO_HOME:
      return "Going to the home page.";
    case INTENTS.OPEN_WISHLIST:
      return "Opening your wishlist.";
    case INTENTS.OPEN_PROFILE:
      return "Opening your profile.";
    default:
      return "Sorry, I didn't understand that command. Please try again.";
  }
};

// Supported languages for the language selector (maps to BCP-47 codes for the Web Speech API)
export const VOICE_LANGUAGES = [
  { code: "auto", label: "Auto (Tamil + English)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
  { code: "ta-IN", label: "Tamil" },
  { code: "hi-IN", label: "Hindi" },
  { code: "te-IN", label: "Telugu" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "kn-IN", label: "Kannada" },
];

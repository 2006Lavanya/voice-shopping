/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          // Driven by CSS variables (see src/context/ThemeContext.jsx) so the whole site can be recoloured
          // at runtime. Defaults (pink) are declared in src/index.css and in the pre-paint script in index.html.
          pink: "rgb(var(--brand-rgb) / <alpha-value>)",
          pinkDark: "rgb(var(--brand-dark-rgb) / <alpha-value>)",
          black: "#0F0F14",
          light: "rgb(var(--brand-light-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.06)",
        cardHover: "0 10px 30px rgb(var(--brand-rgb) / 0.18)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
        fadeUp: "fadeUp 0.45s ease-out both",
        slideIn: "slideIn 0.28s ease-out both",
        pop: "pop 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

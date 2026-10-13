import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { VoiceProvider } from "./context/VoiceContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { I18nProvider } from "./context/I18nContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <VoiceProvider>
                  <App />
                  <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
                </VoiceProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart, FaShoppingCart, FaUserCircle,
  FaBars, FaTimes, FaMoon, FaSun, FaBell, FaHandsHelping, FaPalette,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useVoice } from "../context/VoiceContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import SearchBox from "./SearchBox.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { languages, language, setLanguage } = useVoice();
  const { theme, toggleTheme, openThemePanel } = useTheme();
  const { t } = useI18n();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🛍️</span>
          <span className="font-extrabold text-xl tracking-tight">
            Voice<span className="text-brand-pink">Shop</span>
          </span>
        </Link>

        <SearchBox className="hidden md:block flex-1 max-w-xl" />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="hidden lg:block text-sm bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-1.5"
          title={t("nav.voiceLang")}
          aria-label={t("nav.voiceLang")}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LanguageSwitcher />
          <button onClick={toggleTheme} aria-label={t("nav.toggleTheme")} title={t("nav.toggleTheme")} className="text-zinc-500 hover:text-brand-pink transition">
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={openThemePanel} aria-label={t("nav.themeSettings")} title={t("nav.themeSettings")} className="text-zinc-500 hover:text-brand-pink transition">
            <FaPalette />
          </button>
          <Link to="/hands-free" className="flex items-center gap-1 text-zinc-500 hover:text-brand-pink transition" title={t("nav.handsFree")}>
            <FaHandsHelping />
            <span className="hidden xl:inline text-xs font-semibold">{t("nav.handsFree")}</span>
          </Link>
          <Link to="/notifications" aria-label="Notifications" className="text-zinc-500 hover:text-brand-pink transition">
            <FaBell />
          </Link>
          <Link to="/wishlist" aria-label={t("nav.wishlist")} className="relative text-zinc-500 hover:text-brand-pink transition">
            <FaHeart />
            {wishlist?.products?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-pink text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.products.length}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label={t("nav.cart")} className="relative text-zinc-500 hover:text-brand-pink transition">
            <FaShoppingCart />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-pink text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-1">
                <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-cardHover py-2 text-sm">
                  <p className="px-4 py-1 text-zinc-400 truncate">{user.email}</p>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">{t("nav.profile")}</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">{t("nav.orders")}</Link>
                  <Link to="/addresses" className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">{t("nav.addresses")}</Link>
                  {isAdmin && <Link to="/admin" className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">{t("nav.admin")}</Link>}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-200 hover:text-brand-pink">
              <FaUserCircle size={20} />
              <span className="text-sm font-medium">{t("nav.login")}</span>
            </Link>
          )}
        </div>

        <button className="md:hidden ml-auto text-xl" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <SearchBox placeholderKey="nav.searchShort" onDone={() => setMobileOpen(false)} />
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <button onClick={() => { openThemePanel(); setMobileOpen(false); }} aria-label={t("nav.themeSettings")} className="text-zinc-500"><FaPalette /></button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link to="/hands-free" onClick={() => setMobileOpen(false)} className="flex items-center gap-1"><FaHandsHelping /> {t("nav.handsFree")}</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-1"><FaHeart /> {t("nav.wishlist")}</Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-1"><FaShoppingCart /> {t("nav.cart")} ({itemCount})</Link>
            <button onClick={toggleTheme} aria-label={t("nav.toggleTheme")}>{theme === "dark" ? <FaSun /> : <FaMoon />}</button>
          </div>
          {user ? (
            <div className="space-y-2 text-sm">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block">{t("nav.profile")}</Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block">{t("nav.orders")}</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block">{t("nav.admin")}</Link>}
              <button onClick={logout} className="text-red-500">{t("nav.logout")}</button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block font-medium text-brand-pink">{t("nav.loginRegister")}</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

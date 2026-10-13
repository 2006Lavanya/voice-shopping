import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "../context/I18nContext.jsx";

const Footer = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("footer.subscribed"));
    setEmail("");
  };

  return (
    <footer className="bg-brand-black text-zinc-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-white font-bold text-xl mb-3">Voice<span className="text-brand-pink">Shop</span></h3>
          <p className="text-sm text-zinc-400">{t("footer.tagline")}</p>
          <div className="flex gap-4 mt-4 text-lg">
            <FaInstagram className="hover:text-brand-pink cursor-pointer" />
            <FaTwitter className="hover:text-brand-pink cursor-pointer" />
            <FaFacebook className="hover:text-brand-pink cursor-pointer" />
            <FaYoutube className="hover:text-brand-pink cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-brand-pink">{t("footer.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-brand-pink">{t("footer.contact")}</Link></li>
            <li><Link to="/help" className="hover:text-brand-pink">{t("footer.help")}</Link></li>
            <li><Link to="/offers" className="hover:text-brand-pink">{t("footer.offers")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t("footer.account")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-brand-pink">{t("nav.profile")}</Link></li>
            <li><Link to="/orders" className="hover:text-brand-pink">{t("nav.orders")}</Link></li>
            <li><Link to="/wishlist" className="hover:text-brand-pink">{t("nav.wishlist")}</Link></li>
            <li><Link to="/cart" className="hover:text-brand-pink">{t("nav.cart")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t("footer.newsletter")}</h4>
          <p className="text-sm text-zinc-400 mb-3">{t("footer.newsletterSub")}</p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder={t("footer.email")}
              aria-label={t("footer.email")}
              className="flex-1 px-3 py-2 rounded-l-full text-zinc-800 text-sm focus:outline-none"
            />
            <button className="bg-brand-pink px-4 rounded-r-full text-sm font-medium">{t("footer.join")}</button>
          </form>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} VoiceShop. Built as a demonstration project. All product data is for illustration only.
      </div>
    </footer>
  );
};

export default Footer;

import { Link, useNavigate } from "react-router-dom";
import { onImgError } from "../utils/image.js";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import { useI18n } from "../context/I18nContext.jsx";

const Cart = () => {
  const { cart, loading, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useI18n();
  const items = cart?.items || [];

  if (loading) return <Loader full />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title={t("cart.emptyTitle")}
        subtitle={t("cart.emptySub")}
        actionLabel={t("cart.continue")}
        actionTo="/products"
      />
    );
  }

  const tax = Math.round(subtotal * 0.05);
  const shippingFee = subtotal > 999 ? 0 : 49;
  const total = subtotal + tax + shippingFee;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("cart.title", { n: items.length })}</h1>
        <button onClick={clearCart} className="text-sm text-red-500 flex items-center gap-1">
          <FaTrash size={12} aria-hidden="true" /> {t("cart.clear")}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-card">
              <Link to={`/products/${item.product._id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                <img onError={onImgError} src={item.product.images?.[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${item.product._id}`} className="font-medium hover:text-brand-pink">{item.product.name}</Link>
                <p className="text-xs text-zinc-400">{item.product.brand}{item.color ? ` · ${item.color}` : ""}{item.size ? ` · ${item.size}` : ""}</p>
                <p className="font-bold mt-1">{formatCurrency(item.product.discountPrice || item.product.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-full">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label={t("cart.decrease")} className="p-2"><FaMinus size={10} /></button>
                    <span className="px-3 text-sm" aria-live="polite">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label={t("cart.increase")} className="p-2"><FaPlus size={10} /></button>
                  </div>
                  <button onClick={() => removeItem(item._id)} aria-label={t("cart.remove")} className="text-red-400 hover:text-red-500">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card h-fit">
          <h2 className="font-semibold mb-4">{t("cart.summary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">{t("cart.subtotal")}</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">{t("cart.tax")}</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">{t("cart.delivery")}</span><span>{shippingFee === 0 ? t("cart.free") : formatCurrency(shippingFee)}</span></div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between font-bold text-base">
              <span>{t("cart.total")}</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="w-full mt-5 py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition">
            {t("cart.checkout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

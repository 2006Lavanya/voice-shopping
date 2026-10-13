import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaShoppingCart } from "react-icons/fa";
import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { onImgError } from "../utils/image.js";

/**
 * "Frequently bought together" bundle: the product being viewed + complementary products
 * (from real order history first, then category rules). Tick/untick items and add the whole bundle in one tap.
 */
const FrequentlyBoughtTogether = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [picked, setPicked] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/recommendations/frequently-bought/${product._id}`, { params: { limit: 3 } })
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data.products || []).filter((p) => p.stock > 0);
        setItems(list);
        setPicked(Object.fromEntries(list.map((p) => [p._id, true])));
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [product._id]);

  const bundle = useMemo(() => [product, ...items.filter((p) => picked[p._id])], [product, items, picked]);
  const total = bundle.reduce((n, p) => n + (p.discountPrice || p.price), 0);

  if (items.length === 0) return null;

  const addAll = async () => {
    setBusy(true);
    try {
      for (const p of bundle) if (p.stock > 0) await addToCart(p._id, 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label={t("ai.fbt")} className="mt-12 animate-fadeUp">
      <h2 className="text-xl font-bold">{t("ai.fbt")}</h2>
      <p className="text-sm text-zinc-500 mb-4">{t("ai.fbtSub")}</p>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-card p-5 flex flex-col lg:flex-row lg:items-center gap-5">
        <ul className="flex items-center gap-3 overflow-x-auto pb-1">
          {[product, ...items].map((p, i) => (
            <li key={p._id} className="flex items-center gap-3 shrink-0">
              {i > 0 && <FaPlus className="text-zinc-300" aria-hidden="true" />}
              <label className={`block w-32 cursor-pointer ${i > 0 && !picked[p._id] ? "opacity-40" : ""}`}>
                <Link to={`/products/${p._id}`} className="block aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img onError={onImgError} src={p.images?.[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                </Link>
                <span className="flex items-start gap-2 mt-2">
                  {i > 0 ? (
                    <input
                      type="checkbox"
                      checked={Boolean(picked[p._id])}
                      onChange={(e) => setPicked((s) => ({ ...s, [p._id]: e.target.checked }))}
                      className="mt-1 accent-brand-pink"
                      aria-label={p.name}
                    />
                  ) : (
                    <span className="w-3" />
                  )}
                  <span className="text-xs leading-tight">
                    <span className="line-clamp-2 block">{p.name}</span>
                    <span className="font-semibold">{formatCurrency(p.discountPrice || p.price)}</span>
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="lg:ml-auto lg:text-right">
          <p className="text-sm text-zinc-500">{t("ai.together", { total: formatCurrency(total) })}</p>
          <button
            onClick={addAll}
            disabled={busy || bundle.length === 0}
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pinkDark text-white text-sm font-medium transition disabled:opacity-50"
          >
            <FaShoppingCart size={12} aria-hidden="true" /> {t("ai.addAll")} ({bundle.length})
          </button>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;

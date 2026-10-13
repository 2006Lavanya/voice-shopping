import { Link } from "react-router-dom";
import { onImgError } from "../utils/image.js";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import StarRating from "./StarRating.jsx";

// Stock label shown on every card: green "In stock", amber "Only N left" (<= 10), red "Out of Stock"
export const StockBadge = ({ stock, className = "" }) => {
  const { t } = useI18n();
  if (typeof stock !== "number") return null;
  const [tone, label] =
    stock === 0
      ? ["bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", t("card.outOfStock")]
      : stock <= 10
      ? ["bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", t("card.lowStock", { n: stock })]
      : ["bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", t("card.inStock")];
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone} ${className}`}>{label}</span>;
};

/**
 * Product card. view="grid" (default, the original look + category / stock / description) or view="list"
 * (wide horizontal layout used by the List view toggle on the Products page).
 */
const ProductCard = ({ product, view = "grid" }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { t } = useI18n();
  const inWishlist = isInWishlist(product._id);
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const isList = view === "list";

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
  };

  const price = (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="font-bold text-brand-black dark:text-white">{formatCurrency(product.discountPrice || product.price)}</span>
      {product.discountPrice && <span className="text-sm text-zinc-400 line-through">{formatCurrency(product.price)}</span>}
      {discount > 0 && <span className="text-xs font-semibold text-green-600">{t("card.off", { n: discount })}</span>}
    </div>
  );

  const addButton = (
    <button
      onClick={handleAddToCart}
      disabled={product.stock === 0}
      className={`flex items-center justify-center gap-2 py-2 rounded-full bg-brand-black text-white text-sm font-medium hover:bg-brand-pink transition disabled:opacity-40 disabled:cursor-not-allowed ${isList ? "px-6" : "mt-3 w-full"}`}
    >
      <FaShoppingCart size={12} aria-hidden="true" /> {t("card.addToCart")}
    </button>
  );

  const wishlistBtn = (
    <button
      onClick={toggleWishlist}
      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition"
      aria-label={t("card.wishlist")}
      aria-pressed={inWishlist}
    >
      {inWishlist ? <FaHeart className="text-brand-pink" size={14} /> : <FaRegHeart className="text-zinc-500" size={14} />}
    </button>
  );

  const imageBlock = (
    <div className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${isList ? "w-36 sm:w-56 shrink-0 min-h-[10rem]" : "h-48"}`}>
      <img
        onError={onImgError}
        src={product.images?.[0]}
        alt={product.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {discount > 0 && (
        <span className="absolute top-2 left-2 bg-brand-pink text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>
      )}
      {product.stock === 0 && (
        <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-sm text-center px-2">
          {t("card.outOfStock")}
        </span>
      )}
      {wishlistBtn}
    </div>
  );

  const rating = (
    <div className="flex items-center gap-1.5 mt-1">
      <StarRating rating={product.rating} size={12} showValue={false} />
      <span className="text-xs text-zinc-500">{Number(product.rating || 0).toFixed(1)}</span>
      {product.reviewCount > 0 && <span className="text-xs text-zinc-400 hidden sm:inline">({product.reviewCount.toLocaleString("en-IN")})</span>}
    </div>
  );

  if (isList) {
    return (
      <Link
        to={`/products/${product._id}`}
        className="group relative flex rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-card hover:shadow-cardHover transition-all duration-300 animate-fadeUp"
      >
        {imageBlock}
        <div className="p-4 flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">{product.brand}</p>
            {product.category && <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink font-medium">{product.category}</span>}
          </div>
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 mt-1">{product.name}</h3>
          {rating}
          {product.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 sm:line-clamp-3">{product.description}</p>}
          <div className="mt-auto pt-3 flex items-end justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              {price}
              <StockBadge stock={product.stock} />
            </div>
            {addButton}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1 block animate-fadeUp"
    >
      {imageBlock}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-400 uppercase tracking-wide truncate">{product.brand}</p>
          {product.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink font-medium shrink-0">{product.category}</span>}
        </div>
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100 line-clamp-2 mt-1">{product.name}</h3>
        {rating}
        {product.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 hidden sm:block">{product.description}</p>}
        <div className="mt-2">{price}</div>
        <div className="mt-1.5"><StockBadge stock={product.stock} /></div>
        {addButton}
      </div>
    </Link>
  );
};

export default ProductCard;

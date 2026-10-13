import { useState, useEffect, useCallback, useRef } from "react";
import { onImgError } from "../utils/image.js";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaShare, FaMicrophone, FaBolt } from "react-icons/fa";
import api from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useVoice } from "../context/VoiceContext.jsx";
import StarRating from "../components/StarRating.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductRail from "../components/ProductRail.jsx";
import FrequentlyBoughtTogether from "../components/FrequentlyBoughtTogether.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { setAssistantOpen } = useVoice();
  const { t } = useI18n();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const mountedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, relRes, reviewRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/related`),
        api.get(`/reviews/${id}`),
      ]);
      setProduct(prodRes.data.product);
      setRelated(relRes.data.products);
      setReviews(reviewRes.data.reviews);
      setActiveImage(0);
      setQuantity(1);
      api.post("/recommendations/track", { productId: id }).catch(() => {});
    } catch {
      setError("Product not found or could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [load]);

  if (loading) return <Loader full />;
  if (error || !product) return <ErrorState message={error} onRetry={load} />;

  const inWishlist = isInWishlist(product._id);
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleBuyNow = async () => {
    const ok = await addToCart(product._id, quantity);
    if (ok) navigate("/checkout");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setReviews((prev) => [data.review, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 h-96">
            <img onError={onImgError} src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${activeImage === i ? "border-brand-pink" : "border-transparent"}`}
                >
                  <img onError={onImgError} src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-zinc-400 uppercase tracking-wide">{product.brand}</p>
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={product.rating} />
            <span className="text-sm text-zinc-400">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold">{formatCurrency(product.discountPrice || product.price)}</span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-zinc-400 line-through">{formatCurrency(product.price)}</span>
                <span className="text-brand-pink font-semibold text-sm">{discount}% off</span>
              </>
            )}
          </div>

          <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <p className="text-zinc-600 dark:text-zinc-300 mt-5 leading-relaxed">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Colors</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Sizes</p>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2">-</button>
              <span className="px-2">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-4 py-2">+</button>
            </div>
            <button onClick={() => setAssistantOpen(true)} className="text-brand-pink" title="Voice interaction">
              <FaMicrophone />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => addToCart(product._id, quantity)}
              disabled={product.stock === 0}
              className="flex-1 min-w-[140px] py-3 rounded-full bg-brand-black text-white font-medium hover:bg-brand-pink transition disabled:opacity-40"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 min-w-[140px] py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <FaBolt /> Buy Now
            </button>
            <button
              onClick={() => (inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id))}
              className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"
            >
              {inWishlist ? <FaHeart className="text-brand-pink" /> : <FaRegHeart />}
            </button>
            <button onClick={handleShare} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <FaShare />
            </button>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <tr key={k} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2 text-zinc-400 w-1/3">{k}</td>
                      <td className="py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium">Your rating:</span>
            {[1, 2, 3, 4, 5].map((r) => (
              <button type="button" key={r} onClick={() => setReviewForm((f) => ({ ...f, rating: r }))} className={r <= reviewForm.rating ? "text-amber-400" : "text-zinc-300"}>
                ★
              </button>
            ))}
          </div>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            required
            placeholder="Share your experience with this product..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            rows={3}
          />
          <button type="submit" className="mt-3 px-5 py-2 rounded-full bg-brand-pink text-white text-sm font-medium">
            Submit Review
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-zinc-400 text-sm">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{r.userName}</span>
                  <StarRating rating={r.rating} showValue={false} size={12} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* AI shopping assistant: complementary + similar products */}
      <FrequentlyBoughtTogether product={product} />
      <ProductRail title={t("ai.similar")} subtitle={t("ai.similarSub")} endpoint={`/recommendations/similar/${product._id}`} params={{ limit: 8 }} />
    </div>
  );
};

export default ProductDetails;

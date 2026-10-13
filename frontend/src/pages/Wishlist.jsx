import { Link } from "react-router-dom";
import { onImgError } from "../utils/image.js";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import EmptyState from "../components/EmptyState.jsx";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const products = wishlist?.products || [];

  if (products.length === 0) {
    return (
      <EmptyState
        icon="💗"
        title="Your wishlist is empty"
        subtitle="Save products you love here so you can find them easily later."
        actionLabel="Explore Products"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({products.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p._id} className="flex gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-card">
            <Link to={`/products/${p._id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
              <img onError={onImgError} src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1">
              <Link to={`/products/${p._id}`} className="font-medium hover:text-brand-pink line-clamp-1">{p.name}</Link>
              <p className="text-xs text-zinc-400">{p.brand}</p>
              <p className="font-bold mt-1">{formatCurrency(p.discountPrice || p.price)}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => moveToCart(p._id)} className="text-xs flex items-center gap-1 bg-brand-black text-white px-3 py-1.5 rounded-full">
                  <FaShoppingCart size={10} /> Move to Cart
                </button>
                <button onClick={() => removeFromWishlist(p._id)} className="text-red-400 hover:text-red-500">
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

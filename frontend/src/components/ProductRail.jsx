import { useEffect, useState } from "react";
import api from "../services/api.js";
import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "./ProductCardSkeleton.jsx";

/**
 * A titled horizontal row of product cards, loaded from an API path (or given `products`).
 * Used for the AI shopping sections: Similar products, Frequently bought together, Trending, Recommended.
 * Renders nothing if there is nothing to show (no empty headings).
 */
const ProductRail = ({ title, subtitle, endpoint, params, products: given, children, limit = 8 }) => {
  const [products, setProducts] = useState(given || []);
  const [loading, setLoading] = useState(Boolean(endpoint));

  useEffect(() => {
    if (!endpoint) return undefined;
    let cancelled = false;
    setLoading(true);
    api
      .get(endpoint, { params })
      .then(({ data }) => !cancelled && setProducts(data.products || []))
      .catch(() => !cancelled && setProducts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  if (!loading && products.length === 0) return null;

  return (
    <section aria-label={title} className="mt-12 animate-fadeUp">
      <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
      <div className="rail">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-48 sm:w-56"><ProductCardSkeleton /></div>)
          : products.slice(0, limit).map((p) => (
              <div key={p._id} className="w-48 sm:w-56">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default ProductRail;

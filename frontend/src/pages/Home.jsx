import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaMicrophone, FaArrowRight } from "react-icons/fa";
import api from "../services/api.js";
import { onImgError } from "../utils/image.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import StarRating from "../components/StarRating.jsx";
import { useVoice } from "../context/VoiceContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";

const SectionHeader = ({ title, subtitle, to, viewAll = "View all" }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {to && (
      <Link to={to} className="text-brand-pink text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
        {viewAll} <FaArrowRight size={12} aria-hidden="true" />
      </Link>
    )}
  </div>
);

const Home = () => {
  const { setAssistantOpen } = useVoice();
  const { user } = useAuth();
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, trendRes, bestRes, recRes, dealsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products", { params: { featured: true, limit: 8 } }),
        api.get("/products", { params: { bestSeller: true, limit: 8 } }),
        api.get("/recommendations/for-you").catch(() => api.get("/recommendations")),
        api.get("/products", { params: { sort: "price_low", limit: 4 } }),
      ]);
      setCategories(catRes.data.categories);
      setTrending(trendRes.data.products);
      setBestSellers(bestRes.data.products);
      setRecommended(recRes.data.products);
      setFlashDeals(dealsRes.data.products);

      if (user) {
        const { data } = await api.get("/users/recently-viewed");
        setRecentlyViewed(data.products);
      }
    } catch {
      // handled by empty sections
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-light via-white to-brand-light dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-brand-pink/10 text-brand-pink text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {t("home.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {t("home.hero1")} <span className="text-brand-pink">{t("home.hero2")}</span><br /> {t("home.hero3")}
            </h1>
            <p className="text-zinc-500 mt-4 max-w-md">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => setAssistantOpen(true)}
                className="flex items-center gap-2 bg-brand-pink text-white px-6 py-3 rounded-full font-medium hover:bg-brand-pinkDark transition shadow-cardHover"
              >
                <FaMicrophone aria-hidden="true" /> {t("home.tryVoice")}
              </button>
              <Link
                to="/products"
                className="flex items-center gap-2 border-2 border-brand-black dark:border-white px-6 py-3 rounded-full font-medium hover:bg-brand-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
              >
                {t("home.browse")}
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"
              alt="Shopping"
              className="rounded-3xl shadow-2xl w-full object-cover h-80 md:h-96"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Categories */}
        <section>
          <SectionHeader title={t("home.categories")} subtitle={t("home.categoriesSub")} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-card group-hover:shadow-cardHover transition">
                  <img onError={onImgError} src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition" />
                </div>
                <span className="text-xs text-center font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <SectionHeader title={t("home.trending")} subtitle={t("home.trendingSub")} to="/products?sort=popularity" viewAll={t("common.viewAll")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trending.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* Recommended */}
        <section>
          <SectionHeader title={t("home.recommended")} subtitle={t("home.recommendedSub")} to="/products" viewAll={t("common.viewAll")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : recommended.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* Recently Viewed */}
        {user && recentlyViewed.length > 0 && (
          <section>
            <SectionHeader title={t("home.recent")} subtitle={t("home.recentSub")} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {recentlyViewed.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* Flash Deals */}
        <section className="bg-brand-black rounded-3xl p-8 text-white">
          <SectionHeaderDark title={t("home.flash")} subtitle={t("home.flashSub")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {flashDeals.map((p) => (
              <div key={p._id} className="[&_*]:!text-zinc-900">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section>
          <SectionHeader title={t("home.best")} subtitle={t("home.bestSub")} to="/products?bestSeller=true" viewAll={t("common.viewAll")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* Reviews */}
        <section>
          <SectionHeader title={t("home.reviews")} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ananya R.", text: "The voice search actually works great! I found exactly what I needed just by speaking.", rating: 5 },
              { name: "Karthik S.", text: "Fast delivery, easy checkout, and the wishlist feature is really convenient.", rating: 4.5 },
              { name: "Priya M.", text: "Loved the flash deals section. Got my headphones at a great price!", rating: 5 },
            ].map((r) => (
              <div key={r.name} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card">
                <StarRating rating={r.rating} />
                <p className="text-zinc-600 dark:text-zinc-300 mt-3 text-sm">"{r.text}"</p>
                <p className="mt-4 font-medium text-sm">— {r.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const SectionHeaderDark = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

export default Home;

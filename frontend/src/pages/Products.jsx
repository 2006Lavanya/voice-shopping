import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaMicrophone, FaThLarge, FaList } from "react-icons/fa";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { useVoice } from "../context/VoiceContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";

const SORT_OPTIONS = [
  { value: "newest", key: "p.sort.newest" },
  { value: "price_low", key: "p.sort.low" },
  { value: "price_high", key: "p.sort.high" },
  { value: "rating", key: "p.sort.rating" },
  { value: "popularity", key: "p.sort.popular" },
];

// Grid / List view preference is remembered across refreshes (voice: "list view" / "grid view")
const readView = () => {
  try {
    return localStorage.getItem("voiceshop_view") === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAssistantOpen, setVisibleProductIds } = useVoice();
  const { t } = useI18n();
  const [view, setViewState] = useState(readView);
  const setView = useCallback((v) => {
    setViewState(v);
    try {
      localStorage.setItem("voiceshop_view", v);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    const onView = (e) => setViewState(e.detail === "list" ? "list" : "grid");
    window.addEventListener("voiceshop:view", onView);
    return () => window.removeEventListener("voiceshop:view", onView);
  }, []);
  const [fuzzy, setFuzzy] = useState(false);

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [localKeyword, setLocalKeyword] = useState(searchParams.get("keyword") || "");
  const debouncedKeyword = useDebounce(localKeyword, 400);

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minRating: searchParams.get("minRating") || "",
      sort: searchParams.get("sort") || "newest",
      page: searchParams.get("page") || "1",
      bestSeller: searchParams.get("bestSeller") || "",
      ids: searchParams.get("ids") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    if (debouncedKeyword !== filters.keyword) {
      updateParam("keyword", debouncedKeyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/products", { params: { ...filters, limit: 12 } });
      setProducts(data.products);
      setPages(data.pages);
      setFuzzy(Boolean(data.fuzzy));
      setVisibleProductIds(data.products.map((p) => p._id));
    } catch {
      setError(t("p.error"));
    } finally {
      setLoading(false);
    }
  }, [filters, setVisibleProductIds, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/products/meta/brands")])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.categories);
        setBrands(brandRes.data.brands);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {filters.ids ? t("p.voiceResults", { q: searchParams.get("q") || t("p.yourSearch") }) : filters.keyword ? t("p.resultsFor", { q: filters.keyword }) : t("p.all")}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{products.length > 0 ? t("p.found", { n: products.length }) : ""}{filters.ids && (<button onClick={() => updateParam("ids", "")} className="ml-3 text-brand-pink font-medium">{t("p.showAll")}</button>)}</p>
          {fuzzy && filters.keyword && <p role="status" className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t("p.closest", { q: filters.keyword })}</p>}
        </div>
        <button onClick={() => setAssistantOpen(true)} className="hidden sm:flex items-center gap-2 text-brand-pink text-sm font-medium">
          <FaMicrophone /> {t("p.voiceSearch")}
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder={t("p.searchPh")}
          aria-label={t("p.searchPh")}
          className="flex-1 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
        <button onClick={() => setShowFilters((s) => !s)} className="md:hidden px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center gap-2" aria-expanded={showFilters}>
          <FaFilter /> {t("p.filters")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className={`${showFilters ? "block" : "hidden"} md:block space-y-6`}>
          <div>
            <h3 className="font-semibold mb-2 text-sm">{t("p.category")}</h3>
            <div className="space-y-1 text-sm">
              <button onClick={() => updateParam("category", "")} className={`block ${!filters.category ? "text-brand-pink font-medium" : "text-zinc-500"}`}>{t("p.allCat")}</button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParam("category", c.name)}
                  className={`block ${filters.category === c.name ? "text-brand-pink font-medium" : "text-zinc-500"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">{t("p.brand")}</h3>
            <select value={filters.brand} onChange={(e) => updateParam("brand", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <option value="">{t("p.allBrands")}</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">{t("p.price")}</h3>
            <div className="flex gap-2">
              <input type="number" placeholder={t("p.min")} aria-label={t("p.min")} value={filters.minPrice} onChange={(e) => updateParam("minPrice", e.target.value)} className="w-1/2 text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
              <input type="number" placeholder={t("p.max")} aria-label={t("p.max")} value={filters.maxPrice} onChange={(e) => updateParam("maxPrice", e.target.value)} className="w-1/2 text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">{t("p.minRating")}</h3>
            <select value={filters.minRating} onChange={(e) => updateParam("minRating", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <option value="">{t("p.any")}</option>
              {[4, 3, 2, 1].map((r) => <option key={r} value={r}>{t("p.stars", { n: r })}</option>)}
            </select>
          </div>
        </aside>

        <div className="md:col-span-3">
          <div className="flex items-center justify-end gap-3 mb-4">
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden" role="group" aria-label={t("p.view")}>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label={t("p.grid")}
                title={t("p.grid")}
                className={`px-3 py-2 text-sm transition ${view === "grid" ? "bg-brand-pink text-white" : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-brand-pink"}`}
              >
                <FaThLarge />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label={t("p.list")}
                title={t("p.list")}
                className={`px-3 py-2 text-sm transition ${view === "list" ? "bg-brand-pink text-white" : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-brand-pink"}`}
              >
                <FaList />
              </button>
            </div>
            <select aria-label={t("p.sort")} value={filters.sort} onChange={(e) => updateParam("sort", e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.key)}</option>)}
            </select>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : loading ? (
            <div className={view === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 max-[380px]:grid-cols-1 sm:grid-cols-3 gap-5"} aria-busy="true">
              {Array.from({ length: view === "list" ? 5 : 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon="🔍" title={t("p.noneTitle")} subtitle={t("p.noneSub")} />
          ) : (
            <>
              <div className={view === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 max-[380px]:grid-cols-1 sm:grid-cols-3 gap-5"}>
                {products.map((p) => <ProductCard key={p._id} product={p} view={view} />)}
              </div>
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam("page", String(i + 1))}
                      aria-label={t("p.page", { n: i + 1 })}
                      aria-current={Number(filters.page) === i + 1 ? "page" : undefined}
                      className={`w-9 h-9 rounded-full text-sm ${
                        Number(filters.page) === i + 1 ? "bg-brand-pink text-white" : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;

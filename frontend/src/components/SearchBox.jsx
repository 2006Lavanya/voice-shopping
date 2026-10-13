import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMicrophone, FaSpinner } from "react-icons/fa";
import api from "../services/api.js";
import useDebounce from "../hooks/useDebounce.js";
import { useVoice } from "../context/VoiceContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { onImgError } from "../utils/image.js";
import { formatCurrency } from "../utils/formatCurrency.js";

/**
 * Search bar with type-ahead suggestions. Suggestions are fuzzy and multi-language: typing
 * "samsng", "ஐபோன்" or "arisi" still finds Samsung / iPhone / rice. Enter runs the normal product search.
 * Full keyboard support (Up/Down/Enter/Esc) and combobox ARIA roles.
 */
const SearchBox = ({ placeholderKey = "nav.search", onDone, className = "" }) => {
  const navigate = useNavigate();
  const { setAssistantOpen } = useVoice();
  const { t } = useI18n();
  const listId = useId();

  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const debounced = useDebounce(keyword, 250);

  useEffect(() => {
    let cancelled = false;
    if (debounced.trim().length < 2) {
      setItems([]);
      setCategories([]);
      return undefined;
    }
    setLoading(true);
    api
      .get("/products/meta/suggest", { params: { q: debounced.trim() } })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.suggestions || []);
        setCategories(data.categories || []);
        setActive(-1);
      })
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    onDone?.();
  }, [onDone]);

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      navigate(`/products/${items[active]._id}`);
    } else {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    }
    finish();
  };

  const onKeyDown = (e) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Escape") setOpen(false);
  };

  const showList = open && keyword.trim().length >= 2 && (items.length > 0 || categories.length > 0);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit} role="search" className="relative">
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label={t(placeholderKey)}
          autoComplete="off"
          placeholder={t(placeholderKey)}
          className="w-full pl-4 pr-20 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="absolute right-11 top-1/2 -translate-y-1/2 text-brand-pink hover:scale-110 transition"
          aria-label={t("nav.voiceSearch")}
        >
          <FaMicrophone />
        </button>
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-pink" aria-label={t("nav.search.btn")}>
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("nav.suggestions")}
          className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-cardHover border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-pop"
        >
          {categories.slice(0, 2).map((c) => (
            <li key={c} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => { navigate(`/products?category=${encodeURIComponent(c)}`); finish(); }}
                className="w-full text-left px-4 py-2 text-sm text-brand-pink hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <FaSearch size={11} aria-hidden="true" /> {keyword.trim()} {t("nav.inCategory", { category: c })}
              </button>
            </li>
          ))}
          {items.map((p, i) => (
            <li key={p._id} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
              <button
                type="button"
                onClick={() => { navigate(`/products/${p._id}`); finish(); }}
                className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active === i ? "bg-zinc-50 dark:bg-zinc-800" : ""}`}
              >
                <img onError={onImgError} src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm truncate">{p.name}</span>
                  <span className="block text-xs text-zinc-400">{p.category}</span>
                </span>
                <span className="text-sm font-semibold">{formatCurrency(p.discountPrice || p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;

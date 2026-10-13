import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist({ products: [] });
      return;
    }
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.wishlist);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => (wishlist?.products || []).some((p) => p._id === productId),
    [wishlist]
  );

  const addToWishlist = useCallback(
    async (productId) => {
      if (!user) {
        toast.error("Please login to use your wishlist");
        return;
      }
      try {
        const { data } = await api.post("/wishlist", { productId });
        setWishlist(data.wishlist);
        toast.success("Added to wishlist");
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not add to wishlist");
      }
    },
    [user]
  );

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setWishlist(data.wishlist);
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove");
    }
  }, []);

  const moveToCart = useCallback(async (productId) => {
    try {
      await api.post(`/wishlist/${productId}/move-to-cart`);
      await fetchWishlist();
      toast.success("Moved to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not move to cart");
    }
  }, [fetchWishlist]);

  const value = useMemo(
    () => ({ wishlist, fetchWishlist, isInWishlist, addToWishlist, removeFromWishlist, moveToCart }),
    [wishlist, fetchWishlist, isInWishlist, addToWishlist, removeFromWishlist, moveToCart]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

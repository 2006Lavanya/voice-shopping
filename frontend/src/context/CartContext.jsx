import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch {
      // silent - empty cart state will show
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1, options = {}) => {
      if (!user) {
        toast.error("Please login to add items to your cart");
        return false;
      }
      try {
        const { data } = await api.post("/cart", { productId, quantity, ...options });
        setCart(data.cart);
        toast.success("Added to cart!");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not add to cart");
        return false;
      }
    },
    [user]
  );

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update cart");
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.cart);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove item");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const { data } = await api.delete("/cart");
      setCart(data.cart);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not clear cart");
    }
  }, []);

  const removeByName = useCallback(async (name) => {
    try {
      const { data } = await api.post("/cart/remove-by-name", { name });
      setCart(data.cart);
      return true;
    } catch {
      return false;
    }
  }, []);

  // useMemo for derived totals so they only recompute when cart items change
  const { itemCount, subtotal } = useMemo(() => {
    const items = cart?.items || [];
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const sub = items.reduce((sum, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    return { itemCount: count, subtotal: sub };
  }, [cart]);

  const value = useMemo(
    () => ({ cart, loading, itemCount, subtotal, fetchCart, addToCart, updateQuantity, removeItem, clearCart, removeByName }),
    [cart, loading, itemCount, subtotal, fetchCart, addToCart, updateQuantity, removeItem, clearCart, removeByName]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

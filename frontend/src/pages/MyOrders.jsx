import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";

const statusColors = {
  Placed: "bg-blue-100 text-blue-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Packed: "bg-purple-100 text-purple-700",
  Shipped: "bg-amber-100 text-amber-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders);
    } catch {
      setError("Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // The voice assistant can cancel an order; refresh this page when it does.
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("voiceshop:orders-changed", refresh);
    return () => window.removeEventListener("voiceshop:orders-changed", refresh);
  }, [load]);

  if (loading) return <Loader full />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (orders.length === 0) {
    return <EmptyState icon="📦" title="No orders yet" subtitle="Once you place an order, it will show up here." actionLabel="Start Shopping" actionTo="/products" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} className="block bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-zinc-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.orderStatus] || "bg-zinc-100 text-zinc-600"}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3 overflow-x-auto">
              {order.products.slice(0, 4).map((p, i) => (
                <img key={i} src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ))}
              {order.products.length > 4 && (
                <span className="text-xs text-zinc-400">+{order.products.length - 4} more</span>
              )}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-zinc-500">{order.products.length} item(s)</span>
              <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;

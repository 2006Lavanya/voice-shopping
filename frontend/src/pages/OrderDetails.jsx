import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";

const TIMELINE_STEPS = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } catch {
      setError("Could not load this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // The voice assistant can cancel an order; refresh this page when it does.
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener("voiceshop:orders-changed", refresh);
    return () => window.removeEventListener("voiceshop:orders-changed", refresh);
  }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader full />;
  if (error || !order) return <ErrorState message={error} onRetry={load} />;

  const isCancelled = order.orderStatus === "Cancelled";
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.orderStatus);
  const canCancel = !isCancelled && !["Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-brand-pink">← Back to Orders</Link>
      <h1 className="text-2xl font-bold mt-2">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="text-sm text-zinc-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card mt-6">
          <h2 className="font-semibold mb-6">Order Tracking</h2>
          <div className="flex items-center overflow-x-auto">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStepIndex ? "bg-brand-pink text-white" : "bg-zinc-200 text-zinc-500"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 w-16 text-center ${i <= currentStepIndex ? "font-medium" : "text-zinc-400"}`}>{step}</span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && <div className={`w-10 h-0.5 mx-1 ${i < currentStepIndex ? "bg-brand-pink" : "bg-zinc-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 rounded-2xl p-4 mt-6 text-sm font-medium">This order has been cancelled.</div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.products.map((p, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-zinc-400">Qty: {p.quantity}</p>
                </div>
                <p className="font-semibold text-sm">{formatCurrency(p.price * p.quantity)}</p>
              </div>
            ))}
          </div>

          {order.shippingAddress && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm">Shipping Address</h3>
              <p className="text-sm text-zinc-500">
                {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
                {order.shippingAddress.line1}, {order.shippingAddress.line2 && `${order.shippingAddress.line2}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card h-fit">
          <h2 className="font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Tax</span><span>{formatCurrency(order.tax)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Delivery</span><span>{order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between font-bold">
              <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <p className="text-zinc-400">Payment Method</p>
            <p className="font-medium">{order.paymentMethod}</p>
          </div>
          <div className="mt-2 text-sm">
            <p className="text-zinc-400">Payment Status</p>
            <p className={`font-medium ${order.paymentStatus === "SUCCESS" ? "text-green-600" : "text-amber-500"}`}>{order.paymentStatus}</p>
          </div>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="w-full mt-5 py-2.5 rounded-full border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

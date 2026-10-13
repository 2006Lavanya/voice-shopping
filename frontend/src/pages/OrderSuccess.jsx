import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import api from "../services/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import Loader from "../components/Loader.jsx";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  if (!order) return <Loader full />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
      <p className="text-zinc-500 mt-2">Thank you for shopping with VoiceShop. Your order has been confirmed.</p>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-card p-6 mt-8 text-left">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Order ID</span>
          <span className="font-mono">{order._id}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Payment Method</span>
          <span>{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Payment Status</span>
          <span className={order.paymentStatus === "SUCCESS" ? "text-green-600" : "text-amber-500"}>{order.paymentStatus}</span>
        </div>
        <div className="flex justify-between font-bold mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span>Total Amount</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Link to={`/orders/${order._id}`} className="px-6 py-3 rounded-full bg-brand-pink text-white font-medium">Track Order</Link>
        <Link to="/products" className="px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 font-medium">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;

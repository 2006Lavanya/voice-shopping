import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import Loader from "../../components/Loader.jsx";

const STATUS_OPTIONS = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/all");
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">Order Management</h1>
      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-zinc-100">
                <td className="p-4 font-mono text-xs">{o._id.slice(-8).toUpperCase()}</td>
                <td className="p-4">{o.user?.name}<br /><span className="text-xs text-zinc-400">{o.user?.email}</span></td>
                <td className="p-4">{o.products.length}</td>
                <td className="p-4 font-medium">{formatCurrency(o.totalAmount)}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    className="text-xs border border-zinc-200 rounded-full px-2 py-1.5"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

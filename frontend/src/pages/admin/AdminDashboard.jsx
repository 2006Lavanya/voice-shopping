import { useEffect, useState } from "react";
import { FaUsers, FaBoxOpen, FaClipboardList, FaRupeeSign, FaExclamationTriangle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import api from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import Loader from "../../components/Loader.jsx";

const COLORS = ["#EC4899", "#0F0F14", "#F472B6", "#BE185D", "#FBCFE8", "#831843"];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
      <Icon />
    </div>
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/users/admin/stats"),
      api.get("/orders/all"),
      api.get("/products", { params: { limit: 100 } }),
    ])
      .then(([statsRes, ordersRes, productsRes]) => {
        setStats(statsRes.data.stats);
        setOrders(ordersRes.data.orders);
        setProducts(productsRes.data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const lowStock = products.filter((p) => p.stock < 10).length;

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const categoryRevenue = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.price * (p.reviewCount || 1));
    return acc;
  }, {});
  const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value: Math.round(value) })).slice(0, 6);

  const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5)
    .map((p) => ({ name: p.name.slice(0, 14), sales: p.reviewCount }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={FaUsers} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
        <StatCard icon={FaBoxOpen} label="Total Products" value={products.length} color="bg-purple-500" />
        <StatCard icon={FaClipboardList} label="Total Orders" value={stats.totalOrders} color="bg-amber-500" />
        <StatCard icon={FaRupeeSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="bg-green-500" />
        <StatCard icon={FaClipboardList} label="Pending Orders" value={stats.pendingOrders} color="bg-brand-pink" />
        <StatCard icon={FaExclamationTriangle} label="Low Stock Products" value={lowStock} color="bg-red-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#EC4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card lg:col-span-2">
          <h3 className="font-semibold mb-4">Top Products (by reviews)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={10} width={120} />
              <Tooltip />
              <Bar dataKey="sales" fill="#0F0F14" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

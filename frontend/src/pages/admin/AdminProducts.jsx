import { useEffect, useState, useCallback } from "react";
import { onImgError } from "../../utils/image.js";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import Loader from "../../components/Loader.jsx";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100, keyword } });
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Product Management</h1>
        <Link to="/admin/products/new" className="flex items-center gap-2 bg-brand-pink text-white px-4 py-2.5 rounded-full text-sm font-medium">
          <FaPlus size={12} /> Add Product
        </Link>
      </div>

      <input
        value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search products..."
        className="mb-4 w-full max-w-sm px-4 py-2.5 rounded-full border border-zinc-200 bg-white text-sm"
      />

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-left">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-zinc-100">
                  <td className="p-4 flex items-center gap-3">
                    <img onError={onImgError} src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium line-clamp-1 max-w-[200px]">{p.name}</span>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{formatCurrency(p.discountPrice || p.price)}</td>
                  <td className={`p-4 ${p.stock < 10 ? "text-red-500 font-medium" : ""}`}>{p.stock}</td>
                  <td className="p-4">{p.rating?.toFixed(1)} ⭐</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-zinc-400 hover:text-brand-pink"><FaEdit /></Link>
                      <button onClick={() => handleDelete(p._id)} className="text-zinc-400 hover:text-red-500"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FaTrash, FaPlus } from "react-icons/fa";
import api from "../../services/api.js";
import Loader from "../../components/Loader.jsx";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", image: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories", form);
      toast.success("Category added");
      setForm({ name: "", image: "", description: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete category");
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">Category Management</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 grid md:grid-cols-3 gap-3 mb-6">
        <input required placeholder="Category Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-zinc-200" />
        <input required placeholder="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-zinc-200" />
        <button type="submit" className="flex items-center justify-center gap-2 bg-brand-pink text-white rounded-xl font-medium"><FaPlus size={12} /> Add Category</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl shadow-card overflow-hidden relative">
            <img src={c.image} alt={c.name} className="w-full h-24 object-cover" />
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm font-medium">{c.name}</span>
              <button onClick={() => handleDelete(c._id)} className="text-zinc-400 hover:text-red-500"><FaTrash size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;

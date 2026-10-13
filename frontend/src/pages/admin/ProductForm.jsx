import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import Loader from "../../components/Loader.jsx";

const emptyProduct = {
  name: "", description: "", price: "", discountPrice: "", category: "Electronics", brand: "",
  images: "", stock: "", colors: "", sizes: "", tags: "", featured: false, bestSeller: false,
};

// Shared Add/Edit product form (used by both AddProduct and EditProduct routes)
const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({
        ...p,
        images: p.images.join(", "),
        colors: (p.colors || []).join(", "),
        sizes: (p.sizes || []).join(", "),
        tags: (p.tags || []).join(", "),
      });
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      images: form.images.split(/,\s*(?=https?:|data:|\/)/).map((s) => s.trim()).filter(Boolean),
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">{isEdit ? "Edit Product" : "Add New Product"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Product Name</label>
          <input name="name" required value={form.name} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" required rows={3} value={form.description} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Price (₹)</label>
          <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Discount Price (₹, optional)</label>
          <input name="discountPrice" type="number" value={form.discountPrice || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200">
            {["Electronics", "Mobiles", "Laptops", "Fashion", "Beauty", "Home Appliances", "Accessories", "Shoes", "Watches"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Brand</label>
          <input name="brand" required value={form.brand} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Image URLs (comma separated)</label>
          <input name="images" required value={form.images} onChange={handleChange} placeholder="https://... , https://..." className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Stock Quantity</label>
          <input name="stock" type="number" required value={form.stock} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Colors (comma separated, optional)</label>
          <input name="colors" value={form.colors} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Sizes (comma separated, optional)</label>
          <input name="sizes" value={form.sizes} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured Product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleChange} /> Best Seller
        </label>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-brand-pink text-white font-medium disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2.5 rounded-full border border-zinc-200 font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

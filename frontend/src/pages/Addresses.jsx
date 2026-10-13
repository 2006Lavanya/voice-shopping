import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FaTrash, FaEdit, FaCheckCircle } from "react-icons/fa";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";

const emptyAddress = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false };

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data.addresses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(emptyAddress);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/addresses", form);
        toast.success("Address added");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save address");
    }
  };

  const handleEdit = (address) => {
    setForm(address);
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete address");
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="text-sm bg-brand-pink text-white px-4 py-2 rounded-full">+ Add New</button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon="📍" title="No saved addresses" subtitle="Add an address to speed up checkout next time." />
      ) : (
        <div className="space-y-3 mb-6">
          {addresses.map((a) => (
            <div key={a._id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-card flex justify-between items-start">
              <div className="text-sm">
                <p className="font-medium flex items-center gap-2">{a.fullName} {a.isDefault && <FaCheckCircle className="text-green-500" size={12} />}</p>
                <p className="text-zinc-500">{a.phone}</p>
                <p className="text-zinc-500">{a.line1}, {a.line2 && `${a.line2}, `}{a.city}, {a.state} - {a.pincode}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(a)} className="text-zinc-400 hover:text-brand-pink"><FaEdit /></button>
                <button onClick={() => handleDelete(a._id)} className="text-zinc-400 hover:text-red-500"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card grid grid-cols-2 gap-3">
          {[
            ["fullName", "Full Name"], ["phone", "Phone"], ["line1", "Address Line 1"], ["line2", "Address Line 2 (optional)"],
            ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
          ].map(([key, label]) => (
            <input
              key={key} required={key !== "line2"} placeholder={label} value={form[key] || ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
            />
          ))}
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            Set as default address
          </label>
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="px-5 py-2 bg-brand-pink text-white rounded-full text-sm">{editingId ? "Update" : "Save"} Address</button>
            <button type="button" onClick={resetForm} className="px-5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Addresses;

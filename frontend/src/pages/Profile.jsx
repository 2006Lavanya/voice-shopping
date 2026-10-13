import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user, updateUserInStorage } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUserInStorage({ ...user, ...data.user });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8">
        <div className="flex items-center gap-4 mb-6">
          <img src={user?.profileImage} alt={user?.name} className="w-20 h-20 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-zinc-400">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="text-sm font-medium">Email (cannot be changed)</label>
            <input value={user?.email} disabled className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400" />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-brand-pink text-white font-medium disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

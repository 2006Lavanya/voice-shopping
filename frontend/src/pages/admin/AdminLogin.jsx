import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "ADMIN") {
        toast.error("This account does not have admin access");
        return;
      }
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <p className="text-center text-zinc-500 text-sm mt-1">VoiceShop Admin Panel</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email" required placeholder="Admin Email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <input
            type="password" required placeholder="Password" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-brand-black text-white font-medium hover:bg-brand-pink transition disabled:opacity-60">
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
        <div className="mt-4 text-xs text-zinc-400 bg-zinc-50 rounded-xl p-3 text-center">
          Demo admin: admin@voiceshop.com / Admin@12345
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

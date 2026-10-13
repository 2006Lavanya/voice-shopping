import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-center text-zinc-500 text-sm mt-1">Enter your new password below</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button type="submit" disabled={loading || !token} className="w-full py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition disabled:opacity-60">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {!token && <p className="text-xs text-red-500 text-center">Missing reset token. Please restart the forgot-password flow.</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

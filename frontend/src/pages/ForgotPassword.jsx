import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success("Reset token generated. Redirecting to reset page...");
      // In production this token is emailed. For this demo we pass it through the URL.
      navigate(`/reset-password?token=${data.resetToken}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-zinc-500 text-sm mt-1">Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition disabled:opacity-60">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Remembered your password? <Link to="/login" className="text-brand-pink font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

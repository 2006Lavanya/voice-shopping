import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-center text-zinc-500 text-sm mt-1">Login to continue voice shopping</p>

        <GoogleSignInButton />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email" type="email" required value={form.email} onChange={handleChange}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-pink">Forgot password?</Link>
            </div>
            <input
              name="password" type="password" required value={form.password} onChange={handleChange}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-pink font-medium">Sign up</Link>
        </p>
        <div className="mt-4 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-center">
          Demo login: demo@voiceshop.com / Demo@12345
        </div>
      </div>
    </div>
  );
};

export default Login;

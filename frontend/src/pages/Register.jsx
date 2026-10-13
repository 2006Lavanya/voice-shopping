import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-center">Create Your Account</h1>
        <p className="text-center text-zinc-500 text-sm mt-1">Join VoiceShop and start shopping smarter</p>

        <GoogleSignInButton />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {[
            { name: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "9876543210" },
            { name: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium">{field.label}</label>
              <input
                name={field.name} type={field.type} required={field.name !== "phone"} value={form[field.name]}
                onChange={handleChange} placeholder={field.placeholder}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-brand-pink text-white font-medium hover:bg-brand-pinkDark transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-pink font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

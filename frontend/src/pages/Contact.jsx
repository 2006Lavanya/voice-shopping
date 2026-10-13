import { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! Our team will get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p className="text-zinc-500 mb-6">Have a question or feedback? We'd love to hear from you.</p>
        <div className="space-y-4 text-sm">
          <p className="flex items-center gap-3"><FaEnvelope className="text-brand-pink" /> support@voiceshop.com</p>
          <p className="flex items-center gap-3"><FaPhone className="text-brand-pink" /> +91 98765 43210</p>
          <p className="flex items-center gap-3"><FaMapMarkerAlt className="text-brand-pink" /> Chennai, Tamil Nadu, India</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-card p-6 space-y-4">
        <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
        <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
        <textarea required rows={4} placeholder="Your Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
        <button type="submit" className="w-full py-3 rounded-full bg-brand-pink text-white font-medium">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;

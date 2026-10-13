import { FaBell, FaBoxOpen, FaTags } from "react-icons/fa";
import EmptyState from "../components/EmptyState.jsx";

// Sample static notifications - in a production build these would come from GET /api/notifications
const sample = [
  { icon: FaBoxOpen, title: "Order Shipped", message: "Your recent order has been shipped and is on its way.", time: "2 hours ago" },
  { icon: FaTags, title: "Flash Sale Alert", message: "Up to 40% off on Electronics - today only!", time: "1 day ago" },
  { icon: FaBell, title: "Welcome to VoiceShop", message: "Try our voice assistant - just tap the mic and start speaking.", time: "3 days ago" },
];

const Notifications = () => (
  <div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-2xl font-bold mb-6">Notifications</h1>
    {sample.length === 0 ? (
      <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />
    ) : (
      <div className="space-y-3">
        {sample.map((n, i) => (
          <div key={i} className="flex gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-card">
            <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-zinc-800 flex items-center justify-center text-brand-pink shrink-0">
              <n.icon />
            </div>
            <div>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm text-zinc-500">{n.message}</p>
              <p className="text-xs text-zinc-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Notifications;

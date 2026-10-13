import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaTags, FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: FaTachometerAlt, end: true },
  { to: "/admin/products", label: "Products", icon: FaBoxOpen },
  { to: "/admin/orders", label: "Orders", icon: FaClipboardList },
  { to: "/admin/users", label: "Users", icon: FaUsers },
  { to: "/admin/categories", label: "Categories", icon: FaTags },
];

const AdminLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950">
      <aside className="w-64 bg-brand-black text-zinc-300 flex flex-col shrink-0">
        <div className="p-6 text-white font-bold text-xl">
          Voice<span className="text-brand-pink">Shop</span> <span className="text-xs font-normal text-zinc-400 block">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  isActive ? "bg-brand-pink text-white" : "hover:bg-zinc-800"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 truncate mb-2">{user?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

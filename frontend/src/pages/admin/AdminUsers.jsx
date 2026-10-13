import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import api from "../../services/api.js";
import Loader from "../../components/Loader.jsx";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900">User Management</h1>
      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-zinc-100">
                <td className="p-4 flex items-center gap-3">
                  <img src={u.profileImage} alt="" className="w-8 h-8 rounded-full" />
                  {u.name}
                </td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.phone || "-"}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === "ADMIN" ? "bg-brand-pink/10 text-brand-pink" : "bg-zinc-100 text-zinc-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-zinc-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  {u.role !== "ADMIN" && (
                    <button onClick={() => handleDelete(u._id)} className="text-zinc-400 hover:text-red-500"><FaTrash /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

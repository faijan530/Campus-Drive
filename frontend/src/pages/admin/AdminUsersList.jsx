import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAllUsers } from "../../services/adminService.js";

export default function AdminUsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers(token)
      .then((res) => setUsers(res.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">Global system entities & role tracking</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading users...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600">Name</th>
                <th className="px-4 py-3 font-bold text-slate-600">Email</th>
                <th className="px-4 py-3 font-bold text-slate-600">Role</th>
                <th className="px-4 py-3 font-bold text-slate-600">Class</th>
                <th className="px-4 py-3 font-bold text-slate-600">Section</th>
                <th className="px-4 py-3 font-bold text-slate-600">Enrollment No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      u.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' :
                      u.role === 'Teacher' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.className || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.section || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{u.enrollmentNumber || "—"}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

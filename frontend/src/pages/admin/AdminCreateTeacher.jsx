import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { createTeacher } from "../../services/adminService.js";

export default function AdminCreateTeacher() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await createTeacher(token, formData);
      setSuccess("Teacher account created successfully!");
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/app/admin/analytics/users"), 2000);
    } catch (err) {
      setError(err.message || "Failed to create teacher account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Provision Teacher</h1>
        <p className="text-sm text-slate-500">Securely assign an educator to the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-sm font-bold border border-rose-200 rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 rounded-lg">{success}</div>}
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Full Name</label>
          <input
            autoFocus
            type="text"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Email</label>
          <input
            type="email"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jane.doe@university.edu"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Temporary Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Provisioning..." : "Create Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}

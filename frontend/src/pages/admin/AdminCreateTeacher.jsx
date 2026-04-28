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
      setSuccess("Teacher account created successfully.");
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/app/admin/users"), 2000);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Create Teacher Account</h1>
        <p className="text-sm text-slate-500">Set up a new educator profile with administrative permissions</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {(error || success) && (
            <div className={`p-4 rounded-md border flex items-center gap-3 ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {error ? "!" : "✓"}
              </div>
              <p className="text-sm font-medium">{error || success}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                autoFocus
                type="text"
                required
                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@university.edu"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-4">
         <div className="mt-0.5 w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
         </div>
         <div>
            <p className="text-sm font-semibold text-slate-800">Security Note</p>
            <p className="text-sm text-slate-600 mt-1">Please provide a strong temporary password. The teacher will be prompted to reset their password upon their first login.</p>
         </div>
      </div>
    </div>
  );
}

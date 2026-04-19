import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";

export default function ChangePassword() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords do not match.");
    }

    setLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, token);
      
      setSuccess("Your password was updated successfully.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Account Security</h1>
        <p className="text-sm text-slate-500">
          Update the password for your {user?.role.toLowerCase()} account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-lg">{success}</div>}

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Current Password</label>
          <input
            type="password"
            autoFocus
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Confirm New</label>
          <input
            type="password"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

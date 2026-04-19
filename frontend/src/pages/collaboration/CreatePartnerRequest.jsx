import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { createPartnerRequest } from "../../services/collaborationService.js";

export default function CreatePartnerRequest() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    level: "Beginner",
    duration: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        skillsRequired: form.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
      };
      await createPartnerRequest(payload, token);
      navigate("/app/collaboration/partners/my-requests");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-sm font-bold text-slate-800 uppercase mb-4">Create Partner Request</h2>
      {error && <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
          <input
            required
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="e.g. Fullstack E-Commerce App"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            required
            rows={4}
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Describe what you want to build..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Skills Required (comma separated)</label>
          <input
            required
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={form.skillsRequired}
            onChange={(e) => setForm({...form, skillsRequired: e.target.value})}
            placeholder="React, Node.js, MongoDB"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Level</label>
            <select
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={form.level}
              onChange={(e) => setForm({...form, level: e.target.value})}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expected Duration</label>
            <input
              required
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={form.duration}
              onChange={(e) => setForm({...form, duration: e.target.value})}
              placeholder="e.g. 2 weeks"
            />
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

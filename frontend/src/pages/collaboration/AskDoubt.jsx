import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { createDoubt } from "../../services/collaborationService.js";

export default function AskDoubt() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "DSA",
    priority: "Normal",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createDoubt(form, token);
      navigate(`/app/collaboration/mentorship/${res.doubt._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-sm font-bold text-slate-800 uppercase mb-4">Ask a Doubt</h2>
      {error && <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
          <input
            required
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="e.g. Need help with Dynamic Programming approach"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            required
            rows={5}
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Explain where you are stuck in detail..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
            >
              <option value="DSA">DSA</option>
              <option value="Web Dev">Web Dev</option>
              <option value="Resume">Resume</option>
              <option value="Career">Career</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
            <select
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              value={form.priority}
              onChange={(e) => setForm({...form, priority: e.target.value})}
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Doubt"}
          </button>
        </div>
      </form>
    </div>
  );
}

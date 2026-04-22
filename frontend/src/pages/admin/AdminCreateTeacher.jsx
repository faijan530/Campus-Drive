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
      setSuccess("Account successfully provisioned.");
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/app/admin/users"), 2000);
    } catch (err) {
      setError(err.message || "Credential validation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Provision Educator.</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Initialize high-level access for academic supervisor</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] rounded-full -z-10"></div>
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] p-12 space-y-10">
          {(error || success) && (
            <div className={`p-5 rounded-2xl border flex items-center gap-4 animate-shake ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${error ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {error ? "!" : "✓"}
              </div>
              <p className="text-xs font-black uppercase tracking-widest">{error || success}</p>
            </div>
          )}
          
          <div className="grid gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Legal Identity (Name)</label>
              <input
                autoFocus
                type="text"
                required
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Network Address (Email)</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@university.edu"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Access Token (Temporary Password)</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 Alphanumeric"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-2xl relative overflow-hidden"
            >
              <span className="relative z-10">{loading ? "Provisioning Matrix..." : "Execute Provisioning"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-900 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
          </div>
        </form>
      </div>

      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
         <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl">🛡️</div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Security Directive</p>
            <p className="text-[11px] font-bold text-slate-500 italic">Instruction: Assign a strong temporary password. The educator will be prompted to re-initialize credentials upon first sector entry.</p>
         </div>
      </div>
    </div>
  );
}

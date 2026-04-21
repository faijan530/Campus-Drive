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
      return setError("Cryptographic mismatch: New passwords do not align.");
    }

    setLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, token);
      
      setSuccess("Credential synchronization complete. Your vault is secure.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Protocol Failure: Unable to update credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-10 animate-fade-in pb-20">
      <div className="px-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Security Protocol</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">
          Managing cryptographic access for {user?.role || "User"} identification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-0 focus-within:bg-indigo-100/50 transition-colors"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                 </div>
                 <div>
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Credential Management</h2>
                    <p className="text-xs font-bold text-slate-500">Rotate your access keys periodically for maximum defense.</p>
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-shake">
                   <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 animate-bounce-subtle">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Current Authorization Key</label>
                  <input
                    type="password"
                    autoFocus
                    required
                    className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900 font-bold transition-all text-slate-800"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">New Access Key</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 font-bold transition-all text-slate-800"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Min. 8 Entropy"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Verify Mutation</label>
                    <input
                      type="password"
                      required
                      className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 font-bold transition-all text-slate-800"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      Authorize Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { t: "Encryption", d: "Passwords are salted and hashed using industry-standard BCRYPT protocols." },
             { t: "Multi-Factor", d: "Critical account mutations may trigger secondary verification sequences." },
             { t: "Global Logout", d: "Updating keys will terminate all other active engineering sessions." }
           ].map((item, i) => (
             <div key={i} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.t}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{item.d}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}


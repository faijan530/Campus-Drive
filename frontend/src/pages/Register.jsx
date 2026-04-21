import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, role: "Student" });
      navigate("/app/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Registration encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0F172A]">
      {/* ── Ambient Background ────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-rose-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-slide-up">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_32px_120px_-12px_rgba(0,0,0,0.5)] group">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-3xl shadow-2xl mb-8 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white text-3xl font-black tracking-tighter">CD.</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white tracking-tight">Join CampusDrive.</h1>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">Create your professional identity</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-rose-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 pl-14 pr-6 py-4 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-slate-800 focus:border-rose-500/50 transition-all duration-300 shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest px-1">Email Endpoint</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 pl-14 pr-6 py-4 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-800 focus:border-indigo-500/50 transition-all duration-300 shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2 group relative">
                <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest px-1">Passphrase</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 pl-14 pr-14 py-4 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-slate-800 focus:border-emerald-500/50 transition-all duration-300 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                  >
                    {showPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-white text-slate-900 text-[11px] font-black uppercase tracking-[0.3em] py-5 shadow-2xl hover:bg-slate-100 active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Already registered?</p>
            <Link 
              className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-colors group" 
              to="/login"
            >
              <span>Back to Login</span>
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

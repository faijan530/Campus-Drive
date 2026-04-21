import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/app/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#fafafa]">
      {/* ── Ambient Background Effects ────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-[440px] animate-fade-in">
        <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
          
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] shadow-2xl mb-8 group-hover:scale-105 transition-transform duration-500">
               <span className="text-white text-3xl font-black tracking-tighter">CD.</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Portal</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic underline decoration-indigo-500/30 underline-offset-8">Authenticated Session Sequence</p>
            </div>
          </div>

          <form
            className="space-y-8"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                await login(email, password);
                navigate(from, { replace: true });
              } catch (err) {
                setError(err.message || "Sign in failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Identity Vector</label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all duration-300 shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter assigned email"
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Authorization Key</label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all duration-300 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-shake">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Protocol error: {error}</p>
              </div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] py-5 shadow-2xl hover:bg-black transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 relative overflow-hidden flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                  Execute Login
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unauthorized Access? </p>
            <Link 
              className="inline-block px-10 py-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all"
              to="/register"
            >
              Initialize Sub-Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



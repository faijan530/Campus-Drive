import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#fafafa]">
       {/* ── Ambient Background Effects ────────────────────────── */}
       <div className="absolute inset-0 z-0">
         <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-rose-100/40 rounded-full blur-[100px] animate-pulse delay-700"></div>
       </div>

      <div className="relative z-10 w-full max-w-[480px] animate-fade-in">
        <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] group">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl shadow-2xl mb-6 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white text-2xl font-black tracking-tighter">CD.</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Onboarding Phase</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Generate Recruiter-Ready Identity</p>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                await register({ name, email, password });
                navigate("/app/profile", { replace: true });
              } catch (err) {
                setError(err.message || "Registration failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Legal Designation</label>
                <input
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-slate-900 transition-all duration-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Full Legal Name"
                />
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Endpoint</label>
                <input
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-slate-900 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Contact Vector (Email)"
                />
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Encryption Protocol</label>
                <input
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-slate-900 transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create Secure Passphrase"
                />
                <div className="mt-2 text-[9px] font-black text-slate-400 uppercase italic ml-1 tracking-widest">Entropy: Min 8 Octets required</div>
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Default Protocol Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value="Student / Candidate"
                    disabled
                    className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-inner cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
              </div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] py-5 shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                  Initialize Identity
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Existing Protocol detected?</p>
            <Link 
              className="inline-block px-10 py-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all" 
              to="/login"
            >
              Authorization Bridge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



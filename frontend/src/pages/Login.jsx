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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out">
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"></div>
          </div>
          
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-6 hover:scale-110 transition-transform duration-300">
              <span className="text-white text-3xl font-extrabold">CD</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Welcome back</div>
              <div className="text-slate-600">Sign in to your CampusDrive AI account</div>
            </div>
          </div>

          <form
            className="space-y-6"
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Email</label>
              <div className="relative group">
                <input
                  className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md group-hover:bg-white group-hover:border-indigo-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <input
                  className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md group-hover:bg-white group-hover:border-indigo-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="•••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {error ? (
              <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-pulse">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm font-bold py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "Signing in…" : "Sign in"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-700">
            New here?{" "}
            <Link 
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors duration-200"
              to="/register"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


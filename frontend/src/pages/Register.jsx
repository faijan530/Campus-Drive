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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-xl">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-extrabold">CD</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Create account</div>
            <div className="text-sm text-slate-600">Start building a recruiter-ready profile</div>
          </div>
        </div>

        <form
          className="space-y-5"
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Full name</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                required
                autoComplete="name"
                placeholder="John Doe"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Email</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500 ml-1">Minimum 8 characters</div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Role</label>
            <div className="relative">
              <input
                id="register-role"
                type="text"
                value="Student"
                disabled
                className="w-full rounded-xl border border-slate-200/60 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed shadow-sm select-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500 ml-1">Roles are assigned by admins</div>
          </div>

          {error ? (
            <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-pulse">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-bold py-3.5 shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-700">
          Already have an account?{" "}
          <Link 
            className="font-bold text-slate-900 hover:text-slate-700 underline underline-offset-2 transition-colors duration-200" 
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}


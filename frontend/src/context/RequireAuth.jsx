import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-700">Loading…</div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}


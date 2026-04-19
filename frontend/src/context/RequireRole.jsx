import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function roleFallback(role) {
  if (role === "Admin") return "/app/admin/analytics/dashboard";
  if (role === "Teacher") return "/app/teacher/dashboard";
  return "/app/profile";
}

export function RequireRole({ allow = [], children }) {
  const { user, loading, token } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.role || !allow.includes(user.role))
    return <Navigate to={roleFallback(user?.role)} replace />;
  return children;
}

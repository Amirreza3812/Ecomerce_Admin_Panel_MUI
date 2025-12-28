// ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext.tsx";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return null; 

  if (!token) {
    // CHANGED: Redirect to /admin (Login) instead of /
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
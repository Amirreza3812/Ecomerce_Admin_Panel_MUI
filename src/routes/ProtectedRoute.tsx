import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext.tsx";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return null; // یا یک Spinner

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext.tsx";

export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) return null; // یا spinner

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
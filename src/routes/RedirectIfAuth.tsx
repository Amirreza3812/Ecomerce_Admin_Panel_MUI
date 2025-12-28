// RedirectIfAuth.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext.tsx";

export default function RedirectIfAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useAuth();

  if (loading) return null; // یا spinner

  if (token) {
    // CHANGED: Updated destination to /admin/dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
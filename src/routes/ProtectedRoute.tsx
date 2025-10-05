import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext";

// این کامپوننت فقط وقتی کاربر لاگین است بچه‌هاش رو نشون میده
export default function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) {
    // اگر توکن نداره، به صفحه ساین این برگرده
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
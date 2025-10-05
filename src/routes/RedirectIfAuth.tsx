import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexes/AuthContext";

// اگر لاگین است و توکن دارد، اجازه ورود به ساین این نمی‌دهد و به داشبورد می‌فرستد
export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLicense } from "./LicenseContext";

type Admin = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  avatar?: string | null;
  staff_role?: string | null;
  permissions?: string[] | null;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: Admin, license?: unknown) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  admin: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setLicense } = useLicense();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt: string, adminObj: Admin, license?: unknown) => {
    setToken(jwt);
    setAdmin(adminObj);

    localStorage.setItem("token", jwt);
    localStorage.setItem("admin", JSON.stringify(adminObj));

    if (license) {
      localStorage.setItem("app_license", JSON.stringify(license));
      setLicense(license); // Save license to LicenseContext
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("app_license");
    setLicense(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");

    if (storedToken && storedAdmin && storedAdmin !== "undefined") {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    } else {
      setToken(null);
      setAdmin(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

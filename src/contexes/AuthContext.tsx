import React, { createContext, useContext, useState } from "react";

type Admin = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string | null;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: Admin) => void;
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
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt: string, adminObj: Admin) => {
    setToken(jwt);
    setAdmin(adminObj);
    localStorage.setItem("token", jwt);
    if (adminObj) {
      localStorage.setItem("admin", JSON.stringify(adminObj));
    } else {
      localStorage.removeItem("admin");
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  };

  React.useEffect(() => {
    const jwt = localStorage.getItem("token");
    const adm = localStorage.getItem("admin");
    if (jwt && adm && adm !== "undefined") {
      setToken(jwt);
      setAdmin(JSON.parse(adm));
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

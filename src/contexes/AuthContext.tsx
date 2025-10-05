import React, { createContext, useContext, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (jwt: string, userObj: User) => {
    setToken(jwt);
    setUser(userObj);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // بازیابی اطلاعات از localStorage (مثلاً بعد از refresh)
  React.useEffect(() => {
    const jwt = localStorage.getItem("token");
    const usr = localStorage.getItem("user");
    if (jwt && usr) {
      setToken(jwt);
      setUser(JSON.parse(usr));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
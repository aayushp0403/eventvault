import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem("ev_user") || "null"));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("ev_token", data.access_token);
    localStorage.setItem("ev_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/v1/auth/register", payload);
    localStorage.setItem("ev_token", data.access_token);
    localStorage.setItem("ev_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ev_token");
    localStorage.removeItem("ev_user");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
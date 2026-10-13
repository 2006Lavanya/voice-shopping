import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("voiceshop_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("voiceshop_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("voiceshop_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("voiceshop_token");
        localStorage.removeItem("voiceshop_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("voiceshop_token", data.token);
    localStorage.setItem("voiceshop_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("voiceshop_token", data.token);
    localStorage.setItem("voiceshop_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // OAuth 2.0 login: credential is the ID token Google Identity Services hands us
  // after the user authenticates directly with Google (we never see their password).
  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    localStorage.setItem("voiceshop_token", data.token);
    localStorage.setItem("voiceshop_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("voiceshop_token");
    localStorage.removeItem("voiceshop_user");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const updateUserInStorage = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("voiceshop_user", JSON.stringify(updatedUser));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, logout, updateUserInStorage, isAdmin: user?.role === "ADMIN" }),
    [user, loading, login, register, loginWithGoogle, logout, updateUserInStorage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

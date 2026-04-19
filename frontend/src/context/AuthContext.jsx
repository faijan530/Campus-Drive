import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "campusdrive_ai_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/api/auth/me", token);
        if (!cancelled) setUser(res.user);
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken("");
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(email, password) {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem(STORAGE_KEY, res.token);
        setToken(res.token);
        setUser(res.user);
      },
      async register(payload) {
        const res = await api.post("/api/auth/register", payload);
        localStorage.setItem(STORAGE_KEY, res.token);
        setToken(res.token);
        setUser(res.user);
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
        setUser(null);
      }
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


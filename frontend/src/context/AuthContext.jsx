import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import { connectSocket, disconnectSocket } from "../socket/socket.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("devconnect_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("devconnect_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("devconnect_user", JSON.stringify(data.user));
        connectSocket(token);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [token]);

  const applySession = (payload) => {
    localStorage.setItem("devconnect_token", payload.token);
    localStorage.setItem("devconnect_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
    connectSocket(payload.token);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    applySession(data);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    applySession(data);
  };

  const refreshUser = (nextUser) => {
    localStorage.setItem("devconnect_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("devconnect_token");
    localStorage.removeItem("devconnect_user");
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    if (t) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    }
    return t;
  });

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  const loading = false;

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isApproved: user?.isApproved,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
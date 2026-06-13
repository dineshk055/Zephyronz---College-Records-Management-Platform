/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

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
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"]
      });
      
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected to backend");
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setSocket(null);
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
    if (socket) {
      socket.disconnect();
    }
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isApproved: user?.status === "Approved" || user?.isApproved,
    loading,
    socket,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
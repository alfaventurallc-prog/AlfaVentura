"use client";

import { useState, useEffect } from "react";
import { authUtils } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const hasValidTokens = authUtils.isAuthenticated();

        if (hasValidTokens) {
          const userData = localStorage.getItem("user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            authUtils.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);

        authUtils.clearAuth();
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    authUtils.setAuthCookies(token, userData.role);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    authUtils.clearAuth();
  };

  const isAdmin = () => user?.role === "ADMIN";
  const isUser = () => user?.role === "USER";

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: isAdmin(),
    isUser: isUser(),
    login,
    logout,
    updateUser,
  };
};

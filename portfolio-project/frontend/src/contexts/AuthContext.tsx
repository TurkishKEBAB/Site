"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AxiosError } from "axios";

import api, { apiEndpoints } from "@/services/api";

interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>(apiEndpoints.auth.me);
        setUser(response.data);
      } catch (error) {
        console.error("Token verification failed:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
        }
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void verifyToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{
        access_token: string;
        refresh_token?: string;
      }>(apiEndpoints.auth.loginJson, { email, password });

      const { access_token: accessToken, refresh_token: refreshToken } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }

      setToken(accessToken);

      const userResponse = await api.get<User>(apiEndpoints.auth.me);
      setUser(userResponse.data);
    } catch (error) {
      console.error("Login failed:", error);
      const axiosError = error as AxiosError<{ detail?: string }>;
      throw new Error(axiosError.response?.data?.detail || "Login failed");
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

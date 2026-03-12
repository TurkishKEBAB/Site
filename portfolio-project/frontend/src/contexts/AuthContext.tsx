import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AxiosError } from 'axios';

import api, { apiEndpoints } from '../services/api';
import type { User } from '../services/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>(apiEndpoints.auth.me, {
          signal: controller.signal,
        });
        setUser(response.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void verifyToken();

    return () => {
      controller.abort();
    };
  }, [token]);

  // Keep token state in sync when the Axios interceptor silently refreshes it
  useEffect(() => {
    const handleTokenRefresh = (e: Event) => {
      const { token: newToken } = (e as CustomEvent<{ token: string }>).detail;
      setToken(newToken);
    };
    window.addEventListener('token-refreshed', handleTokenRefresh);
    return () => window.removeEventListener('token-refreshed', handleTokenRefresh);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{
        access_token: string;
        refresh_token?: string;
      }>(apiEndpoints.auth.loginJson, { email, password });

      const { access_token: accessToken, refresh_token: refreshToken } = response.data;

      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      setToken(accessToken);

      const userResponse = await api.get<User>(apiEndpoints.auth.me);
      setUser(userResponse.data);
    } catch (error) {
      // Clean up stored tokens if login or user verification failed
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setUser(null);
      console.error('Login failed:', error);
      const axiosError = error as AxiosError<{ detail?: string }>;
      throw new Error(axiosError.response?.data?.detail || 'Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post(
        apiEndpoints.auth.logout,
        { refresh_token: refreshToken },
        { headers: { 'X-Skip-Global-Error': true } },
      );
    } catch {
      // Backend call may fail; always clear client-side state
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user?.is_admin),
    }),
    [user, token, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

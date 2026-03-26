import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, RegisterData, AuthUser } from '../services/auth';
import axios from 'axios';

// Tipos
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = authService.getToken();
      const cachedUser = authService.getUser();

      try {
        if (!token) {
          setUser(null);
          return;
        }

        // Fast path: show cached user immediately (avoid kicking user to login on refresh)
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Validate persisted token when backend supports it
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        // 404 (or network errors): keep cached user if we have it; otherwise fall back to null.
        setUser(cachedUser ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    try {
      const response = await authService.login(email, password);

      if (!response.user) {
        throw new Error("Usuário não retornado pela API");
      }

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
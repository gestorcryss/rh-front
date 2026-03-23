import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, RegisterData } from '../services/auth';

// Tipos
interface User {
  id: number;
  username: string;
  email: string;
  ativo: boolean;
  funcionario?: {
    id: number;
    nome_completo: string;
    numero_mecanografico: string;
  };
  roles?: Array<{ id: number; nome: string; slug: string }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = authService.getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("📞 AuthContext.login recebeu email:", email);
    console.log("📞 AuthContext.login recebeu password:", password ? "***" : "vazio");
    
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }
    
    try {
      const response = await authService.login(email, password);
      console.log("✅ AuthService.login retornou com sucesso");
      
      if (!response.user) {
        throw new Error("Usuário não retornado pela API");
      }
      
      setUser(response.user);
    } catch (error: unknown) {
      console.error("❌ AuthContext.login erro:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
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
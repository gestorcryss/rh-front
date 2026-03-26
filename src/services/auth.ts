import api from './api';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  numero_mecanografico: string;
  nome_completo: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
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

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const authService = {
  login: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: email,
        password: password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        throw error;
      }
      throw new Error('Erro inesperado ao autenticar');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getUser: (): AuthUser | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    // Backends variam bastante: alguns expõem /auth/me, outros /v1/auth/me.
    // Tentamos os paths mais prováveis antes de falhar.
    const paths = ['/auth/me', '/v1/auth/me'];
    let lastError: unknown = null;

    for (const path of paths) {
      try {
        const response = await api.get<{ user: AuthUser }>(path);
        return response.data.user;
      } catch (error: unknown) {
        lastError = error;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          continue;
        }
        throw error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Endpoint de usuário atual não encontrado');
  },
};
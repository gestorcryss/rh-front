import api from './api';

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

export const authService = {
  login: async (email: string, password: string) => {
    console.log("📞 authService.login recebeu email:", email);
    console.log("📞 authService.login recebeu password:", password ? "***" : "vazio");
    
    if (!email || !password) {
      console.error("❌ Email ou senha vazios:", { email: !!email, password: !!password });
      throw new Error("Email e senha são obrigatórios");
    }
    
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });
      
      console.log("✅ Resposta da API (status):", response.status);
      console.log("✅ Dados da resposta:", response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: unknown) {
      const errObj = error as any;
      console.error("❌ Erro no authService.login:", errObj);
      console.error("❌ Dados do erro:", errObj.response?.data);
      throw errObj;
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
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
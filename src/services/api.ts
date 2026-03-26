import axios from 'axios';

// Inclusão da API base URL a partir das variáveis de ambiente
const API_BASE_URL=(import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'https://api.rh.softseven.ao/api';

// Criando uma instância do Axios com a configuração base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Interceptors para adicionar o token de autenticação e lidar com erros globalmente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Interceptor para lidar com erros de autenticação globalmente 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import { authStorage } from './authStorage';

export const API_BASE_URL = 'https://doacao-bebe-site.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error, fallback = 'Não foi possível concluir a operação.') => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.';
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
  }

  const { status, data } = error.response;
  const serverMessage = typeof data === 'string' ? data : data?.message || data?.error;

  if (status === 401) return 'Credenciais inválidas ou sessão expirada.';
  if (status === 403) return serverMessage || 'Acesso negado.';
  if (status >= 500) return 'Erro interno no servidor. Tente novamente mais tarde.';
  return serverMessage || fallback;
};

export const authApi = {
  login: (email, senha) => api.post('/api/auth/login', { email, senha }),
  register: (nome, email, cpf, senha) => api.post('/api/auth/cadastro', { nome, email, cpf, senha }),
  me: () => api.get('/api/auth/me'),
};

export const productApi = {
  list: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (formData) => api.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  sellerSummary: () => api.get('/api/products/meus'),
};

export const checkoutApi = {
  calculateShipping: (productId, cepDestino) => api.post('/api/shipping/calculate', {
    produtoId: productId,
    cepDestino,
  }),
  checkout: (productId, cepDestino) => api.post('/api/checkout', {
    produtoId: productId,
    cepDestino,
  }),
  simulatePayment: (pagamentoId) => api.post(`/api/dev/simulate-payment/${encodeURIComponent(pagamentoId)}`),
};

export const orderApi = {
  listMine: () => api.get('/api/orders'),
  listSales: () => api.get('/api/orders/vendas'),
  getById: (id) => api.get(`/api/orders/${id}`),
};

export const walletApi = {
  get: () => api.get('/api/wallet'),
  history: () => api.get('/api/wallet/history'),
  requestWithdrawal: (valor) => api.post('/api/withdrawals', { valor }),
};

export const favoriteApi = {
  ids: () => api.get('/api/favoritos/ids'),
  list: () => api.get('/api/favoritos'),
  add: (productId) => api.post(`/api/favoritos/${productId}`),
  remove: (productId) => api.delete(`/api/favoritos/${productId}`),
};

export default api;

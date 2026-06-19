import axios from 'axios';
import { buscarToken } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://doacao-bebe-site.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await buscarToken();
      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore token errors
    }
    if (typeof config.data !== 'undefined') {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.data);
    } else {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.log('[API] Request error', error.message || error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log('[API] Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('[API] No response:', error.message);
    } else {
      console.log('[API] Setup error:', error.message);
    }

    const normalized = {
      status: error.response?.status ?? null,
      message: error.response?.data?.message ?? error.message ?? 'Erro de rede',
      data: error.response?.data ?? null,
    };

    return Promise.reject({ ...error, apiError: normalized });
  }
);

export default api;

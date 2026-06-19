import axios from 'axios';
import { buscarToken } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://doacao-bebe-site.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

let currentToken = null;

export function setSessionToken(token) {
  currentToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api.defaults.headers.common.authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete api.defaults.headers.common.authorization;
  }
  return token;
}

api.interceptors.request.use(
  async (config) => {
    try {
      let token = currentToken;
      if (!token) {
        token = await buscarToken();
        if (token) {
          setSessionToken(token);
        }
      }
      console.log('[API] token loaded:', token ? 'yes' : 'no');
      config.headers = config.headers || {};
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('[API] token load error', e?.message ?? e);
    }
    if (typeof config.data !== 'undefined') {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.data);
    } else {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    }
    console.log('[API] Request headers:', config.headers);
    console.log('[API] Request Authorization header value:', config.headers?.Authorization || config.headers?.authorization || 'none');
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

import axios, { AxiosError } from 'axios';
import { authTokenManager } from './tokenManager';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = authTokenManager.getToken();
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (val?: any) => void; reject: (err: any) => void }> = [];

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach(p => (err ? p.reject(err) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error: AxiosError & { config?: any }) => {
    const originalConfig = error.config;
    if (!originalConfig) return Promise.reject(error);

    if (error.response?.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalConfig.headers['Authorization'] = `Bearer ${token}`;
          return api(originalConfig);
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await api.post('/auth/refresh');
        const newToken = refreshRes.data.accessToken;
        authTokenManager.setToken(newToken);
        processQueue(null, newToken);
        return api(originalConfig);
      } catch (err) {
        processQueue(err, null);
        authTokenManager.clearToken();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

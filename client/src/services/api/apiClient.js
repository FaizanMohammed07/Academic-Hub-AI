import axios from 'axios';
import { useAuthStore } from '@store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: refresh token on 401 ────────────────
let refreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  queue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
        useAuthStore.getState().updateToken({ accessToken: newAccess, refreshToken: newRefresh });
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        const PUBLIC_PATHS = ['/', '/login'];
        const isPublic = PUBLIC_PATHS.includes(window.location.pathname) || window.location.pathname.startsWith('/api');
        if (!isPublic) window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;

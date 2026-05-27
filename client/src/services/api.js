import axios from 'axios';

const AUTH_TOKEN_KEY = 'leadflow.token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('leadflow.user');
      if (
        typeof window !== 'undefined' &&
        !['/login', '/register'].includes(window.location.pathname)
      ) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export { AUTH_TOKEN_KEY };
export default api;

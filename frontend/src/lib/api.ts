import axios from 'axios';
import { tokenStorage } from './tokenStorage';
import { useAuth } from '../stores/authStore';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuth.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

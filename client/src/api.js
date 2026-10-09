import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const rawUrl = (envUrl && envUrl.trim()) ? envUrl.trim() : 'http://localhost:5000/api';
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Interceptor to attach the demo user's email
api.interceptors.request.use((config) => {
  const email = localStorage.getItem('demo_user_email');
  if (email) {
    config.headers['X-Demo-User-Email'] = email;
  }
  return config;
});

export default api;

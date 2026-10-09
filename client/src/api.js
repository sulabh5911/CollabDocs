import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

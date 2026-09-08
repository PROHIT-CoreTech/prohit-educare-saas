import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (!config.headers.Authorization) {
      const platformToken = localStorage.getItem('prohit_platform_token');
      const tenantToken = localStorage.getItem('prohit_auth_token');
      const token = window.location.pathname.startsWith('/platform-admin') ? (platformToken || tenantToken) : (tenantToken || platformToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      const msg = error.response.data?.message;
      if (typeof msg === 'string' && (msg.includes('another device') || msg.includes('Session invalidated'))) {
        localStorage.removeItem('prohit_auth_token');
        alert('⚠️ Session Expired: You have been logged out because your account was logged in from another device.');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

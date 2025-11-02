import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL - Environment variable'dan oku veya fallback kullan
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios instance oluştur
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 401 hatası - Yetkilendirme hatası
      console.error('Authorization error:', error.response.data);
      
      // Eğer /auth/me endpoint'i değilse (sonsuz loop önleme) logout yap
      if (!error.config?.url?.includes('/auth/me')) {
        // Token süresi dolmuş veya geçersiz, kullanıcıyı logout yap
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Sadece admin panelindeyse login'e yönlendir
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoint'leri
export const apiEndpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // Projects
  projects: {
    list: '/projects',
    detail: (id: string) => `/projects/${id}`,
    create: '/projects',
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
  },

  // Blog
  blog: {
    list: '/blog',
    detail: (slug: string) => `/blog/${slug}`,
    create: '/blog',
    update: (slug: string) => `/blog/${slug}`,
    delete: (slug: string) => `/blog/${slug}`,
  },

  // Skills
  skills: {
    list: '/skills',
    detail: (id: string) => `/skills/${id}`,
    create: '/skills',
    update: (id: string) => `/skills/${id}`,
    delete: (id: string) => `/skills/${id}`,
  },

  // Experiences
  experiences: {
    list: '/experiences',
    detail: (id: string) => `/experiences/${id}`,
    create: '/experiences',
    update: (id: string) => `/experiences/${id}`,
    delete: (id: string) => `/experiences/${id}`,
  },

  // Contact
  contact: {
    send: '/contact',
  },

  // GitHub
  github: {
    repos: '/github/repositories',
    stats: '/github/statistics',
  },
  
  // Translations
  translations: {
    list: '/translations',
  },
};

export default api;

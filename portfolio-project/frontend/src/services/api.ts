import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');

      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    loginJson: '/auth/login/json',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  projects: {
    list: '/projects/',
    detail: (slug: string) => `/projects/${slug}`,
    create: '/projects/',
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
    addTranslation: (id: string) => `/projects/${id}/translations`,
    uploadImage: (id: string) => `/projects/${id}/upload-image`,
    updateImage: (projectId: string, imageId: string) =>
      `/projects/${projectId}/images/${imageId}`,
    deleteImage: (projectId: string, imageId: string) =>
      `/projects/${projectId}/images/${imageId}`,
  },

  blog: {
    list: '/blog/',
    detail: (slug: string) => `/blog/${slug}`,
    create: '/blog/',
    update: (postId: string) => `/blog/${postId}`,
    delete: (postId: string) => `/blog/${postId}`,
  },

  skills: {
    list: '/skills/',
    detail: (id: string) => `/skills/${id}`,
    create: '/skills/',
    update: (id: string) => `/skills/${id}`,
    delete: (id: string) => `/skills/${id}`,
  },

  experiences: {
    list: '/experiences/',
    detail: (id: string) => `/experiences/${id}`,
    create: '/experiences/',
    update: (id: string) => `/experiences/${id}`,
    delete: (id: string) => `/experiences/${id}`,
  },

  contact: {
    send: '/contact/',
    list: '/contact/',
    unreadCount: '/contact/unread-count',
    markRead: (id: string) => `/contact/${id}/read`,
    markReplied: (id: string) => `/contact/${id}/replied`,
    delete: (id: string) => `/contact/${id}`,
  },

  github: {
    repos: '/github/repos',
    sync: '/github/sync',
    cacheStatus: '/github/cache-status',
  },

  translations: {
    list: '/translations',
    byLanguage: (language: string) => `/translations/${language}`,
  },
} as const;

export default api;

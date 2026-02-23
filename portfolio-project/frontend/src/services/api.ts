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

const shouldAttachLanguage = (config: { method?: string; url?: string }) => {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') {
    return false;
  }

  const url = config.url || '';
  return !url.startsWith('/auth/');
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const language = localStorage.getItem('lang') || 'en';

    const skipLanguageHeader =
      (config.headers as Record<string, unknown> | undefined)?.['X-Skip-Language'] === true;

    if (!skipLanguageHeader && shouldAttachLanguage(config)) {
      config.params = {
        ...(config.params || {}),
        language,
      };
    }

    if (config.headers && 'X-Skip-Language' in config.headers) {
      delete (config.headers as Record<string, unknown>)['X-Skip-Language'];
    }

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
    const status = error.response?.status;
    const skipGlobalErrorValue =
      (error.config?.headers as Record<string, unknown> | undefined)?.['X-Skip-Global-Error'];
    const shouldSkipGlobalError =
      skipGlobalErrorValue === true || skipGlobalErrorValue === 'true';

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');

      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }

    if (!shouldSkipGlobalError) {
      window.dispatchEvent(
        new CustomEvent('api:error', {
          detail: {
            status,
            message: error.message,
          },
        }),
      );
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

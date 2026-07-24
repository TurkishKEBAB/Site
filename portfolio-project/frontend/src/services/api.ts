import axios, { AxiosError, AxiosInstance } from 'axios';

import { parseApiError } from '@/lib/errors';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const browserNavigation = {
  redirectToLogin() {
    window.location.href = '/login';
  },
};

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
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const language =
      typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en';

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
    const parsedError = parseApiError(error);
    const skipGlobalErrorValue =
      (error.config?.headers as Record<string, unknown> | undefined)?.['X-Skip-Global-Error'];
    const shouldSkipGlobalError =
      skipGlobalErrorValue === true || skipGlobalErrorValue === 'true';

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');

        if (window.location.pathname.startsWith('/admin')) {
          browserNavigation.redirectToLogin();
        }
      }
    }

    if (!shouldSkipGlobalError) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('api:error', {
            detail: {
              status,
              code: parsedError.code,
              message: parsedError.message,
              fields: parsedError.fields,
              requestId: parsedError.requestId,
            },
          }),
        );
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
    list: '/projects',
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

  dossiers: {
    public: (slug: string) => `/dossiers/${slug}`,
    admin: (projectId: string) => `/dossiers/projects/${projectId}`,
  },

  technologies: {
    list: '/technologies/',
    detail: (id: string) => `/technologies/${id}`,
    create: '/technologies/',
    update: (id: string) => `/technologies/${id}`,
    delete: (id: string) => `/technologies/${id}`,
  },

  blog: {
    list: '/blog/',
    detail: (slug: string) => `/blog/${slug}`,
    adminList: '/blog/admin',
    adminDetail: (postId: string) => `/blog/admin/${postId}`,
    create: '/blog/',
    update: (postId: string) => `/blog/${postId}`,
    delete: (postId: string) => `/blog/${postId}`,
    addTranslation: (postId: string) => `/blog/${postId}/translations`,
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

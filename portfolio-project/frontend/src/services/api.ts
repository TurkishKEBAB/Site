import axios, { AxiosError, AxiosInstance } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL environment variable is required. ' +
    'Set it in .env (e.g. VITE_API_BASE_URL=http://localhost:8000/api/v1)',
  );
}

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

// Token refresh queue to avoid concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname.startsWith('/admin')) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const skipGlobalErrorValue =
      (error.config?.headers as Record<string, unknown> | undefined)?.['X-Skip-Global-Error'];
    const shouldSkipGlobalError =
      skipGlobalErrorValue === true || skipGlobalErrorValue === 'true';

    // Attempt token refresh on 401 for non-auth endpoints
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken: string = data.access_token;
        const newRefreshToken: string | undefined = data.refresh_token;

        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Notify AuthContext that token was silently refreshed
        window.dispatchEvent(
          new CustomEvent('token-refreshed', { detail: { token: newAccessToken } }),
        );

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-refreshable 401 (after retry): clear auth and redirect
    if (status === 401 && !originalRequest?._retry) {
      clearAuthAndRedirect();
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
    logout: '/auth/logout',
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

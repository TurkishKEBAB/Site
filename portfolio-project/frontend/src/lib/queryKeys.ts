/**
 * Centralized React Query key factory.
 * Use these keys for consistent cache invalidation across the app.
 */

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: object) => [...projectKeys.lists(), params] as const,
  featured: (language: string) => [...projectKeys.all, 'featured', language] as const,
  detail: (slug: string, language?: string) =>
    [...projectKeys.all, 'detail', slug, language] as const,
};

export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: object) => [...blogKeys.lists(), params] as const,
  detail: (slug: string, language?: string) =>
    [...blogKeys.all, 'detail', slug, language] as const,
};

export const skillKeys = {
  all: ['skills'] as const,
  list: (language?: string) => [...skillKeys.all, language] as const,
};

export const experienceKeys = {
  all: ['experiences'] as const,
  list: (params: object) => [...experienceKeys.all, 'list', params] as const,
};

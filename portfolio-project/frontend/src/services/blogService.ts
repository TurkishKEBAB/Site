import api, { apiEndpoints } from './api';
import { BlogPost, BlogPostCreate, PaginatedResponse } from './types';

type BlogPostApiRecord = BlogPost & {
  is_published?: boolean;
  view_count?: number | string;
  read_time?: number | string;
};

const normalizeNumber = (value: number | string | undefined, fallback = 0): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const normalizeBlogPost = (post: BlogPostApiRecord): BlogPost => ({
  ...post,
  published: typeof post.published === 'boolean' ? post.published : Boolean(post.is_published),
  is_published:
    typeof post.is_published === 'boolean' ? post.is_published : Boolean(post.published),
  views: normalizeNumber(post.views, normalizeNumber(post.view_count)),
  view_count: normalizeNumber(post.view_count, normalizeNumber(post.views)),
  reading_time:
    typeof post.reading_time === 'number'
      ? post.reading_time
      : post.read_time !== undefined
        ? normalizeNumber(post.read_time, 0)
        : undefined,
  read_time:
    typeof post.read_time === 'number'
      ? post.read_time
      : post.read_time !== undefined
        ? normalizeNumber(post.read_time, 0)
        : post.reading_time !== undefined
          ? normalizeNumber(post.reading_time, 0)
        : undefined,
  is_featured: Boolean(post.is_featured),
});

export const blogService = {
  async getPosts(params?: {
    skip?: number;
    limit?: number;
    tag?: string;
    published_only?: boolean;
    language?: string;
  }): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get(apiEndpoints.blog.list, {
      params
    });
    const payload = response.data as PaginatedResponse<BlogPost>;

    return {
      ...payload,
      items: Array.isArray(payload.items)
        ? payload.items.map((item) => normalizeBlogPost(item))
        : [],
    };
  },

  async getPost(slug: string, language?: string): Promise<BlogPost> {
    const response = await api.get(apiEndpoints.blog.detail(slug), {
      params: language ? { language } : undefined,
    });
    return normalizeBlogPost(response.data);
  },

  async createPost(data: BlogPostCreate): Promise<BlogPost> {
    const response = await api.post(apiEndpoints.blog.create, data);
    return normalizeBlogPost(response.data);
  },

  async updatePost(postId: string, data: Partial<BlogPostCreate>): Promise<BlogPost> {
    const response = await api.put(apiEndpoints.blog.update(postId), data);
    return normalizeBlogPost(response.data);
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(apiEndpoints.blog.delete(postId));
  },
};

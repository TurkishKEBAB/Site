import api, { apiEndpoints } from './api';
import { BlogPost, BlogPostCreate, PaginatedResponse } from './types';

const resolveLanguage = (language?: string) =>
  language || localStorage.getItem('lang') || 'en';

const normalizeBlogPost = (post: any): BlogPost => ({
  ...post,
  published: typeof post.published === 'boolean' ? post.published : Boolean(post.is_published),
  is_published:
    typeof post.is_published === 'boolean' ? post.is_published : Boolean(post.published),
  views: typeof post.views === 'number' ? post.views : Number(post.view_count || 0),
  view_count:
    typeof post.view_count === 'number' ? post.view_count : Number(post.views || 0),
  reading_time:
    typeof post.reading_time === 'number'
      ? post.reading_time
      : post.read_time
        ? Number(post.read_time)
        : undefined,
  read_time:
    typeof post.read_time === 'number'
      ? post.read_time
      : post.reading_time
        ? Number(post.reading_time)
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
      params: {
        ...params,
        language: resolveLanguage(params?.language),
      },
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
      params: { language: resolveLanguage(language) },
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

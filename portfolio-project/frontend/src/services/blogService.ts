import api, { apiEndpoints } from './api';
import { BlogPost, BlogPostCreate, PaginatedResponse } from './types';

interface RawBlogPost extends Record<string, unknown> {
  id?: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  is_published?: boolean;
  published?: boolean;
  is_featured?: boolean;
  views?: number;
  view_count?: number;
  reading_time?: number;
  read_time?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

const normalizeBlogPost = (post: RawBlogPost): BlogPost => ({
  ...post,
  is_published:
    typeof post.is_published === 'boolean' ? post.is_published : Boolean(post.published),
  views: typeof post.views === 'number' ? post.views : Number(post.view_count ?? 0),
  reading_time:
    typeof post.reading_time === 'number'
      ? post.reading_time
      : post.read_time
        ? Number(post.read_time)
        : undefined,
  is_featured: Boolean(post.is_featured),
} as BlogPost);

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
    const payload = response.data as PaginatedResponse<RawBlogPost>;

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

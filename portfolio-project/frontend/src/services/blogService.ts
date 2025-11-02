import api, { apiEndpoints } from './api';
import { BlogPost, BlogPostCreate, PaginatedResponse } from './types';

export const blogService = {
  // Tüm blog yazılarını getir
  async getPosts(params?: {
    skip?: number;
    limit?: number;
    tag?: string;
    is_published?: boolean;
  }): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get(apiEndpoints.blog.list, { params });
    return response.data;
  },

  // Tek bir blog yazısını getir
  async getPost(slug: string): Promise<BlogPost> {
    const response = await api.get(apiEndpoints.blog.detail(slug));
    return response.data;
  },

  // Yeni blog yazısı oluştur (Admin)
  async createPost(data: BlogPostCreate): Promise<BlogPost> {
    const response = await api.post(apiEndpoints.blog.create, data);
    return response.data;
  },

  // Blog yazısını güncelle (Admin)
  async updatePost(slug: string, data: Partial<BlogPostCreate>): Promise<BlogPost> {
    const response = await api.put(apiEndpoints.blog.update(slug), data);
    return response.data;
  },

  // Blog yazısını sil (Admin)
  async deletePost(slug: string): Promise<void> {
    await api.delete(apiEndpoints.blog.delete(slug));
  },
};

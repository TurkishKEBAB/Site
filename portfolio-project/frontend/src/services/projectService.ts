import api, { apiEndpoints } from './api';
import { Project, ProjectCreate, PaginatedResponse } from './types';

export const projectService = {
  // Tüm projeleri getir
  async getProjects(params?: {
    skip?: number;
    limit?: number;
    is_featured?: boolean;
    is_published?: boolean;
  }): Promise<PaginatedResponse<Project>> {
    const response = await api.get(apiEndpoints.projects.list, { params });
    return response.data;
  },

  // Tek bir projeyi getir
  async getProject(id: string): Promise<Project> {
    const response = await api.get(apiEndpoints.projects.detail(id));
    return response.data;
  },

  // Yeni proje oluştur (Admin)
  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post(apiEndpoints.projects.create, data);
    return response.data;
  },

  // Projeyi güncelle (Admin)
  async updateProject(id: string, data: Partial<ProjectCreate>): Promise<Project> {
    const response = await api.put(apiEndpoints.projects.update(id), data);
    return response.data;
  },

  // Projeyi sil (Admin)
  async deleteProject(id: string): Promise<void> {
    await api.delete(apiEndpoints.projects.delete(id));
  },
};

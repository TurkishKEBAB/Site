import api, { apiEndpoints } from './api';
import { PaginatedResponse, Project, ProjectCreate } from './types';

const resolveLanguage = (language?: string) =>
  language || localStorage.getItem('lang') || 'en';

export const projectService = {
  async getProjects(params?: {
    skip?: number;
    limit?: number;
    featured_only?: boolean;
    technology_slug?: string;
    language?: string;
  }): Promise<PaginatedResponse<Project>> {
    const response = await api.get(apiEndpoints.projects.list, {
      params: {
        ...params,
        language: resolveLanguage(params?.language),
      },
    });
    return response.data;
  },

  async getProject(slug: string, language?: string): Promise<Project> {
    const response = await api.get(apiEndpoints.projects.detail(slug), {
      params: { language: resolveLanguage(language) },
    });
    return response.data;
  },

  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post(apiEndpoints.projects.create, data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<ProjectCreate>): Promise<Project> {
    const response = await api.put(apiEndpoints.projects.update(id), data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(apiEndpoints.projects.delete(id));
  },
};

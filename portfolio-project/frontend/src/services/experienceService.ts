import api, { apiEndpoints } from './api';
import type { Experience, ExperienceCreate } from './types';

export const experienceService = {
  async getExperiences(params?: { skip?: number; limit?: number; experience_type?: string }): Promise<Experience[]> {
    const response = await api.get(apiEndpoints.experiences.list, { params });
    const experiences = response.data.experiences || response.data || [];
    return experiences;
  },

  async getExperience(id: string): Promise<Experience> {
    const response = await api.get(apiEndpoints.experiences.detail(id));
    return response.data;
  },

  async createExperience(data: ExperienceCreate): Promise<Experience> {
    const response = await api.post(apiEndpoints.experiences.create, data);
    return response.data;
  },

  async updateExperience(id: string, data: Partial<ExperienceCreate>): Promise<Experience> {
    const response = await api.put(apiEndpoints.experiences.update(id), data);
    return response.data;
  },

  async deleteExperience(id: string): Promise<void> {
    await api.delete(apiEndpoints.experiences.delete(id));
  },
};

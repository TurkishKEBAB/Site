import api, { apiEndpoints } from './api';
import { Skill, SkillCreate } from './types';

export const skillService = {
  async getSkills(language?: string): Promise<Skill[]> {
    const response = await api.get(apiEndpoints.skills.list, {
      params: language ? { language } : undefined,
    });
    return response.data.skills || response.data;
  },

  async getSkill(id: string): Promise<Skill> {
    const response = await api.get(apiEndpoints.skills.detail(id));
    return response.data;
  },

  async createSkill(data: SkillCreate): Promise<Skill> {
    const response = await api.post(apiEndpoints.skills.create, data);
    return response.data;
  },

  async updateSkill(id: string, data: Partial<SkillCreate>): Promise<Skill> {
    const response = await api.put(apiEndpoints.skills.update(id), data);
    return response.data;
  },

  async deleteSkill(id: string): Promise<void> {
    await api.delete(apiEndpoints.skills.delete(id));
  },
};

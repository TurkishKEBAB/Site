import api, { apiEndpoints } from './api';
import type {
  AdminProjectDossier,
  ProjectDossier,
  ProjectDossierUpsert,
} from './types';

export const dossierService = {
  async getPublicDossier(slug: string, language?: string): Promise<ProjectDossier> {
    const response = await api.get(apiEndpoints.dossiers.public(slug), {
      params: language ? { language } : undefined,
    });
    return response.data;
  },

  async getAdminDossier(projectId: string): Promise<AdminProjectDossier> {
    const response = await api.get(apiEndpoints.dossiers.admin(projectId));
    return response.data;
  },

  async upsertDossier(
    projectId: string,
    payload: ProjectDossierUpsert,
  ): Promise<AdminProjectDossier> {
    const response = await api.put(
      apiEndpoints.dossiers.admin(projectId),
      payload,
    );
    return response.data;
  },

  async deleteDossier(projectId: string): Promise<void> {
    await api.delete(apiEndpoints.dossiers.admin(projectId));
  },
};

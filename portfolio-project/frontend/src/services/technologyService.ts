import api from './api';

export interface Technology {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  category?: string;
  color?: string;
  created_at: string;
}

export interface TechnologyCreate {
  name: string;
  slug: string;
  icon?: string;
  category?: string;
  color?: string;
}

export interface TechnologyUpdate {
  name?: string;
  slug?: string;
  icon?: string;
  category?: string;
  color?: string;
}

export const technologyService = {
  getAll: async (category?: string): Promise<Technology[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/technologies/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Technology> => {
    const response = await api.get(`/technologies/${id}`);
    return response.data;
  },

  create: async (data: TechnologyCreate): Promise<Technology> => {
    const response = await api.post('/technologies/', data);
    return response.data;
  },

  update: async (id: string, data: TechnologyUpdate): Promise<Technology> => {
    const response = await api.put(`/technologies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/technologies/${id}`);
  },
};

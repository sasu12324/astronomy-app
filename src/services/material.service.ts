import api from '../api/axios.js';
import type { Material } from '../types/index.js';

export const materialService = {
  getAll: async (): Promise<Material[]> => {
    const { data } = await api.get('/news');
    return data;
  },
  
  create: async (material: Omit<Material, 'id' | 'authorId' | 'authorName' | 'createdAt'>): Promise<Material> => {
    const { data } = await api.post('/news', material);
    return data;
  },
  
  update: async (id: string, material: Omit<Material, 'id' | 'authorId' | 'authorName' | 'createdAt'>): Promise<void> => {
    await api.put(`/news/${id}`, material);
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/news/${id}`);
  }
};
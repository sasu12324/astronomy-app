import api from '../api/axios.js';
import type { Test } from '../types/index.js';

export const testService = {
  getAll: async (): Promise<Test[]> => {
    const { data } = await api.get('/tests');
    return data;
  },

  getById: async (id: string): Promise<Test> => {
    const { data } = await api.get(`/tests/${id}`);
    return data;
  },

  create: async (test: Omit<Test, 'id' | 'authorId' | 'authorName' | 'createdAt'>): Promise<Test> => {
    const { data } = await api.post('/tests', test);
    return data;
  },

  update: async (id: string, test: Partial<Test>): Promise<void> => {
    await api.put(`/tests/${id}`, test);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tests/${id}`);
  }
};
import api from '../api/axios.js';
import type { TextbookLecture } from '../types/index.js';

export const textbookService = {
  // Публичные
  getAll: async (): Promise<Pick<TextbookLecture, 'id' | 'order' | 'number' | 'title'>[]> => {
    const { data } = await api.get('/textbook/lectures');
    return data;
  },

  getById: async (id: string): Promise<TextbookLecture> => {
    const { data } = await api.get(`/textbook/lectures/${id}`);
    return data;
  },

  // Только для преподавателя
  create: async (lecture: Partial<TextbookLecture>): Promise<TextbookLecture> => {
    const { data } = await api.post('/textbook/lectures', lecture);
    return data;
  },

  update: async (id: string, lecture: Partial<TextbookLecture>): Promise<void> => {
    await api.put(`/textbook/lectures/${id}`, lecture);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/textbook/lectures/${id}`);
  }
};
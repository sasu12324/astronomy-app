import api from '../api/axios.js';
import type { Wheel } from '../types/index.js';

export const wheelService = {
    getAll: async (): Promise<Wheel[]> => {
        const { data } = await api.get('/wheel');
        return data;
    },

    create: async (name: string, items: string[]): Promise<Wheel> => {
        const { data } = await api.post('/wheel', { name, items });
        return data;
    },

    update: async (id: string, name: string, items: string[]): Promise<void> => {
        await api.put(`/wheel/${id}`, { name, items });
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/wheel/${id}`);
    },
};
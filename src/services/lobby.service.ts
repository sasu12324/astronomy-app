import api from '../api/axios.js';
import type { Lobby } from '../types/index.js';

export const lobbyService = {
    getAll: async (): Promise<Lobby[]> => {
        const { data } = await api.get('/lobby');
        return data;
    },

    getById: async (id: string): Promise<Lobby> => {
        const { data } = await api.get(`/lobby/${id}`);
        return data;
    },

    findByCode: async (code: string): Promise<Lobby> => {
        const { data } = await api.get(`/lobby/code/${code}`);
        return data;
    },

    create: async (testId: string): Promise<Lobby> => {
        const { data } = await api.post('/lobby', { testId });
        return data;
    },

    join: async (lobbyId: string, displayName: string, uid?: string, isAnonymous?: boolean) => {
        const { data } = await api.post(`/lobby/${lobbyId}/join`, { displayName, uid, isAnonymous });
        return data;
    },

    start: async (lobbyId: string): Promise<void> => {
        await api.post(`/lobby/${lobbyId}/start`);
    },

    submitAnswer: async (
        lobbyId: string,
        participantId: string,
        questionId: string,
        selectedOptionIndex?: number,
        selectedOptionIndexes?: number[],
        textAnswer?: string
    ) => {
        const { data } = await api.post(`/lobby/${lobbyId}/answer`, {
            participantId,
            questionId,
            selectedOptionIndex,
            selectedOptionIndexes,
            textAnswer
        });
        return data;
    },

    finish: async (lobbyId: string): Promise<void> => {
        await api.post(`/lobby/${lobbyId}/finish`);
    },

    getTest: async (lobbyId: string) => {
        const { data } = await api.get(`/lobby/${lobbyId}/test`);
        return data;
    },

    finishPersonal: async (lobbyId: string, participantId: string): Promise<void> => {
        await api.post(`/lobby/${lobbyId}/finish-personal`, { participantId });
    },
};
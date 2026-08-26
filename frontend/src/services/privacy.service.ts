import api from '../lib/api';

export const privacyService = {
    exportData: async (): Promise<Record<string, unknown>> => (await api.get('/privacy/export')).data,
    deleteAccount: async (): Promise<void> => { await api.delete('/privacy/account'); },
};

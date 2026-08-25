import api from '../lib/api';

export type SupportRequestType = 'DISPUTE' | 'SUPPORT';
export type SupportRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportRequest {
    id: string;
    type: SupportRequestType;
    subject: string;
    description: string;
    status: SupportRequestStatus;
    bookingId?: string;
    adminResponse?: string;
    createdAt: string;
    updatedAt: string;
    firstResponseAt?: string;
}

export interface CreateSupportRequestInput {
    type: SupportRequestType;
    subject: string;
    description: string;
    bookingId?: string;
}

export const supportService = {
    create: async (data: CreateSupportRequestInput): Promise<SupportRequest> => {
        const response = await api.post('/support-requests', data);
        return response.data;
    },

    getMine: async (): Promise<SupportRequest[]> => {
        const response = await api.get('/support-requests/mine');
        return response.data;
    },
};

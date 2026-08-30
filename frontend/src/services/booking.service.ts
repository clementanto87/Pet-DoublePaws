import api from '../lib/api';

export const BookingStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    COMPLETION_REQUESTED: 'COMPLETION_REQUESTED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface Booking {
    id: string;
    referenceNumber?: string;
    sitterId: string;
    ownerId: string;
    petIds: string[];
    serviceType: string;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    totalPrice: number;
    message: string;
    createdAt: string;
    sitter?: any; // Type properly if needed
    owner?: any; // Type properly if needed
}

export interface PaginatedBookings {
    items: Booking[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface BookingListParams {
    role: 'owner' | 'sitter';
    bucket?: 'upcoming' | 'history';
    search?: string;
    status?: BookingStatus | 'ALL';
    page?: number;
}

export const bookingService = {
    createBooking: async (data: Partial<Booking>) => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    getBookings: async (params: BookingListParams | 'owner' | 'sitter' = 'owner'): Promise<PaginatedBookings> => {
        const normalized = typeof params === 'string' ? { role: params } : params;
        const response = await api.get('/bookings', {
            params: {
                ...normalized,
                ...(normalized.status === 'ALL' ? { status: undefined } : {}),
            },
        });
        return response.data;
    },

    getBookingsBySitterId: async (sitterId: string): Promise<Booking[]> => {
        const response = await api.get(`/bookings/sitter/${sitterId}`);
        return response.data;
    },

    updateStatus: async (id: string, status: BookingStatus) => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return response.data;
    }
};

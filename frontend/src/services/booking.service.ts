import api from '../lib/api';

export const BookingStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface Booking {
    id: string;
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

export const bookingService = {
    createBooking: async (data: Partial<Booking>) => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    getBookings: async (role: 'owner' | 'sitter' = 'owner') => {
        const response = await api.get('/bookings', { params: { role } });
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

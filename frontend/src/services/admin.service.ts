import api from '../lib/api';

export interface AdminOverview {
    metrics: {
        userCount: number;
        sitterCount: number;
        verifiedSitterCount: number;
        bookingCount: number;
        grossRevenue: number;
        completionRate: number;
        averageBookingValue: number;
    };
    chart: Array<{ date: string; bookings: number; revenue: number }>;
    verificationQueue: Array<{
        id: string;
        createdAt: string;
        user?: { firstName: string; lastName: string };
        city?: string;
    }>;
    recentBookings: Array<any>;
    activity: Array<{ kind: string; text: string; time: string }>;
    trust: {
        pendingVerificationCount: number;
        openDisputes: number;
        averageResponseMinutes: number | null;
        disputesTracked: boolean;
        responseTimeTracked: boolean;
    };
}

export interface AdminBooking {
    id: string;
    serviceType: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    owner?: { firstName: string; lastName: string };
    sitter?: { user?: { firstName: string; lastName: string } };
}

export interface AdminBookingsResponse {
    bookings: AdminBooking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminBookingsParams {
    page?: number;
    limit?: number;
    status?: string;
    service?: string;
    search?: string;
}

export const adminService = {
    getOverview: async (): Promise<AdminOverview> => {
        const response = await api.get('/admin/overview');
        return response.data;
    },
    getBookings: async (params: AdminBookingsParams = {}): Promise<AdminBookingsResponse> => {
        const response = await api.get('/admin/bookings', { params });
        return response.data;
    },
};

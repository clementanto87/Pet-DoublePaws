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

export const adminService = {
    getOverview: async (): Promise<AdminOverview> => {
        const response = await api.get('/admin/overview');
        return response.data;
    },
};

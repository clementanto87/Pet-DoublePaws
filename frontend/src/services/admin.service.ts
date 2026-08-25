import api from '../lib/api';

export interface AdminOverview {
    metrics: { userCount: number; sitterCount: number; verifiedSitterCount: number; bookingCount: number; grossRevenue: number; completionRate: number; averageBookingValue: number };
    chart: Array<{ date: string; bookings: number; revenue: number }>;
    verificationQueue: Array<{ id: string; createdAt: string; user?: { firstName: string; lastName: string }; city?: string }>;
    recentBookings: Array<any>;
    activity: Array<{ kind: string; text: string; time: string }>;
    trust: { pendingVerificationCount: number; openDisputes: number; averageResponseMinutes: number | null; disputesTracked: boolean; responseTimeTracked: boolean };
}
export interface AdminUser { id: string; email: string; firstName: string; lastName: string; createdAt: string; }
export interface AdminSitter { id: string; createdAt: string; isVerified: boolean; headline?: string; user?: { firstName: string; lastName: string; email: string }; }
export interface AdminBooking { id: string; serviceType: string; status: string; totalPrice: number; startDate: string; endDate: string; createdAt: string; owner?: { firstName: string; lastName: string; email?: string }; sitter?: { user?: { firstName: string; lastName: string } }; }
export interface AdminBookingsResponse { bookings: AdminBooking[]; total: number; page: number; limit: number; totalPages: number; }
export interface AdminBookingsParams { page?: number; limit?: number; status?: string; service?: string; search?: string; }
export interface AdminPayment { id: string; status: string; amount: number; currency: string; createdAt: string; owner?: { firstName: string; lastName: string; email: string }; booking?: { id: string }; }
export interface AdminSettings { environment: string; emailFrom: string | null; emailAppUrl: string | null; paymentsEnabled: boolean; googleLoginEnabled: boolean; }
export interface AdminAuditEvent { type: string; label: string; createdAt: string; }

export const adminService = {
    getOverview: async (): Promise<AdminOverview> => (await api.get('/admin/overview')).data,
    getVerification: async (): Promise<AdminSitter[]> => (await api.get('/admin/verification')).data,
    updateVerification: async (id: string, isVerified: boolean): Promise<void> => { await api.patch(`/admin/verification/${id}`, { isVerified }); },
    getUsers: async (search?: string): Promise<AdminUser[]> => (await api.get('/admin/users', { params: { search } })).data,
    getBookings: async (params: AdminBookingsParams = {}): Promise<AdminBookingsResponse> => (await api.get('/admin/bookings', { params })).data,
    getPayments: async (): Promise<AdminPayment[]> => (await api.get('/admin/payments')).data,
    getReports: async (): Promise<AdminOverview & { generatedAt: string }> => (await api.get('/admin/reports')).data,
    getSettings: async (): Promise<AdminSettings> => (await api.get('/admin/settings')).data,
    getAudit: async (): Promise<AdminAuditEvent[]> => (await api.get('/admin/audit')).data,
};

import api from '../lib/api';

export interface AdminOverview {
    period?: string;
    metrics: {
        userCount: number;
        sitterCount: number;
        verifiedSitterCount: number;
        bookingCount: number;
        grossRevenue: number;
        revenueGrowth?: number;
        completionRate: number;
        averageBookingValue: number;
    };
    chart: Array<{
        date: string;
        label: string;
        bookings: number;
        revenue: number;
    }>;
    verificationQueue: Array<AdminSitter>;
    recentBookings: Array<AdminBooking>;
    activity: Array<{
        kind: string;
        text: string;
        time: string;
    }>;
    trust: {
        pendingVerificationCount: number;
        openDisputes: number;
        averageResponseMinutes: number | null;
        disputesTracked: boolean;
        responseTimeTracked: boolean;
    };
}

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    hasSitterProfile?: boolean;
    isVerifiedSitter?: boolean;
    petsCount?: number;
    createdAt: string;
}

export interface AdminUserDetails extends AdminUser {
    pets?: Array<{
        id: string;
        name: string;
        species: string;
        breed?: string;
        age?: number;
        imageUrl?: string;
    }>;
    sitterProfile?: AdminSitter;
    bookings?: Array<AdminBooking>;
}

export interface AdminSitter {
    id: string;
    userId: string;
    createdAt: string;
    isVerified: boolean;
    headline?: string;
    bio?: string;
    address?: string;
    phone?: string;
    governmentIdUrl?: string;
    yearsExperience?: number;
    skills?: string[];
    certifications?: string[];
    galleryImages?: string[];
    services?: {
        boarding?: { active: boolean; rate: number; holidayRate?: number };
        houseSitting?: { active: boolean; rate: number; holidayRate?: number };
        dropInVisits?: { active: boolean; rate: number; holidayRate?: number };
        doggyDayCare?: { active: boolean; rate: number; holidayRate?: number };
        dogWalking?: { active: boolean; rate: number; holidayRate?: number };
    };
    preferences?: {
        acceptedPetTypes?: string[];
        acceptedPetSizes?: string[];
        isNeuteredOnly?: boolean;
        behavioralRestrictions?: string[];
    };
    housing?: {
        homeType?: string;
        outdoorSpace?: string;
        hasChildren?: boolean;
        hasOtherPets?: boolean;
        isNonSmoking?: boolean;
    };
    user?: {
        id?: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
    };
}

export interface AdminBooking {
    id: string;
    referenceNumber?: string;
    serviceType: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
    message?: string;
    petIds?: string[];
    createdAt: string;
    owner?: {
        id?: string;
        firstName: string;
        lastName: string;
        email?: string;
        profileImage?: string;
    };
    sitter?: {
        id?: string;
        user?: {
            id?: string;
            firstName: string;
            lastName: string;
            email?: string;
            profileImage?: string;
        };
    };
    payments?: Array<AdminPayment>;
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

export interface AdminPayment {
    id: string;
    stripePaymentIntentId?: string;
    status: string;
    amount: number;
    currency: string;
    failureReason?: string | null;
    createdAt: string;
    owner?: {
        id?: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    booking?: {
        id: string;
        serviceType?: string;
        totalPrice?: number;
    };
    bookingId?: string;
}

export interface AdminReportData {
    generatedAt: string;
    period: string;
    metrics: {
        totalUsers: number;
        totalSitters: number;
        bookingCount: number;
        grossRevenue: number;
        averageBookingValue: number;
    };
    serviceBreakdown: Record<string, { count: number; volume: number }>;
    statusBreakdown: Record<string, number>;
}

export interface AdminSettings {
    environment: string;
    database: {
        status: string;
        type: string;
    };
    email: {
        configured: boolean;
        sender: string;
        appUrl: string;
    };
    payments: {
        enabled: boolean;
        currency: string;
        connectEnabled: boolean;
    };
    authentication: {
        googleLogin: boolean;
        facebookLogin: boolean;
        appleLogin: boolean;
    };
    system: {
        nodeVersion: string;
        uptime: number;
        platform: string;
    };
}

export interface AdminAuditEvent {
    id?: string;
    type: string;
    label: string;
    actor?: string;
    createdAt: string;
}

export interface AdminPageParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    type?: string;
    period?: string;
}

export interface AdminPage<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const adminService = {
    getOverview: async (period: string = '30d'): Promise<AdminOverview> =>
        (await api.get('/admin/overview', { params: { period } })).data,

    getVerification: async (params: AdminPageParams = {}): Promise<AdminPage<AdminSitter>> =>
        (await api.get('/admin/verification', { params })).data,

    getSitterDetails: async (id: string): Promise<AdminSitter> =>
        (await api.get(`/admin/verification/${id}`)).data,

    updateVerification: async (id: string, isVerified: boolean, notes?: string): Promise<void> => {
        await api.patch(`/admin/verification/${id}`, { isVerified, notes });
    },

    getUsers: async (params: AdminPageParams = {}): Promise<AdminPage<AdminUser>> =>
        (await api.get('/admin/users', { params })).data,

    getUserDetails: async (id: string): Promise<AdminUserDetails> =>
        (await api.get(`/admin/users/${id}`)).data,

    getBookings: async (params: AdminBookingsParams = {}): Promise<AdminBookingsResponse> =>
        (await api.get('/admin/bookings', { params })).data,

    getBookingDetails: async (id: string): Promise<AdminBooking> =>
        (await api.get(`/admin/bookings/${id}`)).data,

    updateBookingStatus: async (id: string, status: string): Promise<AdminBooking> =>
        (await api.patch(`/admin/bookings/${id}/status`, { status })).data,

    getPayments: async (params: AdminPageParams = {}): Promise<AdminPage<AdminPayment>> =>
        (await api.get('/admin/payments', { params })).data,

    getReports: async (period: string = '30d'): Promise<AdminReportData> =>
        (await api.get('/admin/reports', { params: { period } })).data,

    getSettings: async (): Promise<AdminSettings> =>
        (await api.get('/admin/settings')).data,

    getAudit: async (params: AdminPageParams = {}): Promise<AdminPage<AdminAuditEvent>> =>
        (await api.get('/admin/audit', { params })).data,
};

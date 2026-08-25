import api from '../lib/api';

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface PaymentConfig {
    enabled: boolean;
    testMode: boolean;
    currency: string;
    publishableKey: string | null;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    amount: number;
    currency: string;
}

export interface PaymentRecord {
    id: string;
    status: PaymentStatus | null;
    amount?: number;
    currency?: string;
    createdAt?: string;
}

export const paymentService = {
    /** Whether payments are enabled server-side, and the publishable key to use. */
    getConfig: async (): Promise<PaymentConfig> => {
        const response = await api.get('/payments/config');
        return response.data;
    },

    /** Create (or resume) the Stripe PaymentIntent for a completed booking. */
    createIntent: async (bookingId: string): Promise<PaymentIntentResponse> => {
        const response = await api.post(`/payments/bookings/${bookingId}/intent`);
        return response.data;
    },

    /** Current payment status for one booking (null status = never attempted). */
    getForBooking: async (bookingId: string): Promise<PaymentRecord> => {
        const response = await api.get(`/payments/bookings/${bookingId}`);
        return response.data;
    },

    /** The signed-in user's payment history. */
    getMyPayments: async () => {
        const response = await api.get('/payments');
        return response.data;
    },
};

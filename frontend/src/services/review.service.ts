import api from '../lib/api';

export interface Review {
    id: string;
    bookingId: string;
    sitterId: string;
    ownerId: string;
    rating: number;
    comment: string;
    createdAt: string;
    owner?: {
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
}

export const reviewService = {
    createReview: async (data: { bookingId: string; rating: number; comment: string }) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    getSitterReviews: async (sitterId: string) => {
        const response = await api.get(`/reviews/sitter/${sitterId}`);
        return response.data;
    }
};

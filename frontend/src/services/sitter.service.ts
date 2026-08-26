import api from '../lib/api';
import type { SitterRegistrationData } from '../context/SitterRegistrationContext';

export interface SitterProfile {
    id: string;
    userId: string;
    user?: { id: string; firstName: string; lastName: string; email?: string; profileImage?: string };
    galleryImages?: string[];
    dob?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    governmentIdUrl?: string;
    isVerified: boolean;
    services?: {
        boarding?: { active: boolean; rate: number; holidayRate?: number };
        houseSitting?: { active: boolean; rate: number; holidayRate?: number };
        dropInVisits?: { active: boolean; rate: number; holidayRate?: number };
        doggyDayCare?: { active: boolean; rate: number; holidayRate?: number };
        dogWalking?: { active: boolean; rate: number; holidayRate?: number };
    };
    serviceRadius?: number;
    preferences?: {
        acceptedPetTypes: string[];
        acceptedPetSizes: string[];
        isNeuteredOnly: boolean;
        behavioralRestrictions: string[];
    };
    housing?: {
        homeType: string;
        outdoorSpace: string;
        hasChildren: boolean;
        hasOtherPets: boolean;
        isNonSmoking: boolean;
    };
    yearsExperience?: number;
    skills?: string[];
    certifications?: string[];
    headline?: string;
    bio?: string;
    availability?: {
        general: string[];
        blockedDates: string[];
    };
    noticePeriod?: string;
    bankDetails?: {
        accountHolderName: string;
        bankName: string;
    };
    stripeConnectAccountId?: string;
    stripeConnectStatus?: 'NOT_STARTED' | 'PENDING' | 'ENABLED';
    createdAt: string;
    updatedAt: string;
}

export const sitterService = {
    createSitterProfile: async (data: SitterRegistrationData) => {
        const response = await api.post('/sitters', data);
        return response.data;
    },

    getMyProfile: async (): Promise<SitterProfile> => {
        const response = await api.get('/sitters/me');
        return response.data;
    },

    getSitterById: async (id: string): Promise<SitterProfile> => {
        const response = await api.get(`/sitters/${id}`);
        return response.data;
    },

    updateProfile: async (data: Partial<SitterRegistrationData>): Promise<SitterProfile> => {
        const response = await api.post('/sitters', data);
        return response.data;
    },

    startPayoutOnboarding: async (): Promise<{ url: string }> => {
        const response = await api.post('/sitters/payouts/onboarding');
        return response.data;
    },

    getPayoutStatus: async (): Promise<{ status: string; payoutsEnabled: boolean }> => {
        const response = await api.get('/sitters/payouts/status');
        return response.data;
    },

    searchSitters: async (params: any) => {
        const response = await api.post('/sitters/search', params);
        return response.data;
    }
};

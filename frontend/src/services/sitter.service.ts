import api from '../lib/api';
import type { SitterRegistrationData } from '../context/SitterRegistrationContext';

export interface SitterProfile {
    id: string;
    userId: string;
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
    cancellationPolicy?: string;
    galleryImages?: string[];
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    reviews?: Array<{
        id: string;
        rating: number;
        comment: string;
        user: {
            firstName: string;
            lastName: string;
            profileImage?: string;
        };
        createdAt: string;
    }>;
    bankDetails?: {
        accountHolderName: string;
        bankName: string;
    };
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

    updateProfile: async (data: Partial<SitterRegistrationData>): Promise<SitterProfile> => {
        const response = await api.post('/sitters', data);
        return response.data;
    },

    searchSitters: async (params: any) => {
        const response = await api.post('/sitters/search', params);
        return response.data;
    }
};

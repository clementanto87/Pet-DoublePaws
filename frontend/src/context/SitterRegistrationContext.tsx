import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface ServiceRate {
    active: boolean;
    rate: number;
    holidayRate?: number;
}

export interface SitterRegistrationData {
    // Identity & Contact
    dob: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone: string;
    governmentIdUrl: string;

    // Service Profile
    services: {
        boarding: ServiceRate;
        houseSitting: ServiceRate;
        dropInVisits: ServiceRate;
        doggyDayCare: ServiceRate;
        dogWalking: ServiceRate;
    };
    serviceRadius: number;

    // Preferences
    acceptedPetTypes: string[];
    acceptedPetSizes: string[];
    isNeuteredOnly: boolean;
    behavioralRestrictions: string[];

    // Housing
    homeType: string;
    outdoorSpace: string;
    hasChildren: boolean;
    hasOtherPets: boolean;
    isNonSmoking: boolean;

    // Experience
    yearsExperience: number;
    skills: string[];
    certifications: string[];
    headline: string;
    bio: string;

    // Availability
    availability: {
        general: string[];
        blockedDates: string[];
    };
    noticePeriod: string;

    // Banking
    bankDetails: {
        accountHolderName: string;
        accountNumber: string; // In real app, use Stripe Elements
        routingNumber: string;
        bankName: string;
    };
}

const initialData: SitterRegistrationData = {
    dob: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    phone: '',
    governmentIdUrl: '',
    services: {
        boarding: { active: false, rate: 30 },
        houseSitting: { active: false, rate: 50 },
        dropInVisits: { active: false, rate: 20 },
        doggyDayCare: { active: false, rate: 25 },
        dogWalking: { active: false, rate: 20 },
    },
    serviceRadius: 5,
    acceptedPetTypes: ['Dog'],
    acceptedPetSizes: ['Small', 'Medium', 'Large'],
    isNeuteredOnly: false,
    behavioralRestrictions: [],
    homeType: 'House',
    outdoorSpace: 'Fenced Yard',
    hasChildren: false,
    hasOtherPets: false,
    isNonSmoking: true,
    yearsExperience: 0,
    skills: [],
    certifications: [],
    headline: '',
    bio: '',
    availability: {
        general: ['Weekdays', 'Weekends'],
        blockedDates: [],
    },
    noticePeriod: '1 day',
    bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: '',
    },
};

interface SitterRegistrationContextType {
    data: SitterRegistrationData;
    updateData: (section: keyof SitterRegistrationData, value: any) => void;
    updateNestedData: (section: keyof SitterRegistrationData, field: string, value: any) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

const SitterRegistrationContext = createContext<SitterRegistrationContextType | undefined>(undefined);

export const SitterRegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<SitterRegistrationData>(initialData);
    const [currentStep, setCurrentStep] = useState(0);

    const updateData = (section: keyof SitterRegistrationData, value: any) => {
        setData(prev => ({ ...prev, [section]: value }));
    };

    const updateNestedData = (section: keyof SitterRegistrationData, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };

    return (
        <SitterRegistrationContext.Provider value={{ data, updateData, updateNestedData, currentStep, setCurrentStep }}>
            {children}
        </SitterRegistrationContext.Provider>
    );
};

export const useSitterRegistration = () => {
    const context = useContext(SitterRegistrationContext);
    if (context === undefined) {
        throw new Error('useSitterRegistration must be used within a SitterRegistrationProvider');
    }
    return context;
};

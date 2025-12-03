import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { SitterRegistrationProvider, useSitterRegistration } from '../context/SitterRegistrationContext';

// Import Forms
import IdentityForm from '../components/sitter-registration/IdentityForm';
import ServiceProfileForm from '../components/sitter-registration/ServiceProfileForm';
import PreferencesForm from '../components/sitter-registration/PreferencesForm';
import HousingForm from '../components/sitter-registration/HousingForm';
import ExperienceForm from '../components/sitter-registration/ExperienceForm';
import AvailabilityForm from '../components/sitter-registration/AvailabilityForm';
import BankingForm from '../components/sitter-registration/BankingForm';

import { sitterService } from '../services/sitter.service';
import { useState } from 'react';

const steps = [
    { id: 'identity', label: 'Identity & Contact', component: IdentityForm },
    { id: 'services', label: 'Service Profile', component: ServiceProfileForm },
    { id: 'preferences', label: 'Preferences', component: PreferencesForm },
    { id: 'housing', label: 'Housing', component: HousingForm },
    { id: 'experience', label: 'Experience', component: ExperienceForm },
    { id: 'availability', label: 'Availability', component: AvailabilityForm },
    { id: 'banking', label: 'Banking', component: BankingForm },
];

const RegistrationContent: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, setCurrentStep, data } = useSitterRegistration();

    const CurrentComponent = steps[currentStep].component;



    // ... inside component ...

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateStep = (stepIndex: number): boolean => {
        setError(null); // Clear previous errors
        switch (stepIndex) {
            case 0: // Identity
                if (!data.address || !data.latitude || !data.longitude) {
                    setError('Please select a valid address from the suggestions.');
                    return false;
                }
                if (!data.phone) {
                    setError('Please enter your phone number.');
                    return false;
                }
                if (!data.dob) {
                    setError('Please enter your date of birth.');
                    return false;
                }
                return true;
            case 1: // Services
                const hasActiveService = Object.values(data.services).some(s => s.active && s.rate > 0);
                if (!hasActiveService) {
                    setError('Please enable at least one service with a valid rate.');
                    return false;
                }
                return true;
            case 2: // Preferences
                if (data.acceptedPetTypes.length === 0) {
                    setError('Please select at least one accepted pet type.');
                    return false;
                }
                if (data.acceptedPetSizes.length === 0) {
                    setError('Please select at least one accepted pet size.');
                    return false;
                }
                return true;
            case 5: // Availability
                if (data.availability.general.length === 0) {
                    setError('Please select at least one day of general availability.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setError(null); // Clear error on step change
            window.scrollTo(0, 0);
        } else {
            // Submit Logic
            try {
                setIsSubmitting(true);
                console.log('Submitting Registration Data:', data);
                await sitterService.createSitterProfile(data);
                navigate('/sitter-dashboard');
            } catch (error) {
                console.error('Failed to create sitter profile:', error);
                setError('Failed to save profile. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        setError(null); // Clear error on back
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        } else {
            navigate('/become-a-sitter');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / Progress */}
                    <div className="lg:col-span-3 space-y-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/become-a-sitter')}
                            className="pl-0 text-muted-foreground hover:text-primary mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Exit
                        </Button>

                        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 sticky top-24">
                            <h3 className="font-bold text-lg mb-4">Registration Steps</h3>
                            <div className="space-y-1">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-colors text-sm font-medium cursor-pointer",
                                            currentStep === index ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5",
                                            currentStep > index && "text-green-600"
                                        )}
                                        onClick={() => {
                                            setCurrentStep(index);
                                            setError(null);
                                        }}
                                    >
                                        {currentStep > index ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <Circle className={cn("w-4 h-4", currentStep === index ? "fill-current" : "")} />
                                        )}
                                        {step.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 p-6 md:p-10 min-h-[600px] flex flex-col">

                            <div className="flex-1">
                                <CurrentComponent />
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="w-32"
                                >
                                    {currentStep === 0 ? 'Cancel' : 'Back'}
                                </Button>

                                <Button
                                    onClick={handleNext}
                                    className="w-32 shadow-glow"
                                    disabled={isSubmitting}
                                >
                                    {currentStep === steps.length - 1 ? (isSubmitting ? 'Saving...' : 'Submit') : 'Next'}
                                    {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PetSitterRegistration: React.FC = () => {
    return (
        <SitterRegistrationProvider>
            <RegistrationContent />
        </SitterRegistrationProvider>
    );
};

export default PetSitterRegistration;

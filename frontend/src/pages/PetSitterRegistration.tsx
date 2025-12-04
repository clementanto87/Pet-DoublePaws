import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    User,
    Briefcase,
    Heart,
    Calendar,
    CreditCard,
    Sparkles,
    PartyPopper,
    Shield,
    Clock,
    DollarSign,
    X,
    Home,
    Award
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

const steps = [
    {
        id: 'identity',
        label: 'Your Info',
        component: IdentityForm,
        icon: User,
        emoji: '👤',
        description: 'Tell us about yourself',
        tip: 'This helps pet parents know who you are!'
    },
    {
        id: 'services',
        label: 'Services',
        component: ServiceProfileForm,
        icon: Briefcase,
        emoji: '💼',
        description: 'What services will you offer?',
        tip: 'Set competitive rates to attract more clients!'
    },
    {
        id: 'preferences',
        label: 'Pet Prefs',
        component: PreferencesForm,
        icon: Heart,
        emoji: '🐾',
        description: 'What pets do you love caring for?',
        tip: 'Be honest about your experience with different pets.'
    },
    {
        id: 'housing',
        label: 'Your Space',
        component: HousingForm,
        icon: Home,
        emoji: '🏠',
        description: 'Tell us about your home',
        tip: 'A safe, comfortable space makes happy pets!'
    },
    {
        id: 'experience',
        label: 'Experience',
        component: ExperienceForm,
        icon: Award,
        emoji: '⭐',
        description: 'Showcase your pet care expertise',
        tip: 'Certifications can boost your profile!'
    },
    {
        id: 'availability',
        label: 'Schedule',
        component: AvailabilityForm,
        icon: Calendar,
        emoji: '📅',
        description: 'When can you care for pets?',
        tip: 'More availability means more bookings!'
    },
    {
        id: 'banking',
        label: 'Get Paid',
        component: BankingForm,
        icon: CreditCard,
        emoji: '💰',
        description: 'Set up your payments',
        tip: 'Get paid within 2 days of each booking!'
    },
];

// Cute validation messages with emojis
const validationMessages: Record<string, { message: string; emoji: string }> = {
    address: { message: "Oops! Please pick an address from the suggestions so pets can find you!", emoji: "📍" },
    phone: { message: "We need your phone number to keep you connected with pet parents!", emoji: "📱" },
    dob: { message: "Don't forget your birthday! (You must be 18+ to join)", emoji: "🎂" },
    services: { message: "Pick at least one service and set a rate to start earning!", emoji: "💰" },
    petTypes: { message: "Choose which furry friends you'd love to care for!", emoji: "🐕" },
    petSizes: { message: "Tell us what size pets you're comfortable with!", emoji: "📏" },
    availability: { message: "Let us know when you're free to care for pets!", emoji: "📅" },
};

const RegistrationContent: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, setCurrentStep, data } = useSitterRegistration();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<{ message: string; emoji: string } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const CurrentComponent = steps[currentStep].component;
    const currentStepInfo = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    // Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const validateStep = (stepIndex: number): boolean => {
        setError(null);
        switch (stepIndex) {
            case 0:
                if (!data.address || !data.latitude || !data.longitude) {
                    setError(validationMessages.address);
                    return false;
                }
                if (!data.phone) {
                    setError(validationMessages.phone);
                    return false;
                }
                if (!data.dob) {
                    setError(validationMessages.dob);
                    return false;
                }
                return true;
            case 1:
                const hasActiveService = Object.values(data.services).some(s => s.active && s.rate > 0);
                if (!hasActiveService) {
                    setError(validationMessages.services);
                    return false;
                }
                return true;
            case 2:
                if (data.acceptedPetTypes.length === 0) {
                    setError(validationMessages.petTypes);
                    return false;
                }
                if (data.acceptedPetSizes.length === 0) {
                    setError(validationMessages.petSizes);
                    return false;
                }
                return true;
            case 5:
                if (data.availability.general.length === 0) {
                    setError(validationMessages.availability);
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) return;

        // Mark current step as completed
        setCompletedSteps(prev => new Set(prev).add(currentStep));

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            try {
                setIsSubmitting(true);
                await sitterService.createSitterProfile(data);
                setShowSuccess(true);
                setTimeout(() => navigate('/sitter-dashboard'), 3000);
            } catch (err) {
                console.error('Failed to create sitter profile:', err);
                setError({ message: 'Something went wrong. Please try again!', emoji: '😅' });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/become-a-sitter');
        }
    };

    const handleStepClick = (index: number) => {
        if (index < currentStep || completedSteps.has(index)) {
            setCurrentStep(index);
            setError(null);
        }
    };

    // Success Modal
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <PartyPopper className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        Welcome to the Pack! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 dark:text-gray-400 mb-6"
                    >
                        Your sitter profile is all set up! Get ready to meet amazing pets and their loving owners.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center gap-2"
                    >
                        <span className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🐕</span>
                        <span className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>🐈</span>
                        <span className="text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🐾</span>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/become-a-sitter')}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Exit</span>
                        </button>

                        {/* Progress Bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-500">Step {currentStep + 1} of {steps.length}</span>
                                <span className="text-primary font-medium">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Save indicator */}
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Auto-saved
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar - Steps */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-28">
                            {/* Mobile Step Pills */}
                            <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-6">
                                {steps.map((step, index) => (
                                    <button
                                        key={step.id}
                                        onClick={() => handleStepClick(index)}
                                        className={cn(
                                            "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                            currentStep === index
                                                ? "bg-primary text-white shadow-lg"
                                                : completedSteps.has(index)
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                        )}
                                    >
                                        {completedSteps.has(index) ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <span>{step.emoji}</span>
                                        )}
                                        {step.label}
                                    </button>
                                ))}
                            </div>

                            {/* Desktop Steps */}
                            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Your Progress
                                </h3>
                                <div className="space-y-1">
                                    {steps.map((step, index) => {
                                        const isCompleted = completedSteps.has(index);
                                        const isCurrent = currentStep === index;
                                        const isAccessible = index <= currentStep || isCompleted;

                                        return (
                                            <motion.button
                                                key={step.id}
                                                onClick={() => handleStepClick(index)}
                                                disabled={!isAccessible}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                                    isCurrent
                                                        ? "bg-primary/10 text-primary"
                                                        : isCompleted
                                                            ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            : isAccessible
                                                                ? "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                                : "text-gray-400 cursor-not-allowed"
                                                )}
                                                whileHover={isAccessible ? { x: 4 } : {}}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                                                    isCurrent
                                                        ? "bg-primary text-white"
                                                        : isCompleted
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                                            : "bg-gray-100 dark:bg-gray-700"
                                                )}>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <span>{step.emoji}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{step.label}</p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tip Card */}
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="hidden lg:block mt-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-800/50"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">{currentStepInfo.emoji}</div>
                                    <div>
                                        <p className="font-medium text-amber-900 dark:text-amber-300 text-sm mb-1">Pro Tip</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400">{currentStepInfo.tip}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-primary/5 to-orange-500/5 dark:from-primary/10 dark:to-orange-500/10 px-6 md:px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-lg">
                                        <currentStepInfo.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {currentStepInfo.label}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400">{currentStepInfo.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 md:p-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CurrentComponent />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="mx-6 md:mx-10 mb-6"
                                    >
                                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-4">
                                            <div className="text-3xl">{error.emoji}</div>
                                            <div className="flex-1">
                                                <p className="font-medium text-red-800 dark:text-red-300">{error.message}</p>
                                            </div>
                                            <button
                                                onClick={() => setError(null)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer Actions */}
                            <div className="px-6 md:px-10 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="h-12 px-6 gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {currentStep === 0 ? 'Cancel' : 'Back'}
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        {/* Step indicator for mobile */}
                                        <span className="text-sm text-gray-500 lg:hidden">
                                            {currentStep + 1} / {steps.length}
                                        </span>

                                        <Button
                                            onClick={handleNext}
                                            disabled={isSubmitting}
                                            className={cn(
                                                "h-12 px-8 gap-2 shadow-lg transition-all",
                                                currentStep === steps.length - 1
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                                    : "shadow-primary/20 hover:shadow-primary/30"
                                            )}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : currentStep === steps.length - 1 ? (
                                                <>
                                                    Complete Registration
                                                    <PartyPopper className="w-4 h-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Continue
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            {[
                                { icon: Shield, text: 'Your data is secure' },
                                { icon: Clock, text: 'Takes ~5 minutes' },
                                { icon: DollarSign, text: 'Free to join' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4 text-green-500" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
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

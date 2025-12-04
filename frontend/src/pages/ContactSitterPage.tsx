import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Send,
    MapPin,
    Dog,
    Cat,
    Calendar,
    Star,
    DollarSign,
    ChevronRight,
    User,
    Shield,
    Minus,
    Plus,
    CheckCircle,
    PawPrint,
    MessageCircle,
    Info,
    Sparkles,
    Home,
    Building,
    Sun,
    Heart,
    Award,
    Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { DatePicker } from '../components/ui/DatePicker';
import { cn } from '../lib/utils';

// Service options with icons and colors
const services = [
    { id: 'boarding', label: 'Boarding', icon: Home, emoji: '🏠', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600' },
    { id: 'house-sitting', label: 'House Sitting', icon: Building, emoji: '🏡', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600' },
    { id: 'drop-in', label: 'Drop-in Visits', icon: Sun, emoji: '☀️', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600' },
    { id: 'day-care', label: 'Doggy Day Care', icon: Dog, emoji: '🐕', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600' },
    { id: 'walking', label: 'Dog Walking', icon: PawPrint, emoji: '🦮', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600' },
];

// Pet size categories
const PET_SIZES = [
    { id: 'small', label: 'Small', weight: '0-7 kg', icon: '🐕', description: 'Chihuahua, Pomeranian' },
    { id: 'medium', label: 'Medium', weight: '7-18 kg', icon: '🐕‍🦺', description: 'Beagle, Cocker Spaniel' },
    { id: 'large', label: 'Large', weight: '18-45 kg', icon: '🦮', description: 'Labrador, German Shepherd' },
    { id: 'giant', label: 'Giant', weight: '45+ kg', icon: '🐕‍🦺', description: 'Great Dane, St. Bernard' },
];

// Map service IDs between booking page and sitter profile
const serviceIdMap: Record<string, string> = {
    'boarding': 'boarding',
    'house-sitting': 'houseSitting',
    'houseSitting': 'houseSitting',
    'drop-in': 'dropInVisits',
    'dropInVisits': 'dropInVisits',
    'day-care': 'doggyDayCare',
    'doggyDayCare': 'doggyDayCare',
    'walking': 'dogWalking',
    'dogWalking': 'dogWalking',
};

// Quick message templates with categories
const messageCategories = [
    {
        label: 'Introduce',
        templates: [
            { text: "Hi! I'm interested in booking your services for my pet.", icon: '👋' },
            { text: "Hello! I found your profile and I'd love to learn more about your experience.", icon: '😊' },
        ]
    },
    {
        label: 'Questions',
        templates: [
            { text: "Can you tell me more about your home environment and daily routine?", icon: '🏠' },
            { text: "Do you have experience with pets that have special needs?", icon: '❓' },
        ]
    },
    {
        label: 'Meet & Greet',
        templates: [
            { text: "Would you be available for a meet & greet before the booking?", icon: '🤝' },
            { text: "I'd like to schedule a video call to discuss my pet's needs.", icon: '📹' },
        ]
    },
];

const ContactSitterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const sitter = location.state?.sitter;

    // Get pre-filled values from search params
    const prefilledService = searchParams.get('serviceType') || searchParams.get('service') || '';
    const prefilledStartDate = searchParams.get('startDate') || '';
    const prefilledEndDate = searchParams.get('endDate') || '';
    const prefilledPetType = searchParams.get('petType') || '';

    // Form state - initialize with prefilled values
    const [selectedService, setSelectedService] = useState(prefilledService);
    const [startDate, setStartDate] = useState(prefilledStartDate);
    const [endDate, setEndDate] = useState(prefilledEndDate);
    const [petInfo, setPetInfo] = useState({
        dogs: prefilledPetType === 'dog' ? 1 : 0,
        cats: prefilledPetType === 'cat' ? 1 : 0
    });
    const [selectedDogSizes, setSelectedDogSizes] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);

    // Toggle dog size selection
    const toggleDogSize = (sizeId: string) => {
        setSelectedDogSizes(prev => 
            prev.includes(sizeId) 
                ? prev.filter(id => id !== sizeId)
                : [...prev, sizeId]
        );
    };

    // Auto advance step based on completion
    useEffect(() => {
        if (selectedService && activeStep === 1) {
            setTimeout(() => setActiveStep(2), 300);
        }
        if (startDate && endDate && activeStep === 2) {
            setTimeout(() => setActiveStep(3), 300);
        }
        if ((petInfo.dogs > 0 || petInfo.cats > 0) && activeStep === 3) {
            setTimeout(() => setActiveStep(4), 300);
        }
    }, [selectedService, startDate, endDate, petInfo, activeStep]);

    // Calculate estimated price
    const estimatedPrice = useMemo(() => {
        if (!sitter?.services || !selectedService || !startDate || !endDate) return null;

        const mappedServiceId = serviceIdMap[selectedService] || selectedService;
        const serviceData = sitter.services[mappedServiceId];
        if (!serviceData?.rate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const totalPets = petInfo.dogs + petInfo.cats;
        const basePrice = serviceData.rate * nights;
        const petMultiplier = totalPets > 1 ? 1 + (totalPets - 1) * 0.5 : 1;

        return Math.round(basePrice * petMultiplier);
    }, [sitter, selectedService, startDate, endDate, petInfo]);

    // Calculate number of nights
    const numberOfNights = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }, [startDate, endDate]);

    // Handle send message
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSending(false);
        setIsSent(true);
    };

    // If no sitter data, show error
    if (!sitter) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <Card className="text-center p-8 shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">No Sitter Selected</h2>
                    <p className="text-muted-foreground mb-6">Please select a sitter from the search results first.</p>
                        <Button onClick={() => navigate('/search')} className="w-full">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Find Sitters
                        </Button>
                </Card>
                </motion.div>
            </div>
        );
    }

    // Success state
    if (isSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-800 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="max-w-md w-full"
                >
                    <Card className="text-center p-8 shadow-2xl overflow-hidden relative">
                        {/* Confetti effect */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        background: ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899'][i % 5],
                                        left: `${Math.random() * 100}%`,
                                        top: '-10px',
                                    }}
                                    initial={{ y: -10, opacity: 1 }}
                                    animate={{
                                        y: 400,
                                        opacity: 0,
                                        rotate: Math.random() * 360,
                                    }}
                                    transition={{
                                        duration: 2 + Math.random(),
                                        delay: Math.random() * 0.5,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}
                    </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-3xl font-bold text-foreground mb-2">Message Sent! 🎉</h2>
                            <p className="text-muted-foreground mb-8">
                                Your message has been sent to <span className="font-semibold text-primary">{sitter.user?.firstName}</span>.
                                They typically respond within a few hours!
                            </p>

                            {/* Booking Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 text-left">
                                <h3 className="text-sm font-semibold text-gray-500 mb-3">Booking Request Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Service</span>
                                        <span className="font-medium">{services.find(s => s.id === selectedService)?.label || 'Boarding'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Dates</span>
                                        <span className="font-medium">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                                    </div>
                                    {estimatedPrice && (
                                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-500">Estimated Total</span>
                                            <span className="font-bold text-primary">${estimatedPrice}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                    <div className="space-y-3">
                                <Button onClick={() => navigate('/dashboard')} className="w-full h-12 shadow-glow">
                                    <Sparkles className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>
                                <Button variant="outline" onClick={() => navigate(-1)} className="w-full h-12">
                            Back to Profile
                        </Button>
                    </div>
                        </motion.div>
                </Card>
                </motion.div>
            </div>
        );
    }

    // Get sitter's available services
    const availableServices = sitter.services
        ? services.filter(s => {
            const mappedId = serviceIdMap[s.id];
            return sitter.services[mappedId]?.active || sitter.services[s.id]?.active;
        })
        : services;

    // Get rate for selected service
    const getServiceRate = (serviceId: string) => {
        if (!sitter.services) return null;
        const mappedId = serviceIdMap[serviceId] || serviceId;
        return sitter.services[mappedId]?.rate || sitter.services[serviceId]?.rate;
    };

    // Get minimum rate
    const minRate = sitter.services
        ? Math.min(...Object.values(sitter.services).filter((s: any) => s?.active).map((s: any) => s.rate || 999))
        : 0;

    const steps = [
        { number: 1, label: 'Service', completed: !!selectedService },
        { number: 2, label: 'Dates', completed: !!startDate && !!endDate },
        { number: 3, label: 'Pets', completed: petInfo.dogs > 0 || petInfo.cats > 0 },
        { number: 4, label: 'Message', completed: !!message.trim() },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-orange-300/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                    <button
                        onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
                    >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back</span>
                    </button>

                        {/* Progress Steps - Desktop */}
                        <div className="hidden md:flex items-center gap-2">
                            {steps.map((step, index) => (
                                <React.Fragment key={step.number}>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm",
                                        step.completed
                                            ? "bg-primary/10 text-primary"
                                            : activeStep === step.number
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                                : "text-gray-400"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                                            step.completed
                                                ? "bg-primary text-white"
                                                : "bg-gray-200 dark:bg-gray-700"
                                        )}>
                                            {step.completed ? '✓' : step.number}
                                        </div>
                                        <span className="font-medium">{step.label}</span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Progress Bar - Mobile */}
                        <div className="md:hidden flex items-center gap-1">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        step.completed ? "bg-primary w-4" : "bg-gray-300 dark:bg-gray-600"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Contact Sitter</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Send a Message to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
                            {sitter.user?.firstName}
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                        Introduce yourself and tell them about your pet care needs
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className={cn(
                                "overflow-hidden transition-all duration-300",
                                activeStep === 1 && "ring-2 ring-primary/20"
                            )}>
                            <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                            1
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">What service do you need?</h2>
                                            <p className="text-sm text-gray-500">Choose the type of care</p>
                                        </div>
                                        {selectedService && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                        )}
                                    </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableServices.map((service) => {
                                            const isSelected = selectedService === service.id;
                                            const rate = getServiceRate(service.id);
                                            const ServiceIcon = service.icon;

                                            return (
                                                <motion.button
                                            key={service.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedService(service.id)}
                                            className={cn(
                                                        "relative p-4 rounded-2xl border-2 transition-all text-left group overflow-hidden",
                                                        isSelected
                                                            ? "border-primary bg-gradient-to-br from-primary/5 to-orange-500/5"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800/50"
                                                    )}
                                                >
                                                    {/* Gradient overlay */}
                                                    <div className={cn(
                                                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity",
                                                        service.color,
                                                        isSelected ? "opacity-5" : "group-hover:opacity-5"
                                                    )} />

                                                    <div className="relative z-10">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                                                            isSelected
                                                                ? `bg-gradient-to-br ${service.color} text-white shadow-lg`
                                                                : `${service.bgColor} ${service.textColor}`
                                                        )}>
                                                            <ServiceIcon className="w-6 h-6" />
                                                        </div>
                                                        <p className={cn(
                                                            "font-bold text-sm mb-1",
                                                            isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                                            )}>
                                                {service.label}
                                                        </p>
                                                        {rate && (
                                                            <p className="text-xs text-gray-500">
                                                                ${rate}/night
                                                            </p>
                                                        )}
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>

                        {/* Dates */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className={cn(
                                "overflow-hidden transition-all duration-300",
                                activeStep === 2 && "ring-2 ring-primary/20"
                            )}>
                            <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg",
                                            startDate && endDate
                                                ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-primary/20"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                        )}>
                                            2
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">When do you need care?</h2>
                                            <p className="text-sm text-gray-500">Select your dates</p>
                                        </div>
                                        {startDate && endDate && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                        )}
                                    </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                            <Label className="mb-2 block text-sm font-medium">Start Date</Label>
                                        <DatePicker
                                            value={startDate}
                                            onChange={setStartDate}
                                            placeholder="Select start date"
                                        />
                                    </div>
                                    <div>
                                            <Label className="mb-2 block text-sm font-medium">End Date</Label>
                                        <DatePicker
                                            value={endDate}
                                            onChange={setEndDate}
                                            placeholder="Select end date"
                                        />
                                    </div>
                                </div>

                                    {numberOfNights > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 p-3 bg-primary/5 rounded-xl flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="text-sm text-primary font-medium">
                                                {numberOfNights} night{numberOfNights !== 1 ? 's' : ''} of care
                                            </span>
                                        </motion.div>
                                    )}
                            </CardContent>
                        </Card>
                        </motion.div>

                        {/* Pet Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className={cn(
                                "overflow-hidden transition-all duration-300",
                                activeStep === 3 && "ring-2 ring-primary/20"
                            )}>
                            <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg",
                                            (petInfo.dogs > 0 || petInfo.cats > 0)
                                                ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-primary/20"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                        )}>
                                            3
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">How many pets?</h2>
                                            <p className="text-sm text-gray-500">Tell us about your furry friends</p>
                                        </div>
                                        {(petInfo.dogs > 0 || petInfo.cats > 0) && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Dogs */}
                                        <div className={cn(
                                            "p-4 rounded-2xl border-2 transition-all",
                                            petInfo.dogs > 0
                                                ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-700"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                        <Dog className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Dogs</p>
                                                        <p className="text-xs text-gray-500">Max 5</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, dogs: Math.max(0, p.dogs - 1) }))}
                                                        disabled={petInfo.dogs === 0}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                            petInfo.dogs === 0
                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 hover:border-primary"
                                                        )}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                </button>
                                                    <span className="w-8 text-center text-xl font-bold text-gray-900 dark:text-white">
                                                        {petInfo.dogs}
                                                    </span>
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, dogs: Math.min(5, p.dogs + 1) }))}
                                                        disabled={petInfo.dogs >= 5}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                            petInfo.dogs >= 5
                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                                                : "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/30"
                                                        )}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                </button>
                                                </div>
                                        </div>
                                    </div>

                                    {/* Cats */}
                                        <div className={cn(
                                            "p-4 rounded-2xl border-2 transition-all",
                                            petInfo.cats > 0
                                                ? "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20"
                                                : "border-gray-200 dark:border-gray-700"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                        <Cat className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Cats</p>
                                                        <p className="text-xs text-gray-500">Max 5</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, cats: Math.max(0, p.cats - 1) }))}
                                                        disabled={petInfo.cats === 0}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                            petInfo.cats === 0
                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 hover:border-primary"
                                                        )}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                </button>
                                                    <span className="w-8 text-center text-xl font-bold text-gray-900 dark:text-white">
                                                        {petInfo.cats}
                                                    </span>
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, cats: Math.min(5, p.cats + 1) }))}
                                                        disabled={petInfo.cats >= 5}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                            petInfo.cats >= 5
                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                                                : "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/30"
                                                        )}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                </button>
                                                </div>
                                        </div>
                                        </div>
                                    </div>

                                    {/* Dog Size Selection */}
                                    {petInfo.dogs > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ delay: 0.1 }}
                                            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                                        >
                                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                                What size is your dog?
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {PET_SIZES.map((size) => {
                                                    const isSelected = selectedDogSizes.includes(size.id);
                                                    return (
                                                        <button
                                                            key={size.id}
                                                            onClick={() => toggleDogSize(size.id)}
                                                            className={cn(
                                                                "p-4 rounded-2xl border-2 transition-all duration-300 text-center group",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800/50"
                                                            )}
                                                        >
                                                            <div className="text-3xl mb-2">{size.icon}</div>
                                                            <p className={cn(
                                                                "font-bold text-sm mb-0.5",
                                                                isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                                                            )}>
                                                                {size.label}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{size.weight}</p>
                                                            {isSelected && (
                                                                <div className="mt-2 flex items-center justify-center">
                                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className={cn(
                                "overflow-hidden transition-all duration-300",
                                activeStep === 4 && "ring-2 ring-primary/20"
                            )}>
                            <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg",
                                            message.trim()
                                                ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-primary/20"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                        )}>
                                            4
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Message</h2>
                                            <p className="text-sm text-gray-500">Tell {sitter.user?.firstName} about your needs</p>
                                        </div>
                                        {message.trim() && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                        )}
                                    </div>

                                {/* Quick Templates */}
                                <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Templates</p>
                                    <div className="flex flex-wrap gap-2">
                                            {messageCategories.map((cat) => (
                                                <div key={cat.label} className="flex flex-wrap gap-2">
                                                    {cat.templates.map((template, index) => (
                                            <button
                                                key={index}
                                                            onClick={() => setMessage(template.text)}
                                                            className={cn(
                                                                "px-3 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5",
                                                                message === template.text
                                                                    ? "bg-primary text-white"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary"
                                                            )}
                                                        >
                                                            <span>{template.icon}</span>
                                                            <span className="truncate max-w-[150px]">{template.text.substring(0, 25)}...</span>
                                            </button>
                                        ))}
                                                </div>
                                            ))}
                                        </div>
                                </div>

                                    <div className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi ${sitter.user?.firstName}! I'm looking for someone to care for my pet...`}
                                            className="w-full h-40 px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all"
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                            {message.length} characters
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Info className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Include details about your pet's personality, any special needs, and your expectations to help {sitter.user?.firstName} understand your requirements.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>

                        {/* Send Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isSending}
                                className={cn(
                                    "w-full h-16 text-lg font-bold rounded-2xl transition-all group",
                                    message.trim()
                                        ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary-600 hover:to-orange-600 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.01]"
                                        : ""
                                )}
                        >
                            {isSending ? (
                                <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending your message...
                                </div>
                            ) : (
                                    <div className="flex items-center gap-3">
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        Send Message to {sitter.user?.firstName}
                                        <Sparkles className="w-5 h-5 opacity-50" />
                                </div>
                            )}
                        </Button>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Sitter Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="overflow-hidden shadow-xl sticky top-24">
                                {/* Header gradient */}
                                <div className="h-24 bg-gradient-to-br from-primary via-orange-500 to-amber-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bS0xMiAwYzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

                                    {/* Favorite button */}
                                    <button
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        <Heart className={cn(
                                            "w-5 h-5 transition-colors",
                                            isFavorited ? "text-red-500 fill-red-500" : "text-white"
                                        )} />
                                    </button>
                                </div>

                                <CardContent className="p-6 -mt-12 relative">
                                    {/* Avatar */}
                                <div className="flex items-end gap-4 mb-4">
                                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden border-4 border-white dark:border-gray-800 flex-shrink-0">
                                        {sitter.user?.profileImage ? (
                                            <img
                                                src={sitter.user.profileImage}
                                                alt={sitter.user.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-primary">
                                                    {sitter.user?.firstName?.[0]}{sitter.user?.lastName?.[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                            {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                                        </h3>
                                            <div className="flex items-center gap-1 text-sm mt-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="font-bold">5.0</span>
                                            <span className="text-gray-400">(0 reviews)</span>
                                            </div>
                                    </div>
                                </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                {sitter.isVerified && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                <Shield className="w-4 h-4 text-emerald-600" />
                                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Verified Sitter</span>
                                            </div>
                                        )}
                                        {(sitter.yearsExperience || 0) >= 3 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                                <Award className="w-4 h-4 text-amber-600" />
                                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Experienced</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                            </div>
                                        <span>{sitter.address?.split(',')[0]}</span>
                                    </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <PawPrint className="w-4 h-4" />
                                            </div>
                                        <span>{sitter.yearsExperience || 0}+ years experience</span>
                                    </div>
                                </div>

                                    {/* Price */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm">Starting from</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-primary">${minRate}</span>
                                                <span className="text-sm text-gray-500">/night</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Price Estimate */}
                        <AnimatePresence>
                            {estimatedPrice && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -20, height: 0 }}
                                >
                                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-green-800 dark:text-green-300">Price Estimate</h3>
                                                    <p className="text-xs text-green-600 dark:text-green-400">Based on your selections</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-green-700 dark:text-green-300">
                                                    <span>{services.find(s => s.id === selectedService)?.label}</span>
                                                    <span>${getServiceRate(selectedService)}/night</span>
                                                </div>
                                                <div className="flex justify-between text-green-700 dark:text-green-300">
                                                    <span>Duration</span>
                                                    <span>{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                                                </div>
                                                {(petInfo.dogs + petInfo.cats) > 1 && (
                                                    <div className="flex justify-between text-green-700 dark:text-green-300">
                                                        <span>Additional pets</span>
                                                        <span>+{((petInfo.dogs + petInfo.cats) - 1) * 50}%</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-3 border-t border-green-200 dark:border-green-700 font-bold text-green-800 dark:text-green-200 text-lg">
                                                    <span>Estimated Total</span>
                                                    <span>${estimatedPrice}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Response Time */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                        <Card>
                                <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Quick Response</p>
                                        <p className="text-sm text-gray-500">Usually responds within a few hours</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>

                        {/* Tips */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-bold text-amber-900 dark:text-amber-300">Tips for a great intro</h3>
                                </div>
                                    <ul className="space-y-3">
                                        {[
                                            { icon: Heart, text: "Share your pet's name and personality" },
                                            { icon: Info, text: "Mention any special care needs" },
                                            { icon: Calendar, text: "Ask about their availability" },
                                            { icon: User, text: "Request a meet & greet if possible" },
                                        ].map((tip, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-amber-200/50 dark:bg-amber-800/50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <tip.icon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                                                </div>
                                                <span className="text-sm text-amber-800 dark:text-amber-300">{tip.text}</span>
                                    </li>
                                        ))}
                                </ul>
                            </CardContent>
                        </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSitterPage;

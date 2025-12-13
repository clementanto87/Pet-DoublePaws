
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
    Zap,
    Plus,
    Minus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { cn } from '../lib/utils';
import { bookingService } from '../services/booking.service';
import { petService, type PetData } from '../services/pet.service';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

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

// Get monthly calendar availability from real backend data
const getMonthlyAvailability = (sitter: any, monthOffset: number = 0, bookings: any[] = []) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const monthName = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Get blocked dates from sitter's availability
    const blockedDates = sitter.availability?.blockedDates || [];
    const blockedSet = new Set<number>();

    // Convert blocked date strings to day numbers for this month
    blockedDates.forEach((dateStr: string) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
            blockedSet.add(date.getDate());
        }
    });

    // Parse general availability settings
    const generalAvailability = sitter.availability?.general || [];
    const hasWeekdays = generalAvailability.includes('Weekdays');
    const hasWeekends = generalAvailability.includes('Weekends');
    const hasFullTime = generalAvailability.includes('Full-Time');

    // Map day names to day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayNameToNumber: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    // Get specific days selected
    const specificDays = new Set<number>();
    generalAvailability.forEach((item: string) => {
        if (dayNameToNumber[item] !== undefined) {
            specificDays.add(dayNameToNumber[item]);
        }
    });

    // Helper function to check if a date matches general availability
    const isDayAvailable = (date: Date): boolean => {
        // If Full-Time is selected, all days are available (unless specifically blocked)
        if (hasFullTime) return true;

        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

        // Check if specific day is selected
        if (specificDays.has(dayOfWeek)) return true;

        // Check weekday/weekend rules
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday

        if (hasWeekdays && isWeekday) return true;
        if (hasWeekends && isWeekend) return true;

        // If no general availability is set, default to all days available
        if (generalAvailability.length === 0) return true;

        // Otherwise, day is not available
        return false;
    };

    // Get booked dates from bookings (ACCEPTED and PENDING)
    const bookedSet = new Set<number>();
    bookings.forEach((booking) => {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);

        // Check if booking overlaps with this month
        if (startDate.getFullYear() === year && startDate.getMonth() === month) {
            // Booking starts this month
            const startDay = startDate.getDate();
            const endDay = endDate.getFullYear() === year && endDate.getMonth() === month
                ? endDate.getDate()
                : daysInMonth;

            for (let day = startDay; day <= endDay; day++) {
                bookedSet.add(day);
            }
        } else if (endDate.getFullYear() === year && endDate.getMonth() === month) {
            // Booking ends this month
            const endDay = endDate.getDate();
            for (let day = 1; day <= endDay; day++) {
                bookedSet.add(day);
            }
        } else if (
            startDate < new Date(year, month, 1) &&
            endDate > new Date(year, month + 1, 0)
        ) {
            // Booking spans the entire month
            for (let day = 1; day <= daysInMonth; day++) {
                bookedSet.add(day);
            }
        }
    });

    // Calculate available days (all days except blocked, booked, past, and not in general availability)
    const availableDays = new Set<number>();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isBlocked = blockedSet.has(day);
        const isBooked = bookedSet.has(day);
        const matchesGeneralAvailability = isDayAvailable(date);

        if (!isPast && !isBlocked && !isBooked && matchesGeneralAvailability) {
            availableDays.add(day);
        }
    }

    // Calculate days since last update
    const lastUpdated = sitter.updatedAt
        ? Math.floor((Date.now() - new Date(sitter.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return {
        monthName,
        year,
        month,
        daysInMonth,
        startDayOfWeek,
        availableDays,
        bookedDays: bookedSet,
        lastUpdated
    };
};

const ContactSitterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    const sitter = location.state?.sitter;

    // Get pre-filled values from search params
    const prefilledService = searchParams.get('service') || '';
    const prefilledStartDate = searchParams.get('startDate') || '';
    const prefilledEndDate = searchParams.get('endDate') || '';

    // Fetch user's pets
    const { data: pets, isLoading: isLoadingPets } = useQuery<PetData[]>({
        queryKey: ['myPets'],
        queryFn: petService.getPets
    });

    // Form state - initialize with prefilled values
    const [selectedService, setSelectedService] = useState(prefilledService);
    const [startDate, setStartDate] = useState(prefilledStartDate);
    const [endDate, setEndDate] = useState(prefilledEndDate);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);

    // Manual pet selection state
    const [petCounts, setPetCounts] = useState({ dogs: 0, cats: 0 });
    const [selectedPetSizes, setSelectedPetSizes] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);
    const { user } = useAuth();

    // Month navigation for calendar
    const [monthOffset, setMonthOffset] = useState(0);

    // Toggle pet selection
    const togglePetSelection = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId)
                ? prev.filter(id => id !== petId)
                : [...prev, petId]
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
        // Don't auto-advance on pet selection as user might want to select multiple
    }, [selectedService, startDate, endDate, activeStep]);

    // Calculate estimated price
    const estimatedPrice = useMemo(() => {
        if (!sitter?.services || !selectedService || !startDate || !endDate) return null;

        const mappedServiceId = serviceIdMap[selectedService] || selectedService;
        const serviceData = sitter.services[mappedServiceId];
        if (!serviceData?.rate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const totalPets = selectedPetIds.length + petCounts.dogs + petCounts.cats;
        if (totalPets === 0) return null;

        const basePrice = serviceData.rate * nights;
        const petMultiplier = totalPets > 1 ? 1 + (totalPets - 1) * 0.5 : 1;

        return Math.round(basePrice * petMultiplier);
    }, [sitter, selectedService, startDate, endDate, selectedPetIds, petCounts]);

    // Calculate number of nights
    const numberOfNights = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }, [startDate, endDate]);

    // Calendar availability - MOVED TO TOP LEVEL TO FIX HOOK ERROR
    const calendar = useMemo(() => {
        if (!sitter) return null;
        return getMonthlyAvailability(sitter, monthOffset, []);
    }, [sitter, monthOffset]);

    const calendarDays = useMemo(() => {
        if (!calendar) return [];
        const days: (number | null)[] = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < calendar.startDayOfWeek; i++) {
            days.push(null);
        }
        // Add the days of the month
        for (let day = 1; day <= calendar.daysInMonth; day++) {
            days.push(day);
        }
        return days;
    }, [calendar]);

    // Handle send message
    const handleSendMessage = async () => {
        console.log('handleSendMessage clicked');
        console.log('Validation:', {
            hasMessage: !!message.trim(),
            hasSitter: !!sitter,
            hasUser: !!user,
            isSending
        });

        if (!message.trim() || !sitter || !user) {
            console.warn('Validation failed: Missing requirements');
            return;
        }

        setIsSending(true);
        try {
            // Construct message with manual pet details if any
            let finalMessage = message;
            const manualDetails = [];
            if (petCounts.dogs > 0) manualDetails.push(`${petCounts.dogs} Dog${petCounts.dogs > 1 ? 's' : ''} `);
            if (petCounts.cats > 0) manualDetails.push(`${petCounts.cats} Cat${petCounts.cats > 1 ? 's' : ''} `);
            if (selectedPetSizes.length > 0) manualDetails.push(`Sizes: ${selectedPetSizes.join(', ')} `);

            if (manualDetails.length > 0) {
                finalMessage = `${message} \n\n[Manual Pet Entry: ${manualDetails.join(', ')}]`;
            }

            // Combine date and time
            const startDateTime = new Date(startDate);
            const [startHour, startMinute] = startTime.split(':');
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

            const endDateTime = new Date(endDate);
            const [endHour, endMinute] = endTime.split(':');
            endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

            await bookingService.createBooking({
                sitterId: sitter.id,
                serviceType: selectedService,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                petIds: selectedPetIds,
                message: finalMessage,
                totalPrice: estimatedPrice || 0
            });
            setIsSent(true);
        } catch (error) {
            console.error('Failed to create booking:', error);
            // Show error toast or message
        } finally {
            setIsSending(false);
        }
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
                                        left: `${Math.random() * 100}% `,
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
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Time</span>
                                        <span className="font-medium">{startTime} - {endTime}</span>
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
        { number: 3, label: 'Pets', completed: selectedPetIds.length > 0 || petCounts.dogs > 0 || petCounts.cats > 0 },
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

            <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-x-hidden">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 mb-3 sm:mb-4">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-primary">Contact Sitter</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 px-2">
                        Send a Message to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
                            {sitter.user?.firstName}
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto px-2">
                        Introduce yourself and tell them about your pet care needs
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
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

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                                                                ? `bg - gradient - to - br ${service.color} text - white shadow - lg`
                                                                : `${service.bgColor} ${service.textColor} `
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
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">Start Date</Label>
                                                <DatePicker
                                                    value={startDate}
                                                    onChange={setStartDate}
                                                    placeholder="Start Date"
                                                    blockedDates={sitter?.availability?.blockedDates}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">Start Time</Label>
                                                <TimePicker
                                                    value={startTime}
                                                    onChange={setStartTime}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">End Date</Label>
                                                <DatePicker
                                                    value={endDate}
                                                    onChange={setEndDate}
                                                    placeholder="End Date"
                                                    blockedDates={sitter?.availability?.blockedDates}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">End Time</Label>
                                                <TimePicker
                                                    value={endTime}
                                                    onChange={setEndTime}
                                                />
                                            </div>
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
                                            (selectedPetIds.length > 0 || petCounts.dogs > 0 || petCounts.cats > 0)
                                                ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-primary/20"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                        )}>
                                            3
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">How many pets?</h2>
                                            <p className="text-sm text-gray-500">Tell us about your furry friends</p>
                                        </div>
                                        {(selectedPetIds.length > 0 || petCounts.dogs > 0 || petCounts.cats > 0) && (
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {/* Manual Counters */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                        <Dog className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">Dogs</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={() => setPetCounts(prev => ({ ...prev, dogs: Math.max(0, prev.dogs - 1) }))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-gray-900 dark:text-white">{petCounts.dogs}</span>
                                                    <button
                                                        onClick={() => setPetCounts(prev => ({ ...prev, dogs: prev.dogs + 1 }))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                        <Cat className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">Cats</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={() => setPetCounts(prev => ({ ...prev, cats: Math.max(0, prev.cats - 1) }))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-gray-900 dark:text-white">{petCounts.cats}</span>
                                                    <button
                                                        onClick={() => setPetCounts(prev => ({ ...prev, cats: prev.cats + 1 }))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pet Size Selection (Only if dogs > 0) */}
                                        <AnimatePresence>
                                            {petCounts.dogs > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <Label className="mb-3 block">Dog Size</Label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {PET_SIZES.map((size) => {
                                                            const isSelected = selectedPetSizes.includes(size.id);
                                                            return (
                                                                <button
                                                                    key={size.id}
                                                                    onClick={() => {
                                                                        setSelectedPetSizes(prev =>
                                                                            isSelected
                                                                                ? prev.filter(id => id !== size.id)
                                                                                : [...prev, size.id]
                                                                        );
                                                                    }}
                                                                    className={cn(
                                                                        "p-3 rounded-xl border-2 text-left transition-all",
                                                                        isSelected
                                                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                                                    )}
                                                                >
                                                                    <div className="text-2xl mb-1">{size.icon}</div>
                                                                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{size.label}</div>
                                                                    <div className="text-xs text-gray-500">{size.weight}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Divider */}
                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                                                    Or select from your profile (Optional)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Profile Pets */}
                                        {isLoadingPets ? (
                                            <div className="text-center py-8 text-gray-500">Loading your pets...</div>
                                        ) : !pets || pets.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <PawPrint className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pets found</h3>
                                                <p className="text-gray-500 mb-6">Create a profile for faster booking, or use the manual entry above.</p>
                                                <Button onClick={() => navigate('/pet-profile', { state: { returnUrl: location.pathname + location.search } })} variant="outline">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Pet
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {pets.map((pet: any) => {
                                                    const isSelected = selectedPetIds.includes(pet.id);
                                                    return (
                                                        <div
                                                            key={pet.id}
                                                            onClick={() => togglePetSelection(pet.id)}
                                                            className={cn(
                                                                "relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                                                pet.species?.toLowerCase() === 'dog'
                                                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                                                    : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                            )}>
                                                                {pet.imageUrl ? (
                                                                    <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover rounded-xl" />
                                                                ) : (
                                                                    pet.species?.toLowerCase() === 'dog' ? <Dog className="w-6 h-6" /> : <Cat className="w-6 h-6" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-gray-900 dark:text-white">{pet.name}</h3>
                                                                <p className="text-xs text-gray-500">{pet.breed} • {pet.age} yrs</p>
                                                            </div>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                                isSelected
                                                                    ? "bg-primary border-primary"
                                                                    : "border-gray-300 dark:border-gray-600"
                                                            )}>
                                                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {(selectedPetIds.length > 0 || petCounts.dogs > 0 || petCounts.cats > 0) && (
                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    onClick={() => setActiveStep(4)}
                                                    className="shadow-glow"
                                                >
                                                    Continue
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
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
                                            placeholder={`Hi ${sitter.user?.firstName} !I'm looking for someone to care for my pet...`}
                                            className="w-full h-40 px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all"
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                            {message.length} characters
                                        </div>
                                    </div >

                                    <div className="flex items-start gap-3 mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Info className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Include details about your pet's personality, any special needs, and your expectations to help {sitter.user?.firstName} understand your requirements.
                                        </p>
                                    </div>
                                </CardContent >
                            </Card >
                        </motion.div >

                        {/* Send Button */}
                        < motion.div
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
                        </motion.div >
                    </div >

                    {/* Sidebar */}
                    < div className="space-y-6" >
                        {/* Sitter Card */}
                        < motion.div
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
                        </motion.div >

                        {/* Availability Calendar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <Card>
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Availability
                                    </h3>

                                    {/* Calendar View */}
                                    {/* Calendar View */}
                                    {calendar && (
                                        <div className="space-y-4">
                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between mb-3">
                                                <button
                                                    onClick={() => setMonthOffset(prev => prev - 1)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    aria-label="Previous month"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
                                                </button>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {calendar.monthName}
                                                </h4>
                                                <button
                                                    onClick={() => setMonthOffset(prev => prev + 1)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    aria-label="Next month"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex items-center gap-3 text-xs mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">Booked</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800 opacity-40" />
                                                    <span className="text-gray-600 dark:text-gray-400">Not available</span>
                                                </div>
                                            </div>

                                            {/* Calendar Grid */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {/* Day headers */}
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                    <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-1">
                                                        {day}
                                                    </div>
                                                ))}

                                                {/* Calendar days */}
                                                {calendarDays.map((day, index) => {
                                                    if (day === null) {
                                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                                    }

                                                    const isAvailable = calendar.availableDays.has(day);
                                                    const isBooked = calendar.bookedDays.has(day);
                                                    const isToday = monthOffset === 0 && day === new Date().getDate();

                                                    return (
                                                        <div
                                                            key={day}
                                                            className={cn(
                                                                "aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                                                isAvailable && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500",
                                                                isBooked && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-2 border-amber-500",
                                                                !isAvailable && !isBooked && "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-40",
                                                                isToday && "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900"
                                                            )}
                                                        >
                                                            {day}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Footer Info */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    <span>Updated {calendar.lastUpdated === 0 ? 'today' : `${calendar.lastUpdated} day${calendar.lastUpdated === 1 ? '' : 's'} ago`}</span>
                                                </div>
                                                {sitter.cancellationPolicy && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        <Info className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>Cancellation: <span className="font-medium text-primary">{sitter.cancellationPolicy || 'flexible'}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Price Estimate */}
                        <AnimatePresence>
                            {
                                estimatedPrice && (
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
                                                    {selectedPetIds.length > 1 && (
                                                        <div className="flex justify-between text-green-700 dark:text-green-300">
                                                            <span>Additional pets</span>
                                                            <span>+{(selectedPetIds.length - 1) * 50}%</span>
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
                                )
                            }
                        </AnimatePresence >

                        {/* Response Time */}
                        < motion.div
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
                        </motion.div >

                        {/* Tips */}
                        < motion.div
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
                        </motion.div >
                    </div >
                </div >
            </div >
        </div >
    );
};

export default ContactSitterPage;

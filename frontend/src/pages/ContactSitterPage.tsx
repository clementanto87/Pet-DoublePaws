import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    MapPin,
    Dog,
    Cat,
    Calendar,
    Star,
    ChevronRight,
    CheckCircle,
    MessageCircle,
    Sparkles,
    Home,
    Building,
    Sun,
    PawPrint,
    Zap,
    Plus,
    Minus,
    ShieldCheck,
    Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { cn } from '../lib/utils';
import { bookingService } from '../services/booking.service';
import { petService, type PetData } from '../services/pet.service';
import { sitterService } from '../services/sitter.service';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// Service options with icons and colors
const services = [
    { id: 'boarding', label: 'Boarding', icon: Home, emoji: '🏠', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50 dark:bg-orange-950/40', textColor: 'text-primary' },
    { id: 'house-sitting', label: 'House Sitting', icon: Building, emoji: '🏡', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-950/40', textColor: 'text-blue-600' },
    { id: 'drop-in', label: 'Drop-in Visits', icon: Sun, emoji: '☀️', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-50 dark:bg-amber-950/40', textColor: 'text-amber-600' },
    { id: 'day-care', label: 'Doggy Day Care', icon: Dog, emoji: '🐕', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', textColor: 'text-emerald-600' },
    { id: 'walking', label: 'Dog Walking', icon: PawPrint, emoji: '🦮', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50 dark:bg-violet-950/40', textColor: 'text-violet-600' },
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

// Quick message templates
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
            { text: "Do you have experience with pets that have special needs or medications?", icon: '❓' },
        ]
    },
    {
        label: 'Meet & Greet',
        templates: [
            { text: "Would you be available for a quick meet & greet before the booking?", icon: '🤝' },
            { text: "I'd like to schedule a video call to discuss my pet's needs.", icon: '📹' },
        ]
    },
];

// Get monthly calendar availability
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

    const blockedDates = sitter.availability?.blockedDates || [];
    const blockedSet = new Set<number>();
    blockedDates.forEach((dateStr: string) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
            blockedSet.add(date.getDate());
        }
    });

    const generalAvailability = sitter.availability?.general || [];
    const hasWeekdays = generalAvailability.includes('Weekdays');
    const hasWeekends = generalAvailability.includes('Weekends');
    const hasFullTime = generalAvailability.includes('Full-Time');

    const dayNameToNumber: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    const specificDays = new Set<number>();
    generalAvailability.forEach((item: string) => {
        if (dayNameToNumber[item] !== undefined) specificDays.add(dayNameToNumber[item]);
    });

    const isDayAvailable = (date: Date): boolean => {
        if (hasFullTime) return true;
        const dayOfWeek = date.getDay();
        if (specificDays.has(dayOfWeek)) return true;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (hasWeekdays && isWeekday) return true;
        if (hasWeekends && isWeekend) return true;
        if (generalAvailability.length === 0) return true;
        return false;
    };

    const bookedSet = new Set<number>();
    bookings.forEach((booking) => {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        if (startDate.getFullYear() === year && startDate.getMonth() === month) {
            const startDay = startDate.getDate();
            const endDay = endDate.getFullYear() === year && endDate.getMonth() === month ? endDate.getDate() : daysInMonth;
            for (let day = startDay; day <= endDay; day++) bookedSet.add(day);
        } else if (endDate.getFullYear() === year && endDate.getMonth() === month) {
            for (let day = 1; day <= endDate.getDate(); day++) bookedSet.add(day);
        } else if (startDate < new Date(year, month, 1) && endDate > new Date(year, month + 1, 0)) {
            for (let day = 1; day <= daysInMonth; day++) bookedSet.add(day);
        }
    });

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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    // Sitter data
    const sitterFromState = location.state?.sitter;
    const { data: fetchedSitter, isLoading: isLoadingSitter } = useQuery({
        queryKey: ['sitter', id],
        queryFn: () => sitterService.getSitterById(id!),
        enabled: !sitterFromState && !!id,
    });
    const sitter = sitterFromState || fetchedSitter;

    // Prefilled values
    const prefilledService = searchParams.get('service') || '';
    const prefilledStartDate = searchParams.get('startDate') || '';
    const prefilledEndDate = searchParams.get('endDate') || '';

    // Fetch user's pets
    const { data: pets } = useQuery<PetData[]>({
        queryKey: ['myPets'],
        queryFn: petService.getPets
    });

    // Form states
    const [selectedService, setSelectedService] = useState(prefilledService || 'boarding');
    const [startDate, setStartDate] = useState(prefilledStartDate);
    const [endDate, setEndDate] = useState(prefilledEndDate);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [petCounts, setPetCounts] = useState({ dogs: 1, cats: 0 });
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [monthOffset, setMonthOffset] = useState(0);
    const { user } = useAuth();

    // Toggle pet selection
    const togglePetSelection = (petId: string) => {
        const normalizedPetId = String(petId);
        setSelectedPetIds(prev =>
            prev.includes(normalizedPetId)
                ? prev.filter(id => id !== normalizedPetId)
                : [...prev, normalizedPetId]
        );
    };

    const hasPetSelection = selectedPetIds.length > 0 || petCounts.dogs > 0 || petCounts.cats > 0;

    // Capitalized sitter name
    const formatName = (str?: string) => {
        if (!str) return '';
        return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    };

    const sitterFirstName = formatName(sitter?.user?.firstName || 'Sitter');
    const sitterFullName = [sitter?.user?.firstName, sitter?.user?.lastName].filter(Boolean).map(formatName).join(' ') || sitterFirstName;

    // Get rate for a specific service
    const getServiceRate = (serviceId: string) => {
        if (!sitter?.services) return 20;
        const mappedId = serviceIdMap[serviceId] || serviceId;
        return sitter.services[mappedId]?.rate || sitter.services[serviceId]?.rate || 20;
    };

    // Calculate estimated price in Euro
    const estimatedPrice = useMemo(() => {
        if (!sitter?.services || !selectedService) return null;
        const rate = getServiceRate(selectedService);
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 86400000);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const totalPets = Math.max(1, selectedPetIds.length + petCounts.dogs + petCounts.cats);
        const basePrice = rate * nights;
        const petMultiplier = totalPets > 1 ? 1 + (totalPets - 1) * 0.5 : 1;
        return Math.round(basePrice * petMultiplier);
    }, [sitter, selectedService, startDate, endDate, selectedPetIds, petCounts]);

    const numberOfNights = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }, [startDate, endDate]);

    // Handle send message / request
    const handleSendMessage = async () => {
        if (!message.trim() || !sitter || !user) return;

        setIsSending(true);
        try {
            let finalMessage = message;
            const manualDetails = [];
            if (petCounts.dogs > 0) manualDetails.push(`${petCounts.dogs} Dog${petCounts.dogs > 1 ? 's' : ''}`);
            if (petCounts.cats > 0) manualDetails.push(`${petCounts.cats} Cat${petCounts.cats > 1 ? 's' : ''}`);

            if (manualDetails.length > 0) {
                finalMessage = `${message}\n\n[Manual Pet Entry: ${manualDetails.join(', ')}]`;
            }

            const startDateTime = startDate ? new Date(startDate) : new Date();
            const [startHour, startMinute] = (startTime || '09:00').split(':');
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

            const endDateTime = endDate ? new Date(endDate) : new Date(startDateTime.getTime() + 86400000);
            const [endHour, endMinute] = (endTime || '17:00').split(':');
            endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

            await bookingService.createBooking({
                sitterId: sitter.id,
                serviceType: selectedService,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                petIds: selectedPetIds,
                message: finalMessage,
                totalPrice: estimatedPrice || 20
            });
            setIsSent(true);
        } catch (error) {
            console.error('Failed to create booking request:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoadingSitter) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading sitter details...</p>
            </div>
        );
    }

    if (!sitter) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <MessageCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('contactSitter.noSitterTitle', 'Sitter Not Found')}</h2>
                    <p className="text-slate-500 text-sm mb-6">{t('contactSitter.noSitterDesc', 'We could not find the selected sitter.')}</p>
                    <Button onClick={() => navigate('/search')} className="w-full rounded-2xl shadow-glow font-bold">
                        {t('contactSitter.findSitters', 'Find Sitters')}
                    </Button>
                </Card>
            </div>
        );
    }

    // Success State
    if (isSent) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center px-4 py-10">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl text-center space-y-5">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Message & Request Sent!</h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Your request has been forwarded to <strong className="text-slate-900 dark:text-white">{sitterFirstName}</strong>. They will reply directly to your Double Paws inbox.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Service:</span>
                            <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedService}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Estimated Total:</span>
                            <span className="font-extrabold text-primary">€{estimatedPrice || 20}</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <Button onClick={() => navigate('/dashboard')} className="w-full h-11 rounded-2xl shadow-glow font-bold text-xs">
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => navigate(-1)} className="w-full h-11 rounded-2xl font-semibold text-xs">
                            Back to Sitter Profile
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const availableServices = services.filter(s => {
        if (!sitter.services) return true;
        const mappedId = serviceIdMap[s.id];
        return sitter.services[mappedId]?.active || sitter.services[s.id]?.active;
    });

    const steps = [
        { number: 1, label: 'Service', completed: !!selectedService },
        { number: 2, label: 'Dates', completed: !!startDate && !!endDate },
        { number: 3, label: 'Pets', completed: hasPetSelection },
        { number: 4, label: 'Message', completed: !!message.trim() },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-16">
            {/* Header Navigation */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>

                    {/* Progress Steps on Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.number}>
                                <div className={cn(
                                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all',
                                    step.completed
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                )}>
                                    <span className={cn(
                                        'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                                        step.completed
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    )}>
                                        {step.completed ? '✓' : step.number}
                                    </span>
                                    <span>{step.label}</span>
                                </div>
                                {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile Progress Dots */}
                    <div className="flex md:hidden items-center gap-1.5">
                        {steps.map(step => (
                            <span
                                key={step.number}
                                className={cn(
                                    'h-2 rounded-full transition-all',
                                    step.completed ? 'w-5 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-8 space-y-6">

                {/* Hero Header */}
                <div className="text-center space-y-2 max-w-xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40 text-[11px] font-bold text-primary">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contact Sitter</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Send a Message to <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">{sitterFirstName}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Introduce yourself and share your pet care needs to check availability and book.
                    </p>
                </div>

                {/* Form and Sidebar 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Left Column: 4 Interactive Form Steps */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Step 1: Select Service */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-black text-sm shadow-xs">
                                        1
                                    </span>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            What service do you need?
                                        </h2>
                                        <p className="text-xs text-slate-500">Choose the type of pet care</p>
                                    </div>
                                </div>
                                {selectedService && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {availableServices.map(service => {
                                    const isSelected = selectedService === service.id;
                                    const rate = getServiceRate(service.id);
                                    const ServiceIcon = service.icon;

                                    return (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setSelectedService(service.id)}
                                            className={cn(
                                                'relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all group overflow-hidden',
                                                isSelected
                                                    ? 'border-primary bg-orange-50/40 dark:bg-orange-950/20 shadow-xs ring-2 ring-primary/20'
                                                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300'
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className={cn(
                                                    'flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                                                    isSelected ? 'bg-primary text-white shadow-xs' : `${service.bgColor} ${service.textColor}`
                                                )}>
                                                    <ServiceIcon className="w-5 h-5" />
                                                </span>
                                                {isSelected && (
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <p className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-slate-900 dark:text-white')}>
                                                    {service.label}
                                                </p>
                                                <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
                                                    €{rate}<span className="text-[10px] font-normal text-slate-400">/night</span>
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Dates & Time */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-black text-sm shadow-xs">
                                        2
                                    </span>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            When do you need care?
                                        </h2>
                                        <p className="text-xs text-slate-500">Pick your start and end dates</p>
                                    </div>
                                </div>
                                {startDate && endDate && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date & Time</Label>
                                    <DatePicker
                                        value={startDate}
                                        onChange={setStartDate}
                                        placeholder="Select start date"
                                        blockedDates={sitter?.availability?.blockedDates}
                                    />
                                    <TimePicker value={startTime} onChange={setStartTime} />
                                </div>

                                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date & Time</Label>
                                    <DatePicker
                                        value={endDate}
                                        onChange={setEndDate}
                                        placeholder="Select end date"
                                        blockedDates={sitter?.availability?.blockedDates}
                                    />
                                    <TimePicker value={endTime} onChange={setEndTime} />
                                </div>
                            </div>

                            {numberOfNights > 0 && startDate && endDate && (
                                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-xs font-semibold text-primary">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>Total Duration: {numberOfNights} night{numberOfNights !== 1 ? 's' : ''} of care</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Step 3: Select Pets */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-black text-sm shadow-xs">
                                        3
                                    </span>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            Tell us about your pets
                                        </h2>
                                        <p className="text-xs text-slate-500">Select your registered pet or specify pet count</p>
                                    </div>
                                </div>
                                {hasPetSelection && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                            </div>

                            {/* Registered Profile Pets if user has any */}
                            {pets && pets.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">My Registered Pets</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {pets.map(pet => {
                                            const petId = String(pet.id);
                                            const isSelected = selectedPetIds.includes(petId);
                                            return (
                                                <div
                                                    key={pet.id}
                                                    onClick={() => togglePetSelection(petId)}
                                                    className={cn(
                                                        'flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all',
                                                        isSelected
                                                            ? 'border-primary bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                                                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100/60'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-11 w-11 rounded-xl overflow-hidden bg-orange-100 flex items-center justify-center text-primary font-bold">
                                                            {pet.imageUrl ? (
                                                                <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                pet.species?.toLowerCase() === 'cat' ? <Cat className="w-5 h-5" /> : <Dog className="w-5 h-5" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{pet.name}</p>
                                                            <p className="text-[11px] text-slate-400">{pet.breed || pet.species} · {pet.age} yrs</p>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        'h-6 w-6 rounded-full border flex items-center justify-center transition-all',
                                                        isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'
                                                    )}>
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Manual Pet Counters */}
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Pets by Quantity</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Dog className="w-4 h-4 text-primary" />
                                            <span>Dogs</span>
                                        </span>
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                                            <button type="button" onClick={() => setPetCounts(p => ({ ...p, dogs: Math.max(0, p.dogs - 1) }))} className="p-1 text-slate-400 hover:text-slate-700">
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="font-extrabold text-xs text-slate-900 dark:text-white min-w-[14px] text-center">{petCounts.dogs}</span>
                                            <button type="button" onClick={() => setPetCounts(p => ({ ...p, dogs: p.dogs + 1 }))} className="p-1 text-slate-400 hover:text-slate-700">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Cat className="w-4 h-4 text-sky-500" />
                                            <span>Cats</span>
                                        </span>
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                                            <button type="button" onClick={() => setPetCounts(p => ({ ...p, cats: Math.max(0, p.cats - 1) }))} className="p-1 text-slate-400 hover:text-slate-700">
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="font-extrabold text-xs text-slate-900 dark:text-white min-w-[14px] text-center">{petCounts.cats}</span>
                                            <button type="button" onClick={() => setPetCounts(p => ({ ...p, cats: p.cats + 1 }))} className="p-1 text-slate-400 hover:text-slate-700">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Message to Sitter */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-black text-sm shadow-xs">
                                        4
                                    </span>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            Your Message to {sitterFirstName}
                                        </h2>
                                        <p className="text-xs text-slate-500">Include key details about your pet and expectations</p>
                                    </div>
                                </div>
                                {message.trim() && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                            </div>

                            {/* Quick Tap Templates */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Prompts (Tap to fill)</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {messageCategories.flatMap(c => c.templates).map((tpl, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setMessage(tpl.text)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                                                message === tpl.text
                                                    ? 'bg-primary text-white border-primary shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50'
                                            )}
                                        >
                                            <span>{tpl.icon}</span>
                                            <span className="truncate max-w-[200px]">{tpl.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi ${sitterFirstName}! I'm looking for pet care for my furry family member...`}
                                    className="w-full min-h-[130px] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                                <div className="text-right text-[10px] text-slate-400 mt-1">
                                    {message.length} characters
                                </div>
                            </div>

                            {/* Send Button */}
                            <Button
                                onClick={handleSendMessage}
                                disabled={!message.trim() || isSending}
                                className="w-full h-12 rounded-2xl font-bold text-sm shadow-glow bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <span>Sending request...</span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Request to {sitterFirstName}</span>
                                        <Sparkles className="w-4 h-4 opacity-70" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Sitter Card & Price Estimate Sidebar */}
                    <div className="space-y-5">

                        {/* Sitter Mini Snapshot */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center text-primary font-black text-lg shrink-0 border border-slate-200 dark:border-slate-800 shadow-2xs">
                                    {sitter.user?.profileImage ? (
                                        <img src={sitter.user.profileImage} alt={sitterFullName} className="h-full w-full object-cover" />
                                    ) : (
                                        sitterFirstName.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                            {sitterFullName}
                                        </h3>
                                        {sitter.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{sitter.headline || 'Loving Pet Sitter'}</p>
                                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        <span>5.0</span>
                                        <span className="text-slate-400 font-normal">· Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-600 dark:text-slate-300">
                                {sitter.address && (
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span className="truncate">{sitter.address.split(',')[0]}</span>
                                    </p>
                                )}
                                <p className="flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>Typically replies within 1 hour</span>
                                </p>
                            </div>
                        </div>

                        {/* Price Breakdown Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                                Price Breakdown
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="capitalize">{selectedService.replace('-', ' ')} rate</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">€{getServiceRate(selectedService)}/night</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Duration</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Pets count</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{Math.max(1, selectedPetIds.length + petCounts.dogs + petCounts.cats)}</span>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">Estimated Total</span>
                                    <span className="font-extrabold text-xl text-primary">€{estimatedPrice || 20}</span>
                                </div>
                            </div>
                        </div>

                        {/* Availability Calendar Mini View */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                                Sitter Schedule
                            </h3>

                            {(() => {
                                const calendar = getMonthlyAvailability(sitter, monthOffset, []);
                                const calendarDays: (number | null)[] = [];
                                for (let i = 0; i < calendar.startDayOfWeek; i++) calendarDays.push(null);
                                for (let day = 1; day <= calendar.daysInMonth; day++) calendarDays.push(day);

                                return (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                                            <span>{calendar.monthName}</span>
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => setMonthOffset(p => p - 1)} className="p-1 hover:bg-slate-100 rounded">
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                </button>
                                                <button type="button" onClick={() => setMonthOffset(p => p + 1)} className="p-1 hover:bg-slate-100 rounded">
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <div key={i} className="font-bold text-slate-400">{d}</div>
                                            ))}
                                            {calendarDays.map((day, idx) => {
                                                if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                                                const isAvailable = calendar.availableDays.has(day);
                                                const isBooked = calendar.bookedDays.has(day);
                                                return (
                                                    <div
                                                        key={day}
                                                        className={cn(
                                                            'aspect-square rounded-md flex items-center justify-center font-semibold text-[10px]',
                                                            isAvailable && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                                                            isBooked && 'bg-amber-50 text-amber-700 border border-amber-200',
                                                            !isAvailable && !isBooked && 'bg-slate-50 text-slate-300 opacity-60'
                                                        )}
                                                    >
                                                        {day}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSitterPage;

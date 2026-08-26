import React, { useState, useEffect, useCallback } from 'react';
import { dfOpts } from '../lib/dateLocale';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    MapPin,
    Star,
    Calendar,
    Home,
    Heart,
    Award,
    CheckCircle2,
    Dog,
    Cat,
    PawPrint,
    MessageCircle,
    Briefcase,
    Users,
    User,
    Sun,
    Baby,
    TreeDeciduous,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    X,
    Sparkles,
    ShieldCheck,
    Check,
    Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { Review } from '../services/review.service';
import { reviewService } from '../services/review.service';
import { sitterService } from '../services/sitter.service';
import { format } from 'date-fns';

// Service icons mapping
const serviceIcons: Record<string, React.ElementType> = {
    boarding: Home,
    houseSitting: Home,
    dropInVisits: Sun,
    doggyDayCare: Users,
    dogWalking: PawPrint
};

const serviceNames: Record<string, string> = {
    boarding: 'Boarding',
    houseSitting: 'House Sitting',
    dropInVisits: 'Drop-in Visits',
    doggyDayCare: 'Doggy Day Care',
    dogWalking: 'Dog Walking'
};

const serviceDescriptions: Record<string, string> = {
    boarding: 'Overnight stay in the sitter’s pet-friendly home',
    houseSitting: 'Care for your pet overnight in your own home',
    dropInVisits: '30 to 60-minute daytime visits for feeding and care',
    doggyDayCare: 'Daytime companionship and playtime at sitter’s home',
    dogWalking: 'Active, supervised neighborhood walks and exercise'
};

// Monthly calendar availability calculator
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

    // Blocked dates
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
        if (dayNameToNumber[item] !== undefined) {
            specificDays.add(dayNameToNumber[item]);
        }
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

const SitterProfileView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { id } = useParams<{ id: string }>();

    const sitterFromState = location.state?.sitter;
    const searchParamsString = searchParams.toString();

    const { data: fetchedSitter, isLoading } = useQuery({
        queryKey: ['sitter', id],
        queryFn: () => sitterService.getSitterById(id!),
        enabled: !sitterFromState && !!id,
    });

    const sitter = sitterFromState || fetchedSitter;

    // Gallery and Lightbox State
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [monthOffset, setMonthOffset] = useState(0);

    // Reviews query
    const { data: reviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ['sitterReviews', sitter?.id],
        queryFn: () => reviewService.getSitterReviews(sitter.id),
        enabled: !!sitter?.id
    });

    // Gallery images preparation
    const uploadedGalleryImages = sitter?.galleryImages || [];
    const profileImage = sitter?.user?.profileImage;
    const galleryImages = [
        ...(profileImage ? [profileImage] : []),
        ...uploadedGalleryImages.filter((img: string) => img !== profileImage)
    ];

    const nextImage = useCallback(() => {
        if (galleryImages.length <= 1) return;
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, [galleryImages.length]);

    const prevImage = useCallback(() => {
        if (galleryImages.length <= 1) return;
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }, [galleryImages.length]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex !== null) {
                if (e.key === 'Escape') setLightboxIndex(null);
                if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : null));
                if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, galleryImages.length]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading sitter profile...</p>
            </div>
        );
    }

    if (!sitter) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <PawPrint className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('sitterProfile.notFoundTitle', 'Sitter Not Found')}</h2>
                    <p className="text-slate-500 text-sm mb-6">{t('sitterProfile.notFoundDesc', 'We couldn\'t find the sitter profile you were looking for.')}</p>
                    <Button onClick={() => navigate(-1)} className="w-full rounded-2xl shadow-glow font-bold">
                        {t('sitterProfile.goBack', 'Go Back')}
                    </Button>
                </Card>
            </div>
        );
    }

    // Capitalize first and last name
    const formatName = (str?: string) => {
        if (!str) return '';
        return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    };

    const fullName = [sitter.user?.firstName, sitter.user?.lastName].filter(Boolean).map(formatName).join(' ') || 'Pet Sitter';

    // Active services
    const activeServices = sitter.services
        ? Object.entries(sitter.services).filter(([_, service]: [string, any]) => service?.active)
        : [];

    const minRate = activeServices.length > 0
        ? Math.min(...activeServices.map(([_, service]: [string, any]) => service.rate))
        : (sitter.pricePerNight || 20);

    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length
        : 5.0;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-16">
            {/* Sticky Navigation Top Bar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('sitterProfile.backToResults', 'Back to Results')}</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>100% Protected Bookings</span>
                        </span>
                        <Button
                            size="sm"
                            className="rounded-xl px-4 text-xs font-bold shadow-glow"
                            onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                        >
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                            Contact
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">

                {/* Hero Showcase Card with Carousel */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">

                    {/* Image Carousel Section */}
                    {galleryImages.length > 0 ? (
                        <div className="relative group bg-slate-950">
                            {/* Main Carousel Viewport */}
                            <div className="relative h-64 sm:h-80 md:h-[420px] w-full overflow-hidden flex items-center justify-center">
                                <img
                                    src={galleryImages[activeImageIndex]}
                                    alt={`Photo ${activeImageIndex + 1}`}
                                    className="h-full w-full object-cover object-center transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

                                {/* Carousel Navigation Arrows */}
                                {galleryImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prevImage}
                                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition-all shadow-md active:scale-95"
                                            aria-label="Previous photo"
                                        >
                                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={nextImage}
                                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition-all shadow-md active:scale-95"
                                            aria-label="Next photo"
                                        >
                                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Floating Photo Badge / Lightbox Trigger */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLightboxIndex(activeImageIndex)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-sm transition-all"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>{activeImageIndex + 1} / {galleryImages.length}</span>
                                    </button>
                                </div>

                                {/* Active Dot Indicators */}
                                {galleryImages.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                        {galleryImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={cn(
                                                    'h-2 rounded-full transition-all',
                                                    idx === activeImageIndex
                                                        ? 'w-6 bg-primary'
                                                        : 'w-2 bg-white/60 hover:bg-white'
                                                )}
                                                aria-label={`Go to slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Preview Strip */}
                            {galleryImages.length > 1 && (
                                <div className="flex items-center gap-2 p-3 bg-slate-900/90 backdrop-blur-md overflow-x-auto scrollbar-hide border-t border-white/10">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={cn(
                                                'relative h-14 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                                                idx === activeImageIndex
                                                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                            )}
                                        >
                                            <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-44 sm:h-56 bg-gradient-to-br from-primary via-orange-500 to-amber-500 relative flex items-center justify-center">
                            <PawPrint className="w-16 h-16 text-white/20" />
                        </div>
                    )}

                    {/* Sitter Overview & CTA Header */}
                    <div className="p-5 sm:p-7 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                            {/* Left Side: Avatar + Details */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 min-w-0 flex-1">
                                <div className="relative shrink-0 -mt-12 sm:-mt-16">
                                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xl">
                                        {profileImage ? (
                                            <img src={profileImage} alt={fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-orange-400 to-primary flex items-center justify-center text-white text-2xl font-black">
                                                {fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {sitter.isVerified && (
                                        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md border-2 border-white dark:border-slate-900" title="Verified Sitter">
                                            <ShieldCheck className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {fullName}
                                        </h1>
                                        {sitter.isVerified && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>Verified</span>
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                                        {sitter.headline || 'Loving & Reliable Pet Sitter'}
                                    </p>

                                    {/* Location & Experience Badges */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                        {sitter.address && (
                                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <span>{sitter.address}</span>
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            <span>{sitter.yearsExperience || 1}+ years experience</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span>Replies within 1 hr</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Price Box & Contact CTA */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shrink-0 w-full lg:w-72">
                                <div className="text-left lg:text-right">
                                    <div className="flex items-baseline gap-1 lg:justify-end">
                                        <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">€{minRate}</span>
                                        <span className="text-xs font-semibold text-slate-500">/ service</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 lg:justify-end">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-slate-900 dark:text-white">{averageRating.toFixed(1)}</span>
                                        <span>({reviews?.length || 0} reviews)</span>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                    className="h-11 px-6 rounded-2xl font-bold text-sm shadow-glow bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 shrink-0"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Contact Sitter</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Grid Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left 2 Columns: Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About Me Section */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-primary" />
                                <span>{t('sitterProfile.aboutMe', 'About Me & Care Routine')}</span>
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {sitter.bio || 'Hello! I am an attentive and dedicated pet lover passionate about providing comfortable, loving care for your furry family members while you are away.'}
                            </p>
                        </div>

                        {/* Services & Pricing Cards */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    <span>{t('sitterProfile.servicesRates', 'Services & Rates')}</span>
                                </h2>
                                <span className="text-xs text-slate-400 font-medium">Standard rates per stay/visit</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {activeServices.map(([key, service]: [string, any]) => {
                                    const Icon = serviceIcons[key] || Briefcase;
                                    return (
                                        <div
                                            key={key}
                                            className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/70 text-primary dark:bg-orange-950/50 group-hover:scale-105 transition-transform">
                                                    <Icon className="w-5 h-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {serviceNames[key]}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                        {serviceDescriptions[key]}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                                <span className="text-slate-400 font-medium">Rate:</span>
                                                <span className="font-extrabold text-base text-primary">€{service.rate}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeServices.length === 0 && (
                                    <div className="col-span-2 text-center py-6 text-xs text-slate-500">
                                        No specific services configured yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills & Experience */}
                        {(sitter.skills?.length > 0 || sitter.certifications?.length > 0) && (
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    <span>Skills & Certifications</span>
                                </h2>

                                {sitter.skills?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Special Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.skills.map((skill: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40 text-xs font-semibold">
                                                    <Check className="w-3.5 h-3.5 text-primary" />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sitter.certifications?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Certifications</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.certifications.map((cert: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-semibold">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customer Reviews Section */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span>{t('sitterProfile.reviews', 'Owner Reviews')} ({reviews?.length || 0})</span>
                                </h2>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    ⭐ {averageRating.toFixed(1)} Rating
                                </span>
                            </div>

                            {reviewsLoading ? (
                                <div className="text-center py-8 text-xs text-slate-500">Loading reviews...</div>
                            ) : reviews && reviews.length > 0 ? (
                                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                                    {reviews.map((review: Review) => (
                                        <div key={review.id} className="pt-4 first:pt-0 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                                        {review.owner?.profileImage ? (
                                                            <img src={review.owner.profileImage} alt="Owner" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                                            {review.owner?.firstName} {review.owner?.lastName || ''}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {format(new Date(review.createdAt), 'MMMM d, yyyy', dfOpts())}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic pl-11">
                                                “{review.comment}”
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">No reviews yet</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Bookings completed with this sitter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar: Preferences, Environment & Calendar */}
                    <div className="space-y-6">

                        {/* Pet Preferences Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PawPrint className="w-5 h-5 text-primary" />
                                <span>Accepted Pets</span>
                            </h2>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Pet Types</p>
                                <div className="flex flex-wrap gap-2">
                                    {sitter.preferences?.acceptedPetTypes?.map((type: string) => (
                                        <span
                                            key={type}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5",
                                                type === 'Dog'
                                                    ? "bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200/60"
                                                    : "bg-sky-50 dark:bg-sky-950/40 text-secondary border border-sky-200/60"
                                            )}
                                        >
                                            {type === 'Dog' ? <Dog className="w-3.5 h-3.5" /> : <Cat className="w-3.5 h-3.5" />}
                                            {type}
                                        </span>
                                    )) || <span className="text-xs text-slate-400">All friendly pets</span>}
                                </div>
                            </div>

                            {sitter.preferences?.acceptedPetSizes?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Dog Sizes</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sitter.preferences.acceptedPetSizes.map((size: string) => (
                                            <span key={size} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sitter.preferences?.isNeuteredOnly && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Only accepts spayed/neutered pets</span>
                                </div>
                            )}
                        </div>

                        {/* Housing & Environment */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Home className="w-5 h-5 text-primary" />
                                <span>Home Environment</span>
                            </h2>

                            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                                {sitter.housing?.homeType && (
                                    <div className="flex items-center gap-2.5">
                                        <Home className="w-4 h-4 text-slate-400" />
                                        <span>Home: <strong>{sitter.housing.homeType}</strong></span>
                                    </div>
                                )}
                                {sitter.housing?.outdoorSpace && (
                                    <div className="flex items-center gap-2.5">
                                        <TreeDeciduous className="w-4 h-4 text-slate-400" />
                                        <span>Yard: <strong>{sitter.housing.outdoorSpace}</strong></span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                {sitter.housing?.hasChildren && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                                        <Baby className="w-3.5 h-3.5" />
                                        Has Kids
                                    </span>
                                )}
                                {sitter.housing?.hasOtherPets && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
                                        <PawPrint className="w-3.5 h-3.5" />
                                        Has Resident Pets
                                    </span>
                                )}
                                {sitter.housing?.isNonSmoking && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Non-Smoking
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Availability Calendar Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>Availability</span>
                            </h2>

                            {(() => {
                                const calendar = getMonthlyAvailability(sitter, monthOffset, []);
                                const calendarDays: (number | null)[] = [];
                                for (let i = 0; i < calendar.startDayOfWeek; i++) calendarDays.push(null);
                                for (let day = 1; day <= calendar.daysInMonth; day++) calendarDays.push(day);

                                return (
                                    <div className="space-y-3">
                                        {/* Month Header */}
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setMonthOffset(prev => prev - 1)}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                aria-label="Previous month"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                                {calendar.monthName}
                                            </span>
                                            <button
                                                onClick={() => setMonthOffset(prev => prev + 1)}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                aria-label="Next month"
                                            >
                                                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                        </div>

                                        {/* Grid */}
                                        <div className="grid grid-cols-7 gap-1 text-center">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                                <div key={idx} className="text-[10px] font-bold text-slate-400 pb-1">{d}</div>
                                            ))}
                                            {calendarDays.map((day, idx) => {
                                                if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                                                const isAvailable = calendar.availableDays.has(day);
                                                const isBooked = calendar.bookedDays.has(day);
                                                return (
                                                    <div
                                                        key={day}
                                                        className={cn(
                                                            'aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all',
                                                            isAvailable && 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
                                                            isBooked && 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
                                                            !isAvailable && !isBooked && 'bg-slate-50 text-slate-300 dark:bg-slate-950/40 dark:text-slate-700 opacity-60'
                                                        )}
                                                    >
                                                        {day}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Booked</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Unavailable</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Ready to Book Bottom Box */}
                        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-amber-500/10 border border-orange-200/60 dark:border-orange-900/40 p-6 text-center space-y-3">
                            <Sparkles className="w-8 h-8 text-primary mx-auto" />
                            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                                Ready to book with {fullName}?
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Send a booking request with your dates and pet details to confirm availability.
                            </p>
                            <Button
                                className="w-full rounded-2xl font-bold shadow-glow bg-primary hover:bg-primary/90 text-white"
                                onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Send Request
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Lightbox Modal */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxIndex(null)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                        aria-label="Close photos"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative max-h-[85vh] max-w-[92vw] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={galleryImages[lightboxIndex]}
                            alt={`Photo ${lightboxIndex + 1}`}
                            className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
                        />

                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white hover:bg-black/90 transition-all"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white hover:bg-black/90 transition-all"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
                            {lightboxIndex + 1} / {galleryImages.length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SitterProfileView;

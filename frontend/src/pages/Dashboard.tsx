import React, { useState } from 'react';
import { dfOpts } from '../lib/dateLocale';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Calendar,
    Dog,
    Cat,
    Bird,
    Star,
    Search,
    Shield,
    PawPrint,
    MessageSquare,
    CheckCircle2,
    Clock,
    User as UserIcon,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { petService, type PetData } from '../services/pet.service';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { Booking } from '../services/booking.service';
import { bookingService, BookingStatus } from '../services/booking.service';
import { format } from 'date-fns';
import { Modal } from '../components/ui/Modal';
import { reviewService } from '../services/review.service';
import { messageService } from '../services/message.service';
import { useToast } from '../components/ui/Toast';
import { PayButton } from '../components/payment/PayButton';
import { SupportRequestCard } from '../components/support/SupportRequestCard';
import { bookingReference } from '../utils/bookingReference';

interface Pet extends PetData {
    id: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingPage, setBookingPage] = useState(1);

    // Fetch Pets
    const { data: pets, isLoading: petsLoading } = useQuery({
        queryKey: ['pets'],
        queryFn: petService.getPets,
    });

    // Fetch Bookings
    const { data: bookingPageData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['myBookings', activeTab, bookingSearch, bookingPage],
        queryFn: () => bookingService.getBookings({
            role: 'owner',
            bucket: activeTab,
            search: bookingSearch,
            page: bookingPage,
        }),
    });
    const bookings = bookingPageData?.items || [];

    // Fetch conversations for unread count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000,
    });

    const totalUnreadCount = conversations?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) || 0;

    const handleSubmitReview = async () => {
        if (!selectedBookingId) return;

        setSubmittingReview(true);
        try {
            await reviewService.createReview({
                bookingId: selectedBookingId,
                rating,
                comment
            });
            setReviewModalOpen(false);
            showToast(t('dashboard.bookings.reviewSubmitted', 'Review submitted successfully!'), 'success');
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast(t('dashboard.bookings.reviewFailed', 'Failed to submit review.'), 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm(t('dashboard.bookings.cancelConfirm', 'Are you sure you want to cancel this booking?'))) return;
        try {
            await bookingService.updateStatus(id, BookingStatus.CANCELLED);
            showToast(t('dashboard.bookings.cancelledSuccess', 'Booking cancelled successfully'), 'success');
            window.location.reload();
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            showToast(t('dashboard.bookings.cancelledFailed', 'Failed to cancel booking'), 'error');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
        if (hour < 17) return t('dashboard.greeting.afternoon', 'Good afternoon');
        return t('dashboard.greeting.evening', 'Good evening');
    };

    // Format user name with proper casing
    const rawName = user?.firstName || user?.email?.split('@')[0] || 'Friend';
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const petCount = pets?.length || 0;
    const upcomingCount = activeTab === 'upcoming' ? (bookingPageData?.total || 0) : 0;
    const completedCount = activeTab === 'history' ? bookings.filter((b: Booking) => b.status === BookingStatus.COMPLETED).length : 0;

    if (petsLoading || bookingsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">{t('dashboard.loading', 'Loading your dashboard...')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">

                {/* Top Hero & Greeting Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-amber-950/20 dark:to-slate-900/40 border border-orange-200/60 dark:border-orange-900/30 p-5 sm:p-7 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 relative z-10">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{format(new Date(), 'EEEE, MMMM d', dfOpts())}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {getGreeting()}, {formattedName}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                                {petCount > 0
                                    ? (petCount === 1 ? t('dashboard.petsInCare', { count: petCount }) : t('dashboard.petsInCare_plural', { count: petCount }))
                                    : t('dashboard.welcome', 'Welcome to your pet care dashboard')}
                            </p>
                        </div>

                        {/* Top Action CTAs */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            <Link to="/booking" className="flex-1 sm:flex-initial">
                                <Button className="w-full sm:w-auto h-11 px-5 rounded-2xl shadow-glow font-bold text-sm bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span>{t('dashboard.bookNow', 'Book a Sitter')}</span>
                                </Button>
                            </Link>

                            <Link to="/pet-profile" className="flex-1 sm:flex-initial">
                                <Button variant="outline" className="w-full sm:w-auto h-11 px-4 rounded-2xl font-semibold text-sm border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5">
                                    <Plus className="w-4 h-4 text-primary" />
                                    <span>{t('dashboard.addPet', 'Add Pet')}</span>
                                </Button>
                            </Link>

                            <Link to="/messages" className="relative">
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800">
                                    <MessageSquare className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                </Button>
                                {totalUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
                                        {totalUnreadCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Modern 3-Column Metric Stat Bar */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                    {/* Stat 1: Pets */}
                    <button
                        onClick={() => navigate('/pet-profile')}
                        className="flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('dashboard.stats.myPets', 'My Pets')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {petCount}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                {t('dashboard.statsSub.myPets', 'in your care')}
                            </p>
                        </div>
                    </button>

                    {/* Stat 2: Upcoming */}
                    <button
                        onClick={() => { setActiveTab('upcoming'); setBookingPage(1); }}
                        className={cn(
                            'flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:shadow-md transition-all text-left group',
                            activeTab === 'upcoming'
                                ? 'border-primary/60 ring-2 ring-primary/20 bg-orange-50/20 dark:bg-orange-950/10'
                                : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('dashboard.stats.upcoming', 'Upcoming')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {upcomingCount}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                {t('dashboard.statsSub.upcoming', 'active & pending')}
                            </p>
                        </div>
                    </button>

                    {/* Stat 3: Completed */}
                    <button
                        onClick={() => { setActiveTab('history'); setBookingPage(1); }}
                        className={cn(
                            'flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:shadow-md transition-all text-left group',
                            activeTab === 'history'
                                ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10'
                                : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('dashboard.stats.completed', 'Completed')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {completedCount}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                {t('dashboard.statsSub.completed', 'past stays')}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">

                        {/* Section: My Pets Carousel / Cards */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <PawPrint className="w-5 h-5 text-primary" />
                                        <span>{t('dashboard.myPetsTitle', 'My Pets')}</span>
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                        {petCount ? (petCount === 1 ? t('dashboard.petsInCare', { count: petCount }) : t('dashboard.petsInCare_plural', { count: petCount })) : t('dashboard.petCard.noPetsDesc', 'Add your furry friend to get started')}
                                    </p>
                                </div>
                                <Link to="/pet-profile">
                                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700">
                                        <Plus className="w-3.5 h-3.5 mr-1 text-primary" />
                                        <span>{t('dashboard.addPet', 'Add Pet')}</span>
                                    </Button>
                                </Link>
                            </div>

                            {!pets || pets.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-primary mb-3">
                                        <PawPrint className="h-6 w-6" />
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {t('dashboard.petCard.noPetsTitle', 'No pets registered yet')}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                        {t('dashboard.petCard.noPetsDesc', 'Create a pet profile with routines and care instructions for sitters.')}
                                    </p>
                                    <Link to="/pet-profile" className="mt-4 inline-block">
                                        <Button size="sm" className="rounded-xl shadow-glow font-semibold">
                                            <Plus className="w-4 h-4 mr-1" />
                                            {t('dashboard.petCard.createProfile', 'Create Profile')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {pets.map((pet: Pet) => {
                                        const species = (pet.species || '').toLowerCase();
                                        return (
                                            <div
                                                key={pet.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => navigate('/pet-profile', { state: { pet } })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        navigate('/pet-profile', { state: { pet } });
                                                    }
                                                }}
                                                className="group flex cursor-pointer items-center gap-3.5 sm:gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 sm:p-4 shadow-xs transition-all hover:bg-orange-50/40 hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-orange-950/20"
                                            >
                                                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl bg-orange-100/80 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40 shadow-2xs">
                                                    {pet.imageUrl ? (
                                                        <img
                                                            src={pet.imageUrl}
                                                            alt={pet.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-primary">
                                                            {species === 'dog' ? (
                                                                <Dog className="h-7 w-7" />
                                                            ) : species === 'cat' ? (
                                                                <Cat className="h-7 w-7 text-purple-500" />
                                                            ) : species === 'bird' ? (
                                                                <Bird className="h-7 w-7 text-sky-500" />
                                                            ) : (
                                                                <PawPrint className="h-7 w-7" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white truncate">
                                                            {pet.name}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 capitalize">
                                                            {pet.species}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {pet.breed ? `${pet.breed} · ` : ''}{pet.age ? `${pet.age} ${t('dashboard.petCard.yrs', 'yrs')}` : ''}
                                                    </p>
                                                    <span className="mt-1.5 inline-flex items-center text-[11px] font-bold text-primary group-hover:underline">
                                                        {t('dashboard.petCard.edit', 'View & Edit')} →
                                                    </span>
                                                </div>
                                                <div className="rounded-xl p-2 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Section: Bookings */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {/* Bookings Header & Segmented Tabs */}
                            <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <span>{t('dashboard.myBookingsTitle', 'My Bookings')}</span>
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                            {activeTab === 'upcoming' ? t('dashboard.tabs.upcoming', 'Upcoming stays & walks') : t('dashboard.tabs.history', 'Past completed stays')}
                                        </p>
                                    </div>

                                    {/* Segmented Tab Controls */}
                                    <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto border border-slate-200/50 dark:border-slate-700/50">
                                        <button
                                            onClick={() => { setActiveTab('upcoming'); setBookingPage(1); }}
                                            className={cn(
                                                'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                                                activeTab === 'upcoming'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            )}
                                        >
                                            {t('dashboard.tabs.upcoming', 'Upcoming')}
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('history'); setBookingPage(1); }}
                                            className={cn(
                                                'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                                                activeTab === 'history'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            )}
                                        >
                                            {t('dashboard.tabs.history', 'History')}
                                        </button>
                                    </div>
                                </div>

                                {/* Booking Search Input */}
                                <div className="relative mt-4">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={bookingSearch}
                                        onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                                        placeholder={t('dashboard.searchBookingsPlaceholder', 'Search by sitter, service, or date...')}
                                        className="h-11 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                                    />
                                </div>
                            </div>

                            {/* Bookings List */}
                            <div className="p-0">
                                {bookings.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
                                            <Calendar className="h-7 w-7" />
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {activeTab === 'upcoming' ? t('dashboard.emptyUpcoming', 'No upcoming bookings found.') : t('dashboard.emptyHistory', 'No booking history found.')}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            {activeTab === 'upcoming' ? 'Browse verified local sitters and schedule care for your pets anytime.' : 'Your completed stays and walks will appear here.'}
                                        </p>
                                        {activeTab === 'upcoming' && (
                                            <Link to="/booking" className="mt-4 inline-block">
                                                <Button size="sm" className="rounded-xl shadow-glow font-bold">
                                                    <Sparkles className="w-4 h-4 mr-1.5" />
                                                    {t('dashboard.bookNow', 'Book Now')}
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {bookings.map((booking: Booking) => {
                                            const isCompleted = booking.status === BookingStatus.COMPLETED;
                                            const isPending = booking.status === BookingStatus.PENDING;
                                            const isAccepted = booking.status === BookingStatus.ACCEPTED;

                                            const statusBadgeClass = isAccepted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                                : isPending
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                                : isCompleted
                                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

                                            const sitterName = booking.sitter?.user
                                                ? `${booking.sitter.user.firstName} ${booking.sitter.user.lastName || ''}`
                                                : 'Verified Sitter';

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                                >
                                                    <div className="flex items-start gap-4 min-w-0">
                                                        <div className={cn(
                                                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs font-bold text-sm',
                                                            isCompleted
                                                                ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800'
                                                                : isAccepted
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                                                                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                                                        )}>
                                                            <Calendar className="h-5 w-5" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-bold text-slate-900 dark:text-white capitalize truncate text-sm sm:text-base">
                                                                    {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                                                </h3>
                                                                <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border', statusBadgeClass)}>
                                                                    {String(t(`dashboard.bookings.status.${booking.status.toLowerCase()}`, { defaultValue: booking.status }))}
                                                                </span>
                                                            </div>

                                                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                                                                    {sitterName}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 font-medium">
                                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                                    {format(new Date(booking.startDate), 'MMM d', dfOpts())} - {format(new Date(booking.endDate), 'MMM d, yyyy', dfOpts())}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Booking Actions */}
                                                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                                                        {isPending && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCancel(booking.id)}
                                                                className="h-9 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            >
                                                                {t('dashboard.bookings.cancel', 'Cancel')}
                                                            </Button>
                                                        )}

                                                        {isCompleted && (
                                                            <PayButton
                                                                bookingId={booking.id}
                                                                amountLabel={booking.totalPrice ? `€${booking.totalPrice}` : undefined}
                                                            />
                                                        )}

                                                        {isCompleted && !(booking as any).review && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => { setSelectedBookingId(booking.id); setReviewModalOpen(true); }}
                                                                className="h-9 px-3 rounded-xl text-xs font-bold"
                                                            >
                                                                <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                                                                {t('dashboard.bookings.review', 'Review')}
                                                            </Button>
                                                        )}

                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            aria-label={t('dashboard.quickActions.messages.title', 'Messages')}
                                                            onClick={() => navigate('/messages', { state: { userId: booking.sitter?.userId } })}
                                                            className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700"
                                                        >
                                                            <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pagination */}
                                {bookingPageData && bookingPageData.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-4 text-xs font-medium text-slate-500 sm:px-6">
                                        <span>Page {bookingPageData.page} of {bookingPageData.totalPages} · {bookingPageData.total} bookings</span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg text-xs"
                                                disabled={bookingPage <= 1}
                                                onClick={() => setBookingPage((p) => p - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg text-xs"
                                                disabled={bookingPage >= bookingPageData.totalPages}
                                                onClick={() => setBookingPage((p) => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-5">
                        {/* Trust & Guarantee Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800">
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/25 blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-orange-400 shadow-inner">
                                    <Shield className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 text-lg font-bold">
                                    {t('dashboard.whyChooseUs.title', 'Double Paws Guarantee')}
                                </h3>
                                <p className="mt-1.5 text-xs leading-5 text-slate-300">
                                    {t('dashboard.whyChooseUs.p1', 'Every booking is covered by veterinary support and pet insurance.')}
                                </p>
                                <div className="mt-4 space-y-2.5 text-xs text-slate-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{t('dashboard.whyChooseUs.p2', 'Identity-verified & background-checked sitters')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{t('dashboard.whyChooseUs.p3', '24/7 dedicated support & emergency coverage')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Sitters CTA Banner */}
                        <div className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50/50 p-5 dark:border-orange-900/30 dark:from-orange-950/20 dark:to-slate-900">
                            <div className="flex items-start gap-3.5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-primary shadow-xs">
                                    <Search className="h-5 w-5" />
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                        {t('dashboard.quickActions.bookSitter.title', 'Find a Trusted Sitter')}
                                    </h4>
                                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                        {t('dashboard.quickActions.bookSitter.desc', 'Browse available sitters nearby for your upcoming trip.')}
                                    </p>
                                    <Link
                                        to="/booking"
                                        className="mt-3 inline-flex items-center text-xs font-bold text-primary hover:underline gap-1"
                                    >
                                        <span>{t('dashboard.bookNow', 'Search Sitters')}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Support Request Component */}
                        <SupportRequestCard
                            bookingOptions={bookings?.map((booking: Booking) => ({
                                id: booking.id,
                                label: `${bookingReference(booking.id, booking.referenceNumber)} · ${booking.serviceType.replace(/([A-Z])/g, ' $1').trim()} · ${format(new Date(booking.startDate), 'MMM d', dfOpts())}`
                            }))}
                        />
                    </aside>
                </div>
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                title={t('dashboard.review.title', 'Rate your experience')}
            >
                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 p-1"
                                >
                                    <Star
                                        className={cn(
                                            "w-7 h-7",
                                            star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {rating === 5 ? t('dashboard.review.excellent', 'Excellent! ⭐⭐⭐⭐⭐') : rating === 4 ? t('dashboard.review.good', 'Very Good! ⭐⭐⭐⭐') : rating === 3 ? t('dashboard.review.okay', 'Average ⭐⭐⭐') : rating === 2 ? t('dashboard.review.poor', 'Below Average ⭐⭐') : t('dashboard.review.terrible', 'Poor ⭐')}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t('dashboard.review.share', 'Share your review')}
                        </label>
                        <textarea
                            className="w-full min-h-[110px] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                            placeholder={t('dashboard.review.placeholder', 'Tell us about your pet\'s stay and the sitter\'s care...')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={() => setReviewModalOpen(false)}
                            disabled={submittingReview}
                            className="rounded-xl text-xs font-semibold"
                        >
                            {t('dashboard.review.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !comment.trim()}
                            className="rounded-xl text-xs font-bold shadow-glow"
                        >
                            {submittingReview ? t('dashboard.review.submitting', 'Submitting...') : t('dashboard.review.submit', 'Submit Review')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;

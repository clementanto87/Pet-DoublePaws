import React, { useState } from 'react';
import { dfOpts } from '../lib/dateLocale';
import { Link, useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Calendar,
    Dog,
    Cat,
    Star,
    Search,
    Shield,
    PawPrint,
    MessageSquare,
    CheckCircle,
    User,
    ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
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
import { paymentService } from '../services/payment.service';

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

    // Fetch Pets
    const { data: pets, isLoading: petsLoading } = useQuery({
        queryKey: ['pets'],
        queryFn: petService.getPets,
    });

    // Fetch Bookings
    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['myBookings'],
        queryFn: () => bookingService.getBookings('owner'),
    });

    // Completed services remain upcoming until Stripe confirms payment. The
    // payment queries use the same keys as PayButton, so its webhook-driven
    // status update automatically moves the booking to History.
    const completedBookings = bookings?.filter(
        (booking: Booking) => booking.status === BookingStatus.COMPLETED
    ) || [];
    const completedPaymentQueries = useQueries({
        queries: completedBookings.map((booking: Booking) => ({
            queryKey: ['payment', booking.id],
            queryFn: () => paymentService.getForBooking(booking.id),
            retry: false,
        })),
    });

    // Fetch conversations for unread count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000,
    });

    // Calculate total unread messages
    const totalUnreadCount = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;

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
            showToast(t('dashboard.bookings.reviewSubmitted'), 'success');
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast(t('dashboard.bookings.reviewFailed'), 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm(t('dashboard.bookings.cancelConfirm'))) return;
        try {
            await bookingService.updateStatus(id, BookingStatus.CANCELLED);
            showToast(t('dashboard.bookings.cancelledSuccess'), 'success');
            window.location.reload();
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            showToast(t('dashboard.bookings.cancelledFailed'), 'error');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.greeting.morning');
        if (hour < 17) return t('dashboard.greeting.afternoon');
        return t('dashboard.greeting.evening');
    };

    const petCount = pets?.length || 0;

    const paidCompletedBookingIds = new Set(
        completedBookings.filter((_booking: Booking, index: number) =>
            (completedPaymentQueries[index]?.data as { status?: string } | undefined)?.status === 'SUCCEEDED'
        ).map((booking: Booking) => booking.id)
    );

    const upcomingBookings = bookings?.filter((b: Booking) =>
        b.status === BookingStatus.PENDING ||
        b.status === BookingStatus.ACCEPTED ||
        (b.status === BookingStatus.COMPLETED && !paidCompletedBookingIds.has(b.id))
    ) || [];

    const historicalBookings = bookings?.filter((b: Booking) =>
        (b.status === BookingStatus.COMPLETED && paidCompletedBookingIds.has(b.id)) ||
        b.status === BookingStatus.REJECTED ||
        b.status === BookingStatus.CANCELLED
    ) || [];

    const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historicalBookings;

    if (petsLoading || bookingsLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark pt-8 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8fa] dark:bg-background-alt-dark px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
            <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{format(new Date(), 'EEEE, MMMM d', dfOpts())}</p>
                        <h1 className="mt-1 text-3xl font-display font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            {getGreeting()}, {user?.firstName}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                            {petCount > 0 ? t('dashboard.petsInCare', { count: petCount }) : t('dashboard.welcome')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/messages" className="relative hidden sm:block">
                            <Button variant="outline" size="icon" aria-label={t('dashboard.quickActions.messages.title')}>
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            {totalUnreadCount > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#f7f8fa] bg-primary" />}
                        </Link>
                        <Link to="/booking">
                            <Button className="h-11 rounded-xl px-5 shadow-md shadow-primary/20">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('dashboard.bookNow')}
                            </Button>
                        </Link>
                    </div>
                </header>

                <section className="grid gap-3 sm:grid-cols-3">
                    {[
                        { label: t('dashboard.stats.myPets'), value: petCount, note: t('dashboard.statsSub.myPets'), icon: PawPrint, tone: 'bg-orange-50 text-primary dark:bg-orange-950/30', action: () => navigate('/pet-profile') },
                        { label: t('dashboard.stats.upcoming'), value: upcomingBookings.length, note: t('dashboard.statsSub.upcoming'), icon: Calendar, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30', action: () => setActiveTab('upcoming') },
                        { label: t('dashboard.stats.completed'), value: historicalBookings.filter((booking: Booking) => booking.status === BookingStatus.COMPLETED).length, note: t('dashboard.statsSub.completed'), icon: CheckCircle, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30', action: () => setActiveTab('history') },
                    ].map((stat) => (
                        <button key={stat.label} onClick={stat.action} className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{stat.value}</p>
                                <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                            </div>
                            <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', stat.tone)}><stat.icon className="h-5 w-5" /></span>
                        </button>
                    ))}
                </section>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">
                        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl text-slate-950 dark:text-white">{t('dashboard.myBookingsTitle')}</CardTitle>
                                        <p className="mt-1 text-sm text-slate-500">{activeTab === 'upcoming' ? t('dashboard.tabs.upcoming') : t('dashboard.tabs.history')}</p>
                                    </div>
                                    <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                        {(['upcoming', 'history'] as const).map((tab) => (
                                            <button key={tab} onClick={() => setActiveTab(tab)} className={cn('rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4', activeTab === tab ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white')}>
                                                {t(`dashboard.tabs.${tab}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {displayedBookings.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"><Calendar className="h-6 w-6" /></span>
                                        <p className="mt-4 text-sm text-slate-500">{activeTab === 'upcoming' ? t('dashboard.emptyUpcoming') : t('dashboard.emptyHistory')}</p>
                                        {activeTab === 'upcoming' && <Link to="/booking" className="mt-4 inline-block"><Button size="sm">{t('dashboard.bookNow')}</Button></Link>}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {displayedBookings.map((booking: Booking) => {
                                            const isCompleted = booking.status === BookingStatus.COMPLETED;
                                            const statusStyle = booking.status === BookingStatus.ACCEPTED ? 'bg-emerald-50 text-emerald-700' : booking.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-700' : isCompleted ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600';
                                            return (
                                                <div key={booking.id} className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                                    <div className="flex min-w-0 items-start gap-4">
                                                        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', isCompleted ? 'bg-blue-50 text-blue-600' : booking.status === BookingStatus.ACCEPTED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}><Calendar className="h-5 w-5" /></span>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="truncate font-semibold capitalize text-slate-950 dark:text-white">{booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                                                <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', statusStyle)}>{String(t(`dashboard.bookings.status.${booking.status.toLowerCase()}`, { defaultValue: booking.status }))}</span>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                                <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName?.[0]}.</span>
                                                                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(new Date(booking.startDate), 'MMM d', dfOpts())} - {format(new Date(booking.endDate), 'MMM d, yyyy', dfOpts())}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-15 sm:pl-0">
                                                        {booking.status === BookingStatus.PENDING && <Button variant="ghost" size="sm" onClick={() => handleCancel(booking.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">{t('dashboard.bookings.cancel')}</Button>}
                                                        {isCompleted && <PayButton bookingId={booking.id} amountLabel={booking.totalPrice ? `$${booking.totalPrice}` : undefined} />}
                                                        {isCompleted && !(booking as any).review && <Button size="sm" variant="outline" onClick={() => { setSelectedBookingId(booking.id); setReviewModalOpen(true); }}>{t('dashboard.bookings.review')}</Button>}
                                                        <Button size="icon" variant="ghost" aria-label={t('dashboard.quickActions.messages.title')} onClick={() => navigate('/messages', { state: { userId: booking.sitter?.userId } })}><MessageSquare className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <div><h2 className="text-xl font-bold text-slate-950 dark:text-white">{t('dashboard.myPetsTitle')}</h2><p className="mt-1 text-sm text-slate-500">{petCount ? t('dashboard.petsInCare', { count: petCount }) : t('dashboard.petCard.noPetsDesc')}</p></div>
                                <Link to="/pet-profile"><Button variant="outline" size="sm"><Plus className="mr-1.5 h-4 w-4" />{t('dashboard.addPet')}</Button></Link>
                            </div>
                            {!pets || pets.length === 0 ? (
                                <Card className="rounded-2xl border-dashed bg-white dark:bg-slate-900"><CardContent className="flex flex-col items-center px-6 py-10 text-center"><PawPrint className="h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-950 dark:text-white">{t('dashboard.petCard.noPetsTitle')}</h3><Link to="/pet-profile" className="mt-4"><Button size="sm">{t('dashboard.petCard.createProfile')}</Button></Link></CardContent></Card>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {pets.slice(0, 4).map((pet: Pet) => (
                                        <div key={pet.id} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-orange-50 dark:bg-orange-950/30">
                                                {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{pet.species?.toLowerCase() === 'dog' ? <Dog className="h-8 w-8 text-orange-300" /> : <Cat className="h-8 w-8 text-purple-300" />}</div>}
                                            </div>
                                            <div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-950 dark:text-white">{pet.name}</h3><p className="mt-1 text-sm capitalize text-slate-500">{pet.breed || pet.species} · {pet.age} {t('dashboard.petCard.yrs')}</p><button onClick={() => navigate('/pet-profile', { state: { pet } })} className="mt-2 text-xs font-semibold text-primary hover:underline">{t('dashboard.petCard.edit')}</button></div>
                                            <button onClick={() => navigate('/booking')} className="rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-primary" aria-label={t('dashboard.petCard.book')}><ArrowRight className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <Card className="overflow-hidden rounded-2xl border-0 bg-slate-950 text-white shadow-xl shadow-slate-900/10">
                            <CardContent className="relative p-6"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-2xl" /><div className="relative"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Shield className="h-5 w-5 text-orange-300" /></span><h2 className="mt-5 text-xl font-semibold">{t('dashboard.whyChooseUs.title')}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{t('dashboard.whyChooseUs.p1')}</p><div className="mt-5 space-y-3 text-sm text-slate-200"><p className="flex gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{t('dashboard.whyChooseUs.p2')}</p><p className="flex gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{t('dashboard.whyChooseUs.p3')}</p></div></div></CardContent>
                        </Card>

                        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-950/20"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-slate-900"><Search className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-950 dark:text-white">{t('dashboard.quickActions.bookSitter.title')}</h3><p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{t('dashboard.quickActions.bookSitter.desc')}</p><Link to="/booking" className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline">{t('dashboard.bookNow')}<ArrowRight className="ml-1.5 h-4 w-4" /></Link></div></div></div>

                        <SupportRequestCard bookingOptions={bookings?.map((booking: Booking) => ({ id: booking.id, label: `${booking.serviceType.replace(/([A-Z])/g, ' $1').trim()} · ${format(new Date(booking.startDate), 'MMM d', dfOpts())}` }))} />
                    </aside>
                </div>
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                title={t('dashboard.review.title')}
            >
                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            "w-8 h-8",
                                            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            {rating === 5 ? t('dashboard.review.excellent') : rating === 4 ? t('dashboard.review.good') : rating === 3 ? t('dashboard.review.okay') : rating === 2 ? t('dashboard.review.poor') : t('dashboard.review.terrible')}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {t('dashboard.review.share')}
                        </label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                            placeholder={t('dashboard.review.placeholder')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setReviewModalOpen(false)}
                            disabled={submittingReview}
                        >
                            {t('dashboard.review.cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !comment.trim()}
                        >
                            {submittingReview ? t('dashboard.review.submitting') : t('dashboard.review.submit')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;

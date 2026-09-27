import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format, differenceInCalendarDays, isValid } from 'date-fns';
import {
    Calendar,
    Clock,
    User,
    ArrowLeft,
    Check,
    X,
    CheckCircle2,
    MessageSquare,
    ShieldCheck,
    MapPin,
    AlertCircle,
    Dog,
    CreditCard,
    Home,
    Footprints,
    Sun,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PayButton } from '../components/payment/PayButton';
import { bookingService, BookingStatus } from '../services/booking.service';
import { bookingReference } from '../utils/bookingReference';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export const BookingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingService.getBookingById(id!),
        enabled: !!id,
        retry: 1,
    });

    // Update status mutation (for sitter accept/reject/completion, or owner cancel)
    const updateStatusMutation = useMutation({
        mutationFn: (status: BookingStatus) => bookingService.updateStatus(id!, status),
        onSuccess: (_, newStatus) => {
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({ queryKey: ['sitterBookings'] });
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            setCancelModalOpen(false);

            if (newStatus === BookingStatus.ACCEPTED) {
                showToast(t('bookingDetail.acceptedSuccess', 'Booking accepted successfully!'), 'success');
            } else if (newStatus === BookingStatus.REJECTED) {
                showToast(t('bookingDetail.rejectedNotice', 'Booking declined.'), 'info');
            } else if (newStatus === BookingStatus.COMPLETION_REQUESTED) {
                showToast(t('bookingDetail.completionRequested', 'Completion request sent to the pet parent.'), 'success');
            } else if (newStatus === BookingStatus.CANCELLED) {
                showToast(t('bookingDetail.cancelledNotice', 'Booking has been cancelled.'), 'info');
            }
        },
        onError: () => {
            showToast(t('bookingDetail.actionFailed', 'Failed to update booking status.'), 'error');
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">{t('bookingDetail.loading', 'Loading booking details...')}</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">
                <div className="max-w-xl mx-auto text-center bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t('bookingDetail.notFoundTitle', 'Booking Not Found')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                        {t('bookingDetail.notFoundDesc', 'We could not find this booking or you do not have permission to view it.')}
                    </p>
                    <Button onClick={() => navigate(-1)} className="rounded-xl font-bold">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('common.goBack', 'Go Back')}
                    </Button>
                </div>
            </div>
        );
    }

    const isSitter = booking.sitter?.userId === user?.id;
    const isOwner = booking.ownerId === user?.id;

    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const isValidDates = isValid(startDate) && isValid(endDate);
    const nights = isValidDates ? Math.max(1, differenceInCalendarDays(endDate, startDate)) : 1;

    const isPending = booking.status === BookingStatus.PENDING;
    const isAccepted = booking.status === BookingStatus.ACCEPTED;
    const isCompletionRequested = booking.status === BookingStatus.COMPLETION_REQUESTED;
    const isCompleted = booking.status === BookingStatus.COMPLETED;
    const isCancelled = booking.status === BookingStatus.CANCELLED;
    const isRejected = booking.status === BookingStatus.REJECTED;

    const ownerFullName = [booking.owner?.firstName, booking.owner?.lastName].filter(Boolean).join(' ').trim();
    const ownerDisplayName = ownerFullName || booking.owner?.email || 'Pet Parent';

    const sitterUser = booking.sitter?.user;
    const sitterFullName = [sitterUser?.firstName, sitterUser?.lastName].filter(Boolean).join(' ').trim();
    const sitterDisplayName = sitterFullName || sitterUser?.email || 'Pet Sitter';

    const serviceIcons: Record<string, any> = {
        boarding: Home,
        'house-sitting': Home,
        housesitting: Home,
        walking: Footprints,
        'dog-walking': Footprints,
        'drop-in': Sun,
        'day-care': Sun,
    };
    const ServiceIcon = serviceIcons[booking.serviceType.toLowerCase()] || Calendar;

    // Chat navigation helper
    const handleOpenChat = () => {
        if (isSitter) {
            navigate('/sitter-messages', { state: { userId: booking.ownerId } });
        } else {
            navigate('/messages', { state: { userId: booking.sitter?.userId } });
        }
    };

    const backUrl = isSitter ? '/sitter-dashboard' : '/dashboard';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                {/* Back navigation & header bar */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigate(backUrl)}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isSitter ? t('bookingDetail.backToSitterDashboard', 'Back to Sitter Dashboard') : t('bookingDetail.backToDashboard', 'Back to Dashboard')}</span>
                    </button>

                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        #{bookingReference(booking.id, booking.referenceNumber)}
                    </span>
                </div>

                {/* Hero / Summary Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                                <ServiceIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                        {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                    </h1>
                                    <span
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border',
                                            isAccepted && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
                                            isPending && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
                                            isCompletionRequested && 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
                                            isCompleted && 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
                                            isCancelled && 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
                                            isRejected && 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                        )}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                        {isValidDates ? `${format(startDate, 'EEE, MMM d')} – ${format(endDate, 'EEE, MMM d, yyyy')} (${nights} ${nights === 1 ? 'night/day' : 'nights/days'})` : 'Dates pending'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 font-medium sm:hidden">Total Price</span>
                            <div className="text-right">
                                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    €{Number(booking.totalPrice).toFixed(2)}
                                </div>
                                <span className="text-[10px] text-slate-400">Taxes & fees included</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar inside Header Card */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Sitter Actions */}
                        {isSitter && isPending && (
                            <>
                                <Button
                                    onClick={() => updateStatusMutation.mutate(BookingStatus.ACCEPTED)}
                                    disabled={updateStatusMutation.isPending}
                                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                >
                                    <Check className="w-4 h-4 mr-1.5" />
                                    Accept Request
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate(BookingStatus.REJECTED)}
                                    disabled={updateStatusMutation.isPending}
                                    className="rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/40"
                                >
                                    <X className="w-4 h-4 mr-1.5" />
                                    Decline Request
                                </Button>
                            </>
                        )}

                        {isSitter && isAccepted && (
                            <Button
                                onClick={() => updateStatusMutation.mutate(BookingStatus.COMPLETION_REQUESTED)}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Request Completion
                            </Button>
                        )}

                        {/* Owner Actions */}
                        {isOwner && isAccepted && (
                            <PayButton bookingId={booking.id} amountLabel={`€${Number(booking.totalPrice).toFixed(2)}`} />
                        )}

                        {isOwner && (isPending || isAccepted) && (
                            <Button
                                variant="outline"
                                onClick={() => setCancelModalOpen(true)}
                                className="rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                                Cancel Booking
                            </Button>
                        )}

                        {/* Always visible Chat Button */}
                        <Button
                            variant="outline"
                            onClick={handleOpenChat}
                            className="rounded-xl text-xs font-bold gap-1.5 ml-auto"
                        >
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span>{isSitter ? 'Message Pet Parent' : 'Message Sitter'}</span>
                        </Button>
                    </div>
                </div>

                {/* Main 2-Column or Stacked Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Counterpart Card: Pet Parent or Sitter */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-primary" />
                            <span>{isSitter ? 'Pet Parent Information' : 'Pet Sitter Information'}</span>
                        </h2>

                        {isSitter ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                        {booking.owner?.profileImage ? (
                                            <img src={booking.owner.profileImage} alt="" className="h-full w-full rounded-2xl object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {ownerDisplayName}
                                        </div>
                                        {booking.owner?.email && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {booking.owner.email}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-400">Account Role</span>
                                        <span className="font-semibold">Pet Owner</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-400">Direct Contact</span>
                                        <button
                                            onClick={handleOpenChat}
                                            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            Start Conversation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {sitterUser?.profileImage ? (
                                            <img src={sitterUser.profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {sitterDisplayName}
                                        </div>
                                        {booking.sitter?.headline && (
                                            <div className="text-xs text-slate-500 truncate">
                                                {booking.sitter.headline}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {booking.sitter?.address && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{booking.sitter.address}</span>
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-400">Profile View</span>
                                        <Link
                                            to={`/sitter/${booking.sitterId}`}
                                            className="text-primary font-bold hover:underline"
                                        >
                                            View Public Profile →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Schedule & Duration Card */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Schedule & Booking Timeline</span>
                        </h2>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Start Date</span>
                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                        {isValidDates ? format(startDate, 'EEE, MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">End Date</span>
                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                        {isValidDates ? format(endDate, 'EEE, MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Total Duration</span>
                                <span className="font-bold text-slate-900 dark:text-white">{nights} {nights === 1 ? 'day/night' : 'days/nights'}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Requested On</span>
                                <span className="text-slate-600 dark:text-slate-300">
                                    {isValid(new Date(booking.createdAt)) ? format(new Date(booking.createdAt), 'MMM d, yyyy · HH:mm') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pets Information Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Dog className="w-4 h-4 text-primary" />
                        <span>Pets for this Booking</span>
                    </h2>

                    {booking.pets && booking.pets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {booking.pets.map((pet) => (
                                <div
                                    key={pet.id}
                                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0">
                                        {pet.imageUrl ? (
                                            <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Dog className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {pet.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 capitalize">
                                            {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-1">
                                            {pet.age !== undefined && <span>{pet.age} yrs</span>}
                                            {pet.weight !== undefined && <span>· {pet.weight} kg</span>}
                                        </div>
                                        {pet.specialNeeds && (
                                            <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                                Special notes: {pet.specialNeeds}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                            <Dog className="w-5 h-5 text-slate-400 shrink-0" />
                            <span>
                                {booking.message?.includes('[Manual Pet Entry')
                                    ? 'Pet information entered manually in the booking note below.'
                                    : 'Standard booking without registered pet profiles attached.'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Client Message / Special Notes */}
                {booking.message && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span>Special Instructions & Notes from Client</span>
                        </h2>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic break-words">
                            “{booking.message}”
                        </div>
                    </div>
                )}

                {/* Payment & Security Escrow Information */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <span>Payment & Guarantee</span>
                        </h2>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Double Paws Escrow Guarantee</span>
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                            <span>Service Total</span>
                            <span className="text-emerald-600 dark:text-emerald-400">€{Number(booking.totalPrice).toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                            All transactions are securely held in platform escrow. Payment is released to the pet sitter only after the booking is completed to your satisfaction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cancel Booking Confirmation Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Cancel Booking?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Are you sure you want to cancel this booking request? The sitter will be notified and your booking status will be updated to cancelled.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setCancelModalOpen(false)}
                                className="rounded-xl text-xs"
                            >
                                Keep Booking
                            </Button>
                            <Button
                                onClick={() => updateStatusMutation.mutate(BookingStatus.CANCELLED)}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                            >
                                {updateStatusMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { dfOpts } from '../lib/dateLocale';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchAddresses, type Address } from '../utils/geocoding';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    MapPin,
    Phone,
    Calendar,
    DollarSign,
    Clock,
    Edit3,
    CheckCircle2,
    Home,
    Briefcase,
    Heart,
    Award,
    PawPrint,
    X,
    Save,
    ChevronRight,
    Users,
    MessageSquare,
    ArrowRight,
    Search,
    Image as ImageIcon,
    Trash2,
    ShieldCheck,
    Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { sitterService, type SitterProfile } from '../services/sitter.service';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { Booking } from '../services/booking.service';
import { bookingService, BookingStatus } from '../services/booking.service';
import { format } from 'date-fns';
import { messageService } from '../services/message.service';
import { useToast } from '../components/ui/Toast';
import { AvailabilityCalendar } from '../components/sitter/AvailabilityCalendar';
import { SupportRequestCard } from '../components/support/SupportRequestCard';
import { bookingReference } from '../utils/bookingReference';

// Service name mapping
const serviceNames: Record<string, string> = {
    boarding: 'Boarding',
    houseSitting: 'House Sitting',
    dropInVisits: 'Drop-in Visits',
    doggyDayCare: 'Doggy Day Care',
    dogWalking: 'Dog Walking'
};

// Service icons
const serviceIcons: Record<string, React.ElementType> = {
    boarding: Home,
    houseSitting: Home,
    dropInVisits: Clock,
    doggyDayCare: Users,
    dogWalking: PawPrint
};

const readImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Only image files are supported'));
    if (file.size > 10 * 1024 * 1024) return reject(new Error('Images must be smaller than 10 MB'));
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to read image'));
    };
    image.src = objectUrl;
});

// Edit Modal Component
interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSave: () => void;
    isSaving: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children, onSave, isSaving }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 sm:p-6 overflow-y-auto max-h-[60vh]">
                    {children}
                </div>
                <div className="flex justify-end gap-2.5 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs font-semibold">
                        {t('sitterDashboard.modal.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={onSave} disabled={isSaving} className="rounded-xl text-xs font-bold shadow-glow">
                        {isSaving ? t('sitterDashboard.modal.saving', 'Saving...') : <><Save className="w-3.5 h-3.5 mr-1.5" /> {t('sitterDashboard.modal.save', 'Save Changes')}</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SitterDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
    const [bookingPage, setBookingPage] = useState(1);

    // Fetch sitter profile
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['sitterProfile'],
        queryFn: sitterService.getMyProfile,
        retry: false
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: sitterService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sitterProfile'] });
            setEditModal({ isOpen: false, section: '' });
            showToast('Profile updated successfully!', 'success');
        }
    });

    // Fetch bookings
    const { data: bookingPageData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['sitterBookings', activeTab, bookingSearch, bookingStatusFilter, bookingPage],
        queryFn: () => bookingService.getBookings({
            role: 'sitter',
            bucket: activeTab,
            search: bookingSearch,
            status: bookingStatusFilter,
            page: bookingPage,
        }),
        enabled: !!profile
    });
    const bookings = bookingPageData?.items || [];

    // Fetch conversations for unread count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000,
    });

    const totalUnreadCount = conversations?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) || 0;

    // Update booking status mutation
    const updateBookingStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
            bookingService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sitterBookings'] });
            if (variables.status === BookingStatus.ACCEPTED) {
                showToast('Booking accepted successfully!', 'success');
            } else if (variables.status === BookingStatus.REJECTED) {
                showToast('Booking rejected', 'info');
            } else if (variables.status === BookingStatus.COMPLETED) {
                showToast('Service marked as completed. The owner can now pay.', 'success');
            }
        },
        onError: () => {
            showToast('Failed to update booking status', 'error');
        }
    });

    // Edit modal state
    const [editModal, setEditModal] = useState<{ isOpen: boolean; section: string }>({
        isOpen: false,
        section: ''
    });

    // Form data state for editing
    const [editFormData, setEditFormData] = useState<Partial<SitterProfile>>({});

    // Open edit modal
    const openEditModal = (section: string) => {
        setEditFormData(profile || {});
        setEditModal({ isOpen: true, section });
    };

    // Address Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditFormData({ ...editFormData, address: value });

        if (value.length > 2) {
            try {
                const results = await searchAddresses(value);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (place: Address) => {
        setEditFormData({
            ...editFormData,
            address: place.display_name,
            latitude: place.coordinates?.lat ?? editFormData.latitude,
            longitude: place.coordinates?.lng ?? editFormData.longitude
        });
        setShowSuggestions(false);
    };

    const handleSave = () => {
        updateMutation.mutate(editFormData as any);
    };

    const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const profileImage = await readImage(file);
            updateMutation.mutate({ profileImage } as any);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to upload image', 'error');
        }
        event.target.value = '';
    };

    const handleGalleryImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const current = profile?.galleryImages || [];
        if (current.length + files.length > 10) {
            showToast('You can upload up to 10 gallery images.', 'error');
            return;
        }
        try {
            const images = await Promise.all(files.map(readImage));
            updateMutation.mutate({ galleryImages: [...current, ...images] } as any);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to upload images', 'error');
        }
        event.target.value = '';
    };

    const removeGalleryImage = (index: number) => {
        const images = (profile?.galleryImages || []).filter((_, imageIndex) => imageIndex !== index);
        updateMutation.mutate({ galleryImages: images } as any);
    };

    const handleToggleDate = (date: string) => {
        if (!profile) return;

        const currentBlocked = profile.availability?.blockedDates || [];
        const newBlocked = currentBlocked.includes(date)
            ? currentBlocked.filter(d => d !== date)
            : [...currentBlocked, date];

        updateMutation.mutate({
            availability: {
                general: profile.availability?.general || [],
                blockedDates: newBlocked
            }
        } as any);
    };

    // Format display name
    const rawName = user?.firstName || user?.email?.split('@')[0] || 'Sitter';
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading sitter dashboard...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pt-20 px-4 flex items-center justify-center">
                <div className="max-w-md w-full text-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                        <PawPrint className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('sitterDashboard.noProfile.title', 'Become a Pet Sitter')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                        You haven't registered a sitter profile yet. Start offering boarding, dog walking, and daycare services!
                    </p>
                    <Button onClick={() => navigate('/become-a-sitter')} className="w-full h-11 rounded-2xl shadow-glow font-bold">
                        Become a Sitter
                    </Button>
                </div>
            </div>
        );
    }

    const activeServicesCount = profile.services
        ? Object.values(profile.services).filter(s => s?.active).length
        : 0;

    const activeRates = profile.services
        ? Object.values(profile.services).filter(s => s?.active).map(s => s?.rate || 0)
        : [];
    const minRate = activeRates.length > 0 ? Math.min(...activeRates) : 0;
    const maxRate = activeRates.length > 0 ? Math.max(...activeRates) : 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">

                {/* Top Hero & Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-amber-950/20 dark:to-slate-900/40 border border-orange-200/60 dark:border-orange-900/30 p-5 sm:p-7 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 relative z-10">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{format(new Date(), 'EEEE, MMMM d', dfOpts())}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Sitter Dashboard · {formattedName}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Manage your incoming bookings, services, calendar, and profile.
                            </p>
                        </div>

                        {/* Top Action CTAs */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/dashboard')}
                                className="h-11 px-4 rounded-2xl font-semibold text-xs border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
                            >
                                <PawPrint className="w-4 h-4 text-primary" />
                                <span>{t('sitterDashboard.petOwnerView', 'Pet Parent View')}</span>
                            </Button>

                            <Button
                                onClick={() => openEditModal('profile')}
                                className="h-11 px-5 rounded-2xl shadow-glow font-bold text-xs bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-1.5"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </Button>

                            <Link to="/sitter-messages" className="relative">
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

                {/* Verification Status Banner */}
                <div className={cn(
                    'flex items-center justify-between gap-3.5 rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all shadow-xs',
                    profile.isVerified
                        ? 'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/30'
                        : 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/30'
                )}>
                    <div className="flex items-center gap-3.5">
                        <span className={cn(
                            'flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl shadow-2xs',
                            profile.isVerified
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                : 'bg-amber-500 text-white dark:bg-amber-600'
                        )}>
                            {profile.isVerified ? <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" /> : <Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </span>
                        <div>
                            <h2 className={cn('font-bold text-sm sm:text-base', profile.isVerified ? 'text-emerald-950 dark:text-emerald-200' : 'text-amber-950 dark:text-amber-200')}>
                                {profile.isVerified ? 'Verified Sitter' : 'Verification Under Review'}
                            </h2>
                            <p className={cn('text-xs sm:text-sm mt-0.5', profile.isVerified ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>
                                {profile.isVerified
                                    ? "Your listing is active and verified. Pet owners can find and book your care services directly."
                                    : "Our trust & safety team is reviewing your profile. You'll be ready to accept bookings shortly."}
                            </p>
                        </div>
                    </div>

                    {!profile.isVerified && (
                        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            Pending Approval
                        </span>
                    )}
                </div>

                {/* 4-Column Stat Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    {/* Stat 1: Active Services */}
                    <div
                        onClick={() => openEditModal('services')}
                        className="cursor-pointer flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('sitterDashboard.stats.activeServices', 'Services')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {activeServicesCount} <span className="text-xs font-semibold text-slate-400">active</span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                Click to edit rates
                            </p>
                        </div>
                    </div>

                    {/* Stat 2: Rate Range */}
                    <div
                        onClick={() => openEditModal('services')}
                        className="cursor-pointer flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('sitterDashboard.stats.rateRange', 'Rates')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                €{minRate} - €{maxRate}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                per service / night
                            </p>
                        </div>
                    </div>

                    {/* Stat 3: Service Radius */}
                    <div
                        onClick={() => openEditModal('services')}
                        className="cursor-pointer flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('sitterDashboard.stats.serviceRadius', 'Coverage')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {Math.round((profile.serviceRadius || 5) * 1.60934)} km
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                search radius
                            </p>
                        </div>
                    </div>

                    {/* Stat 4: Experience */}
                    <div
                        onClick={() => openEditModal('experience')}
                        className="cursor-pointer flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                                {t('sitterDashboard.stats.experience', 'Experience')}
                            </span>
                            <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                            <p className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {profile.yearsExperience || 0} <span className="text-xs font-semibold text-slate-400">years</span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                verified experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">

                        {/* Section: Incoming & Historical Bookings */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {/* Header & Tabs */}
                            <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <span>{t('sitterDashboard.bookings.title', 'Booking Requests')}</span>
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                            {activeTab === 'upcoming' ? 'Review and manage incoming booking requests' : 'Past completed stays and walks'}
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
                                            Upcoming & Pending
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
                                            History
                                        </button>
                                    </div>
                                </div>

                                {/* Search and Status Filter Row */}
                                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                                    <div className="relative min-w-0 flex-1">
                                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={bookingSearch}
                                            onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                                            placeholder="Search by pet owner, service, or date..."
                                            className="h-11 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        />
                                    </div>

                                    <select
                                        value={bookingStatusFilter}
                                        onChange={(e) => { setBookingStatusFilter(e.target.value as 'ALL' | BookingStatus); setBookingPage(1); }}
                                        className="h-11 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        {activeTab === 'upcoming' ? (
                                            <>
                                                <option value={BookingStatus.PENDING}>Pending</option>
                                                <option value={BookingStatus.ACCEPTED}>Accepted</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value={BookingStatus.COMPLETED}>Completed</option>
                                                <option value={BookingStatus.REJECTED}>Rejected</option>
                                                <option value={BookingStatus.CANCELLED}>Cancelled</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Bookings List Content */}
                            <div className="p-0">
                                {bookingsLoading ? (
                                    <div className="px-6 py-14 text-center text-sm text-slate-500">
                                        Loading booking requests...
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
                                            <Calendar className="h-7 w-7" />
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {activeTab === 'upcoming' ? 'No incoming booking requests' : 'No booking history found'}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            {activeTab === 'upcoming'
                                                ? 'When pet parents in your area request care, their requests will appear here for you to accept or decline.'
                                                : 'Your completed stays will be archived here.'}
                                        </p>
                                        {bookingSearch && (
                                            <button
                                                onClick={() => { setBookingSearch(''); setBookingStatusFilter('ALL'); }}
                                                className="mt-3 text-xs font-bold text-primary hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {bookings.map((booking: Booking) => {
                                            const isPending = booking.status === BookingStatus.PENDING;
                                            const isAccepted = booking.status === BookingStatus.ACCEPTED;
                                            const isCompleted = booking.status === BookingStatus.COMPLETED;

                                            const statusBadgeClass = isAccepted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                                : isPending
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                                : isCompleted
                                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

                                            const ownerName = booking.owner?.user
                                                ? `${booking.owner.user.firstName} ${booking.owner.user.lastName || ''}`
                                                : 'Pet Parent';

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className="p-5 sm:p-6 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 space-y-3.5"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-4 min-w-0">
                                                            <div className={cn(
                                                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs font-bold text-sm',
                                                                isAccepted
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                                                                    : isPending
                                                                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                                                                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                            )}>
                                                                <Calendar className="h-5 w-5" />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="font-bold text-slate-900 dark:text-white capitalize truncate text-sm sm:text-base">
                                                                        {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </h3>
                                                                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border', statusBadgeClass)}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                                                        {ownerName}
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1 font-medium">
                                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                                        {format(new Date(booking.startDate), 'MMM d', dfOpts())} - {format(new Date(booking.endDate), 'MMM d, yyyy', dfOpts())}
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                                                        €{booking.totalPrice}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sitter Actions */}
                                                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                                                            {isPending && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: BookingStatus.ACCEPTED })}
                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                        className="h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                                    >
                                                                        <Check className="w-3.5 h-3.5 mr-1" />
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: BookingStatus.REJECTED })}
                                                                        disabled={updateBookingStatusMutation.isPending}
                                                                        className="h-9 px-3 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/40"
                                                                    >
                                                                        Decline
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {isAccepted && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: BookingStatus.COMPLETED })}
                                                                    disabled={updateBookingStatusMutation.isPending}
                                                                    className="h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                    Complete Service
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                aria-label="Message owner"
                                                                onClick={() => navigate('/sitter-messages', { state: { userId: booking.ownerId } })}
                                                                className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700"
                                                            >
                                                                <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {booking.message && (
                                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3.5 text-xs italic text-slate-600 dark:text-slate-300">
                                                            “{booking.message}”
                                                        </div>
                                                    )}
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

                        {/* Section: Profile Photos & Space Showcase */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-primary" />
                                        <span>Profile & Daycare Space Photos</span>
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                        Showcase your home, yard, and play areas (up to 10 photos).
                                    </p>
                                </div>

                                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-2xl bg-primary px-4 text-xs font-bold text-white shadow-glow hover:bg-primary/90 transition-all self-start sm:self-auto">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleGalleryImagesChange}
                                        disabled={updateMutation.isPending || (profile.galleryImages?.length || 0) >= 10}
                                    />
                                    <span>+ Add Photos</span>
                                </label>
                            </div>

                            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[160px_1fr]">
                                {/* Main Profile Avatar Preview */}
                                <div className="space-y-2.5">
                                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                                        {profile.user?.profileImage ? (
                                            <img src={profile.user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-3xl font-extrabold text-primary">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} disabled={updateMutation.isPending} />
                                        <span>Change Avatar</span>
                                    </label>
                                </div>

                                {/* Gallery Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {(profile.galleryImages || []).map((image, index) => (
                                        <div key={`${image.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                                            <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                disabled={updateMutation.isPending}
                                                aria-label={`Delete gallery image ${index + 1}`}
                                                className="absolute right-2 top-2 rounded-xl bg-slate-950/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    {(profile.galleryImages?.length || 0) < 10 && (
                                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-orange-50/20 text-slate-400 hover:text-primary transition-all p-3 text-center">
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImagesChange} disabled={updateMutation.isPending} />
                                            <span className="text-2xl font-light leading-none mb-1">+</span>
                                            <span className="text-[11px] font-bold">Add Photo</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section: Services & Rates & Availability Cards Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Services & Rates */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-primary" />
                                                <span>Services & Rates</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Toggle active services and configure pricing.</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal('services')} className="rounded-xl">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {profile.services && Object.entries(profile.services).map(([key, service]) => {
                                            if (!service) return null;
                                            const Icon = serviceIcons[key] || Briefcase;
                                            return (
                                                <div
                                                    key={key}
                                                    className={cn(
                                                        'flex items-center justify-between rounded-2xl border p-3.5 transition-all',
                                                        service.active
                                                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                                            : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/40'
                                                    )}
                                                >
                                                    <span className="flex min-w-0 items-center gap-2.5">
                                                        <Icon className={cn('h-4 w-4 shrink-0', service.active ? 'text-emerald-600' : 'text-slate-400')} />
                                                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">{serviceNames[key]}</span>
                                                    </span>
                                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">€{service.rate}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Calendar & Notice Period */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span>Calendar & Availability</span>
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Click any date to block or unblock your schedule.</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal('availability')} className="rounded-xl">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {profile.availability?.general?.map((day) => (
                                            <span key={day} className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                                {t(`sitterDashboard.days.${day}`, day)}
                                            </span>
                                        )) || <span className="text-xs text-slate-500">Not specified</span>}
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mb-3 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Notice Period:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{profile.noticePeriod || 'Same Day'}</span>
                                    </div>

                                    <AvailabilityCalendar
                                        blockedDates={profile.availability?.blockedDates || []}
                                        bookings={bookings || []}
                                        onToggleDate={handleToggleDate}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-5">
                        {/* Sitter Profile Snapshot Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800">
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/25 blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-lg font-bold text-white shadow-md">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-bold">{user?.firstName} {user?.lastName}</h3>
                                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs text-slate-300">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0 text-orange-300" />
                                        <span className="truncate">{profile.address || 'No address set'}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0 text-orange-300" />
                                        <span>{profile.phone || 'No phone set'}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 shrink-0 text-orange-300" />
                                        <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                                    </p>
                                </div>

                                <Button
                                    className="mt-5 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-sm"
                                    onClick={() => openEditModal('profile')}
                                >
                                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                    Edit Contact & Bio
                                </Button>
                            </div>
                        </div>

                        {/* Quick Configuration Links */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                Profile Preferences
                            </h4>

                            <button
                                onClick={() => openEditModal('preferences')}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-3 text-left text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Heart className="h-4 w-4 text-primary" />
                                    <span>Pet Preferences & Sizes</span>
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </button>

                            <button
                                onClick={() => openEditModal('housing')}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-3 text-left text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Home className="h-4 w-4 text-primary" />
                                    <span>Housing & Yard Details</span>
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </button>

                            <button
                                onClick={() => openEditModal('experience')}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-3 text-left text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span>Skills & Certifications</span>
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </button>

                            <button
                                onClick={() => navigate('/become-a-sitter/register')}
                                className="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-orange-50/40 dark:bg-orange-950/20 p-3 text-left text-xs font-bold text-primary transition hover:bg-orange-50 dark:hover:bg-orange-950/40 mt-3"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Edit3 className="h-4 w-4" />
                                    <span>Full Sitter Wizard</span>
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Support Card */}
                        <SupportRequestCard
                            bookingOptions={bookings?.map((booking: Booking) => ({
                                id: booking.id,
                                label: `${bookingReference(booking.id, booking.referenceNumber)} · ${booking.serviceType.replace(/([A-Z])/g, ' $1').trim()} · ${format(new Date(booking.startDate), 'MMM d', dfOpts())}`
                            }))}
                        />
                    </aside>
                </div>
            </div>

            {/* Edit Modals */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'profile'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.profile', 'Edit Profile')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label>{t('sitterDashboard.fields.phone', 'Phone Number')}</Label>
                        <Input
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            placeholder={t('sitterDashboard.placeholders.phone', '+1 (555) 000-0000')}
                            className="mt-1"
                        />
                    </div>
                    <div className="relative">
                        <Label>{t('sitterDashboard.fields.address', 'Address')}</Label>
                        <div className="relative mt-1">
                            <Input
                                value={editFormData.address || ''}
                                onChange={handleAddressChange}
                                placeholder={t('sitterDashboard.placeholders.address', 'Enter address')}
                                className="pl-10"
                                onFocus={() => (editFormData.address?.length || 0) > 2 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((place, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-start gap-3"
                                        onClick={() => selectAddress(place)}
                                    >
                                        <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-xs text-slate-900 dark:text-white">
                                                {place.display_name.split(',')[0]}
                                            </p>
                                            <p className="text-[10px] text-slate-500 line-clamp-1">{place.display_name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label>{t('sitterDashboard.fields.headline', 'Profile Headline')}</Label>
                        <Input
                            value={editFormData.headline || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
                            placeholder={t('sitterDashboard.placeholders.headline', 'e.g. Caring dog lover with a big fenced yard')}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>{t('sitterDashboard.fields.bio', 'About You & Experience')}</Label>
                        <textarea
                            className="w-full min-h-[110px] px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mt-1"
                            value={editFormData.bio || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                            placeholder={t('sitterDashboard.placeholders.bio', 'Tell pet parents about your routine, care experience...')}
                        />
                    </div>
                </div>
            </EditModal>

            {/* Services Modal */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'services'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.services', 'Rates & Services')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-3.5">
                    {editFormData.services && Object.entries(editFormData.services).map(([key, service]) => {
                        if (!service) return null;
                        return (
                            <div key={key} className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={service.active}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            services: {
                                                ...editFormData.services,
                                                [key]: { ...service, active: e.target.checked }
                                            }
                                        })}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">{serviceNames[key]}</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-500">€</span>
                                    <Input
                                        type="number"
                                        value={service.rate}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            services: {
                                                ...editFormData.services,
                                                [key]: { ...service, rate: parseFloat(e.target.value) || 0 }
                                            }
                                        })}
                                        className="w-20 h-9 rounded-xl text-xs font-bold"
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <div className="pt-2">
                        <Label>{t('sitterDashboard.fields.serviceRadiusKm', 'Service Radius (miles / km)')}</Label>
                        <Input
                            type="number"
                            value={editFormData.serviceRadius || 5}
                            onChange={(e) => setEditFormData({ ...editFormData, serviceRadius: parseInt(e.target.value) || 5 })}
                            className="mt-1 h-9 rounded-xl text-xs"
                        />
                    </div>
                </div>
            </EditModal>

            {/* Preferences Modal */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'preferences'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.preferences', 'Pet Preferences')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block">{t('sitterDashboard.fields.petTypes', 'Accepted Pet Types')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {['Dog', 'Cat', 'Bird', 'Small Animal', 'Reptile'].map(type => (
                                <label key={type} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.preferences?.acceptedPetTypes?.includes(type) || false}
                                        onChange={(e) => {
                                            const current = editFormData.preferences?.acceptedPetTypes || [];
                                            const updated = e.target.checked
                                                ? [...current, type]
                                                : current.filter(t => t !== type);
                                            setEditFormData({
                                                ...editFormData,
                                                preferences: { ...(editFormData.preferences || { acceptedPetTypes: [], acceptedPetSizes: [], isNeuteredOnly: false, behavioralRestrictions: [] }), acceptedPetTypes: updated }
                                            });
                                        }}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">{t('sitterDashboard.fields.petSizes', 'Accepted Dog Sizes')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {['Small (0-7 kg)', 'Medium (7-18 kg)', 'Large (18-45 kg)', 'Giant (45+ kg)'].map(size => (
                                <label key={size} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.preferences?.acceptedPetSizes?.includes(size) || false}
                                        onChange={(e) => {
                                            const current = editFormData.preferences?.acceptedPetSizes || [];
                                            const updated = e.target.checked
                                                ? [...current, size]
                                                : current.filter(s => s !== size);
                                            setEditFormData({
                                                ...editFormData,
                                                preferences: { ...(editFormData.preferences || { acceptedPetTypes: [], acceptedPetSizes: [], isNeuteredOnly: false, behavioralRestrictions: [] }), acceptedPetSizes: updated }
                                            });
                                        }}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>{size}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="neutered"
                            checked={editFormData.preferences?.isNeuteredOnly || false}
                            onChange={(e) => setEditFormData({
                                ...editFormData,
                                preferences: { ...(editFormData.preferences || { acceptedPetTypes: [], acceptedPetSizes: [], isNeuteredOnly: false, behavioralRestrictions: [] }), isNeuteredOnly: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="neutered" className="text-xs">{t('sitterDashboard.fields.neuteredAccept', 'Only accept neutered/spayed pets')}</Label>
                    </div>
                </div>
            </EditModal>

            {/* Housing Modal */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'housing'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.housing', 'Housing & Environment')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label>{t('sitterDashboard.fields.homeType', 'Home Type')}</Label>
                        <select
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                            value={editFormData.housing?.homeType || ''}
                            onChange={(e) => setEditFormData({
                                ...editFormData,
                                housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), homeType: e.target.value }
                            })}
                        >
                            <option value="">Select Home Type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Farm">Farm</option>
                        </select>
                    </div>
                    <div>
                        <Label>{t('sitterDashboard.fields.outdoorSpace', 'Outdoor Space')}</Label>
                        <select
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                            value={editFormData.housing?.outdoorSpace || ''}
                            onChange={(e) => setEditFormData({
                                ...editFormData,
                                housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), outdoorSpace: e.target.value }
                            })}
                        >
                            <option value="">Select Outdoor Space</option>
                            <option value="Fenced Yard">Fenced Yard</option>
                            <option value="Unfenced Yard">Unfenced Yard</option>
                            <option value="No Yard">No Yard</option>
                        </select>
                    </div>
                    <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold">
                            <input
                                type="checkbox"
                                checked={editFormData.housing?.hasChildren || false}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), hasChildren: e.target.checked }
                                })}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>Has Children living at home</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold">
                            <input
                                type="checkbox"
                                checked={editFormData.housing?.hasOtherPets || false}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), hasOtherPets: e.target.checked }
                                })}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>Has other resident pets</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold">
                            <input
                                type="checkbox"
                                checked={editFormData.housing?.isNonSmoking || false}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), isNonSmoking: e.target.checked }
                                })}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>Non-smoking household</span>
                        </label>
                    </div>
                </div>
            </EditModal>

            {/* Experience Modal */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'experience'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.experience', 'Skills & Experience')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label>{t('sitterDashboard.fields.yearsExperience', 'Years of Experience')}</Label>
                        <Input
                            type="number"
                            min="0"
                            value={editFormData.yearsExperience || 0}
                            onChange={(e) => setEditFormData({ ...editFormData, yearsExperience: parseInt(e.target.value) || 0 })}
                            className="mt-1 h-9 rounded-xl text-xs"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">{t('sitterDashboard.fields.skills', 'Special Skills')}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Oral Medication', 'Injected Medication', 'Senior Dog Experience', 'Puppy Training', 'Special Needs Care'].map(skill => (
                                <label key={skill} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.skills?.includes(skill) || false}
                                        onChange={(e) => {
                                            const current = editFormData.skills || [];
                                            const updated = e.target.checked
                                                ? [...current, skill]
                                                : current.filter(s => s !== skill);
                                            setEditFormData({ ...editFormData, skills: updated });
                                        }}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>{skill}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="mb-2 block">{t('sitterDashboard.fields.certifications', 'Certifications')}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Pet CPR', 'First Aid', 'Professional Dog Trainer', 'Vet Tech'].map(cert => (
                                <label key={cert} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.certifications?.includes(cert) || false}
                                        onChange={(e) => {
                                            const current = editFormData.certifications || [];
                                            const updated = e.target.checked
                                                ? [...current, cert]
                                                : current.filter(c => c !== cert);
                                            setEditFormData({ ...editFormData, certifications: updated });
                                        }}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>{cert}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </EditModal>

            {/* Availability Modal */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'availability'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title={t('sitterDashboard.editTitles.availability', 'General Availability')}
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block">{t('sitterDashboard.fields.generalAvailability', 'General Schedule')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Weekdays', 'Weekends', 'Holidays', 'Full-Time'].map(day => (
                                <label key={day} className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.availability?.general?.includes(day) || false}
                                        onChange={(e) => {
                                            const current = editFormData.availability?.general || [];
                                            let updated: string[];
                                            const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                                            const weekends = ['Sat', 'Sun'];
                                            const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                                            if (e.target.checked) {
                                                updated = [...current, day];
                                                if (day === 'Weekdays') {
                                                    weekdays.forEach(d => { if (!updated.includes(d)) updated.push(d); });
                                                } else if (day === 'Weekends') {
                                                    weekends.forEach(d => { if (!updated.includes(d)) updated.push(d); });
                                                } else if (day === 'Full-Time') {
                                                    allDays.forEach(d => { if (!updated.includes(d)) updated.push(d); });
                                                }
                                            } else {
                                                updated = current.filter(d => d !== day);
                                            }

                                            setEditFormData({
                                                ...editFormData,
                                                availability: { ...(editFormData.availability || { general: [], blockedDates: [] }), general: updated }
                                            });
                                        }}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span>{t(`sitterDashboard.days.${day}`, day)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>{t('sitterDashboard.fields.noticePeriod', 'Required Notice Period')}</Label>
                        <select
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                            value={editFormData.noticePeriod || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, noticePeriod: e.target.value })}
                        >
                            <option value="">Select Notice Period</option>
                            <option value="Same Day">Same Day</option>
                            <option value="1 Day">1 Day</option>
                            <option value="2 Days">2 Days</option>
                            <option value="3 Days">3 Days</option>
                            <option value="1 Week">1 Week</option>
                        </select>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default SitterDashboard;

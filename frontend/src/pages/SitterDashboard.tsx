import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    MapPin,
    Phone,
    Calendar,
    DollarSign,
    Clock,
    Edit3,
    CheckCircle,
    AlertCircle,
    Home,
    Briefcase,
    Heart,
    Award,
    PawPrint,
    Settings,
    X,
    Save,
    ChevronRight,
    Users,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {children}
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SitterDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

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
        }
    });

    // Fetch bookings
    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['sitterBookings'],
        queryFn: () => bookingService.getBookings('sitter'),
        enabled: !!profile
    });

    // Fetch conversations for unread count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Calculate total unread messages
    const totalUnreadCount = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;

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

    // Tab state for bookings
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

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
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
                const results = await response.json();
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

    const selectAddress = (place: any) => {
        setEditFormData({
            ...editFormData,
            address: place.display_name,
            latitude: place.lat ? parseFloat(place.lat) : editFormData.latitude,
            longitude: place.lon ? parseFloat(place.lon) : editFormData.longitude
        });
        setShowSuggestions(false);
    };

    // Handle save
    const handleSave = () => {
        updateMutation.mutate(editFormData as any);
    };

    // Handle availability toggle
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

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // No profile found - redirect to registration
    if (error || !profile) {
        return (
            <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PawPrint className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">No Sitter Profile Found</h2>
                    <p className="text-muted-foreground mb-6">
                        You haven't created a sitter profile yet. Start earning by becoming a pet sitter today!
                    </p>
                    <Button onClick={() => navigate('/become-a-sitter')} className="shadow-glow">
                        Become a Sitter
                    </Button>
                </Card>
            </div>
        );
    }

    // Calculate stats
    const activeServicesCount = profile.services
        ? Object.values(profile.services).filter(s => s?.active).length
        : 0;

    const minRate = profile.services
        ? Math.min(...Object.values(profile.services).filter(s => s?.active).map(s => s?.rate || 0))
        : 0;

    const maxRate = profile.services
        ? Math.max(...Object.values(profile.services).filter(s => s?.active).map(s => s?.rate || 0))
        : 0;

    // Filter bookings based on active tab
    const upcomingBookings = bookings?.filter((booking: Booking) =>
        booking.status === BookingStatus.PENDING || booking.status === BookingStatus.ACCEPTED
    ) || [];

    const historicalBookings = bookings?.filter((booking: Booking) =>
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.REJECTED ||
        booking.status === BookingStatus.CANCELLED
    ) || [];

    const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historicalBookings;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Sitter Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your profile, services, and availability
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            <PawPrint className="w-4 h-4 mr-2" />
                            Pet Owner View
                        </Button>
                        <Button variant="primary" className="shadow-glow">
                            <Settings className="w-4 h-4 mr-2" />
                            Account Settings
                        </Button>
                    </div>
                </div>

                {/* Verification Banner */}
                {!profile.isVerified && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Verification Pending</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                Your profile is under review. You'll start receiving bookings once verified.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
                            Learn More
                        </Button>
                    </div>
                )}

                {profile.isVerified && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-green-800 dark:text-green-200">Profile Verified</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                You're all set! Pet parents can now book your services.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-orange-100 dark:from-primary/20 dark:to-orange-900/20 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                                    <p className="text-3xl font-bold text-foreground">{activeServicesCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rate Range</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        €{minRate} - €{maxRate}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Service Radius</p>
                                    <p className="text-3xl font-bold text-foreground">{Math.round((profile.serviceRadius || 5) * 1.60934)} km</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                                    <p className="text-3xl font-bold text-foreground">{profile.yearsExperience || 0} yrs</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Overview */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('profile')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{user?.firstName} {user?.lastName}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{profile.address || 'No address set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{profile.phone || 'No phone set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {profile.headline && (
                                <div className="pt-4 border-t border-border">
                                    <p className="text-sm font-medium text-foreground">{profile.headline}</p>
                                </div>
                            )}

                            {profile.bio && (
                                <div className="pt-2">
                                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Services & Rates */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Services & Rates
                                </CardTitle>
                                <CardDescription>Your active services and pricing</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('services')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.services && Object.entries(profile.services).map(([key, service]) => {
                                    if (!service) return null;
                                    const Icon = serviceIcons[key] || Briefcase;
                                    return (
                                        <div
                                            key={key}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all",
                                                service.active
                                                    ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                                    : "bg-muted/30 border-border opacity-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                        service.active ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"
                                                    )}>
                                                        <Icon className={cn(
                                                            "w-5 h-5",
                                                            service.active ? "text-green-600" : "text-muted-foreground"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{serviceNames[key]}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {service.active ? 'Active' : 'Inactive'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-foreground">${service.rate}</p>
                                                    <p className="text-xs text-muted-foreground">per night</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Pet Preferences */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    Pet Preferences
                                </CardTitle>
                                <CardDescription>Types and sizes of pets you accept</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('preferences')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Pet Types</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences?.acceptedPetTypes?.map((type) => (
                                        <span key={type} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            {type}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None specified</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Pet Sizes</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences?.acceptedPetSizes?.map((size) => (
                                        <span key={size} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                                            {size}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None specified</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    {profile.preferences?.isNeuteredOnly ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm text-foreground">Neutered only</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Housing */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" />
                                    Housing Details
                                </CardTitle>
                                <CardDescription>Your home environment</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('housing')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Home Type</p>
                                    <p className="font-medium text-foreground">{profile.housing?.homeType || 'Not specified'}</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Outdoor Space</p>
                                    <p className="font-medium text-foreground">{profile.housing?.outdoorSpace || 'Not specified'}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.hasChildren ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.hasChildren ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Has Children
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.hasOtherPets ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.hasOtherPets ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Has Other Pets
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.isNonSmoking ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.isNonSmoking ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Non-Smoking
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Third Row */}


                    {/* Skills & Experience */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Skills & Certifications
                                </CardTitle>
                                <CardDescription>Your expertise and qualifications</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('experience')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills?.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None added</span>}
                                </div>
                            </div>
                            {profile.certifications && profile.certifications.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.certifications.map((cert) => (
                                            <span key={cert} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Booking Requests - Spans 2 columns */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Booking Requests</CardTitle>
                                    <CardDescription>Manage your incoming and past booking requests</CardDescription>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={cn(
                                        "px-4 py-2 text-sm font-semibold transition-all relative",
                                        activeTab === 'upcoming'
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    )}
                                >
                                    Upcoming & In-Progress
                                    {upcomingBookings.length > 0 && (
                                        <span className={cn(
                                            "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                            activeTab === 'upcoming'
                                                ? "bg-primary/20 text-primary"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        )}>
                                            {upcomingBookings.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={cn(
                                        "px-4 py-2 text-sm font-semibold transition-all relative",
                                        activeTab === 'history'
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    )}
                                >
                                    History
                                    {historicalBookings.length > 0 && (
                                        <span className={cn(
                                            "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                            activeTab === 'history'
                                                ? "bg-primary/20 text-primary"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        )}>
                                            {historicalBookings.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {bookingsLoading ? (
                                <div className="text-center py-8">Loading bookings...</div>
                            ) : displayedBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-muted-foreground font-medium mb-1">
                                        {activeTab === 'upcoming'
                                            ? 'No upcoming bookings'
                                            : 'No historical bookings'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {activeTab === 'upcoming'
                                            ? 'You\'ll see pending and accepted bookings here'
                                            : 'Completed, rejected, and cancelled bookings will appear here'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {displayedBookings.map((booking: Booking) => (
                                        <div key={booking.id} className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-bold",
                                                        booking.status === BookingStatus.PENDING ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                            booking.status === BookingStatus.ACCEPTED ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                booking.status === BookingStatus.REJECTED ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                    booking.status === BookingStatus.COMPLETED ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                    )}>
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg mb-1 text-foreground">
                                                    {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                                </h4>
                                                <div className="text-sm space-y-1 text-muted-foreground">
                                                    <p className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        {booking.owner?.firstName} {booking.owner?.lastName}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        ${booking.totalPrice}
                                                    </p>
                                                </div>

                                                {/* Selected Pets Display */}
                                                {booking.petIds && booking.petIds.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3 mb-1">
                                                        {booking.petIds.map(petId => {
                                                            const pet = booking.owner?.pets?.find((p: any) => p.id === petId);
                                                            if (!pet) return null;
                                                            return (
                                                                <div key={pet.id} className="group relative flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-md text-xs border border-secondary/20 cursor-help transition-colors hover:bg-secondary/20">
                                                                    <PawPrint className="w-3 h-3 text-secondary" />
                                                                    <span className="font-medium text-foreground">{pet.name}</span>
                                                                    <span className="text-muted-foreground">({pet.breed})</span>

                                                                    {/* Tooltip */}
                                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-3 bg-white dark:bg-card text-foreground rounded-lg shadow-xl border border-border z-50 animate-in fade-in zoom-in-95 duration-200">
                                                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                                                            {pet.imageUrl ? (
                                                                                <img src={pet.imageUrl} alt={pet.name} className="w-8 h-8 rounded-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                                                                    <PawPrint className="w-4 h-4 text-secondary" />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="font-bold text-sm">{pet.name}</p>
                                                                                <p className="text-xs text-muted-foreground">{pet.breed}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1 text-xs">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Type:</span>
                                                                                <span className="font-medium">{pet.species}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Age:</span>
                                                                                <span className="font-medium">{pet.age} yrs</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Weight:</span>
                                                                                <span className="font-medium">{pet.weight} kg</span>
                                                                            </div>
                                                                            {pet.specialNeeds && (
                                                                                <div className="mt-2 pt-2 border-t border-border">
                                                                                    <span className="text-muted-foreground block mb-1">Special Needs:</span>
                                                                                    <span className="font-medium text-red-600 dark:text-red-400 block leading-tight">{pet.specialNeeds}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {/* Arrow */}
                                                                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-white dark:border-t-card" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {booking.message && (
                                                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm italic border-l-2 border-primary/30">
                                                        "{booking.message}"
                                                    </div>
                                                )}
                                            </div>
                                            {booking.status === BookingStatus.PENDING && activeTab === 'upcoming' && (
                                                <div className="flex flex-row md:flex-col gap-2 justify-center">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: BookingStatus.ACCEPTED })}
                                                        disabled={updateBookingStatusMutation.isPending}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                                        onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: BookingStatus.REJECTED })}
                                                        disabled={updateBookingStatusMutation.isPending}
                                                    >
                                                        Reject
                                                    </Button>

                                                </div>
                                            )}

                                            {/* Chat Button for Upcoming/In-Progress */}
                                            {(booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.PENDING) && activeTab === 'upcoming' && (
                                                <div className="flex justify-end mt-2 md:mt-0 md:self-start">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        onClick={() => navigate('/sitter-messages', { state: { userId: booking.ownerId } })}
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Chat
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Availability - Spans 1 column */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Availability
                                </CardTitle>
                                <CardDescription>When you're available for bookings</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('availability')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">General Availability</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.availability?.general?.map((day) => (
                                        <span key={day} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                            {day}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">Not specified</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Notice Period</p>
                                <p className="text-foreground font-medium">{profile.noticePeriod || 'Not specified'}</p>
                            </div>
                            {profile.availability?.blockedDates && profile.availability.blockedDates.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Blocked Dates</p>
                                    <p className="text-sm text-foreground">{profile.availability.blockedDates.length} dates blocked</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-4">Availability Calendar</p>
                                <AvailabilityCalendar
                                    blockedDates={profile.availability?.blockedDates || []}
                                    bookings={bookings || []}
                                    onToggleDate={handleToggleDate}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>



                {/* Messages Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center relative">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                {totalUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
                                    {totalUnreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                            {totalUnreadCount} new
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">Chat with pet owners</p>
                            </div>
                        </div>
                        <Link to="/sitter-messages">
                            <Button variant="outline" size="sm" className="relative">
                                View All
                                {totalUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                    </span>
                                )}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    <Link to="/sitter-messages">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg relative">
                                            <MessageSquare className="w-7 h-7 text-white" />
                                            {totalUnreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                                                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                Chat with Pet Owners
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {totalUnreadCount > 0
                                                    ? `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`
                                                    : 'View and manage your conversations'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>



                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => navigate('/become-a-sitter/register')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Edit3 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Edit Full Profile</p>
                                        <p className="text-xs text-muted-foreground">Update all your information</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => openEditModal('availability')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Update Availability</p>
                                        <p className="text-xs text-muted-foreground">Block dates or change schedule</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => openEditModal('services')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Adjust Rates</p>
                                        <p className="text-xs text-muted-foreground">Update your service pricing</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>


                {/* Edit Modals */}
                <EditModal
                    isOpen={editModal.isOpen && editModal.section === 'profile'}
                    onClose={() => setEditModal({ isOpen: false, section: '' })}
                    title="Edit Profile"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Phone Number</Label>
                            <Input
                                value={editFormData.phone || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                placeholder="Your phone number"
                            />
                        </div>
                        <div className="relative">
                            <Label>Address</Label>
                            <div className="relative">
                                <Input
                                    value={editFormData.address || ''}
                                    onChange={handleAddressChange}
                                    placeholder="Start typing your address..."
                                    className="pl-10"
                                    onFocus={() => (editFormData.address?.length || 0) > 2 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                </div>
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card rounded-lg shadow-xl border border-border z-50 max-h-60 overflow-y-auto">
                                    {suggestions.map((place, index) => (
                                        <button
                                            key={index}
                                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-start gap-3"
                                            onClick={() => selectAddress(place)}
                                        >
                                            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-sm text-foreground">
                                                    {place.display_name.split(',')[0]}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{place.display_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Headline</Label>
                            <Input
                                value={editFormData.headline || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
                                placeholder="A catchy headline for your profile"
                            />
                        </div>
                        <div>
                            <Label>Bio</Label>
                            <textarea
                                className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={editFormData.bio || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                placeholder="Tell pet parents about yourself..."
                            />
                        </div>
                    </div>
                </EditModal>

                <EditModal
                    isOpen={editModal.isOpen && editModal.section === 'services'}
                    onClose={() => setEditModal({ isOpen: false, section: '' })}
                    title="Edit Services & Rates"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        {editFormData.services && Object.entries(editFormData.services).map(([key, service]) => {
                            if (!service) return null;
                            return (
                                <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                    <div className="flex items-center gap-3">
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
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="font-medium">{serviceNames[key]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">$</span>
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
                                            className="w-20"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <div>
                            <Label>Service Radius (kilometers)</Label>
                            <Input
                                type="number"
                                value={editFormData.serviceRadius || 5}
                                onChange={(e) => setEditFormData({ ...editFormData, serviceRadius: parseInt(e.target.value) || 5 })}
                            />
                        </div>
                    </div>
                </EditModal>

                {/* Preferences Modal */}
                <EditModal
                    isOpen={editModal.isOpen && editModal.section === 'preferences'}
                    onClose={() => setEditModal({ isOpen: false, section: '' })}
                    title="Edit Pet Preferences"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-6">
                        <div>
                            <Label className="mb-2 block">Accepted Pet Types</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Dog', 'Cat', 'Bird', 'Small Animal', 'Reptile'].map(type => (
                                    <label key={type} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
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
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block">Accepted Pet Sizes</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Small', 'Medium', 'Large', 'Giant'].map(size => (
                                    <label key={size} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
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
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{size}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="neutered"
                                checked={editFormData.preferences?.isNeuteredOnly || false}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    preferences: { ...(editFormData.preferences || { acceptedPetTypes: [], acceptedPetSizes: [], isNeuteredOnly: false, behavioralRestrictions: [] }), isNeuteredOnly: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="neutered">Only accept spayed/neutered pets</Label>
                        </div>
                    </div>
                </EditModal>

                {/* Housing Modal */}
                <EditModal
                    isOpen={editModal.isOpen && editModal.section === 'housing'}
                    onClose={() => setEditModal({ isOpen: false, section: '' })}
                    title="Edit Housing Details"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Home Type</Label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={editFormData.housing?.homeType || ''}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), homeType: e.target.value }
                                })}
                            >
                                <option value="">Select home type</option>
                                <option value="House">House</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Farm">Farm</option>
                            </select>
                        </div>
                        <div>
                            <Label>Outdoor Space</Label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={editFormData.housing?.outdoorSpace || ''}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), outdoorSpace: e.target.value }
                                })}
                            >
                                <option value="">Select outdoor space</option>
                                <option value="Fenced Yard">Fenced Yard</option>
                                <option value="Unfenced Yard">Unfenced Yard</option>
                                <option value="No Yard">No Yard</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editFormData.housing?.hasChildren || false}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), hasChildren: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Has Children</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editFormData.housing?.hasOtherPets || false}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), hasOtherPets: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Has Other Pets</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editFormData.housing?.isNonSmoking || false}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        housing: { ...(editFormData.housing || { homeType: '', outdoorSpace: '', hasChildren: false, hasOtherPets: false, isNonSmoking: false }), isNonSmoking: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Non-Smoking Household</span>
                            </label>
                        </div>
                    </div>
                </EditModal>

                {/* Experience Modal */}
                <EditModal
                    isOpen={editModal.isOpen && editModal.section === 'experience'}
                    onClose={() => setEditModal({ isOpen: false, section: '' })}
                    title="Edit Experience & Skills"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Years of Experience</Label>
                            <Input
                                type="number"
                                min="0"
                                value={editFormData.yearsExperience || 0}
                                onChange={(e) => setEditFormData({ ...editFormData, yearsExperience: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Skills</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Oral Medication', 'Injected Medication', 'Senior Dog Experience', 'Puppy Training', 'Special Needs Care'].map(skill => (
                                    <label key={skill} className="flex items-center gap-2">
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
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{skill}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Certifications</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Pet CPR', 'First Aid', 'Professional Dog Trainer', 'Vet Tech'].map(cert => (
                                    <label key={cert} className="flex items-center gap-2">
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
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{cert}</span>
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
                    title="Edit Availability"
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block">General Availability</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Weekdays', 'Weekends', 'Holidays', 'Full-Time'].map(day => (
                                    <label key={day} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
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
                                                    // Adding a day/option
                                                    updated = [...current, day];
                                                    
                                                    // If checking "Weekdays", add all weekdays
                                                    if (day === 'Weekdays') {
                                                        weekdays.forEach(d => {
                                                            if (!updated.includes(d)) updated.push(d);
                                                        });
                                                    }
                                                    // If checking "Weekends", add all weekends
                                                    else if (day === 'Weekends') {
                                                        weekends.forEach(d => {
                                                            if (!updated.includes(d)) updated.push(d);
                                                        });
                                                    }
                                                    // If checking "Full-Time", add all days
                                                    else if (day === 'Full-Time') {
                                                        allDays.forEach(d => {
                                                            if (!updated.includes(d)) updated.push(d);
                                                        });
                                                        // Also add Weekdays and Weekends
                                                        if (!updated.includes('Weekdays')) updated.push('Weekdays');
                                                        if (!updated.includes('Weekends')) updated.push('Weekends');
                                                    }
                                                    // If checking an individual weekday, check if all weekdays are now selected
                                                    else if (weekdays.includes(day)) {
                                                        const allWeekdaysSelected = weekdays.every(d => updated.includes(d));
                                                        if (allWeekdaysSelected && !updated.includes('Weekdays')) {
                                                            updated.push('Weekdays');
                                                        }
                                                        // Check if all days are selected for Full-Time
                                                        const allDaysSelected = allDays.every(d => updated.includes(d));
                                                        if (allDaysSelected && !updated.includes('Full-Time')) {
                                                            updated.push('Full-Time');
                                                            if (!updated.includes('Weekends')) updated.push('Weekends');
                                                        }
                                                    }
                                                    // If checking an individual weekend day, check if all weekends are now selected
                                                    else if (weekends.includes(day)) {
                                                        const allWeekendsSelected = weekends.every(d => updated.includes(d));
                                                        if (allWeekendsSelected && !updated.includes('Weekends')) {
                                                            updated.push('Weekends');
                                                        }
                                                        // Check if all days are selected for Full-Time
                                                        const allDaysSelected = allDays.every(d => updated.includes(d));
                                                        if (allDaysSelected && !updated.includes('Full-Time')) {
                                                            updated.push('Full-Time');
                                                            if (!updated.includes('Weekdays')) updated.push('Weekdays');
                                                        }
                                                    }
                                                } else {
                                                    // Removing a day/option
                                                    updated = current.filter(d => d !== day);
                                                    
                                                    // If unchecking "Weekdays", remove all weekdays
                                                    if (day === 'Weekdays') {
                                                        updated = updated.filter(d => !weekdays.includes(d));
                                                        // Also remove Full-Time if it was selected
                                                        updated = updated.filter(d => d !== 'Full-Time');
                                                    }
                                                    // If unchecking "Weekends", remove all weekends
                                                    else if (day === 'Weekends') {
                                                        updated = updated.filter(d => !weekends.includes(d));
                                                        // Also remove Full-Time if it was selected
                                                        updated = updated.filter(d => d !== 'Full-Time');
                                                    }
                                                    // If unchecking "Full-Time", remove all days and group options
                                                    else if (day === 'Full-Time') {
                                                        updated = updated.filter(d => !allDays.includes(d));
                                                        updated = updated.filter(d => d !== 'Weekdays' && d !== 'Weekends');
                                                    }
                                                    // If unchecking an individual weekday, uncheck "Weekdays" and "Full-Time"
                                                    else if (weekdays.includes(day)) {
                                                        updated = updated.filter(d => d !== 'Weekdays');
                                                        updated = updated.filter(d => d !== 'Full-Time');
                                                        // Also uncheck Weekends if all weekends aren't selected
                                                        const allWeekendsSelected = weekends.every(d => updated.includes(d));
                                                        if (!allWeekendsSelected) {
                                                            updated = updated.filter(d => d !== 'Weekends');
                                                        }
                                                    }
                                                    // If unchecking an individual weekend day, uncheck "Weekends" and "Full-Time"
                                                    else if (weekends.includes(day)) {
                                                        updated = updated.filter(d => d !== 'Weekends');
                                                        updated = updated.filter(d => d !== 'Full-Time');
                                                        // Also uncheck Weekdays if all weekdays aren't selected
                                                        const allWeekdaysSelected = weekdays.every(d => updated.includes(d));
                                                        if (!allWeekdaysSelected) {
                                                            updated = updated.filter(d => d !== 'Weekdays');
                                                        }
                                                    }
                                                }
                                                
                                                setEditFormData({
                                                    ...editFormData,
                                                    availability: { ...(editFormData.availability || { general: [], blockedDates: [] }), general: updated }
                                                });
                                            }}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{day}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Tip: Select "Weekdays" or "Weekends" to quickly show your preference. Use the calendar on the dashboard to block specific dates.
                            </p>
                        </div>
                        <div>
                            <Label>Notice Period</Label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={editFormData.noticePeriod || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, noticePeriod: e.target.value })}
                            >
                                <option value="">Select notice period</option>
                                <option value="Same Day">Same Day</option>
                                <option value="1 Day">1 Day</option>
                                <option value="2 Days">2 Days</option>
                                <option value="3 Days">3 Days</option>
                                <option value="1 Week">1 Week</option>
                            </select>
                        </div>
                    </div>
                </EditModal>
            </div >
        </div>
    );
};

export default SitterDashboard;


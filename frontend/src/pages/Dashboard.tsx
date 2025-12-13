import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Calendar,
    Dog,
    Cat,
    Clock,
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

    const upcomingBookings = bookings?.filter((b: Booking) =>
        b.status === BookingStatus.PENDING || b.status === BookingStatus.ACCEPTED
    ) || [];

    const historicalBookings = bookings?.filter((b: Booking) =>
        b.status === BookingStatus.COMPLETED ||
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
        <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark pt-4 sm:pt-6 md:pt-8 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
                            {getGreeting()}, {user?.firstName}! 👋
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            {petCount > 0
                                ? `You have ${petCount} adorable pet${petCount === 1 ? '' : 's'} in your care`
                                : 'Welcome to your pet care dashboard'
                            }
                        </p>
                    </div>
                    <Link to="/booking" className="flex-shrink-0">
                        <Button className="shadow-glow text-xs sm:text-sm">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Book Now
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <Card className="bg-gradient-to-br from-primary/10 to-orange-100 dark:from-primary/20 dark:to-orange-900/20 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">My Pets</p>
                                    <p className="text-3xl font-bold text-foreground">{petCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <PawPrint className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                                    <p className="text-3xl font-bold text-foreground">{upcomingBookings.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {bookings?.filter((b: Booking) => b.status === BookingStatus.COMPLETED).length || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Row */}
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/booking">
                            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Search className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Book a Sitter</h4>
                                            <p className="text-sm text-muted-foreground">Find trusted pet sitters</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/pet-profile">
                            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Add Pet</h4>
                                            <p className="text-sm text-muted-foreground">Create pet profile</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/messages">
                            <Card className="hover:shadow-md transition-all cursor-pointer h-full group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                                            <MessageSquare className="w-6 h-6 text-purple-600" />
                                            {totalUnreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Messages</h4>
                                            <p className="text-sm text-muted-foreground">Chat with sitters</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 items-start">

                    {/* Left Column (2/3) - My Pets & Bookings (Now separate, but stacked) */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">

                        {/* My Pets Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-foreground">My Pets</h3>
                                <Link to="/pet-profile">
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Pet
                                    </Button>
                                </Link>
                            </div>

                            {!pets || pets.length === 0 ? (
                                <Card className="bg-muted/30 border-dashed">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <PawPrint className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">No pets yet</h3>
                                        <p className="text-muted-foreground text-sm mb-4">Add your furry friend to get started</p>
                                        <Link to="/pet-profile">
                                            <Button size="sm">Create Profile</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pets.map((pet: Pet) => (
                                        <Card key={pet.id} className="overflow-hidden group hover:shadow-md transition-all">
                                            <div className="relative h-32 bg-gray-100">
                                                {pet.imageUrl ? (
                                                    <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={cn(
                                                        "w-full h-full flex items-center justify-center",
                                                        "bg-gradient-to-br",
                                                        pet.species?.toLowerCase() === 'dog'
                                                            ? "from-orange-100 to-amber-100"
                                                            : "from-purple-100 to-pink-100"
                                                    )}>
                                                        {pet.species?.toLowerCase() === 'dog' ? (
                                                            <Dog className="w-12 h-12 text-orange-300" />
                                                        ) : (
                                                            <Cat className="w-12 h-12 text-purple-300" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                <div className="absolute bottom-3 left-4">
                                                    <h4 className="text-white font-bold text-lg">{pet.name}</h4>
                                                    <p className="text-white/80 text-xs">{pet.breed || pet.species}</p>
                                                </div>
                                                <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-foreground">
                                                    {pet.species}
                                                </span>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {pet.age} yrs
                                                    </div>
                                                    {pet.weight && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs">⚖️</span>
                                                            {pet.weight} kg
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/pet-profile', { state: { pet } })}>
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" className="w-full" onClick={() => navigate('/booking')}>
                                                        Book
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bookings Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-foreground">My Bookings</h3>
                                <div className="flex bg-muted p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab('upcoming')}
                                        className={cn(
                                            "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                            activeTab === 'upcoming'
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={cn(
                                            "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                            activeTab === 'history'
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    {displayedBookings.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Calendar className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {activeTab === 'upcoming'
                                                    ? "No upcoming bookings found."
                                                    : "No booking history found."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {displayedBookings.map((booking: Booking) => (
                                                <div key={booking.id} className="p-4 hover:bg-muted/30 transition-colors">
                                                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                                        <div className="flex gap-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                booking.status === BookingStatus.ACCEPTED ? "bg-green-100 text-green-600" :
                                                                    booking.status === BookingStatus.PENDING ? "bg-amber-100 text-amber-600" :
                                                                        "bg-gray-100 text-gray-500"
                                                            )}>
                                                                <Calendar className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-foreground">
                                                                        {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </h4>
                                                                    <span className={cn(
                                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                                        booking.status === BookingStatus.ACCEPTED ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                            booking.status === BookingStatus.PENDING ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                                booking.status === BookingStatus.COMPLETED ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                                                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                                    )}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <User className="w-3.5 h-3.5" />
                                                                        {booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName?.[0]}.
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar className="w-3.5 h-3.5" />
                                                                        {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                                            {booking.status === BookingStatus.PENDING && (
                                                                <Button variant="ghost" size="sm" onClick={() => handleCancel(booking.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                            {booking.status === BookingStatus.COMPLETED && !(booking as any).review && (
                                                                <Button size="sm" variant="outline" onClick={() => {
                                                                    setSelectedBookingId(booking.id);
                                                                    setReviewModalOpen(true);
                                                                }}>
                                                                    Review
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="ghost" onClick={() => navigate('/messages', { state: { userId: booking.sitter?.userId } })}>
                                                                <MessageSquare className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>

                    {/* Right Column (1/3) - Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    Why Choose Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">All sitters are verified and background-checked</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">Every booking includes pet insurance</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-muted-foreground">24/7 support when you need us</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help / Promo Card */}
                        <Card className="bg-primary text-primary-foreground overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-xl" />
                            <CardContent className="p-6 relative z-10">
                                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                                <p className="text-primary-foreground/90 text-sm mb-4">
                                    Our support team is always here for you and your pets.
                                </p>
                                <Button variant="secondary" size="sm" className="w-full">
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                title="Rate your experience"
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
                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Terrible'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Share your experience
                        </label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                            placeholder="How was the service? Would you recommend this sitter?"
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
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !comment.trim()}
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;

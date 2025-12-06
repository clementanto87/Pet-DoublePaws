import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Plus,
    Calendar,
    Dog,
    Cat,
    Clock,
    MapPin,
    Star,
    ArrowRight,
    Shield,
    PawPrint,
    MessageSquare,
    CheckCircle2,
    Search,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
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

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');



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
            showToast('Review submitted successfully!', 'success');
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Failed to submit review. You may have already reviewed this booking.', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await bookingService.updateStatus(id, BookingStatus.CANCELLED);
            showToast('Booking cancelled successfully', 'success');
            window.location.reload();
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            showToast('Failed to cancel booking', 'error');
        }
    };

    const { data: pets, isLoading, error } = useQuery({
        queryKey: ['pets'],
        queryFn: petService.getPets,
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['myBookings'],
        queryFn: () => bookingService.getBookings('owner'),
    });

    // Fetch conversations for unread count
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Calculate total unread messages
    const totalUnreadCount = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.PENDING: return 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
            case BookingStatus.ACCEPTED: return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
            case BookingStatus.REJECTED: return 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200';
            case BookingStatus.COMPLETED: return 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
            case BookingStatus.CANCELLED: return 'text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">😿</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-500 mb-6">We couldn't load your dashboard. Please try again.</p>
                    <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                </Card>
            </div>
        );
    }

    const hasPets = pets && pets.length > 0;
    const petCount = pets?.length || 0;
    const upcomingBookings = bookings?.filter((b: Booking) =>
        b.status === BookingStatus.PENDING || b.status === BookingStatus.ACCEPTED
    ) || [];
    const pastBookings = bookings?.filter((b: Booking) =>
        b.status === BookingStatus.COMPLETED ||
        b.status === BookingStatus.REJECTED ||
        b.status === BookingStatus.CANCELLED
    ) || [];

    const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    // Quick stats
    const stats = [
        {
            label: 'My Pets',
            value: petCount,
            icon: PawPrint,
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            textColor: 'text-orange-600 dark:text-orange-400'
        },
        {
            label: 'Upcoming',
            value: upcomingBookings.length,
            icon: Calendar,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Completed',
            value: pastBookings.filter((b: Booking) => b.status === BookingStatus.COMPLETED).length,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            textColor: 'text-emerald-600 dark:text-emerald-400'
        },
    ];

    // Quick actions
    const quickActions = [
        {
            title: 'Book a Sitter',
            description: 'Find trusted pet sitters',
            icon: Search,
            path: '/booking',
            gradient: 'from-primary to-orange-500',
            emoji: '🔍'
        },
        {
            title: 'Add Pet',
            description: 'Create pet profile',
            icon: Plus,
            path: '/pet-profile',
            gradient: 'from-blue-500 to-cyan-500',
            emoji: '🐾'
        },
        {
            title: 'Messages',
            description: 'Chat with sitters',
            icon: MessageSquare,
            path: '/messages',
            gradient: 'from-purple-500 to-pink-500',
            emoji: '💬'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {getGreeting()}, {user?.firstName}! 👋
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {hasPets
                                    ? `You have ${petCount} adorable pet${petCount > 1 ? 's' : ''} in your care`
                                    : 'Welcome to your pet care dashboard'
                                }
                            </p>
                        </div>
                        <Link to="/booking">
                            <Button size="lg" className="shadow-lg">
                                <Calendar className="w-5 h-5 mr-2" />
                                Book Now
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                            </div>
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            const isMessages = action.title === 'Messages';
                            return (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Link to={action.path}>
                                        <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
                                            <CardContent className="p-6 relative">
                                                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg relative`}>
                                                            <Icon className="w-6 h-6 text-white" />
                                                            {isMessages && totalUnreadCount > 0 && (
                                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                                                                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-2xl">{action.emoji}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - My Pets */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* My Pets Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Pets</h2>
                                <Link to="/pet-profile">
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Pet
                                    </Button>
                                </Link>
                            </div>

                            {!hasPets ? (
                                <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-full flex items-center justify-center mb-4">
                                            <PawPrint className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            No pets yet
                                        </h3>
                                        <p className="text-gray-500 mb-6 max-w-sm">
                                            Add your furry friends to start booking amazing pet sitters
                                        </p>
                                        <Link to="/pet-profile">
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Pet Profile
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pets.map((pet: Pet, index: number) => (
                                        <motion.div
                                            key={pet.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                                                <div className="relative h-40 overflow-hidden">
                                                    {pet.imageUrl ? (
                                                        <img
                                                            src={pet.imageUrl}
                                                            alt={pet.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className={cn(
                                                            "w-full h-full flex items-center justify-center",
                                                            "bg-gradient-to-br",
                                                            pet.species?.toLowerCase() === 'dog'
                                                                ? "from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30"
                                                                : "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                                                        )}>
                                                            {pet.species?.toLowerCase() === 'dog' ? (
                                                                <Dog className="w-16 h-16 text-orange-300" />
                                                            ) : (
                                                                <Cat className="w-16 h-16 text-purple-300" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                                                        <p className="text-white/80 text-sm">{pet.breed}</p>
                                                    </div>
                                                    <div className="absolute top-3 right-3">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-full text-xs font-bold shadow-lg",
                                                            pet.species?.toLowerCase() === 'dog'
                                                                ? "bg-orange-500 text-white"
                                                                : "bg-purple-500 text-white"
                                                        )}>
                                                            {pet.species}
                                                        </span>
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {pet.age} {pet.age === 1 ? 'year' : 'years'}
                                                        </span>
                                                        {pet.weight && (
                                                            <span>{pet.weight} kg</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => navigate('/pet-profile', { state: { pet } })}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => navigate('/booking')}
                                                        >
                                                            Book
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bookings Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Bookings</h2>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab('upcoming')}
                                        className={cn(
                                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                            activeTab === 'upcoming'
                                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        )}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('past')}
                                        className={cn(
                                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                            activeTab === 'past'
                                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        )}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    {bookingsLoading ? (
                                        <div className="text-center py-8 text-gray-500">Loading...</div>
                                    ) : displayedBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {displayedBookings.map((booking: Booking, index: number) => (
                                                <motion.div
                                                    key={booking.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", getStatusColor(booking.status))}>
                                                                    {booking.status}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {format(new Date(booking.createdAt), 'MMM d')}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                                                {booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                with {booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName?.[0]}.
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    {booking.sitter?.address?.split(',')[0] || 'Location'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {booking.status === BookingStatus.PENDING && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => handleCancel(booking.id)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                            {booking.status === BookingStatus.COMPLETED && !(booking as any).review && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-1"
                                                                    onClick={() => {
                                                                        setSelectedBookingId(booking.id);
                                                                        setReviewModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Star className="w-3 h-3" />
                                                                    Review
                                                                </Button>
                                                            )}
                                                            {(booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.PENDING) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => navigate('/messages', { state: { userId: booking.sitter?.userId } })}
                                                                >
                                                                    <MessageSquare className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                No {activeTab} bookings
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                {activeTab === 'upcoming'
                                                    ? 'Book a trusted sitter for your pet'
                                                    : 'Your past bookings will appear here'
                                                }
                                            </p>
                                            {activeTab === 'upcoming' && (
                                                <Link to="/booking">
                                                    <Button size="sm">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Book Now
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Badges */}
                        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-orange-500/5">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Why Choose Us</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            All sitters are verified and background-checked
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Every booking includes pet insurance
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            24/7 support when you need us
                                        </p>
                                    </div>
                                </div>
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
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Terrible'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Share your experience
                        </label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
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

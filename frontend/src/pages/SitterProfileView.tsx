import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Star,
    Shield,
    Clock,
    Calendar,
    Home,
    Heart,
    Award,
    CheckCircle,
    Dog,
    Cat,
    PawPrint,
    MessageCircle,
    BadgeCheck,
    Briefcase,
    Users,
    User,
    Sun,
    Baby,
    TreeDeciduous,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { Review } from '../services/review.service';
import { reviewService } from '../services/review.service';
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
    boarding: 'Your pet stays overnight at the sitter\'s home',
    houseSitting: 'The sitter stays overnight at your home',
    dropInVisits: '30-60 minute visits to your home',
    doggyDayCare: 'Daytime care at the sitter\'s home',
    dogWalking: 'Walks in your neighborhood'
};

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

const SitterProfileView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get sitter data from navigation state or fetch it
    const sitterFromState = location.state?.sitter;

    // Preserve search params for contact page
    const searchParamsString = searchParams.toString();

    // For now, we use the sitter from state. In production, you'd fetch by ID
    const sitter = sitterFromState;

    // Month navigation for calendar
    const [monthOffset, setMonthOffset] = useState(0);

    if (!sitter) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8 mx-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PawPrint className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Sitter Not Found</h2>
                    <p className="text-muted-foreground mb-6">We couldn't find this sitter's profile.</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </Card>
            </div>
        );
    }

    // Get active services
    const activeServices = sitter.services
        ? Object.entries(sitter.services).filter(([_, service]: [string, any]) => service?.active)
        : [];

    // Get minimum rate
    const minRate = activeServices.length > 0
        ? Math.min(...activeServices.map(([_, service]: [string, any]) => service.rate))
        : 0;

    // Fetch reviews
    const { data: reviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ['sitterReviews', sitter.id],
        queryFn: () => reviewService.getSitterReviews(sitter.id),
        enabled: !!sitter?.id
    });

    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark">
            {/* Header with Back Button */}
            <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 overflow-x-hidden">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">Back to Results</span>
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-x-hidden">
                {/* Profile Header */}
                <div className="bg-white dark:bg-card rounded-3xl shadow-lg overflow-hidden mb-6">
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden border-4 border-white dark:border-gray-800">
                                {sitter.user?.profileImage ? (
                                    <img
                                        src={sitter.user.profileImage}
                                        alt={sitter.user.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary">
                                            {sitter.user?.firstName?.[0]}{sitter.user?.lastName?.[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {sitter.isVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                                    <BadgeCheck className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                        {sitter.user?.firstName} {sitter.user?.lastName}
                                    </h1>
                                    {sitter.isVerified && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                            <Shield className="w-4 h-4" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-3">
                                    {sitter.headline || 'Loving Pet Sitter'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {sitter.address}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-primary" />
                                        {sitter.yearsExperience || 0}+ years experience
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">
                                        ${minRate}
                                        <span className="text-base text-gray-500 font-normal">/night</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</span>
                                        <span className="text-gray-500">({reviews?.length || 0} reviews)</span>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="shadow-glow w-full md:w-auto"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Contact Sitter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                        {/* Gallery Section */}
                        {sitter.galleryImages && sitter.galleryImages.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-primary" />
                                        Photo Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {sitter.galleryImages.map((img: string, index: number) => (
                                            <div key={index} className="aspect-square rounded-xl overflow-hidden bg-muted relative group">
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* About */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    About Me
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {sitter.bio || 'This sitter hasn\'t added a bio yet.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Services & Rates */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Services & Rates
                                </h2>
                                <div className="space-y-4">
                                    {activeServices.map(([key, service]: [string, any]) => {
                                        const Icon = serviceIcons[key] || Briefcase;
                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                        <Icon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                                            {serviceNames[key]}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {serviceDescriptions[key]}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-primary">${service.rate}</div>
                                                    <div className="text-sm text-gray-500">per night</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeServices.length === 0 && (
                                        <p className="text-gray-500 text-center py-4">No services listed yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Certifications */}
                        {(sitter.skills?.length > 0 || sitter.certifications?.length > 0) && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Skills & Certifications
                                    </h2>
                                    {sitter.skills?.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {sitter.skills.map((skill: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {sitter.certifications?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {sitter.certifications.map((cert: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Award className="w-3 h-3" />
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-primary" />
                                    Reviews ({reviews?.length || 0})
                                </h2>
                                {reviewsLoading ? (
                                    <div className="text-center py-8">Loading reviews...</div>
                                ) : reviews && reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review: Review) => (
                                            <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-6 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                            {review.owner?.profileImage ? (
                                                                <img src={review.owner.profileImage} alt={review.owner.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {review.owner?.firstName} {review.owner?.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-bold">{review.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">No reviews yet</h3>
                                        <p className="text-sm text-gray-500">Be the first to leave a review!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pet Preferences */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <PawPrint className="w-5 h-5 text-primary" />
                                    Accepts
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pet Types</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.preferences?.acceptedPetTypes?.map((type: string) => (
                                                <span
                                                    key={type}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2",
                                                        type === 'Dog'
                                                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                                    )}
                                                >
                                                    {type === 'Dog' ? <Dog className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pet Sizes</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.preferences?.acceptedPetSizes?.map((size: string) => (
                                                <span
                                                    key={size}
                                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Home Environment */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" />
                                    Home Environment
                                </h2>
                                <div className="space-y-3">
                                    {sitter.housing?.homeType && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Home className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">{sitter.housing.homeType}</span>
                                        </div>
                                    )}
                                    {sitter.housing?.outdoorSpace && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <TreeDeciduous className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">{sitter.housing.outdoorSpace}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {sitter.housing?.hasChildren && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium">
                                                <Baby className="w-3 h-3" />
                                                Has Children
                                            </span>
                                        )}
                                        {sitter.housing?.hasOtherPets && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                                                <PawPrint className="w-3 h-3" />
                                                Has Other Pets
                                            </span>
                                        )}
                                        {sitter.housing?.isNonSmoking && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                Non-Smoking
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Availability
                                </h2>

                                {/* Calendar View */}
                                {(() => {
                                    const calendar = useMemo(() => getMonthlyAvailability(sitter, monthOffset, []), [sitter, monthOffset]);
                                    const calendarDays: (number | null)[] = [];

                                    // Add empty cells for days before the first day of the month
                                    for (let i = 0; i < calendar.startDayOfWeek; i++) {
                                        calendarDays.push(null);
                                    }

                                    // Add the days of the month
                                    for (let day = 1; day <= calendar.daysInMonth; day++) {
                                        calendarDays.push(day);
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between mb-3">
                                                <button
                                                    onClick={() => setMonthOffset(prev => prev - 1)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    aria-label="Previous month"
                                                >
                                                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </button>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                    {calendar.monthName}
                                                </h3>
                                                <button
                                                    onClick={() => setMonthOffset(prev => prev + 1)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    aria-label="Next month"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex items-center gap-4 text-xs mb-3">
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
                                                {sitter.noticePeriod && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>Cancellation: <span className="font-medium text-primary">{sitter.cancellationPolicy || 'flexible'}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* Contact Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-orange-400/5 border-primary/20">
                            <CardContent className="p-6 text-center">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Ready to book?
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Contact {sitter.user?.firstName} to discuss your pet's needs
                                </p>
                                <Button
                                    className="w-full shadow-glow mb-3"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Check Availability
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitterProfileView;


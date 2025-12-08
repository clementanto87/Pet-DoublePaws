import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sitterService } from '../services/sitter.service';
import { Button } from '../components/ui/Button';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, Shield, Heart, Grid3X3,
    List, Map as MapIcon, ChevronDown, X,
    Home, DollarSign, SlidersHorizontal, Sparkles,
    Award, CheckCircle2, ArrowUpDown, Search, Navigation,
    Calendar, PawPrint, Sun, Building2, ArrowRight,
    ChevronLeft, ChevronRight, MessageCircle, Filter,
    XCircle, Loader2, AlertCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';
import { getCurrentPosition, reverseGeocode } from '../utils/geocoding';
import type { Address } from '../utils/geocoding';

// Get monthly calendar availability from real backend data
const getMonthlyAvailability = (sitter: SitterData, monthOffset: number = 0, bookings: any[] = []) => {
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
    blockedDates.forEach((dateStr) => {
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

// Custom marker for highlighted sitter
const createCustomIcon = (isActive: boolean, price: number) => {
    return new DivIcon({
        className: 'custom-marker',
        html: `
            <div class="relative flex items-center justify-center">
                <div class="${isActive
                ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30'
                : 'bg-white text-gray-800 hover:scale-105'} 
                    px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap
                    border-2 ${isActive ? 'border-primary' : 'border-gray-200'}
                    transition-all duration-200 cursor-pointer shadow-md">
                    $${price}
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 
                    ${isActive ? 'bg-primary' : 'bg-white border border-gray-200'} 
                    rotate-45 -z-10"></div>
            </div>
        `,
        iconSize: [60, 40],
        iconAnchor: [30, 40],
    });
};

// Map center update component
const MapCenterUpdater: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 0.5 });
        }
    }, [center, map]);
    return null;
};

interface SitterData {
    id: string;
    user?: {
        firstName?: string;
        lastName?: string;
        profileImage?: string;
    };
    headline?: string;
    bio?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    isVerified?: boolean;
    services?: Record<string, { active?: boolean; rate?: number }>;
    skills?: string[];
    yearsExperience?: number;
    housing?: {
        homeType?: string;
        outdoorSpace?: string;
    };
    distance?: number;
    availability?: {
        general?: string[];
        blockedDates?: string[];
    };
    updatedAt?: string;
    reviews?: any[]; // Reviews array for rating and review count
}

type ViewMode = 'split' | 'list' | 'map';
type SortOption = 'distance' | 'price_low' | 'price_high' | 'rating';

const serviceOptions = [
    { id: 'boarding', icon: Home, emoji: '🏠', label: 'Boarding', desc: 'Overnight stays' },
    { id: 'housesitting', icon: Building2, emoji: '🏡', label: 'House Sitting', desc: 'At your home' },
    { id: 'visits', icon: Sun, emoji: '☀️', label: 'Drop-In', desc: 'Check-ins' },
    { id: 'daycare', icon: PawPrint, emoji: '🐕', label: 'Day Care', desc: 'Daytime care' },
    { id: 'walking', icon: Calendar, emoji: '🦮', label: 'Walking', desc: 'Daily walks' },
];

const SearchResultsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sitters, setSitters] = useState<SitterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hoveredSitter, setHoveredSitter] = useState<string | null>(null);
    const [selectedSitter, setSelectedSitter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showSidebarFilters, setShowSidebarFilters] = useState(true); // Show by default, toggle with button
    const [sortBy, setSortBy] = useState<SortOption>('distance');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Search modification states
    const [editLocation, setEditLocation] = useState(searchParams.get('location') || '');
    const [editService, setEditService] = useState(searchParams.get('service') || 'boarding');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [selectedEditAddress, setSelectedEditAddress] = useState<Address | null>(null);
    const [isGettingEditLocation, setIsGettingEditLocation] = useState(false);
    const [editLocationError, setEditLocationError] = useState('');

    // Get price for sitter (needed before filter states)
    const getSitterPrice = useCallback((sitter: SitterData) => {
        const services = sitter.services || {};
        const rates = Object.values(services).map((s) => s?.rate || 999).filter(r => r < 999);
        return rates.length > 0 ? Math.min(...rates) : 25;
    }, []);

    // Calculate dynamic price range from sitters
    const maxPrice = useMemo(() => {
        if (sitters.length === 0) return 200;
        const prices = sitters.map(s => getSitterPrice(s));
        const max = Math.max(...prices);
        return Math.ceil(max / 10) * 10; // Round up to nearest 10
    }, [sitters, getSitterPrice]);

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

    // Update price range max when maxPrice changes (but don't trigger filter refetch)
    useEffect(() => {
        // Only update if the current max is greater than the new maxPrice
        // This prevents unnecessary updates that would trigger filter refetch
        if (maxPrice > 0 && priceRange[1] > maxPrice) {
            setPriceRange([priceRange[0], maxPrice]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxPrice]); // Intentionally not including priceRange to avoid loops
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [maxDistance, setMaxDistance] = useState(50);
    const [minExperience, setMinExperience] = useState(0);
    const [hasReviews, setHasReviews] = useState(false);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<Set<string>>(new Set());

    // Availability week navigator state (must be before any conditional returns)
    const [weekOffset, setWeekOffset] = useState<Record<string, number>>({});

    // Bookings state for each sitter
    const sitterBookings = useRef<Record<string, any[]>>({});

    // Preserve search params for navigation (used in JSX)
    const searchParamsString = searchParams.toString();

    // Debounce function for filter changes
    const [filterDebounceTimer, setFilterDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);
    const previousFilters = useRef<string>('');
    const isFetching = useRef(false);
    const searchParamsStringRef = useRef<string>('');

    // Stable fetch function using refs to prevent re-creation
    const fetchSittersRef = useRef(async (filterParams?: {
        priceRange: [number, number];
        minRating: number;
        maxDistance: number;
        minExperience: number;
        verifiedOnly: boolean;
        hasReviews: boolean;
        selectedServiceTypes: Set<string>;
        maxPrice: number;
    }) => {
        // Prevent concurrent calls
        if (isFetching.current) {
            console.log('Already fetching, skipping...');
            return;
        }

        isFetching.current = true;
        setLoading(true);
        setError('');

        try {
            // Map URL params to API params
            const apiParams: any = {};

            // Get coordinates from URL
            const latitude = searchParams.get('latitude');
            const longitude = searchParams.get('longitude');
            if (latitude && longitude) {
                apiParams.latitude = latitude;
                apiParams.longitude = longitude;
                // Use filter maxDistance if available, otherwise default to 50
                const radius = filterParams && filterParams.maxDistance < 50 ? filterParams.maxDistance : 50;
                apiParams.radius = radius;
            }

            // Map service type
            const service = searchParams.get('service');
            if (service) {
                // Map frontend service IDs to backend format
                const serviceMap: Record<string, string> = {
                    'boarding': 'boarding',
                    'housesitting': 'houseSitting',
                    'visits': 'dropInVisits',
                    'daycare': 'doggyDayCare',
                    'walking': 'dogWalking',
                };
                apiParams.serviceType = serviceMap[service] || service;
            }

            // Add advanced filter parameters if filterParams is provided
            if (filterParams) {
                if (filterParams.priceRange[0] > 0) apiParams.minPrice = filterParams.priceRange[0].toString();
                if (filterParams.priceRange[1] < filterParams.maxPrice) apiParams.maxPrice = filterParams.priceRange[1].toString();
                if (filterParams.minRating > 0) apiParams.minRating = filterParams.minRating.toString();
                if (filterParams.maxDistance < 50) apiParams.maxDistance = filterParams.maxDistance.toString();
                if (filterParams.minExperience > 0) apiParams.minExperience = filterParams.minExperience.toString();
                if (filterParams.verifiedOnly) apiParams.verifiedOnly = 'true';
                if (filterParams.hasReviews) apiParams.hasReviews = 'true';
                if (filterParams.selectedServiceTypes.size > 0) {
                    apiParams.serviceTypes = Array.from(filterParams.selectedServiceTypes).join(',');
                }
            }

            console.log('Fetching sitters with params:', apiParams);
            const data = await sitterService.searchSitters(apiParams);
            console.log('Received sitters:', data);

            // Transform backend response to frontend format
            const transformedData: SitterData[] = data.map((profile: any) => ({
                id: profile.id,
                user: profile.user,
                headline: profile.headline,
                bio: profile.bio,
                address: profile.address,
                latitude: profile.latitude,
                longitude: profile.longitude,
                isVerified: profile.isVerified || false,
                services: profile.services,
                skills: profile.skills,
                yearsExperience: profile.yearsExperience,
                housing: profile.housing,
                distance: profile.distance, // Backend calculates this
                availability: profile.availability,
                updatedAt: profile.updatedAt,
                reviews: profile.reviews || [], // Include reviews for rating filter
            }));

            setSitters(transformedData);
        } catch (err) {
            console.error('Failed to fetch sitters:', err);
            setError('Failed to load sitters. Please try again.');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    });

    // Fetch sitters when search params change (initial load)
    useEffect(() => {
        const currentParamsString = searchParams.toString();

        // Only fetch if search params actually changed
        if (currentParamsString === searchParamsStringRef.current) {
            return;
        }

        searchParamsStringRef.current = currentParamsString;
        isInitialMount.current = true;
        previousFilters.current = '';
        isFetching.current = false; // Reset fetching flag

        fetchSittersRef.current();
    }, [searchParams]);

    // Fetch sitters when filters change (with debouncing)
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Don't fetch if already fetching
        if (isFetching.current) {
            return;
        }

        // Create a string representation of current filters to detect changes
        const currentFilters = JSON.stringify({
            priceRange,
            minRating,
            maxDistance,
            minExperience,
            verifiedOnly,
            hasReviews,
            selectedServiceTypes: Array.from(selectedServiceTypes).sort()
        });

        // Only proceed if filters actually changed
        if (currentFilters === previousFilters.current) {
            return;
        }

        previousFilters.current = currentFilters;

        // Clear existing timer
        if (filterDebounceTimer) {
            clearTimeout(filterDebounceTimer);
        }

        // Set new timer to debounce filter changes
        const timer = setTimeout(() => {
            if (!isFetching.current) {
                // Capture maxPrice at the time of the API call
                const currentMaxPrice = maxPrice;
                fetchSittersRef.current({
                    priceRange,
                    minRating,
                    maxDistance,
                    minExperience,
                    verifiedOnly,
                    hasReviews,
                    selectedServiceTypes,
                    maxPrice: currentMaxPrice
                });
            }
        }, 500); // 500ms debounce

        setFilterDebounceTimer(timer);

        // Cleanup
        return () => {
            if (timer) clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceRange, minRating, maxDistance, minExperience, verifiedOnly, hasReviews, selectedServiceTypes]);

    // Handle Near Me for search modification
    const handleEditNearMe = async () => {
        setIsGettingEditLocation(true);
        setEditLocationError('');
        try {
            const position = await getCurrentPosition();
            const address = await reverseGeocode(position.lat, position.lng);
            setEditLocation(address.display_name.split(',').slice(0, 2).join(','));
            setSelectedEditAddress(address);
        } catch (error: any) {
            setEditLocationError(error.message || 'Failed to get location');
        } finally {
            setIsGettingEditLocation(false);
        }
    };

    // Handle location change from autocomplete
    const handleEditLocationChange = (value: string, address?: Address) => {
        setEditLocation(value);
        if (address) {
            setSelectedEditAddress(address);
        } else {
            setSelectedEditAddress(null);
        }
    };

    // Handle search update
    const handleSearchUpdate = () => {
        const newParams = new URLSearchParams();
        if (editService) newParams.set('service', editService);
        if (editLocation) newParams.set('location', editLocation);
        // Add coordinates if available
        if (selectedEditAddress?.coordinates) {
            newParams.set('latitude', selectedEditAddress.coordinates.lat.toString());
            newParams.set('longitude', selectedEditAddress.coordinates.lng.toString());
        }
        setSearchParams(newParams);
        setIsSearchExpanded(false);
    };

    // Calculate map center based on sitters
    const mapCenter = useMemo(() => {
        const validSitters = sitters.filter(s => s.latitude && s.longitude);
        if (validSitters.length === 0) return [40.7128, -74.006] as [number, number];

        const avgLat = validSitters.reduce((acc, s) => acc + (s.latitude || 0), 0) / validSitters.length;
        const avgLng = validSitters.reduce((acc, s) => acc + (s.longitude || 0), 0) / validSitters.length;
        return [avgLat, avgLng] as [number, number];
    }, [sitters]);

    // Get rating for sitter (from reviews if available)
    const getSitterRating = useCallback((sitter: SitterData) => {
        // Calculate average rating from reviews if available
        if (sitter.reviews && sitter.reviews.length > 0) {
            const totalRating = sitter.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
            return totalRating / sitter.reviews.length;
        }
        // Default to 5.0 if no reviews (new sitters)
        return 5.0;
    }, []);

    // Sort sitters (filtering is now done on backend, only sorting here)
    const sortedSitters = useMemo(() => {
        let sorted = [...sitters];

        switch (sortBy) {
            case 'distance':
                return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            case 'price_low':
                return sorted.sort((a, b) => getSitterPrice(a) - getSitterPrice(b));
            case 'price_high':
                return sorted.sort((a, b) => getSitterPrice(b) - getSitterPrice(a));
            case 'rating':
                return sorted.sort((a, b) => getSitterRating(b) - getSitterRating(a));
            default:
                return sorted;
        }
    }, [sitters, sortBy, getSitterPrice, getSitterRating]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (verifiedOnly) count++;
        if (minRating > 0) count++;
        if (maxDistance < 50) count++;
        if (minExperience > 0) count++;
        if (hasReviews) count++;
        if (selectedServiceTypes.size > 0) count++;
        if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
        return count;
    }, [verifiedOnly, minRating, maxDistance, minExperience, hasReviews, selectedServiceTypes, priceRange, maxPrice]);

    const clearAllFilters = () => {
        setPriceRange([0, maxPrice]);
        setVerifiedOnly(false);
        setMinRating(0);
        setMaxDistance(50);
        setMinExperience(0);
        setHasReviews(false);
        setSelectedServiceTypes(new Set());
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(id)) {
                newFavs.delete(id);
            } else {
                newFavs.add(id);
            }
            return newFavs;
        });
    };

    const highlightedCenter = useMemo(() => {
        const target = hoveredSitter || selectedSitter;
        if (!target) return null;
        const sitter = sitters.find(s => s.id === target);
        if (sitter?.latitude && sitter?.longitude) {
            return [sitter.latitude, sitter.longitude] as [number, number];
        }
        return null;
    }, [hoveredSitter, selectedSitter, sitters]);

    const currentService = serviceOptions.find(s => s.id === searchParams.get('service')) || serviceOptions[0];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">🐾</div>
                    </div>
                    <p className="text-gray-500 font-medium text-lg">Finding perfect sitters near you...</p>
                    <p className="text-gray-400 text-sm">This won't take long</p>
                </motion.div>
            </div>
        );
    }

    const SitterCard: React.FC<{ sitter: SitterData }> = ({ sitter }) => {
        const price = getSitterPrice(sitter);
        const isHovered = hoveredSitter === sitter.id;
        const isSelected = selectedSitter === sitter.id;
        const isFavorite = favorites.has(sitter.id);
        const currentMonthOffset = weekOffset[sitter.id] || 0;
        const bookings = sitterBookings.current[sitter.id] || [];
        const calendar = useMemo(() => getMonthlyAvailability(sitter, currentMonthOffset, bookings), [sitter, currentMonthOffset, bookings]);

        // Build calendar grid
        const calendarDays: (number | null)[] = [];
        for (let i = 0; i < calendar.startDayOfWeek; i++) {
            calendarDays.push(null);
        }
        for (let day = 1; day <= calendar.daysInMonth; day++) {
            calendarDays.push(day);
        }

        return (
            <div
                onMouseEnter={() => setHoveredSitter(sitter.id)}
                onMouseLeave={() => setHoveredSitter(null)}
                className={`
                    relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                    border transition-colors duration-200 cursor-pointer shadow-sm
                    ${isHovered || isSelected
                        ? 'border-primary/50 shadow-lg shadow-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                `}
            >
                <div className="flex flex-col lg:flex-row">
                    {/* Left Section - Sitter Info */}
                    <div className="p-4 flex gap-3 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700 lg:w-[260px] lg:flex-shrink-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                                {sitter.user?.profileImage ? (
                                    <img
                                        src={sitter.user.profileImage}
                                        alt={sitter.user.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary/40">
                                            {sitter.user?.firstName?.[0] || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {sitter.isVerified && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    <Shield className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                    <h3
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } });
                                        }}
                                        className="text-sm font-bold text-primary hover:underline cursor-pointer truncate flex items-center gap-1"
                                    >
                                        {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                                        {(sitter.yearsExperience || 0) >= 5 && (
                                            <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                        )}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {sitter.headline || 'Pet Care Specialist'}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(sitter.id); }}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                                >
                                    <Heart
                                        className={`w-4 h-4 transition-colors ${isFavorite
                                            ? 'text-red-500 fill-red-500'
                                            : 'text-gray-300 hover:text-red-400'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="truncate">{sitter.address?.split(',').slice(-2, -1)[0]?.trim() || 'Nearby'}</span>
                            </div>

                            {/* Rating & Price */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-0.5">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">5.0</span>
                                    <span className="text-[10px] text-gray-400">(0)</span>
                                </div>
                                <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                                <div className="flex items-center">
                                    <span className="text-sm font-black text-primary">${price}</span>
                                    <span className="text-[10px] text-gray-400 ml-0.5">/night</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 mt-3">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1 h-7 text-xs px-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } });
                                    }}
                                >
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    Book
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs px-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } });
                                    }}
                                >
                                    View Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Monthly Calendar */}
                    <div className="flex-1 p-4 bg-gray-50/30 dark:bg-gray-800/50 min-w-0 flex flex-col items-center justify-center">
                        <div className="w-full max-w-[320px]">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                    {calendar.monthName}
                                </h4>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setWeekOffset(prev => ({ ...prev, [sitter.id]: Math.max(0, (prev[sitter.id] || 0) - 1) }));
                                        }}
                                        disabled={currentMonthOffset === 0}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setWeekOffset(prev => ({ ...prev, [sitter.id]: Math.min(3, (prev[sitter.id] || 0) + 1) }));
                                        }}
                                        disabled={currentMonthOffset >= 3}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-200"></div>
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-200"></div>
                                    <span>Booked</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-200" style={{
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(156,163,175,0.3) 1px, rgba(156,163,175,0.3) 2px)'
                                    }}></div>
                                    <span>Not available</span>
                                </div>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid - Slightly Larger */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
                                    if (day === null) {
                                        return <div key={idx} className="w-8 h-8"></div>;
                                    }

                                    const isAvailable = calendar.availableDays.has(day);
                                    const isBooked = calendar.bookedDays?.has(day) || false;
                                    const today = new Date();
                                    const isToday = day === today.getDate() &&
                                        calendar.month === today.getMonth() &&
                                        calendar.year === today.getFullYear();

                                    return (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAvailable) {
                                                    navigate(`/contact/${sitter.id}`, {
                                                        state: {
                                                            sitter,
                                                            selectedDate: new Date(calendar.year, calendar.month, day),
                                                            searchParams: searchParamsString
                                                        }
                                                    });
                                                }
                                            }}
                                            disabled={!isAvailable}
                                            className={`
                                                w-8 h-8 rounded-lg text-xs font-medium transition-colors
                                                flex items-center justify-center
                                                ${isAvailable
                                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer border border-emerald-200'
                                                    : isBooked
                                                        ? 'bg-amber-50 text-amber-700 cursor-default border border-amber-200'
                                                        : 'text-gray-300 cursor-default bg-gray-50'
                                                }
                                                ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                                            `}
                                            style={!isAvailable && !isBooked ? {
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(156,163,175,0.15) 1px, rgba(156,163,175,0.15) 2px)'
                                            } : {}}
                                            title={isBooked ? 'Booked' : !isAvailable ? 'Not available' : 'Available'}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer Info */}
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Updated {calendar.lastUpdated} day{calendar.lastUpdated > 1 ? 's' : ''} ago</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Cancellation: <span className="text-primary hover:underline cursor-pointer">flexible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Compact card for split view
    const CompactSitterCard: React.FC<{ sitter: SitterData }> = ({ sitter }) => {
        const price = getSitterPrice(sitter);
        const isHovered = hoveredSitter === sitter.id;
        const isSelected = selectedSitter === sitter.id;
        const isFavorite = favorites.has(sitter.id);

        return (
            <div
                onMouseEnter={() => setHoveredSitter(sitter.id)}
                onMouseLeave={() => setHoveredSitter(null)}
                onClick={() => setSelectedSitter(sitter.id === selectedSitter ? null : sitter.id)}
                className={`
                    relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                    border transition-colors duration-200 cursor-pointer shadow-sm
                    ${isHovered || isSelected
                        ? 'border-primary/50 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                `}
            >
                <div className="flex p-4 gap-4">
                    {/* Avatar with Price */}
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                            {sitter.user?.profileImage ? (
                                <img
                                    src={sitter.user.profileImage}
                                    alt={sitter.user.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-primary/30">
                                        {sitter.user?.firstName?.[0] || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-md border border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-black text-primary">${price}</span>
                            <span className="text-[10px] text-gray-400">/night</span>
                        </div>
                        {sitter.isVerified && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                                <Shield className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                            </h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(sitter.id); }}
                                className="p-1 flex-shrink-0"
                            >
                                <Heart
                                    className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                                />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sitter.headline || 'Pet Sitter'}</p>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{sitter.address?.split(',').slice(-2, -1)[0]?.trim() || 'Nearby'}</span>
                        </div>

                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold">5.0</span>
                            <span className="text-xs text-gray-400">(0)</span>
                        </div>

                        <Button
                            size="sm"
                            className="w-full mt-3 h-8 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } });
                            }}
                        >
                            View Profile
                            <Sparkles className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Clean Search Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 py-3 overflow-visible">
                    {/* Main Search Bar - Always Visible */}
                    <div className="flex items-center gap-4">
                        {/* Search Summary & Quick Edit */}
                        <div className="flex-1">
                            <motion.div
                                className={`relative bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 transition-all overflow-visible ${isSearchExpanded ? 'border-primary' : 'border-transparent hover:border-gray-200'
                                    }`}
                            >
                                <div
                                    className="flex items-center gap-3 p-3 cursor-pointer"
                                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                >
                                    {/* Service Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 
                                        flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                                        <span className="text-2xl">{currentService.emoji}</span>
                                    </div>

                                    {/* Search Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                {currentService.label}
                                            </h1>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {searchParams.get('location') || 'Current Location'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-primary font-semibold">
                                            {sortedSitters.length} sitter{sortedSitters.length !== 1 ? 's' : ''} available
                                        </p>
                                    </div>

                                    {/* Edit Button */}
                                    <button className="px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600
                                        text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
                                        transition-colors flex items-center gap-2 shadow-sm">
                                        <Search className="w-4 h-4" />
                                        <span className="hidden sm:inline">Modify Search</span>
                                    </button>
                                </div>

                                {/* Expanded Search Panel */}
                                <AnimatePresence>
                                    {isSearchExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-visible border-t border-gray-200 dark:border-gray-700 relative z-50"
                                        >
                                            <div className="p-4 space-y-4 overflow-visible">
                                                {/* Service Selection */}
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                                        🎯 Service Type
                                                    </label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                        {serviceOptions.map((service) => (
                                                            <button
                                                                key={service.id}
                                                                onClick={() => setEditService(service.id)}
                                                                className={`p-3 rounded-xl text-left transition-all ${editService === service.id
                                                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2'
                                                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-primary'
                                                                    }`}
                                                            >
                                                                <span className="text-xl mb-1 block">{service.emoji}</span>
                                                                <span className={`text-sm font-semibold block ${editService === service.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                                    {service.label}
                                                                </span>
                                                                <span className={`text-xs ${editService === service.id ? 'text-white/80' : 'text-gray-500'}`}>
                                                                    {service.desc}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Location Input */}
                                                <div className="relative overflow-visible z-50">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                                        📍 Location
                                                    </label>
                                                    <div className="flex gap-3 relative overflow-visible">
                                                        <AddressAutocomplete
                                                            value={editLocation}
                                                            onChange={handleEditLocationChange}
                                                            placeholder="Search by zip code or address..."
                                                            className="w-full pl-12 pr-4 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                                bg-white dark:bg-gray-700 focus:border-primary focus:ring-0 transition-colors
                                                                text-gray-900 dark:text-white"
                                                        />
                                                        <button
                                                            onClick={handleEditNearMe}
                                                            disabled={isGettingEditLocation}
                                                            className="h-12 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary 
                                                                font-semibold transition-colors flex items-center gap-2 whitespace-nowrap
                                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isGettingEditLocation ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    <span className="hidden sm:inline">Getting...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Navigation className="w-4 h-4" />
                                                                    <span className="hidden sm:inline">Near Me</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    {editLocationError && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-2 flex items-center gap-2 text-sm text-red-500"
                                                        >
                                                            <AlertCircle className="w-4 h-4" />
                                                            {editLocationError}
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Search Button */}
                                                <Button onClick={handleSearchUpdate} className="w-full h-12 text-base">
                                                    <Search className="w-5 h-5 mr-2" />
                                                    Update Search
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 
                                    hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold">
                                    <ArrowUpDown className="w-4 h-4 text-primary" />
                                    <span className="hidden sm:inline">Sort</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl 
                                    shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible 
                                    group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    {[
                                        { value: 'distance', label: '📍 Distance' },
                                        { value: 'price_low', label: '💰 Price: Low to High' },
                                        { value: 'price_high', label: '💎 Price: High to Low' },
                                        { value: 'rating', label: '⭐ Top Rated' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSortBy(opt.value as SortOption)}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 
                                                dark:hover:bg-gray-700 flex items-center justify-between
                                                ${sortBy === opt.value ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                            {opt.label}
                                            {sortBy === opt.value && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowSidebarFilters(!showSidebarFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-semibold relative
                                    ${showSidebarFilters
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                        {activeFilterCount > 9 ? '9+' : activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5">
                            {[
                                { mode: 'list' as ViewMode, icon: List, label: 'List' },
                                { mode: 'split' as ViewMode, icon: Grid3X3, label: 'Split' },
                                { mode: 'map' as ViewMode, icon: MapIcon, label: 'Map' },
                            ].map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${viewMode === mode
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden lg:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
                        <X className="w-5 h-5" />
                        {error}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="w-full">
                <div className={`flex ${viewMode === 'map' ? 'flex-col' : 'flex-row'}`}>
                    {/* Advanced Filters Sidebar */}
                    {viewMode !== 'map' && showSidebarFilters && (
                        <aside className="hidden lg:block w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                            <div className="sticky top-[160px] h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                <div className="p-6 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg">
                                                <Filter className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                                                {activeFilterCount > 0 && (
                                                    <p className="text-xs text-primary font-semibold">{activeFilterCount} active</p>
                                                )}
                                            </div>
                                        </div>
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={clearAllFilters}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                                title="Clear all filters"
                                            >
                                                <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Price Range */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Price Range</label>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min</label>
                                                    <input
                                                        type="number"
                                                        value={priceRange[0]}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setPriceRange([Math.min(val, priceRange[1]), priceRange[1]]);
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                                                                    bg-white dark:bg-gray-800 text-sm font-medium focus:border-primary focus:ring-0
                                                                    text-gray-900 dark:text-white transition-colors"
                                                        min={0}
                                                        max={maxPrice}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max</label>
                                                    <input
                                                        type="number"
                                                        value={priceRange[1]}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || maxPrice;
                                                            setPriceRange([priceRange[0], Math.max(priceRange[0], Math.min(val, maxPrice))]);
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                                                                    bg-white dark:bg-gray-800 text-sm font-medium focus:border-primary focus:ring-0
                                                                    text-gray-900 dark:text-white transition-colors"
                                                        min={priceRange[0]}
                                                        max={maxPrice}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>${priceRange[0]}</span>
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                                                    <div
                                                        className="absolute h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
                                                        style={{
                                                            left: `${(priceRange[0] / maxPrice) * 100}%`,
                                                            width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <span>${priceRange[1]}+</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Distance */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Max Distance</label>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={0}
                                                max={50}
                                                value={maxDistance}
                                                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                                                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                                                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                                                            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                                                            [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                            />
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>0 km</span>
                                                <span className="font-semibold text-primary">{maxDistance} km</span>
                                                <span>50+ km</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Rating */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-primary fill-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Minimum Rating</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {[0, 3, 4, 4.5, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => setMinRating(rating)}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${minRating === rating
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {rating === 0 ? 'Any' : `${rating}+`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Experience */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Experience</label>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { value: 0, label: 'Any' },
                                                { value: 1, label: '1+ years' },
                                                { value: 3, label: '3+ years' },
                                                { value: 5, label: '5+ years' },
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="experience"
                                                        checked={minExperience === option.value}
                                                        onChange={() => setMinExperience(option.value)}
                                                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                        {option.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Service Types */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <PawPrint className="w-4 h-4 text-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Service Types</label>
                                        </div>
                                        <div className="space-y-2">
                                            {serviceOptions.map((service) => {
                                                const isSelected = selectedServiceTypes.has(service.id);
                                                return (
                                                    <label
                                                        key={service.id}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                                            ? 'bg-primary/10 border-2 border-primary'
                                                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newSet = new Set(selectedServiceTypes);
                                                                if (e.target.checked) {
                                                                    newSet.add(service.id);
                                                                } else {
                                                                    newSet.delete(service.id);
                                                                }
                                                                setSelectedServiceTypes(newSet);
                                                            }}
                                                            className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer rounded"
                                                        />
                                                        <span className="text-xl">{service.emoji}</span>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{service.label}</div>
                                                            <div className="text-xs text-gray-500">{service.desc}</div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Additional Options */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Additional</label>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    checked={verifiedOnly}
                                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer rounded"
                                                />
                                                <Shield className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                    Verified Sitters Only
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    checked={hasReviews}
                                                    onChange={(e) => setHasReviews(e.target.checked)}
                                                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer rounded"
                                                />
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                    Has Reviews
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Sitter List */}
                    {viewMode !== 'map' && (
                        <div
                            className={`flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${viewMode === 'split'
                                ? 'lg:max-h-[calc(100vh-160px)]'
                                : 'min-h-[calc(100vh-160px)]'
                                }`}
                        >
                            {sortedSitters.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 
                                        flex items-center justify-center">
                                        <span className="text-5xl">🐾</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        No sitters found
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Try adjusting your filters or search area
                                    </p>
                                    <Button onClick={() => setIsSearchExpanded(true)} size="lg">
                                        <Search className="w-5 h-5 mr-2" />
                                        Update Search
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className={`flex flex-col gap-4 ${viewMode === 'list' ? '' : ''}`}>
                                    <AnimatePresence mode="popLayout">
                                        {sortedSitters.map((sitter) => (
                                            viewMode === 'split' ? (
                                                <CompactSitterCard key={sitter.id} sitter={sitter} />
                                            ) : (
                                                <SitterCard key={sitter.id} sitter={sitter} />
                                            )
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Map - Split View */}
                    {viewMode === 'split' && (
                        <div className="hidden lg:block w-2/5 flex-shrink-0 h-[calc(100vh-160px)] sticky top-[160px] relative">
                            <MapContainer
                                center={mapCenter}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-none z-10"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapCenterUpdater center={highlightedCenter} />

                                {sortedSitters
                                    .filter(sitter => sitter.latitude && sitter.longitude)
                                    .map((sitter) => {
                                        const price = getSitterPrice(sitter);
                                        const isActive = hoveredSitter === sitter.id || selectedSitter === sitter.id;

                                        return (
                                            <Marker
                                                key={sitter.id}
                                                position={[sitter.latitude!, sitter.longitude!]}
                                                icon={createCustomIcon(isActive, price)}
                                                eventHandlers={{
                                                    click: () => setSelectedSitter(sitter.id),
                                                    mouseover: () => setHoveredSitter(sitter.id),
                                                    mouseout: () => setHoveredSitter(null),
                                                }}
                                            >
                                                <Popup className="custom-popup">
                                                    <div className="p-2 min-w-[220px]">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 
                                                                overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                {sitter.user?.profileImage ? (
                                                                    <img src={sitter.user.profileImage} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl font-bold text-primary/50">
                                                                        {sitter.user?.firstName?.[0]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">
                                                                    {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                                                                </h4>
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                    <span className="font-medium">5.0</span>
                                                                </div>
                                                                <span className="text-primary font-bold">${price}/night</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => navigate(`/sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                                        >
                                                            View Profile
                                                        </Button>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                            </MapContainer>

                            {/* Map Legend */}
                            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 
                                backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-primary shadow-md"></div>
                                        Selected
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-1.5 flex">
                    {[
                        { mode: 'list' as ViewMode, icon: List, label: 'List' },
                        { mode: 'split' as ViewMode, icon: Grid3X3, label: 'Split' },
                        { mode: 'map' as ViewMode, icon: MapIcon, label: 'Map' },
                    ].map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${viewMode === mode
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-gray-500'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;

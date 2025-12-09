import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sitterService } from '../services/sitter.service';
import { Button } from '../components/ui/Button';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DivIcon, LatLngBounds } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, Shield, Heart, Grid3X3,
    List, Map as MapIcon, ChevronDown, X,
    Home, SlidersHorizontal, Sparkles,
    Award, CheckCircle2, ArrowUpDown, Search,
    Calendar, PawPrint, Sun, Building2,
    ChevronLeft, ChevronRight, MessageCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { SearchFilters } from '../components/search/SearchFilters';

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

// Map center update component - only pans, doesn't zoom
const MapCenterUpdater: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            // Only pan to center, keep current zoom level
            map.panTo(center, { duration: 0.5 });
        }
    }, [center, map]);
    return null;
};

// Map bounds fitter component for split view - shows 50km radius from search center
const MapBoundsFitter: React.FC<{
    centerLat?: number;
    centerLng?: number;
    radiusKm?: number;
}> = ({ centerLat, centerLng, radiusKm = 50 }) => {
    const map = useMap();

    useEffect(() => {
        if (!centerLat || !centerLng) {
            return;
        }

        // Calculate bounds for a circle with specified radius (in km)
        // 1 degree of latitude ≈ 111 km
        // 1 degree of longitude ≈ 111 km * cos(latitude)
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

        // Create bounds that represent the 50km radius circle
        const bounds = new LatLngBounds(
            [centerLat - latDelta, centerLng - lngDelta] as [number, number],
            [centerLat + latDelta, centerLng + lngDelta] as [number, number]
        );

        // Fit bounds with padding to show the 50km radius area
        map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 12, // Limit max zoom to ensure we can see the full area
            duration: 0.5
        });
    }, [centerLat, centerLng, radiusKm, map]);

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
    const [initialLoading, setInitialLoading] = useState(true); // Only for initial page load
    const [filterLoading, setFilterLoading] = useState(false); // For filter updates
    const [error, setError] = useState('');
    const [hoveredSitter, setHoveredSitter] = useState<string | null>(null);
    const [selectedSitter, setSelectedSitter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showSidebarFilters, setShowSidebarFilters] = useState(true); // Show by default, toggle with button
    const [sortBy, setSortBy] = useState<SortOption>('distance');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Filter state
    const [filters, setFilters] = useState({
        location: searchParams.get('location') || '',
        service: searchParams.get('service') || 'boarding',
        latitude: parseFloat(searchParams.get('latitude') || '0'),
        longitude: parseFloat(searchParams.get('longitude') || '0'),
        priceRange: [0, 200] as [number, number],
        maxPrice: 200,
        minRating: 0,
        maxDistance: 50,
        minExperience: 0,
        verifiedOnly: false,
        hasReviews: false,
        selectedServiceTypes: new Set<string>()
    });

    const isInitialMount = useRef(true);
    const searchParamsStringRef = useRef<string>('');
    const fetchingRef = useRef(false);

    // Initial filter setup from URL
    useEffect(() => {
        const location = searchParams.get('location') || '';
        const service = searchParams.get('service') || 'boarding';
        const lat = parseFloat(searchParams.get('latitude') || '0');
        const lng = parseFloat(searchParams.get('longitude') || '0');

        setFilters(prev => ({
            ...prev,
            location,
            service,
            latitude: lat || prev.latitude,
            longitude: lng || prev.longitude
        }));
    }, [searchParams]);


    // Availability week navigator state (must be before any conditional returns)
    const [weekOffset, setWeekOffset] = useState<Record<string, number>>({});

    // Bookings state for each sitter
    const sitterBookings = useRef<Record<string, any[]>>({});

    // Preserve search params for navigation (used in JSX)
    const searchParamsString = searchParams.toString();

    // Stable fetch function
    const fetchSitters = useCallback(async (currentFilters: any, isInitialLoad: boolean = false) => {
        // Prevent concurrent calls if needed, though debouncing helps
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        // Only show full page loading on initial load
        if (isInitialLoad) {
            setInitialLoading(true);
        } else {
            setFilterLoading(true);
        }
        setError('');

        try {
            const apiParams: any = {};

            // Core Location Params
            if (currentFilters.latitude && currentFilters.longitude) {
                apiParams.latitude = currentFilters.latitude.toString();
                apiParams.longitude = currentFilters.longitude.toString();
                apiParams.radius = (currentFilters.maxDistance || 50).toString();
            }

            // Service Type
            if (currentFilters.service) {
                const serviceMap: Record<string, string> = {
                    'boarding': 'boarding',
                    'housesitting': 'houseSitting',
                    'visits': 'dropInVisits',
                    'daycare': 'doggyDayCare',
                    'walking': 'dogWalking',
                };
                apiParams.serviceType = serviceMap[currentFilters.service] || currentFilters.service;
            }

            // Advanced Filters
            if (currentFilters.priceRange) {
                if (currentFilters.priceRange[0] > 0) apiParams.minPrice = currentFilters.priceRange[0].toString();
                if (currentFilters.priceRange[1] < (currentFilters.maxPrice || 200)) apiParams.maxPrice = currentFilters.priceRange[1].toString();
            }
            if (currentFilters.minRating > 0) apiParams.minRating = currentFilters.minRating.toString();
            if (currentFilters.minExperience > 0) apiParams.minExperience = currentFilters.minExperience.toString();
            if (currentFilters.verifiedOnly) apiParams.verifiedOnly = 'true';
            if (currentFilters.hasReviews) apiParams.hasReviews = 'true';

            console.log('Fetching sitters with params:', apiParams);
            const data = await sitterService.searchSitters(apiParams);

            // Transform data
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
                distance: profile.distance,
                availability: profile.availability,
                updatedAt: profile.updatedAt,
                reviews: profile.reviews || [],
            }));

            setSitters(transformedData);
        } catch (err) {
            console.error('Failed to fetch sitters:', err);
            setError('Failed to load sitters. Please try again.');
        } finally {
            if (isInitialLoad) {
                setInitialLoading(false);
            } else {
                setFilterLoading(false);
            }
            fetchingRef.current = false;
        }
    }, []);

    // Initial Fetch on Mount or when search params change from URL (not from filter changes)
    useEffect(() => {
        // Prevent React Strict Mode double fetch
        const currentParamsString = searchParams.toString();
        if (currentParamsString === searchParamsStringRef.current && !isInitialMount.current) {
            return;
        }
        searchParamsStringRef.current = currentParamsString;

        // Construct initial filters from params + defaults
        const initialFilters = {
            location: searchParams.get('location') || '',
            service: searchParams.get('service') || 'boarding',
            latitude: parseFloat(searchParams.get('latitude') || '0'),
            longitude: parseFloat(searchParams.get('longitude') || '0'),
            maxDistance: 50,
            priceRange: [0, 200],
            // ... other defaults
        };

        // Only use initialLoading on true initial mount, otherwise use filterLoading
        const isInitial = isInitialMount.current;
        if (isInitial) {
            isInitialMount.current = false;
        }

        fetchSitters(initialFilters, isInitial);
    }, [searchParams, fetchSitters]);

    // Handle filter changes from component
    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };

            // Check if core params changed to update URL
            if (updated.location !== prev.location || updated.service !== prev.service) {
                // Fetch immediately with filterLoading, then update URL
                // This prevents the searchParams useEffect from triggering with initialLoading
                fetchSitters(updated, false); // false = not initial load, use filterLoading

                // Update URL after fetching to avoid triggering the useEffect
                const newParams = new URLSearchParams(searchParams);
                if (updated.location) newParams.set('location', updated.location);
                if (updated.service) newParams.set('service', updated.service);
                if (updated.latitude) newParams.set('latitude', updated.latitude.toString());
                if (updated.longitude) newParams.set('longitude', updated.longitude.toString());

                // Use replace to avoid triggering the useEffect
                setSearchParams(newParams, { replace: true });
            } else {
                // Only filters changed, not location/service - fetch with updated filters
                fetchSitters(updated, false); // false = not initial load
            }

            return updated;
        });
    }, [searchParams, setSearchParams, fetchSitters]);

    // Get price for sitter (needed for sorting)
    const getSitterPrice = useCallback((sitter: SitterData) => {
        const services = sitter.services || {};
        const rates = Object.values(services).map((s) => s?.rate || 999).filter(r => r < 999);
        return rates.length > 0 ? Math.min(...rates) : 25;
    }, []);

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
        if (filters.verifiedOnly) count++;
        if (filters.minRating > 0) count++;
        if (filters.maxDistance < 50) count++;
        if (filters.hasReviews) count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < filters.maxPrice) count++;
        return count;
    }, [filters]);

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
        // Only update center on selection, not on hover
        const target = selectedSitter;
        if (!target) return null;
        const sitter = sitters.find(s => s.id === target);
        if (sitter?.latitude && sitter?.longitude) {
            return [sitter.latitude, sitter.longitude] as [number, number];
        }
        return null;
    }, [selectedSitter, sitters]);

    // Only show full page loading on initial load
    if (initialLoading) {
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

    const SitterCard = React.memo<{ sitter: SitterData }>(({ sitter }) => {
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
    });

    // Compact card for split view
    const CompactSitterCard = React.memo<{ sitter: SitterData }>(({ sitter }) => {
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
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Clean Search Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 py-2 overflow-visible">
                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
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

            {
                error && (
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
                            <X className="w-5 h-5" />
                            {error}
                        </div>
                    </div>
                )
            }

            {/* Main Content */}
            <div className="w-full">
                <div className={`flex ${viewMode === 'map' ? 'flex-col' : 'flex-row'}`}>
                    {/* New Search Filters Component */}
                    {viewMode !== 'map' && showSidebarFilters && (
                        <div className="hidden lg:block w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm h-[calc(100vh-160px)] sticky top-[160px]">
                            <SearchFilters
                                initialFilters={filters}
                                onFilterChange={handleFilterChange}
                                serviceOptions={serviceOptions}
                            />
                        </div>
                    )}

                    {/* Sitter List */}
                    {
                        viewMode !== 'map' && (
                            <div
                                className={`flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative ${viewMode === 'split'
                                    ? 'lg:max-h-[calc(100vh-160px)]'
                                    : 'min-h-[calc(100vh-160px)]'
                                    }`}
                            >
                                {/* Filter Loading Overlay */}
                                {filterLoading && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-3"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">🐾</div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Updating results...</p>
                                        </motion.div>
                                    </div>
                                )}
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
                                        <Button onClick={() => setShowSidebarFilters(true)} size="lg">
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
                        )
                    }

                    {/* Map - Split View */}
                    {
                        viewMode === 'split' && (
                            <div className="hidden lg:block w-2/5 flex-shrink-0 h-[calc(100vh-160px)] sticky top-[160px] relative">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={10}
                                    style={{ height: '100%', width: '100%' }}
                                    className="rounded-none z-10"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapBoundsFitter
                                        centerLat={searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined}
                                        centerLng={searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined}
                                        radiusKm={filters.maxDistance}
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
                        )
                    }
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
        </div >
    );
};

export default SearchResultsPage;

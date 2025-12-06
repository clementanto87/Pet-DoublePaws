import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
    ChevronLeft, ChevronRight, MessageCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Generate monthly calendar availability for demo
const generateMonthlyAvailability = (sitterId: string, monthOffset: number = 0) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const monthName = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Generate availability based on sitter id hash
    const hash = sitterId.charCodeAt(0) + sitterId.length;
    const availableDays: Set<number> = new Set();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        // Don't mark past dates as available
        if (date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            // Random availability based on hash
            if ((hash + day) % 4 !== 0 && (hash * day) % 5 !== 0) {
                availableDays.add(day);
            }
        }
    }

    return {
        monthName,
        year,
        month,
        daysInMonth,
        startDayOfWeek,
        availableDays,
        lastUpdated: Math.floor(Math.random() * 5) + 1
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
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('distance');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Search modification states
    const [editLocation, setEditLocation] = useState(searchParams.get('location') || '');
    const [editService, setEditService] = useState(searchParams.get('service') || 'boarding');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    // Availability week navigator state (must be before any conditional returns)
    const [weekOffset, setWeekOffset] = useState<Record<string, number>>({});

    // Preserve search params for navigation
    const searchParamsString = searchParams.toString();

    useEffect(() => {
        const fetchSitters = async () => {
            setLoading(true);
            try {
                const params = Object.fromEntries(searchParams.entries());
                const data = await sitterService.searchSitters(params);
                setSitters(data);
            } catch (err) {
                console.error('Failed to fetch sitters:', err);
                setError('Failed to load sitters. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSitters();
    }, [searchParams]);

    // Handle search update
    const handleSearchUpdate = () => {
        const newParams = new URLSearchParams();
        if (editService) newParams.set('service', editService);
        if (editLocation) newParams.set('location', editLocation);
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

    // Get price for sitter
    const getSitterPrice = useCallback((sitter: SitterData) => {
        const services = sitter.services || {};
        const rates = Object.values(services).map((s) => s?.rate || 999).filter(r => r < 999);
        return rates.length > 0 ? Math.min(...rates) : 25;
    }, []);

    // Sort sitters
    const sortedSitters = useMemo(() => {
        let filtered = [...sitters];

        if (verifiedOnly) {
            filtered = filtered.filter(s => s.isVerified);
        }

        filtered = filtered.filter(s => {
            const price = getSitterPrice(s);
            return price >= priceRange[0] && price <= priceRange[1];
        });

        switch (sortBy) {
            case 'distance':
                return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            case 'price_low':
                return filtered.sort((a, b) => getSitterPrice(a) - getSitterPrice(b));
            case 'price_high':
                return filtered.sort((a, b) => getSitterPrice(b) - getSitterPrice(a));
            case 'rating':
                return filtered;
            default:
                return filtered;
        }
    }, [sitters, sortBy, verifiedOnly, priceRange, getSitterPrice]);

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
        const calendar = useMemo(() => generateMonthlyAvailability(sitter.id, currentMonthOffset), [sitter.id, currentMonthOffset]);

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
                            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-200"></div>
                                    <span>Available</span>
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
                                                    : 'text-gray-300 cursor-default bg-gray-50'
                                                }
                                                ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                                            `}
                                            style={!isAvailable ? {
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(156,163,175,0.15) 1px, rgba(156,163,175,0.15) 2px)'
                                            } : {}}
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
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    {/* Main Search Bar - Always Visible */}
                    <div className="flex items-center gap-4">
                        {/* Search Summary & Quick Edit */}
                        <div className="flex-1">
                            <motion.div
                                className={`relative bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 transition-all ${isSearchExpanded ? 'border-primary' : 'border-transparent hover:border-gray-200'
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
                                            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="p-4 space-y-4">
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
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                                        📍 Location
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1 relative">
                                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                                            <input
                                                                type="text"
                                                                value={editLocation}
                                                                onChange={(e) => setEditLocation(e.target.value)}
                                                                placeholder="Enter city or zip code..."
                                                                className="w-full pl-12 pr-4 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                                    bg-white dark:bg-gray-700 focus:border-primary focus:ring-0 transition-colors
                                                                    text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => setEditLocation('Current Location')}
                                                            className="h-12 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary 
                                                                font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            <Navigation className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Near Me</span>
                                                        </button>
                                                    </div>
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
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-semibold
                                    ${showFilters
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
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

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="py-4 flex flex-wrap items-center gap-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                    {/* Price Range */}
                                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-primary" /> Price
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                                                    bg-white dark:bg-gray-700 text-sm font-medium"
                                                min={0}
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                                                    bg-white dark:bg-gray-700 text-sm font-medium"
                                                min={0}
                                            />
                                        </div>
                                    </div>

                                    {/* Verified Only */}
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                                        <input
                                            type="checkbox"
                                            checked={verifiedOnly}
                                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                            <Shield className="w-4 h-4 text-emerald-500" /> Verified Only
                                        </span>
                                    </label>

                                    {/* Clear Filters */}
                                    <button
                                        onClick={() => {
                                            setPriceRange([0, 100]);
                                            setVerifiedOnly(false);
                                        }}
                                        className="text-sm text-gray-500 hover:text-primary font-medium flex items-center gap-1 
                                            px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Clear All
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
            <div className="max-w-7xl mx-auto">
                <div className={`flex ${viewMode === 'list' ? 'flex-col' : viewMode === 'map' ? 'flex-col' : 'flex-col lg:flex-row'}`}>
                    {/* Sitter List */}
                    {viewMode !== 'map' && (
                        <div
                            className={`p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${viewMode === 'split' ? 'lg:w-2/5 lg:max-h-[calc(100vh-160px)]' : 'w-full max-w-5xl mx-auto'
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

                    {/* Map */}
                    {viewMode !== 'list' && (
                        <div
                            className={`relative ${viewMode === 'split'
                                ? 'lg:w-3/5 h-[400px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-[160px]'
                                : 'w-full h-[calc(100vh-160px)]'
                                }`}
                        >
                            <MapContainer
                                center={mapCenter}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-none lg:rounded-l-3xl z-10"
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Search,
    MapPin,
    ArrowRight,
    CheckCircle,
    Navigation,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { getCurrentPosition, reverseGeocode, formatAddressShort, type Address } from '../../utils/geocoding';
import { cn } from '../../lib/utils';

interface FindSitterSearchBoxProps {
    initialService?: string;
    initialLocation?: string;
    className?: string;
}

const FindSitterSearchBox: React.FC<FindSitterSearchBoxProps> = ({
    initialService = 'boarding',
    initialLocation = '',
    className
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [selectedService, setSelectedService] = useState<string>(initialService);
    const [location, setLocation] = useState(initialLocation);
    const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Animated placeholder text
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = [
        t('landing.enterCity'),
        t('landing.tryLocation'),
        t('landing.wherePetCare'),
        t('landing.searchByZip')
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const serviceOptions = [
        { id: 'boarding', icon: '🏠', label: t('landing.services.boarding.label'), desc: t('landing.services.boarding.desc'), color: 'from-primary to-orange-500' },
        { id: 'housesitting', icon: '🏡', label: t('landing.services.houseSitting.label'), desc: t('landing.services.houseSitting.desc'), color: 'from-blue-500 to-blue-600' },
        { id: 'visits', icon: '☀️', label: t('landing.services.dropInVisits.label'), desc: t('landing.services.dropInVisits.desc'), color: 'from-amber-500 to-yellow-500' },
        { id: 'daycare', icon: '🐕', label: t('landing.services.dayCare.label'), desc: t('landing.services.dayCare.desc'), color: 'from-rose-400 to-pink-500' },
        { id: 'walking', icon: '🦮', label: t('landing.services.walking.label'), desc: t('landing.services.walking.desc'), color: 'from-green-500 to-emerald-600' },
    ];

    const handleSearch = () => {
        // Validate that we have at least a location or service
        if (!location && !selectedService) {
            setLocationError('Please enter a location or select a service');
            return;
        }

        const params = new URLSearchParams();
        if (selectedService) params.set('service', selectedService);
        if (location) params.set('location', location);
        // Add coordinates if available for better search results
        if (selectedAddress?.coordinates) {
            params.set('latitude', selectedAddress.coordinates.lat.toString());
            params.set('longitude', selectedAddress.coordinates.lng.toString());
        }

        console.log('Navigating to search with params:', params.toString());
        navigate(`/search?${params.toString()}`);
    };

    const handleNearMe = async () => {
        setIsGettingLocation(true);
        setLocationError(null);

        try {
            // Get current position
            const coords = await getCurrentPosition();

            // Reverse geocode to get address
            const address = await reverseGeocode(coords.lat, coords.lng);

            // Update location state
            const formattedAddress = formatAddressShort(address);
            setLocation(formattedAddress);
            setSelectedAddress(address);
        } catch (error) {
            console.error('Geolocation error:', error);
            setLocationError(error instanceof Error ? error.message : 'Failed to get your location');
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleLocationChange = (value: string, address?: Address) => {
        setLocation(value);
        setSelectedAddress(address);
        setLocationError(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={cn("relative z-20 -mx-1 sm:-mx-2 md:mx-0", className)}
        >
            {/* Glow Effect Behind Search - Reduced on mobile */}
            <div className="absolute -inset-1 sm:-inset-2 md:-inset-4 bg-gradient-to-r from-primary/20 via-amber-400/20 to-primary/20 rounded-[16px] sm:rounded-[24px] md:rounded-[40px] blur-lg sm:blur-xl md:blur-2xl opacity-30 sm:opacity-40 md:opacity-60" />

            {/* Main Search Container */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl border-2 transition-all duration-500 overflow-visible ${isSearchFocused
                ? 'border-primary shadow-primary/20 shadow-lg sm:shadow-xl md:shadow-2xl scale-[1.005] sm:scale-[1.01] md:scale-[1.02]'
                : 'border-gray-100 dark:border-gray-700'
                }`}>
                {/* Service Selection - Compact Grid Design for Mobile */}
                <div className="p-2.5 sm:p-3 md:p-6 pb-2 sm:pb-2.5 md:pb-4 border-b border-gray-100 dark:border-gray-700 [@media(max-height:750px)]:p-2 [@media(max-height:750px)]:pb-1.5">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 md:mb-4 flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 [@media(max-height:750px)]:mb-1">
                        <span className="text-xs sm:text-sm md:text-lg">🎯</span> <span className="truncate">{t('landing.whatServiceNeeded')}</span>
                    </p>
                    {/* Flex Layout for centered items - 3 columns mobile, 5 desktop */}
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 [@media(max-height:750px)]:gap-1">
                        {serviceOptions.map((service, index) => (
                            <motion.button
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.08 }}
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedService(service.id)}
                                className={`relative w-[calc(33.333%-4px)] sm:w-[31%] lg:w-[18%] p-1.5 sm:p-2 md:p-4 rounded-md sm:rounded-lg md:rounded-2xl text-left transition-all duration-300 overflow-hidden group flex flex-col justify-center items-center md:items-start min-h-[70px] sm:min-h-[80px] md:aspect-square [@media(max-height:750px)]:min-h-[58px] [@media(max-height:750px)]:p-1 ${selectedService === service.id
                                    ? 'bg-gradient-to-br ' + service.color + ' text-white shadow-md md:shadow-lg ring-1 md:ring-2 ring-offset-0 md:ring-offset-2 ring-primary/50'
                                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm md:hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                    }`}
                            >
                                {/* Shine Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                <div className="relative z-10 flex flex-col items-center md:items-start w-full">
                                    {/* Icon Circle - Smaller on mobile */}
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-1.5 md:mb-3 transition-all flex-shrink-0 [@media(max-height:750px)]:mb-0.5 ${selectedService === service.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-100 dark:bg-gray-600'
                                        }`}>
                                        <span className="text-sm sm:text-lg md:text-2xl [@media(max-height:750px)]:text-xs">{service.icon}</span>
                                    </div>

                                    {/* Text Content - Compact on mobile */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                                        <p className={`font-bold text-[9px] sm:text-[10px] md:text-sm mb-0.5 md:mb-1 leading-tight [@media(max-height:750px)]:text-[8px] [@media(max-height:750px)]:mb-0 ${selectedService === service.id ? 'text-white' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {service.label}
                                        </p>
                                        <p className={`text-[8px] sm:text-[9px] md:text-xs leading-tight md:leading-snug line-clamp-2 [@media(max-height:750px)]:hidden ${selectedService === service.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {service.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Checkmark for Selected - Smaller on mobile */}
                                {selectedService === service.id && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="absolute top-1.5 right-1.5 md:top-3 md:right-3 w-4 h-4 md:w-6 md:h-6 rounded-full bg-white flex items-center justify-center shadow-md md:shadow-lg z-20"
                                    >
                                        <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                    </motion.div>
                                )}

                                {/* Subtle border glow for selected */}
                                {selectedService === service.id && (
                                    <div className="absolute inset-0 rounded-lg md:rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Location Search - Improved for mobile */}
                <div className="p-3 sm:p-4 md:p-6 pt-2.5 sm:pt-3 md:pt-5 overflow-visible [@media(max-height:750px)]:p-2 [@media(max-height:750px)]:pt-2">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 px-1 [@media(max-height:750px)]:mb-1.5">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" /> <span className="truncate">{t('landing.whereNeedCare')}</span>
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearch();
                            return false;
                        }}
                        className="flex flex-col md:flex-row gap-2 sm:gap-2.5 md:gap-3 relative [@media(max-height:750px)]:gap-1.5"
                    >
                        {/* Beautiful Location Input with Autocomplete */}
                        <div className={`flex-1 relative min-w-0 ${isSearchFocused ? 'z-50' : ''}`}>
                            <div className={`relative flex items-center rounded-full transition-all duration-300 overflow-visible ${isSearchFocused
                                ? 'ring-2 ring-primary/50 ring-offset-1 md:ring-offset-2 bg-white dark:bg-gray-700 shadow-lg shadow-primary/10'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-white shadow-sm hover:shadow-md'
                                }`}>
                                {/* Location Icon */}
                                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-l-full transition-colors flex-shrink-0 ${isSearchFocused ? 'text-primary' : 'text-gray-400'
                                    }`}>
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${isSearchFocused ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-600'
                                        }`}>
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    </div>
                                </div>

                                <AddressAutocomplete
                                    value={location}
                                    onChange={handleLocationChange}
                                    onFocus={() => {
                                        setIsSearchFocused(true);
                                    }}
                                    onBlur={() => {
                                        // Delay to check if focus moved to suggestions
                                        setTimeout(() => {
                                            const activeElement = document.activeElement as HTMLElement;
                                            if (activeElement?.closest('.suggestion-item') === null &&
                                                activeElement?.closest('.relative.flex-1.overflow-visible') === null) {
                                                setIsSearchFocused(false);
                                            }
                                        }, 350);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSearch();
                                        }
                                    }}
                                    placeholder={placeholders[placeholderIndex]}
                                    className="flex-1 h-10 sm:h-12 md:h-14 pr-1 sm:pr-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-xs sm:text-sm md:text-base font-medium !border-0 !outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0 min-w-0"
                                />

                                {/* Near Me Button - Better mobile layout */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNearMe();
                                    }}
                                    type="button"
                                    disabled={isGettingLocation}
                                    className="mr-1 sm:mr-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-full bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold text-[10px] sm:text-xs md:text-sm transition-all group flex items-center gap-1 sm:gap-1.5 md:gap-2 whitespace-nowrap border border-primary/20 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    title="Use current location"
                                >
                                    {isGettingLocation ? (
                                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-spin" />
                                    ) : (
                                        <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform" />
                                    )}
                                    <span className="hidden sm:inline md:hidden lg:inline">
                                        {isGettingLocation ? 'Getting...' : t('landing.nearMe')}
                                    </span>
                                </button>
                            </div>

                            {/* Error Message */}
                            {locationError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 p-2.5 md:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg md:rounded-xl flex items-start gap-2 z-50"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm text-red-600 dark:text-red-400">{locationError}</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Search Button - Full width on mobile */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Search button clicked');
                                handleSearch();
                            }}
                            type="button"
                            className="relative h-10 sm:h-12 md:h-14 w-full md:w-auto px-4 sm:px-6 md:px-8 lg:px-10 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-xs sm:text-sm md:text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden group cursor-pointer [@media(max-height:750px)]:h-9"
                        >
                            {/* Animated Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 justify-center">
                                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span className="truncate">{t('landing.searchSitters')}</span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </span>
                        </motion.button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default FindSitterSearchBox;

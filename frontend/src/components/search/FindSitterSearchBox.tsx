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
        const params = new URLSearchParams();
        if (selectedService) params.set('service', selectedService);
        if (location) params.set('location', location);
        // Add coordinates if available for better search results
        if (selectedAddress?.coordinates) {
            params.set('latitude', selectedAddress.coordinates.lat.toString());
            params.set('longitude', selectedAddress.coordinates.lng.toString());
        }
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
            className={cn("relative z-20 -mx-2 md:mx-0", className)}
        >
            {/* Glow Effect Behind Search - Reduced on mobile */}
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-primary/20 via-amber-400/20 to-primary/20 rounded-[24px] md:rounded-[40px] blur-xl md:blur-2xl opacity-40 md:opacity-60" />

            {/* Main Search Container */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border-2 transition-all duration-500 overflow-visible ${isSearchFocused
                ? 'border-primary shadow-primary/20 shadow-xl md:shadow-2xl scale-[1.01] md:scale-[1.02]'
                : 'border-gray-100 dark:border-gray-700'
                }`}>
                {/* Service Selection - Compact Grid Design for Mobile */}
                <div className="p-3 md:p-6 pb-2.5 md:pb-4 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                        <span className="text-sm md:text-lg">🎯</span> {t('landing.whatServiceNeeded')}
                    </p>
                    {/* Compact Grid Layout - 3 columns on mobile to fit all services, 5 on desktop */}
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 md:gap-3">
                        {serviceOptions.map((service, index) => (
                            <motion.button
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.08 }}
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedService(service.id)}
                                className={`relative p-2 md:p-4 rounded-lg md:rounded-2xl text-left transition-all duration-300 overflow-hidden group flex flex-col justify-center items-center md:items-start min-h-[80px] md:aspect-square ${selectedService === service.id
                                    ? 'bg-gradient-to-br ' + service.color + ' text-white shadow-md md:shadow-lg ring-1 md:ring-2 ring-offset-0 md:ring-offset-2 ring-primary/50'
                                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm md:hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                    }`}
                            >
                                {/* Shine Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                <div className="relative z-10 flex flex-col items-center md:items-start w-full">
                                    {/* Icon Circle - Smaller on mobile */}
                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1.5 md:mb-3 transition-all flex-shrink-0 ${selectedService === service.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-100 dark:bg-gray-600'
                                        }`}>
                                        <span className="text-lg md:text-2xl">{service.icon}</span>
                                    </div>

                                    {/* Text Content - Compact on mobile */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                                        <p className={`font-bold text-[10px] md:text-sm mb-0.5 md:mb-1 leading-tight ${selectedService === service.id ? 'text-white' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {service.label}
                                        </p>
                                        <p className={`text-[9px] md:text-xs leading-tight md:leading-snug line-clamp-2 ${selectedService === service.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
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
                <div className="p-4 md:p-6 pt-3 md:pt-5 overflow-visible">
                    <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 md:mb-4 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {t('landing.whereNeedCare')}
                    </p>

                    <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 relative">
                        {/* Beautiful Location Input with Autocomplete */}
                        <div className="flex-1 relative">
                            <div className={`relative flex items-center rounded-full md:rounded-full transition-all duration-300 ${isSearchFocused
                                ? 'ring-2 ring-primary/50 ring-offset-1 md:ring-offset-2 bg-white dark:bg-gray-700 shadow-lg shadow-primary/10'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-white shadow-sm hover:shadow-md'
                                }`}>
                                {/* Location Icon */}
                                <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-l-full transition-colors flex-shrink-0 ${isSearchFocused ? 'text-primary' : 'text-gray-400'
                                    }`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${isSearchFocused ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-600'
                                        }`}>
                                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                </div>

                                <AddressAutocomplete
                                    value={location}
                                    onChange={handleLocationChange}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    placeholder={placeholders[placeholderIndex]}
                                    className="flex-1 h-12 md:h-14 pr-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base font-medium !border-0 !outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0"
                                />

                                {/* Near Me Button - Better mobile layout */}
                                <button
                                    onClick={handleNearMe}
                                    disabled={isGettingLocation}
                                    className="mr-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold text-xs md:text-sm transition-all group flex items-center gap-1.5 md:gap-2 whitespace-nowrap border border-primary/20 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    title="Use current location"
                                >
                                    {isGettingLocation ? (
                                        <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                                    ) : (
                                        <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform" />
                                    )}
                                    <span className="hidden xs:inline md:hidden lg:inline">
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
                            onClick={handleSearch}
                            className="relative h-12 md:h-14 w-full md:w-auto px-6 md:px-8 lg:px-10 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-sm md:text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden group"
                        >
                            {/* Animated Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            <span className="relative z-10 flex items-center gap-2 justify-center">
                                <Search className="w-4 h-4 md:w-5 md:h-5" />
                                <span>{t('landing.searchSitters')}</span>
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FindSitterSearchBox;

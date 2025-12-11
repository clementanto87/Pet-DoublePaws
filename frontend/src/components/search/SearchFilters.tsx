import React, { useState, useEffect, useRef } from 'react';
import {
    Filter, MapPin, Star, Shield,
    CheckCircle2, X
} from 'lucide-react';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { Button } from '../ui/Button';
import { RangeSlider } from '../ui/RangeSlider';


interface SearchFiltersProps {
    initialFilters: {
        location: string;
        service: string;
        priceRange: [number, number];
        maxPrice: number;
        minRating: number;
        maxDistance: number;
        minExperience: number;
        verifiedOnly: boolean;
        hasReviews: boolean;
        selectedServiceTypes: Set<string>;
    };
    onFilterChange: (filters: any) => void;
    serviceOptions: any[];
    className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = React.memo(({
    initialFilters,
    onFilterChange,
    serviceOptions,
    className = '',
}) => {
    // Local state for all filters
    const [location, setLocation] = useState(initialFilters.location);
    const [selectedService, setSelectedService] = useState(initialFilters.service);
    const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange);
    const [minRating, setMinRating] = useState(initialFilters.minRating);
    const [maxDistance, setMaxDistance] = useState(initialFilters.maxDistance);
    const [verifiedOnly, setVerifiedOnly] = useState(initialFilters.verifiedOnly);
    const [hasReviews, setHasReviews] = useState(initialFilters.hasReviews);

    // Debounce timer ref
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Update parent when filters change (debounced)
    const handleFilterUpdate = (newFilters: any) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            onFilterChange(newFilters);
            debounceTimerRef.current = null;
        }, 500); // 500ms debounce
    };

    const getCurrentFilters = () => ({
        location,
        service: selectedService,
        priceRange,
        minRating,
        maxDistance,
        verifiedOnly,
        hasReviews
    });

    // Handle initial filters updates (e.g., if page refreshes or props change)
    useEffect(() => {
        setLocation(initialFilters.location);
        setSelectedService(initialFilters.service);
        setPriceRange(initialFilters.priceRange);
        setMinRating(initialFilters.minRating);
        setMaxDistance(initialFilters.maxDistance);
        setVerifiedOnly(initialFilters.verifiedOnly);
        setHasReviews(initialFilters.hasReviews);
    }, [initialFilters.location, initialFilters.service]); // Only essential changes



    const handleServiceChange = (serviceId: string) => {
        setSelectedService(serviceId);
        onFilterChange({ ...getCurrentFilters(), service: serviceId });
    };

    const handlePriceChange = (newRange: [number, number]) => {
        setPriceRange(newRange);
        handleFilterUpdate({ ...getCurrentFilters(), priceRange: newRange });
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col ${className}`}>

            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                            // Reset all filters
                            const defaultRange: [number, number] = [0, initialFilters.maxPrice || 200];
                            setPriceRange(defaultRange);
                            setMinRating(0);
                            setMaxDistance(50);
                            setVerifiedOnly(false);
                            setHasReviews(false);
                            setSelectedService(initialFilters.service);
                            onFilterChange({
                                ...getCurrentFilters(),
                                priceRange: defaultRange,
                                minRating: 0,
                                maxDistance: 50,
                                verifiedOnly: false,
                                hasReviews: false,
                                service: initialFilters.service
                            });
                        }}
                    >
                        Reset
                    </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Refine your search results</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {/* Location Section */}
                <section>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <div className="relative">
                        <AddressAutocomplete
                            value={location}
                            onChange={(val, addr) => {
                                setLocation(val);
                                if (addr) {
                                    onFilterChange({
                                        ...getCurrentFilters(),
                                        location: val, // Use the formatted address to prevent value jump/re-search
                                        latitude: addr.coordinates.lat,
                                        longitude: addr.coordinates.lng
                                    });
                                }
                            }}
                            placeholder="Where to?"
                            className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {location && (
                            <button
                                onClick={() => {
                                    setLocation('');
                                    onFilterChange({
                                        ...getCurrentFilters(),
                                        location: '',
                                        latitude: 0,
                                        longitude: 0,
                                        service: selectedService // Ensure service is preserved
                                    });
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </section>

                {/* Service Type Section */}
                <section>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Service Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {serviceOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedService === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleServiceChange(option.id)}
                                    className={`
                                        relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                                        ${isSelected
                                            ? 'bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary/20'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                                    <span className="text-xs font-semibold">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Price Range Section */}
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                        <span className="text-xs text-primary font-semibold">
                            ${priceRange[0]} - ${priceRange[1]}
                        </span>
                    </div>
                    <RangeSlider
                        min={0}
                        max={initialFilters.maxPrice || 200}
                        step={5}
                        value={priceRange}
                        onChange={handlePriceChange}
                        formatLabel={(val: number) => `$${val}`}
                    />
                </section>

                {/* Rating Filter */}
                <section>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Minimum Rating</label>
                    <div className="flex gap-2">
                        {[0, 3, 4, 4.5, 5].map((rating) => {
                            const isSelected = minRating === rating;
                            return (
                                <button
                                    key={rating}
                                    onClick={() => {
                                        setMinRating(rating);
                                        handleFilterUpdate({ ...getCurrentFilters(), minRating: rating });
                                    }}
                                    className={`
                                        flex-1 py-2 rounded-lg text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    {rating === 0 ? 'Any' : (
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{rating}+</span>
                                            {rating > 0 && <Star className={`w-3 h-3 ${isSelected ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400'}`} />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Max Distance Filter */}
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Distance</label>
                        <span className="text-xs text-gray-500">{maxDistance} km</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        value={maxDistance}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setMaxDistance(val);
                            handleFilterUpdate({ ...getCurrentFilters(), maxDistance: val });
                        }}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1 km</span>
                        <span>50 km</span>
                        <span>100 km</span>
                    </div>
                </section>

                {/* Attributes */}
                <section className="space-y-3 pt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attributes</label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                        <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${verifiedOnly ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}
                        `}>
                            {verifiedOnly && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={verifiedOnly}
                                onChange={(e) => {
                                    setVerifiedOnly(e.target.checked);
                                    handleFilterUpdate({ ...getCurrentFilters(), verifiedOnly: e.target.checked });
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Verified Sitters Only</span>
                                <Shield className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-xs text-gray-500">Identity checked & background verified</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                        <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${hasReviews ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}
                        `}>
                            {hasReviews && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={hasReviews}
                                onChange={(e) => {
                                    setHasReviews(e.target.checked);
                                    handleFilterUpdate({ ...getCurrentFilters(), hasReviews: e.target.checked });
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Has Reviews</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-xs text-gray-500">Sitters with 5 star ratings</p>
                        </div>
                    </label>
                </section>

            </div>
        </div>
    );
});

SearchFilters.displayName = 'SearchFilters';

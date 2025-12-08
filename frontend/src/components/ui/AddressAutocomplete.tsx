import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchAddresses, formatAddressShort } from '../../utils/geocoding';
import type { Address } from '../../utils/geocoding';
import { AnimatePresence, motion } from 'framer-motion';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string, address?: Address) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder = 'Search by zip code or address...',
    className = '',
}) => {
    const [suggestions, setSuggestions] = useState<Address[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);
    const isSelectingRef = useRef(false);

    useEffect(() => {
        // Skip search if value was set programmatically (from selection)
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }

        // Debounce address search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (value.length >= 3) {
            setIsLoading(true);
            debounceTimer.current = setTimeout(async () => {
                try {
                    const results = await searchAddresses(value);
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Address search failed:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoading(false);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [value]);

    const handleSelectAddress = (address: Address) => {
        const formattedAddress = formatAddressShort(address);
        // Mark that we're selecting to prevent triggering new search
        isSelectingRef.current = true;
        // Clear suggestions immediately
        setShowSuggestions(false);
        setSuggestions([]);
        // Update the value (this will trigger onChange but won't trigger new search due to isSelectingRef)
        onChange(formattedAddress, address);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleFocus = () => {
        // Don't automatically show suggestions on focus
        // Suggestions will appear when user types (via useEffect)
        onFocus?.();
    };

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            setShowSuggestions(false);
            onBlur?.();
        }, 200);
    };

    return (
        <div className="relative flex-1 overflow-visible">
            <div className="relative overflow-visible">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={className}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[100] max-h-[300px] overflow-y-auto"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Suggestions
                            </p>
                        </div>
                        {suggestions.map((address, index) => (
                            <button
                                key={index}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectAddress(address);
                                }}
                                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors flex-shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {formatAddressShort(address)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {address.display_name}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

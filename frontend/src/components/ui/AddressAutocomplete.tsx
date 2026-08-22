import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { searchAddresses, formatAddressShort } from '../../utils/geocoding';
import type { Address } from '../../utils/geocoding';
import { AnimatePresence, motion } from 'framer-motion';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string, address?: Address) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    placeholder = 'Search by zip code or address...',
    className = '',
}) => {
    const [suggestions, setSuggestions] = useState<Address[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isSelectingRef = useRef(false);
    const isUserTypingRef = useRef(false);

    // The dropdown is rendered in a portal on <body> with fixed positioning so it
    // can never be clipped by an ancestor's overflow (the page uses overflow-x-hidden,
    // which forces overflow-y to `auto` and would otherwise cut off later suggestions).
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

    const updatePosition = useCallback(() => {
        if (containerRef.current) {
            // Anchor to the surrounding search field (icon + input + button) when one is
            // marked, so the dropdown lines up with the full field instead of just the
            // inner input; otherwise fall back to the input wrapper itself.
            const anchor = (containerRef.current.closest('[data-ac-anchor]') as HTMLElement) || containerRef.current;
            const rect = anchor.getBoundingClientRect();
            // Clamp within the viewport with an 8px margin as a defensive safety net — this
            // keeps the dropdown fully visible even if the anchor itself is partly off-screen.
            const viewportWidth = document.documentElement.clientWidth;
            const margin = 8;
            const width = Math.min(rect.width, viewportWidth - margin * 2);
            const left = Math.min(Math.max(rect.left, margin), viewportWidth - width - margin);
            setDropdownPos({ top: rect.bottom + 8, left, width });
        }
    }, []);

    // Keep the dropdown anchored to the input while it is open (scroll / resize / new results).
    // Also listen on visualViewport: iOS Safari shifts the visible (visual) viewport away from
    // the layout viewport when it auto-zooms on input focus, which getBoundingClientRect() alone
    // doesn't account for — without this the dropdown can render partly off-screen after zoom.
    useEffect(() => {
        if (!showSuggestions || suggestions.length === 0) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        const vv = window.visualViewport;
        vv?.addEventListener('resize', updatePosition);
        vv?.addEventListener('scroll', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
            vv?.removeEventListener('resize', updatePosition);
            vv?.removeEventListener('scroll', updatePosition);
        };
    }, [showSuggestions, suggestions.length, updatePosition]);

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


        // Only search if the user is actively typing
        if (!isUserTypingRef.current) {
            return;
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
        // Mark that we're selecting and NOT typing
        isSelectingRef.current = true;
        isUserTypingRef.current = false;
        // Clear suggestions immediately
        setShowSuggestions(false);
        setSuggestions([]);
        // Update the value (this will trigger onChange but won't trigger new search due to isSelectingRef)
        onChange(formattedAddress, address);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isUserTypingRef.current = true;
        onChange(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Ensure input maintains focus
        e.stopPropagation();
        if (inputRef.current) {
            // Use setTimeout to ensure focus happens after any other handlers
            setTimeout(() => {
                if (inputRef.current && document.activeElement !== inputRef.current) {
                    inputRef.current.focus();
                }
            }, 0);
        }
        // Don't automatically show suggestions on focus
        // Suggestions will appear when user types (via useEffect)
        onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Check if focus is moving to a suggestion or staying within the component
        const relatedTarget = e.relatedTarget as HTMLElement;
        const isClickingSuggestion = relatedTarget?.closest('.suggestion-item');
        
        // If clicking on suggestion, don't blur
        if (isClickingSuggestion) {
            return;
        }
        
        // Delay to allow click on suggestion or other elements
        setTimeout(() => {
            // Double check that input is still not focused and not clicking on suggestions
            const currentActive = document.activeElement as HTMLElement;
            const isClickingSuggestionNow = currentActive?.closest('.suggestion-item');
            
            if (document.activeElement !== inputRef.current && !isClickingSuggestionNow) {
                setShowSuggestions(false);
                onBlur?.();
            } else if (document.activeElement === inputRef.current) {
                // If input is focused again, don't blur
                return;
            }
        }, 300);
    };

    return (
        <div ref={containerRef} className="relative flex-1 overflow-visible">
            {/* flex wrapper so the input's `flex-1` fills the full width instead of
                collapsing to the browser default input width (~20 chars). */}
            <div className="relative overflow-visible flex w-full items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        // Prevent form submission on Enter unless explicitly handled
                        if (e.key === 'Enter' && onKeyDown) {
                            e.preventDefault();
                            e.stopPropagation();
                            onKeyDown(e);
                        } else if (e.key === 'Enter') {
                            // If no onKeyDown handler, prevent default form submission
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onMouseDown={(e) => {
                        // Prevent default to avoid losing focus
                        e.preventDefault();
                        e.stopPropagation();
                        // Focus the input
                        if (inputRef.current) {
                            inputRef.current.focus();
                        }
                    }}
                    onClick={(e) => {
                        // Ensure input gets focus when clicked
                        e.stopPropagation();
                        if (inputRef.current) {
                            // Use setTimeout to ensure focus happens
                            setTimeout(() => {
                                if (inputRef.current && document.activeElement !== inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }, 0);
                        }
                    }}
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

            {/* Suggestions Dropdown — portaled to <body> with fixed positioning so it is
                never clipped by an overflow ancestor or trapped under another section. */}
            {createPortal(
                <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && dropdownPos && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'fixed',
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                        }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[9999] max-h-[300px] overflow-y-auto"
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
                                    e.stopPropagation();
                                    handleSelectAddress(address);
                                    // Keep focus on input after selection
                                    setTimeout(() => {
                                        inputRef.current?.focus();
                                    }, 0);
                                }}
                                className="suggestion-item w-full px-4 py-3 flex items-start gap-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left group"
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
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

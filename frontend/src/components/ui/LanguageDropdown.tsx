import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const LANGUAGES = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
];

interface LanguageDropdownProps {
    className?: string;
}

// A single click-toggle dropdown (works on touch, unlike a hover menu) replacing
// the old pair of always-visible EN/DE pill buttons. The menu is portaled to
// <body> with position:fixed — the navbar's <nav> has overflow-x-hidden, which
// (per spec) implicitly sets overflow-y:auto and would otherwise clip an inline
// absolutely-positioned menu that drops below the header's own height.
export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className }) => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, updatePosition]);

    return (
        <div className={cn('relative', className)}>
            <button
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
                aria-label="Change language"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
            >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{current.short}</span>
                <ChevronDown className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-transform', open && 'rotate-180')} />
            </button>

            {open && menuPos && createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
                    <div
                        style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                        className="w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-[9999]"
                    >
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                                    i18n.language === lang.code ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'
                                )}
                            >
                                {lang.label}
                                {i18n.language === lang.code && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

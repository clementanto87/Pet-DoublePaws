import React from 'react';
import { cn } from '../../lib/utils';

interface WordmarkProps {
    className?: string;
    showBadge?: boolean;
}

export const Wordmark: React.FC<WordmarkProps> = ({ className, showBadge = true }) => (
    <span className={cn('inline-flex items-center font-display font-extrabold tracking-[-0.03em] select-none whitespace-nowrap leading-none', className)}>
        <span className="text-slate-900 dark:text-white transition-colors">
            Double
        </span>
        <span className="ml-1 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Paws
        </span>
        {showBadge && (
            <span className="inline-flex items-center justify-center font-display font-black text-[10px] sm:text-[11px] leading-none px-1.5 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xs ml-1 tracking-tight">
                24
            </span>
        )}
    </span>
);
export default Wordmark;

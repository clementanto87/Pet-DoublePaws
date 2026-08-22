import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
    className?: string;
}

// The lucide "paw-print" glyph, inlined so both paws can live in one
// responsive <svg viewBox>. Unlike two absolutely-positioned fixed-size
// icons, a single vector graphic scales exactly with the element's
// width/height at every breakpoint — that's what was breaking the mark
// down at small (mobile) sizes.
const PawGlyph: React.FC<{ strokeWidth: number; className?: string }> = ({ strokeWidth, className }) => (
    <>
        <circle cx="11" cy="4" r="2" className={className} strokeWidth={strokeWidth} />
        <circle cx="18" cy="8" r="2" className={className} strokeWidth={strokeWidth} />
        <circle cx="20" cy="16" r="2" className={className} strokeWidth={strokeWidth} />
        <path
            d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"
            className={className}
            strokeWidth={strokeWidth}
        />
    </>
);

export const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 56 40"
            className={cn('w-14 h-10', className)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Blue paw (back) */}
            <g transform="translate(0,4) rotate(-12,16,16) scale(1.3333)">
                <PawGlyph strokeWidth={1.5} className="fill-secondary stroke-secondary" />
            </g>

            {/* Orange paw (front) — background-colored halo first for separation, then the solid paw */}
            <g transform="translate(24,0) rotate(12,16,16) scale(1.3333)">
                <PawGlyph strokeWidth={6} className="stroke-background" />
            </g>
            <g transform="translate(24,0) rotate(12,16,16) scale(1.3333)">
                <PawGlyph strokeWidth={1.5} className="fill-primary stroke-primary" />
            </g>
        </svg>
    );
};

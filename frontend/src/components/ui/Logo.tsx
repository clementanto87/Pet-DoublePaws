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

// Two paws laid out side by side within one viewBox. Each group first
// normalizes the glyph's bounding box to the origin (translate -4.46,-2),
// scales it up, then positions it — so the blue (left) and orange (right)
// paws sit in their own horizontal lanes with a clear gap between them and
// never overlap, at any size. A gentle opposite tilt keeps the mark lively.
export const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 62 40"
            className={cn('w-14 h-10', className)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Blue paw (left lane). translate(-4.46,-2) normalizes the glyph
                bbox to the origin; scale enlarges it; rotate spins it about its
                own centre so it stays inside its lane; translate positions it. */}
            <g transform="translate(3,8) rotate(-8,10.96,10.94) scale(1.25) translate(-4.46,-2)">
                <PawGlyph strokeWidth={1.4} className="fill-secondary stroke-secondary" />
            </g>

            {/* Orange paw (right lane) */}
            <g transform="translate(34,8) rotate(8,10.96,10.94) scale(1.25) translate(-4.46,-2)">
                <PawGlyph strokeWidth={1.4} className="fill-primary stroke-primary" />
            </g>
        </svg>
    );
};

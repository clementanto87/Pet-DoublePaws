import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    className?: string;
    formatLabel?: (value: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    step = 1,
    value,
    onChange,
    className = '',
    formatLabel = (v) => `${v}`
}) => {
    const [localValue, setLocalValue] = useState<[number, number]>(value);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop value when not dragging/interacting might create jitter
    // so we sync only when prop significantly changes or on mount
    useEffect(() => {
        setLocalValue(value);
    }, [value[0], value[1]]);

    const getPercentage = (val: number) => {
        return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    };

    const handleMouseDown = (index: 0 | 1) => (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startVal = localValue[index];

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const width = rect.width;
            const deltaX = moveEvent.clientX - startX;
            const deltaVal = (deltaX / width) * (max - min);

            let newVal = startVal + deltaVal;
            // Round to nearest step
            newVal = Math.round(newVal / step) * step;
            // Clamp to min/max
            newVal = Math.max(min, Math.min(max, newVal));

            const nextValue: [number, number] = [...localValue];
            nextValue[index] = newVal;

            // Prevent crossing
            if (index === 0) {
                nextValue[0] = Math.min(newVal, nextValue[1] - step);
            } else {
                nextValue[1] = Math.max(newVal, nextValue[0] + step);
            }

            setLocalValue(nextValue);
            onChange(nextValue);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className={`w-full py-4 select-none ${className}`}>
            <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700" ref={sliderRef}>
                {/* Track fill */}
                <div
                    className="absolute h-full rounded-full bg-primary"
                    style={{
                        left: `${getPercentage(localValue[0])}%`,
                        right: `${100 - getPercentage(localValue[1])}%`
                    }}
                />

                {/* Left Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/20 z-10"
                    style={{ left: `calc(${getPercentage(localValue[0])}% - 12px)` }}
                    onMouseDown={handleMouseDown(0)}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {formatLabel(localValue[0])}
                    </div>
                </div>

                {/* Right Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/20 z-10"
                    style={{ left: `calc(${getPercentage(localValue[1])}% - 12px)` }}
                    onMouseDown={handleMouseDown(1)}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {formatLabel(localValue[1])}
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
                <span>{formatLabel(localValue[0])}</span>
                <span>{formatLabel(localValue[1])}</span>
            </div>
        </div>
    );
};

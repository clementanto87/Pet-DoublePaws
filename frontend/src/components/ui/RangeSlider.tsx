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
    const valueRef = useRef<[number, number]>(value);

    // Sync local state with prop value when not dragging/interacting might create jitter
    // so we sync only when prop significantly changes or on mount
    useEffect(() => {
        setLocalValue(value);
        valueRef.current = value;
    }, [value[0], value[1]]);

    const getPercentage = (val: number) => {
        return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    };

    const handlePointerDown = (index: 0 | 1) => (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const handlePointerMove = (moveEvent: PointerEvent) => {
            if (!sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const position = Math.min(rect.width, Math.max(0, moveEvent.clientX - rect.left));
            let newVal = min + (position / rect.width) * (max - min);
            // Round to nearest step
            newVal = Math.round(newVal / step) * step;
            // Clamp to min/max
            newVal = Math.max(min, Math.min(max, newVal));

            const nextValue: [number, number] = [...valueRef.current];
            nextValue[index] = newVal;

            // Prevent crossing
            if (index === 0) {
                nextValue[0] = Math.min(newVal, nextValue[1] - step);
            } else {
                nextValue[1] = Math.max(newVal, nextValue[0] + step);
            }

            setLocalValue(nextValue);
            valueRef.current = nextValue;
            onChange(nextValue);
        };

        const handlePointerUp = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointercancel', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);
    };

    return (
        <div className={`w-full py-4 select-none ${className}`}>
            <div className="relative h-2 touch-none rounded-full bg-gray-200 dark:bg-gray-700" ref={sliderRef}>
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
                    className="absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 touch-none rounded-full border-2 border-primary bg-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
                    style={{ left: `calc(${getPercentage(localValue[0])}% - 12px)` }}
                    onPointerDown={handlePointerDown(0)}
                    role="slider"
                    aria-label="Minimum price"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={localValue[0]}
                    tabIndex={0}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {formatLabel(localValue[0])}
                    </div>
                </div>

                {/* Right Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 touch-none rounded-full border-2 border-primary bg-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
                    style={{ left: `calc(${getPercentage(localValue[1])}% - 12px)` }}
                    onPointerDown={handlePointerDown(1)}
                    role="slider"
                    aria-label="Maximum price"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={localValue[1]}
                    tabIndex={0}
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

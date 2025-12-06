import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Clock className="w-5 h-5 text-primary" />
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-14 px-4 pl-12 flex items-center text-left rounded-2xl border-2 transition-all duration-300",
          "bg-white dark:bg-gray-900/50",
          "border-gray-200 dark:border-gray-700 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none",
          "text-gray-900 dark:text-white font-medium",
          "appearance-none" // Helps with some browser styling
        )}
      />
    </div>
  );
};

export default TimePicker;

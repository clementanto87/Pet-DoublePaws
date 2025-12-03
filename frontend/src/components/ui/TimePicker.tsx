import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactDOM from 'react-dom';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select time',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Parse value to display
  const getDisplayTime = () => {
    if (!value) return placeholder;
    const [hours, minutes] = value.split(':').map(Number);
    const isPM = hours >= 12;
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
  };

  // Calculate position and handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const popupWidth = 320;
        let left = rect.left;

        if (left + popupWidth > window.innerWidth - 16) {
          left = window.innerWidth - popupWidth - 16;
        }
        if (left < 16) left = 16;

        setPosition({
          top: rect.bottom + 8,
          left: left
        });
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTimeSelect = (hour: number, minute: string) => {
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) hours24 = hour + 12;
    else if (period === 'AM' && hour === 12) hours24 = 0;

    onChange(`${hours24.toString().padStart(2, '0')}:${minute}`);
    setIsOpen(false);
  };

  const presets = [
    { label: 'Morning', time: '09:00', display: '9:00 AM' },
    { label: 'Noon', time: '12:00', display: '12:00 PM' },
    { label: 'Afternoon', time: '14:00', display: '2:00 PM' },
    { label: 'Evening', time: '18:00', display: '6:00 PM' },
  ];

  const popupContent = isOpen ? ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[320px] z-[9999]"
      style={{ top: position.top, left: position.left }}
    >
      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => { onChange(preset.time); setIsOpen(false); }}
            className="py-2 px-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-center"
          >
            <span className="block text-xs text-gray-400 mb-0.5">{preset.label}</span>
            <span className="font-semibold text-xs">{preset.display}</span>
          </button>
        ))}
      </div>

      {/* AM/PM Toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setPeriod('AM')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
            period === 'AM' ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => setPeriod('PM')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
            period === 'PM' ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          PM
        </button>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
        {HOURS.flatMap((hour) =>
          MINUTES.map((minute) => (
            <button
              key={`${hour}:${minute}`}
              type="button"
              onClick={() => handleTimeSelect(hour, minute)}
              className="py-2 px-2 text-sm font-medium rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary"
            >
              {hour}:{minute}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 px-4 pl-12 flex items-center text-left rounded-2xl border-2 transition-all duration-300",
          "bg-white dark:bg-gray-900/50",
          isOpen ? "border-primary ring-4 ring-primary/10" : "border-gray-200 dark:border-gray-700 hover:border-primary/50",
          value ? "text-gray-900 dark:text-white" : "text-gray-400"
        )}
      >
        <Clock className="absolute left-4 w-5 h-5 text-primary" />
        <span className="font-medium">{getDisplayTime()}</span>
      </button>
      {popupContent}
    </div>
  );
};

export default TimePicker;

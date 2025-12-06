import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactDOM from 'react-dom';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  blockedDates?: string[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  blockedDates = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  // Calculate position and handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const popupWidth = 320;
        let left = rect.left;

        // Keep popup within viewport
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleDateSelect = (date: Date) => {
    // Use local time to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Check blocked dates
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return blockedDates.includes(dateStr);
  };

  const isDateSelected = (date: Date) => selectedDate?.toDateString() === date.toDateString();
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const days = getDaysInMonth(currentMonth);

  const popupContent = isOpen ? ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[320px] z-[9999]"
      style={{ top: position.top, left: position.left }}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                type="button"
                onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                disabled={isDateDisabled(date)}
                className={cn(
                  "w-full h-full flex items-center justify-center rounded-xl text-sm font-medium transition-all",
                  isDateDisabled(date) && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                  !isDateDisabled(date) && !isDateSelected(date) && "hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300",
                  isDateSelected(date) && "bg-primary text-white shadow-lg",
                  isToday(date) && !isDateSelected(date) && "ring-2 ring-primary/30 text-primary font-bold"
                )}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quick Select */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button type="button" onClick={() => handleDateSelect(new Date())} className="flex-1 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl">Today</button>
        <button type="button" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); handleDateSelect(d); }} className="flex-1 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl">Tomorrow</button>
        <button type="button" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); handleDateSelect(d); }} className="flex-1 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl">Next Week</button>
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
        <Calendar className="absolute left-4 w-5 h-5 text-primary" />
        <span className="font-medium">{value ? formatDisplayDate(value) : placeholder}</span>
      </button>
      {popupContent}
    </div>
  );
};

export default DatePicker;

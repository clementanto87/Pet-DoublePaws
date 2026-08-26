
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Ban } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingStatus } from '../../services/booking.service';
import type { Booking } from '../../services/booking.service';

interface AvailabilityCalendarProps {
    blockedDates: string[];
    bookings?: Booking[];
    onToggleDate: (date: string) => void;
    className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    blockedDates,
    bookings = [],
    onToggleDate,
    className
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isDateBlocked = (date: Date) => {
        return blockedDates.includes(formatDate(date));
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const getBookingStatusForDate = (date: Date) => {
        const dateStr = formatDate(date);
        const dateObj = new Date(dateStr); // Normalize to midnight

        // Check for accepted bookings first (highest priority)
        const acceptedBooking = bookings.find(booking => {
            if (booking.status !== BookingStatus.ACCEPTED) return false;
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            return dateObj >= new Date(start.toDateString()) && dateObj <= new Date(end.toDateString());
        });

        if (acceptedBooking) return 'accepted';

        // Check for pending bookings
        const pendingBooking = bookings.find(booking => {
            if (booking.status !== BookingStatus.PENDING) return false;
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            return dateObj >= new Date(start.toDateString()) && dateObj <= new Date(end.toDateString());
        });

        if (pendingBooking) return 'pending';

        return null;
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className={cn("bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs", className)}>
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Availability
                    </h3>
                    <p className="text-[11px] text-slate-500">Tap date to block / unblock</p>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white min-w-[90px] sm:min-w-[110px] text-center text-xs sm:text-sm">
                        {MONTHS[currentMonth.getMonth()].slice(0, 3)} {currentMonth.getFullYear()}
                    </span>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 sm:p-5">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                    {DAYS.map((day) => (
                        <div key={day} className="h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {day.slice(0, 2)}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {days.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

                        const isBlocked = isDateBlocked(date);
                        const isPast = isPastDate(date);
                        const bookingStatus = getBookingStatusForDate(date);
                        const dateStr = formatDate(date);

                        return (
                            <button
                                key={dateStr}
                                onClick={() => !isPast && onToggleDate(dateStr)}
                                disabled={isPast}
                                className={cn(
                                    "aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all relative group text-xs",
                                    isPast
                                        ? "bg-slate-50 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                                        : isBlocked
                                            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold"
                                            : bookingStatus === 'accepted'
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold"
                                                : bookingStatus === 'pending'
                                                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold"
                                                    : "bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:border-primary/50 hover:bg-orange-50/20 text-slate-700 dark:text-slate-300"
                                )}
                            >
                                <span className={cn(
                                    "text-xs sm:text-sm font-semibold",
                                    !isPast && !isBlocked && !bookingStatus && "group-hover:text-primary"
                                )}>
                                    {date.getDate()}
                                </span>
                                {isBlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Ban className="w-4 h-4 sm:w-6 sm:h-6 opacity-25 text-red-600" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="px-3 pb-3 sm:px-5 sm:pb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></div>
                    <span className="text-slate-500">Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"></div>
                    <span className="text-slate-500">Booked</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm border border-amber-300 bg-amber-50 dark:bg-amber-950/40"></div>
                    <span className="text-slate-500">Request</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm border border-red-300 bg-red-50 dark:bg-red-950/40"></div>
                    <span className="text-slate-500">Blocked</span>
                </div>
            </div>
        </div>
    );
};

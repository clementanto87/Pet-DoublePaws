
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
        <div className={cn("bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Availability
                    </h3>
                    <p className="text-xs text-gray-500">Click dates to block/unblock</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white min-w-[110px] text-center text-sm">
                        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {DAYS.map((day) => (
                        <div key={day} className="h-10 flex items-center justify-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
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
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative group",
                                    isPast
                                        ? "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed"
                                        : isBlocked
                                            ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                                            : bookingStatus === 'accepted'
                                                ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                                                : bookingStatus === 'pending'
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
                                                    : "bg-white dark:bg-gray-800 border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                <span className={cn(
                                    "text-lg font-medium",
                                    !isPast && !isBlocked && !bookingStatus && "group-hover:text-primary"
                                )}>
                                    {date.getDate()}
                                </span>
                                {isBlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Ban className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                {isBlocked && (
                                    <span className="text-[10px] font-bold uppercase mt-1">Blocked</span>
                                )}
                                {!isBlocked && bookingStatus === 'accepted' && (
                                    <span className="text-[10px] font-bold uppercase mt-1">Booked</span>
                                )}
                                {!isBlocked && bookingStatus === 'pending' && (
                                    <span className="text-[10px] font-bold uppercase mt-1">Request</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 pb-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"></div>
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"></div>
                    <span className="text-gray-600 dark:text-gray-400">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"></div>
                    <span className="text-gray-600 dark:text-gray-400">Request</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"></div>
                    <span className="text-gray-600 dark:text-gray-400">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-gray-50 dark:bg-gray-900"></div>
                    <span className="text-gray-400">Past</span>
                </div>
            </div>
        </div>
    );
};

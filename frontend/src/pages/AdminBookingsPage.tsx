import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { adminService } from '../services/admin.service';

type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Needs review';

const statusStyles: Record<Status, string> = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
    Confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    'Needs review': 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
};

const statusLabel = (status: string): Status => ({
    PENDING: 'Pending',
    ACCEPTED: 'Confirmed',
    COMPLETED: 'Completed',
    REJECTED: 'Needs review',
    CANCELLED: 'Needs review',
}[status] || 'Pending') as Status;

const serviceLabels: Record<string, string> = {
    boarding: 'Boarding',
    'house-sitting': 'House Sitting',
    'drop-in': 'Drop-in Visits',
    'day-care': 'Doggy Day Care',
    walking: 'Dog Walking',
};

const serviceLabel = (serviceType?: string) =>
    (serviceType && serviceLabels[serviceType]) ||
    (serviceType || 'Service').replace(/[-_]/g, ' ').replace(/^./, (value) => value.toUpperCase());

const statusOptions: Array<'All' | Status> = ['All', 'Pending', 'Confirmed', 'Completed', 'Needs review'];

const serviceOptions: Array<{ value: string; label: string }> = [
    { value: 'All', label: 'All services' },
    { value: 'boarding', label: 'Boarding' },
    { value: 'house-sitting', label: 'House Sitting' },
    { value: 'drop-in', label: 'Drop-in Visits' },
    { value: 'day-care', label: 'Doggy Day Care' },
    { value: 'walking', label: 'Dog Walking' },
];

const PAGE_SIZE = 20;

const AdminBookingsPage: React.FC = () => {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | Status>('All');
    const [service, setService] = useState('All');
    const [page, setPage] = useState(1);

    // Debounce the free-text search so we don't fire a request on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Any filter change should send us back to the first page of results.
    useEffect(() => {
        setPage(1);
    }, [search, status, service]);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['adminBookings', { page, status, service, search }],
        queryFn: () =>
            adminService.getBookings({
                page,
                limit: PAGE_SIZE,
                status,
                service,
                search: search || undefined,
            }),
        placeholderData: keepPreviousData,
    });

    const bookings = data?.bookings ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const rangeLabel = useMemo(() => {
        if (total === 0) return '0 bookings';
        const start = (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(page * PAGE_SIZE, total);
        return `${start}–${end} of ${total} bookings`;
    }, [page, total]);

    return (
        <div className="min-h-screen bg-slate-50 py-6 dark:bg-slate-950 sm:py-10">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-orange-600 dark:text-slate-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Link>
                    <div className="mt-4 flex flex-col gap-1">
                        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                            All bookings
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Monitor every booking across the marketplace
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by participant or booking ID..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-500/10"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'All' | Status)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option === 'All' ? 'All statuses' : option}
                            </option>
                        ))}
                    </select>
                    <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                        {serviceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Results */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {isError ? (
                        <div className="p-12 text-center text-sm text-rose-500">
                            Unable to load bookings. Please try again.
                        </div>
                    ) : isLoading ? (
                        <div className="p-12 text-center text-sm text-slate-400">Loading bookings…</div>
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <CalendarDays className="h-6 w-6 text-slate-400" />
                            </span>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No bookings found</p>
                            <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-3">Booking</th>
                                            <th className="px-4 py-3">Participants</th>
                                            <th className="px-4 py-3">Service</th>
                                            <th className="px-4 py-3">Dates</th>
                                            <th className="px-4 py-3">Value</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {bookings.map((booking) => {
                                            const label = statusLabel(booking.status);
                                            return (
                                                <tr
                                                    key={booking.id}
                                                    className="text-sm transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 dark:text-white">
                                                            #{booking.id.slice(0, 8)}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {booking.owner?.firstName} {booking.owner?.lastName}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            with {booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                                                        {serviceLabel(booking.serviceType)}
                                                    </td>
                                                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                        {format(new Date(booking.startDate), 'MMM d')} – {format(new Date(booking.endDate), 'MMM d')}
                                                    </td>
                                                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                                                        ${Number(booking.totalPrice || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={cn(
                                                                'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
                                                                statusStyles[label]
                                                            )}
                                                        >
                                                            {label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                                {bookings.map((booking) => {
                                    const label = statusLabel(booking.status);
                                    return (
                                        <div key={booking.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        #{booking.id.slice(0, 8)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
                                                        statusStyles[label]
                                                    )}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-1 text-sm">
                                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {booking.owner?.firstName} {booking.owner?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    with {booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    {serviceLabel(booking.serviceType)}
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    ${Number(booking.totalPrice || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {format(new Date(booking.startDate), 'MMM d')} – {format(new Date(booking.endDate), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {!isLoading && !isError && bookings.length > 0 && (
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
                            <p className={cn('text-xs text-slate-400', isFetching && 'animate-pulse')}>
                                {rangeLabel}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page <= 1}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </button>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page >= totalPages}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBookingsPage;

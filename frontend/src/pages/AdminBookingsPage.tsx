import React, { useEffect, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Search,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { adminService, type AdminBooking } from '../services/admin.service';
import { bookingReference } from '../utils/bookingReference';
import { AdminCard, AdminPageFrame, AdminShell, AdminState, AdminTable } from '../components/admin/AdminShell';

type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Needs review';

const statusStyles: Record<Status, string> = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300',
    Confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300',
    'Needs review': 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300',
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

const PAGE_SIZE = 15;

const AdminBookingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | Status>('All');
    const [service, setService] = useState('All');
    const [page, setPage] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

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

    const statusMutation = useMutation({
        mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
            adminService.updateBookingStatus(id, newStatus),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
            queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
            setSelectedBooking(updated);
        },
    });

    const bookings = data?.bookings ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    // Export CSV
    const handleExportCSV = () => {
        if (!bookings.length) return;
        const rows = [
            ['Booking ID', 'Service', 'Status', 'Owner Name', 'Owner Email', 'Sitter Name', 'Sitter Email', 'Start Date', 'End Date', 'Total Price (€)'],
            ...bookings.map((b) => [
                bookingReference(b.id),
                serviceLabel(b.serviceType),
                b.status,
                `${b.owner?.firstName || ''} ${b.owner?.lastName || ''}`,
                b.owner?.email || '',
                `${b.sitter?.user?.firstName || ''} ${b.sitter?.user?.lastName || ''}`,
                b.sitter?.user?.email || '',
                format(new Date(b.startDate), 'yyyy-MM-dd'),
                format(new Date(b.endDate), 'yyyy-MM-dd'),
                b.totalPrice,
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `doublepaws-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminShell>
            <AdminPageFrame
                title="Bookings Management"
                description="Review, filter, and manage every booking across the Double Paws marketplace."
                action={
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                    </button>
                }
            >
                {/* Search and Filters Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by participant name, email, or booking reference..."
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-xs sm:text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'All' | Status)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt === 'All' ? 'All Statuses' : opt}
                                </option>
                            ))}
                        </select>

                        <select
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            {serviceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Bookings Card */}
                <AdminState loading={isLoading} error={isError}>
                    <AdminCard className="p-0 sm:p-0 overflow-hidden">
                        <AdminTable>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 pl-6">Reference</th>
                                    <th className="py-4 px-4">Owner</th>
                                    <th className="py-4 px-4">Sitter</th>
                                    <th className="py-4 px-4">Service & Dates</th>
                                    <th className="py-4 px-4">Total</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 pr-6 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                                            No bookings found matching the current search & filters.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                                                {bookingReference(b.id)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {b.owner?.firstName} {b.owner?.lastName}
                                                </div>
                                                <div className="text-[11px] text-slate-400">{b.owner?.email || '—'}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {b.sitter?.user?.firstName} {b.sitter?.user?.lastName}
                                                </div>
                                                <div className="text-[11px] text-slate-400">{b.sitter?.user?.email || '—'}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {serviceLabel(b.serviceType)}
                                                </span>
                                                <div className="text-[11px] text-slate-400">
                                                    {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-primary">
                                                €{b.totalPrice}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                                                    statusStyles[statusLabel(b.status)]
                                                )}>
                                                    {statusLabel(b.status)}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-6 text-right">
                                                <button
                                                    onClick={() => setSelectedBooking(b)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Inspect</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </AdminTable>

                        {/* Pagination Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 text-xs text-slate-500 gap-3">
                            <span>
                                Showing {bookings.length} of {total} booking{total === 1 ? '' : 's'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1 || isFetching}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </button>
                                <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages || isFetching}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </AdminCard>
                </AdminState>
            </AdminPageFrame>

            {/* Deep Booking Inspection & Override Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="font-mono text-xs font-extrabold text-primary">
                                    {bookingReference(selectedBooking.id)}
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    {serviceLabel(selectedBooking.serviceType)} Details
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Participants 2-Col */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                                    Pet Parent (Owner)
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {selectedBooking.owner?.firstName} {selectedBooking.owner?.lastName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedBooking.owner?.email || 'No email'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                                    Pet Sitter
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {selectedBooking.sitter?.user?.firstName} {selectedBooking.sitter?.user?.lastName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedBooking.sitter?.user?.email || 'No email'}</p>
                            </div>
                        </div>

                        {/* Dates and Price Summary */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Service Type:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{serviceLabel(selectedBooking.serviceType)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Scheduled Dates:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {format(new Date(selectedBooking.startDate), 'MMM d, yyyy')} – {format(new Date(selectedBooking.endDate), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created:</span>
                                <span className="text-slate-700 dark:text-slate-300">
                                    {format(new Date(selectedBooking.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">Total Gross Value:</span>
                                <span className="font-extrabold text-primary text-base">€{selectedBooking.totalPrice}</span>
                            </div>
                        </div>

                        {/* Owner message if provided */}
                        {selectedBooking.message && (
                            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/40 text-xs">
                                <p className="text-[10px] font-extrabold uppercase text-primary mb-1">Owner Message / Notes</p>
                                <p className="text-slate-700 dark:text-slate-300">{selectedBooking.message}</p>
                            </div>
                        )}

                        {/* Admin Overrides */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                Administrative Status Overrides
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => statusMutation.mutate({ id: selectedBooking.id, newStatus: 'ACCEPTED' })}
                                    disabled={statusMutation.isPending || selectedBooking.status === 'ACCEPTED'}
                                    className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 disabled:opacity-40"
                                >
                                    Force Confirm
                                </button>
                                <button
                                    onClick={() => statusMutation.mutate({ id: selectedBooking.id, newStatus: 'COMPLETED' })}
                                    disabled={statusMutation.isPending || selectedBooking.status === 'COMPLETED'}
                                    className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 disabled:opacity-40"
                                >
                                    Mark Completed
                                </button>
                                <button
                                    onClick={() => statusMutation.mutate({ id: selectedBooking.id, newStatus: 'CANCELLED' })}
                                    disabled={statusMutation.isPending || selectedBooking.status === 'CANCELLED'}
                                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-40"
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default AdminBookingsPage;

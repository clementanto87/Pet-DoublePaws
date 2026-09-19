import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Download,
    Eye,
    RefreshCw,
    Search,
    ShieldCheck,
    Star,
    TrendingUp,
    Users,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { adminService, type AdminBooking, type AdminSitter } from '../services/admin.service';
import { bookingReference } from '../utils/bookingReference';
import { AdminShell, formatName } from '../components/admin/AdminShell';

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
    (serviceType || 'Service').replace(/[-_]/g, ' ').replace(/^./, (v) => v.toUpperCase());

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'year'>('30d');
    const [bookingFilter, setBookingFilter] = useState<'All' | Status>('All');
    const [search, setSearch] = useState('');
    const [hoveredPoint, setHoveredPoint] = useState<{ label: string; revenue: number; bookings: number } | null>(null);

    // Selected items for modals
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
    const [selectedSitter, setSelectedSitter] = useState<AdminSitter | null>(null);

    const { data: overview, isLoading, isError, refetch } = useQuery({
        queryKey: ['adminOverview', period],
        queryFn: () => adminService.getOverview(period),
        refetchInterval: 60000,
    });

    const verifyMutation = useMutation({
        mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
            adminService.updateVerification(id, isVerified),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
            queryClient.invalidateQueries({ queryKey: ['adminVerification'] });
            setSelectedSitter(null);
        },
    });

    const firstName = formatName(user?.firstName || 'Admin');

    // Dynamic greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Filter bookings in table
    const filteredBookings = useMemo(() => {
        if (!overview?.recentBookings) return [];
        return overview.recentBookings.filter((booking) => {
            const displayStatus = statusLabel(booking.status);
            const ownerName = `${booking.owner?.firstName || ''} ${booking.owner?.lastName || ''}`;
            const sitterName = `${booking.sitter?.user?.firstName || ''} ${booking.sitter?.user?.lastName || ''}`;
            const query = search.toLowerCase();
            const matchesFilter = bookingFilter === 'All' || bookingFilter === displayStatus;
            const matchesSearch = !query || `${booking.id} ${ownerName} ${sitterName} ${booking.serviceType}`.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [overview?.recentBookings, bookingFilter, search]);

    // CSV Export Handler
    const handleExportCSV = () => {
        if (!overview) return;
        const rows = [
            ['Booking Reference', 'Service', 'Status', 'Owner', 'Sitter', 'Total Price (€)', 'Created At'],
            ...overview.recentBookings.map((b) => [
                bookingReference(b.id),
                serviceLabel(b.serviceType),
                b.status,
                `${b.owner?.firstName || ''} ${b.owner?.lastName || ''}`,
                `${b.sitter?.user?.firstName || ''} ${b.sitter?.user?.lastName || ''}`,
                b.totalPrice,
                format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm'),
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `doublepaws-overview-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <AdminShell>
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-primary" />
                    <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading overview metrics...</p>
                </div>
            </AdminShell>
        );
    }

    if (isError || !overview) {
        return (
            <AdminShell>
                <div className="flex min-h-[60vh] items-center justify-center px-4">
                    <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-md dark:border-rose-900/40 dark:bg-slate-900">
                        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
                        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Could not load overview</h1>
                        <p className="mt-2 text-xs text-slate-500 mb-5">Please verify the API connection and try again.</p>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-glow"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Retry</span>
                        </button>
                    </div>
                </div>
            </AdminShell>
        );
    }

    // SVG Chart Geometry
    const chartData = overview.chart || [];
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);
    const chartWidth = 700;
    const chartHeight = 160;

    const points = chartData.map((d, index) => {
        const x = (index / Math.max(chartData.length - 1, 1)) * (chartWidth - 40) + 20;
        const y = chartHeight - 20 - (d.revenue / maxRevenue) * (chartHeight - 40);
        return { x, y, ...d };
    });

    const svgPath = points.length > 1
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
        : '';

    const areaPath = points.length > 1
        ? `${svgPath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
        : '';

    return (
        <AdminShell>
            <div className="space-y-6 sm:space-y-8">
                {/* Header Controls Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Live Overview</span>
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Here’s what’s happening across Double Paws today.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Period Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="h-10 rounded-2xl border border-slate-200/90 bg-white px-3.5 pr-8 text-xs font-bold text-slate-700 shadow-2xs outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="today">Today</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="year">This year</option>
                            </select>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Cards (In Euro) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Gross Revenue */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-primary dark:bg-orange-950/40 font-black text-lg">
                                €
                            </span>
                            {overview.metrics.revenueGrowth !== undefined && (
                                <span className={cn(
                                    'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                                    overview.metrics.revenueGrowth >= 0
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                )}>
                                    <TrendingUp className="h-3 w-3" />
                                    {overview.metrics.revenueGrowth >= 0 ? `+${overview.metrics.revenueGrowth}%` : `${overview.metrics.revenueGrowth}%`}
                                </span>
                            )}
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Bookings</p>
                        <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            €{overview.metrics.grossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">in selected period</p>
                    </div>

                    {/* Pet Parents / Users */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40">
                                <Users className="h-5 w-5" />
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">Platform Total</span>
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pet Parents</p>
                        <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            {overview.metrics.userCount.toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">registered user accounts</p>
                    </div>

                    {/* Verified Sitters */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                <ShieldCheck className="h-5 w-5" />
                            </span>
                            <Link to="/admin/verification" className="text-[11px] font-bold text-primary hover:underline">
                                Review Queue ({overview.trust.pendingVerificationCount})
                            </Link>
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Sitters</p>
                        <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            {overview.metrics.verifiedSitterCount.toLocaleString()}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">of {overview.metrics.sitterCount} sitter profiles</p>
                    </div>

                    {/* Completion Rate */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                                <Activity className="h-5 w-5" />
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600">High Reliability</span>
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                        <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            {overview.metrics.completionRate.toFixed(1)}%
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">{overview.metrics.bookingCount} bookings in period</p>
                    </div>
                </div>

                {/* Interactive Revenue & Bookings Chart */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                Marketplace Revenue & Booking Trend
                            </h2>
                            <p className="text-xs text-slate-400">Daily gross volume across all services</p>
                        </div>
                        {hoveredPoint ? (
                            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{hoveredPoint.label}:</span>
                                <span className="font-extrabold text-primary">€{hoveredPoint.revenue.toFixed(0)}</span>
                                <span className="text-slate-400">({hoveredPoint.bookings} bookings)</span>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 italic">Hover over chart nodes to inspect</div>
                        )}
                    </div>

                    {/* SVG Chart Render */}
                    <div className="relative w-full overflow-hidden pt-2">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Area fill */}
                            {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                            {/* Line */}
                            {svgPath && (
                                <path
                                    d={svgPath}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                            {/* Points */}
                            {points.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredPoint?.label === p.label ? '6' : '3.5'}
                                    className="fill-white stroke-primary stroke-2 cursor-pointer transition-all hover:scale-125"
                                    onMouseEnter={() => setHoveredPoint({ label: p.label, revenue: p.revenue, bookings: p.bookings })}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            ))}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                            <span>{chartData[0]?.label || 'Start'}</span>
                            <span>{chartData[Math.floor(chartData.length / 2)]?.label || 'Mid'}</span>
                            <span>{chartData[chartData.length - 1]?.label || 'End'}</span>
                        </div>
                    </div>
                </div>

                {/* 2-Column Section: Verification Queue & Live Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left 2 Cols: Verification Queue Preview */}
                    <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    Sitter Verification Queue
                                </h2>
                                <p className="text-xs text-slate-400">Applications waiting for identity & background verification</p>
                            </div>
                            <Link
                                to="/admin/verification"
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                                <span>View all ({overview.trust.pendingVerificationCount})</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {overview.verificationQueue.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Verification queue is clear</p>
                                <p className="text-xs text-slate-400">All submitted sitter profiles are reviewed and up to date.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {overview.verificationQueue.map((sitter) => (
                                    <div
                                        key={sitter.id}
                                        className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-orange-100 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden">
                                                {sitter.user?.profileImage ? (
                                                    <img src={sitter.user.profileImage} alt={sitter.user.firstName} className="h-full w-full object-cover" />
                                                ) : (
                                                    sitter.user?.firstName?.charAt(0) || 'S'
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {sitter.user?.firstName} {sitter.user?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">{sitter.headline || sitter.address || 'New applicant'}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Submitted {format(new Date(sitter.createdAt), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                            <button
                                                onClick={() => setSelectedSitter(sitter)}
                                                className="flex-1 py-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                Inspect
                                            </button>
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: sitter.id, isVerified: true })}
                                                disabled={verifyMutation.isPending}
                                                className="flex-1 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold shadow-xs hover:bg-primary/90"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Platform Activity Timeline */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                Real-Time Activity
                            </h2>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        <div className="space-y-3">
                            {overview.activity.slice(0, 7).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs">
                                    <div className={cn(
                                        'h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                                        item.kind === 'booking' ? 'bg-orange-50 text-primary' :
                                        item.kind === 'sitter' ? 'bg-purple-50 text-purple-600' :
                                        item.kind === 'review' ? 'bg-amber-50 text-amber-600' :
                                        item.kind === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-sky-50 text-sky-600'
                                    )}>
                                        {item.kind === 'booking' ? <CalendarDays className="h-3.5 w-3.5" /> :
                                         item.kind === 'sitter' ? <ShieldCheck className="h-3.5 w-3.5" /> :
                                         item.kind === 'review' ? <Star className="h-3.5 w-3.5" /> :
                                         item.kind === 'payment' ? <CreditCard className="h-3.5 w-3.5" /> :
                                         <Users className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{item.text}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{format(new Date(item.time), 'MMM d, h:mm a')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Bookings Table Section */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                Recent Booking Transactions
                            </h2>
                            <p className="text-xs text-slate-400">Live booking feed across all pet services</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search bookings..."
                                    className="h-9 w-44 sm:w-56 rounded-xl border border-slate-200/90 bg-white pl-8 pr-3 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={bookingFilter}
                                onChange={(e) => setBookingFilter(e.target.value as any)}
                                className="h-9 rounded-xl border border-slate-200/90 bg-white px-2.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Needs review">Needs review</option>
                            </select>

                            <Link
                                to="/admin/bookings"
                                className="h-9 inline-flex items-center gap-1 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                            >
                                <span>Full Table</span>
                                <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                        <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
                                    <th className="pb-3 pl-2">Reference</th>
                                    <th className="pb-3">Owner</th>
                                    <th className="pb-3">Sitter</th>
                                    <th className="pb-3">Service</th>
                                    <th className="pb-3">Price</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 pr-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                                            No bookings match the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                                                {bookingReference(b.id)}
                                            </td>
                                            <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                                                {b.owner?.firstName} {b.owner?.lastName}
                                            </td>
                                            <td className="py-3.5 text-slate-600 dark:text-slate-300">
                                                {b.sitter?.user?.firstName} {b.sitter?.user?.lastName}
                                            </td>
                                            <td className="py-3.5 font-medium text-slate-600 dark:text-slate-400">
                                                {serviceLabel(b.serviceType)}
                                            </td>
                                            <td className="py-3.5 font-extrabold text-primary">
                                                €{b.totalPrice}
                                            </td>
                                            <td className="py-3.5">
                                                <span className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                                                    statusStyles[statusLabel(b.status)]
                                                )}>
                                                    {statusLabel(b.status)}
                                                </span>
                                            </td>
                                            <td className="py-3.5 pr-2 text-right">
                                                <button
                                                    onClick={() => setSelectedBooking(b)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal 1: Quick Booking Details Preview */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="font-mono text-xs font-extrabold text-primary">
                                    {bookingReference(selectedBooking.id)}
                                </span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    {serviceLabel(selectedBooking.serviceType)} Booking
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pet Owner</p>
                                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                        {selectedBooking.owner?.firstName} {selectedBooking.owner?.lastName}
                                    </p>
                                    <p className="text-slate-400">{selectedBooking.owner?.email || 'No email'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sitter</p>
                                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                        {selectedBooking.sitter?.user?.firstName} {selectedBooking.sitter?.user?.lastName}
                                    </p>
                                    <p className="text-slate-400">{selectedBooking.sitter?.user?.email || 'No email'}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500">Service Dates:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {format(new Date(selectedBooking.startDate), 'MMM d, yyyy')} — {format(new Date(selectedBooking.endDate), 'MMM d, yyyy')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500">Total Price:</span>
                                <span className="font-extrabold text-base text-primary">€{selectedBooking.totalPrice}</span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500">Status:</span>
                                <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold', statusStyles[statusLabel(selectedBooking.status)])}>
                                    {statusLabel(selectedBooking.status)}
                                </span>
                            </div>

                            {selectedBooking.message && (
                                <div className="p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/40 text-slate-700 dark:text-slate-300">
                                    <p className="text-[10px] font-bold uppercase text-primary mb-1">Owner Message</p>
                                    <p>{selectedBooking.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                            >
                                Close
                            </button>
                            <Link
                                to="/admin/bookings"
                                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-glow"
                            >
                                Manage in Bookings
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Quick Sitter Verification Modal */}
            {selectedSitter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    Review Sitter Application
                                </h3>
                                <p className="text-xs text-slate-400">{selectedSitter.user?.firstName} {selectedSitter.user?.lastName}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSitter(null)}
                                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                                <p className="text-slate-500 font-semibold">Headline: <strong className="text-slate-900 dark:text-white">{selectedSitter.headline || 'None'}</strong></p>
                                <p className="text-slate-500 font-semibold">Email: <strong className="text-slate-900 dark:text-white">{selectedSitter.user?.email}</strong></p>
                                <p className="text-slate-500 font-semibold">Location: <strong className="text-slate-900 dark:text-white">{selectedSitter.address || 'Not specified'}</strong></p>
                            </div>

                            {selectedSitter.bio && (
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Bio / Experience</p>
                                    <p className="text-slate-700 dark:text-slate-300">{selectedSitter.bio}</p>
                                </div>
                            )}

                            {selectedSitter.governmentIdUrl && (
                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 flex items-center justify-between">
                                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Government ID Document Uploaded</span>
                                    <a
                                        href={selectedSitter.governmentIdUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-bold text-primary hover:underline"
                                    >
                                        Inspect File
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                onClick={() => verifyMutation.mutate({ id: selectedSitter.id, isVerified: false })}
                                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => verifyMutation.mutate({ id: selectedSitter.id, isVerified: true })}
                                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-glow hover:bg-primary/90"
                            >
                                Approve Sitter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default AdminPage;

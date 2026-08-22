import React, { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Clock3,
    DollarSign,
    Download,
    FileCheck2,
    LayoutDashboard,
    Menu,
    MoreHorizontal,
    PawPrint,
    Search,
    Settings,
    ShieldCheck,
    Star,
    Users,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { cn } from '../lib/utils';
import { adminService } from '../services/admin.service';

type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Needs review';

const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Verification queue', icon: ClipboardCheck, badge: 12 },
    { label: 'Users & sitters', icon: Users },
    { label: 'Bookings', icon: CalendarDays },
    { label: 'Payments', icon: DollarSign },
    { label: 'Reports', icon: BarChart3 },
];

const statusStyles: Record<Status, string> = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Needs review': 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const toneStyles: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-sky-50 text-sky-600',
    green: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
};

const statusLabel = (status: string): Status => ({
    PENDING: 'Pending',
    ACCEPTED: 'Confirmed',
    COMPLETED: 'Completed',
    REJECTED: 'Needs review',
    CANCELLED: 'Needs review',
}[status] || 'Pending') as Status;

const serviceLabel = (serviceType?: string) => (serviceType || 'Service')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (value) => value.toUpperCase());

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const { data: overview, isLoading, isError } = useQuery({
        queryKey: ['adminOverview'],
        queryFn: adminService.getOverview,
        refetchInterval: 300000,
    });
    const [activeNav, setActiveNav] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookingFilter, setBookingFilter] = useState<'All' | Status>('All');
    const [search, setSearch] = useState('');

    const firstName = user?.firstName || 'Alex';

    if (isLoading) {
        return <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f8fb] dark:bg-slate-950"><div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" /></div>;
    }

    if (isError || !overview) {
        return <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f8fb] px-4 dark:bg-slate-950"><div className="max-w-md rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm dark:border-rose-500/20 dark:bg-slate-900"><AlertTriangle className="mx-auto h-8 w-8 text-rose-500" /><h1 className="mt-4 font-display text-xl font-bold">Could not load admin data</h1><p className="mt-2 text-sm text-slate-500">Check that the API is running and try again.</p></div></div>;
    }

    const metricCards = [
        { label: 'Gross bookings', value: `$${overview.metrics.grossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, tone: 'orange', note: 'last 30 days' },
        { label: 'Pet parents', value: overview.metrics.userCount.toLocaleString(), icon: Users, tone: 'blue', note: 'registered users' },
        { label: 'Verified sitters', value: overview.metrics.verifiedSitterCount.toLocaleString(), icon: ShieldCheck, tone: 'green', note: `of ${overview.metrics.sitterCount} sitter profiles` },
        { label: 'Completion rate', value: `${overview.metrics.completionRate.toFixed(1)}%`, icon: Activity, tone: 'violet', note: 'last 30 days' },
    ];

    const filteredBookings = overview.recentBookings.filter((booking) => {
        const displayStatus = statusLabel(booking.status);
        const ownerName = `${booking.owner?.firstName || ''} ${booking.owner?.lastName || ''}`;
        const sitterName = `${booking.sitter?.user?.firstName || ''} ${booking.sitter?.user?.lastName || ''}`;
        const query = search.toLowerCase();
        return (bookingFilter === 'All' || bookingFilter === displayStatus) && (!query || `${booking.id} ${ownerName} ${sitterName}`.toLowerCase().includes(query));
    });

    return (
        <div className="min-h-screen bg-[#f6f8fb] text-slate-900 dark:bg-slate-950 dark:text-white">
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900',
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                <div className="flex items-center justify-between px-2">
                    <a href="/" className="flex items-center gap-2.5">
                        <Logo className="h-9 w-12" />
                        <span className="font-display text-lg font-bold text-gradient">Double Paws</span>
                    </a>
                    <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close navigation">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
                <nav className="mt-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => { setActiveNav(item.label); setIsSidebarOpen(false); }}
                                className={cn(
                                    'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors',
                                    activeNav === item.label ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                                )}
                            >
                                <Icon className={cn('h-[18px] w-[18px]', activeNav === item.label ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600')} />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>}
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Administration</div>
                <nav className="mt-3 space-y-1">
                    <button onClick={() => setActiveNav('Settings')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                        <Settings className="h-[18px] w-[18px] text-slate-400" /> Settings
                    </button>
                    <button onClick={() => setActiveNav('Audit log')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                        <FileCheck2 className="h-[18px] w-[18px] text-slate-400" /> Audit log
                    </button>
                </nav>
                <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold">{firstName[0]}</span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{firstName} {user?.lastName || 'Admin'}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">Platform administrator</p>
                        </div>
                        <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                    </div>
                </div>
            </aside>

            {isSidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation overlay" />}

            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f6f8fb]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10 dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden dark:border-slate-800 dark:bg-slate-900" aria-label="Open navigation">
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <p className="text-xs font-semibold text-slate-400">Admin console</p>
                            <h1 className="font-display text-lg font-bold sm:text-xl">{activeNav}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="h-10 w-52 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-orange-500/10" />
                        </div>
                        <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:text-orange-500 dark:border-slate-800 dark:bg-slate-900" aria-label="Notifications">
                            <Bell className="h-[18px] w-[18px]" />
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
                        </button>
                        <div className="hidden h-9 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">{firstName[0]}</div>
                    </div>
                </header>

                <div className="mx-auto max-w-[1560px] space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-orange-600"><span className="h-2 w-2 rounded-full bg-orange-500" /> Live overview</p>
                            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Good morning, {firstName}</h2>
                            <p className="mt-1 text-sm text-slate-500">Here’s what’s happening across Double Paws today.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><CalendarDays className="h-4 w-4" /> Last 30 days <ChevronDown className="h-4 w-4" /></button>
                            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 dark:bg-orange-500 dark:text-white"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export report</span><span className="sm:hidden">Export</span></button>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {metricCards.map((metric) => {
                            const Icon = metric.icon;
                            return <div key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between"><span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneStyles[metric.tone])}><Icon className="h-5 w-5" /></span><MoreHorizontal className="h-5 w-5 text-slate-300" /></div>
                                <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
                                <div className="mt-1 flex items-end gap-2"><p className="font-display text-2xl font-bold">{metric.value}</p></div>
                                <p className="mt-1 text-xs text-slate-400">{metric.note}</p>
                            </div>;
                        })}
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                            <div className="flex items-start justify-between"><div><h3 className="font-display text-base font-bold">Bookings & revenue</h3><p className="mt-1 text-xs text-slate-400">Performance over the last 30 days</p></div><div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-orange-500" /> Revenue</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-400" /> Bookings</span></div></div>
                            <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-slate-100 pl-3 dark:border-slate-800 sm:gap-4">
                                {overview.chart.filter((_, index) => index % 3 === 0).map((point, _index, points) => { const maxRevenue = Math.max(...points.map((item) => item.revenue), 1); const maxBookings = Math.max(...points.map((item) => item.bookings), 1); return <div key={point.date} className="group relative flex h-full flex-1 items-end gap-1"><div style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 100)}%` }} className="w-1/2 rounded-t-md bg-orange-400 transition-all group-hover:bg-orange-500" /><div style={{ height: `${Math.max(4, (point.bookings / maxBookings) * 100)}%` }} className="w-1/2 rounded-t-md bg-sky-300 transition-all group-hover:bg-sky-400" /><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">{format(new Date(point.date), 'd')}</span></div>; })}
                            </div>
                            <div className="mt-10 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"><div><p className="text-xs text-slate-400">Average booking value</p><p className="mt-0.5 text-sm font-bold">${overview.metrics.averageBookingValue.toFixed(2)}</p></div><div className="h-8 w-px bg-slate-200 dark:bg-slate-700" /><div><p className="text-xs text-slate-400">Platform commission</p><p className="mt-0.5 text-sm font-bold text-slate-400">Not tracked</p></div></div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex items-start justify-between"><div><h3 className="font-display text-base font-bold">Trust & safety</h3><p className="mt-1 text-xs text-slate-400">Items that need attention</p></div><ShieldCheck className="h-5 w-5 text-emerald-500" /></div><div className="mt-6 space-y-3"><div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/70 p-3 dark:border-orange-500/20 dark:bg-orange-500/10"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm dark:bg-slate-900"><ClipboardCheck className="h-4 w-4" /></span><div><p className="text-sm font-bold">Sitter verification</p><p className="text-xs text-slate-500">{overview.trust.pendingVerificationCount} profiles waiting</p></div></div><ArrowUpRight className="h-4 w-4 text-orange-500" /></div><div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/70 p-3 dark:border-rose-500/20 dark:bg-rose-500/10"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm dark:bg-slate-900"><AlertTriangle className="h-4 w-4" /></span><div><p className="text-sm font-bold">Disputes</p><p className="text-xs text-slate-500">Not tracked in current data model</p></div></div></div><div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-500/20 dark:bg-sky-500/10"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm dark:bg-slate-900"><Clock3 className="h-4 w-4" /></span><div><p className="text-sm font-bold">Support response time</p><p className="text-xs text-slate-500">Not tracked in current data model</p></div></div></div></div><button className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Open trust center</button></div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-slate-800"><div><h3 className="font-display text-base font-bold">Recent bookings</h3><p className="mt-1 text-xs text-slate-400">Monitor marketplace activity in real time</p></div><div className="flex items-center gap-2 overflow-x-auto"><select value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value as 'All' | Status)} className="h-9 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"><option>All</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Needs review</option></select><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800"><MoreHorizontal className="h-5 w-5" /></button></div></div>
                            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/50"><tr><th className="px-6 py-3">Booking</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th><th className="px-6 py-3" /></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredBookings.map((booking) => { const status = statusLabel(booking.status); return <tr key={booking.id} className="text-sm transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-6 py-4"><p className="font-bold">#{booking.id.slice(0, 8)}</p><p className="mt-1 text-xs text-slate-400">{format(new Date(booking.createdAt), 'MMM d, h:mm a')}</p></td><td className="px-4 py-4"><p className="font-semibold">{booking.owner?.firstName} {booking.owner?.lastName}</p><p className="mt-1 text-xs text-slate-400">with {booking.sitter?.user?.firstName} {booking.sitter?.user?.lastName}</p></td><td className="px-4 py-4 text-slate-500">{serviceLabel(booking.serviceType)}</td><td className="px-4 py-4 font-bold">${Number(booking.totalPrice || 0).toFixed(2)}</td><td className="px-4 py-4"><span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset', statusStyles[status])}>{status}</span></td><td className="px-6 py-4 text-right"><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label={`Open ${booking.id}`}><MoreHorizontal className="h-4 w-4" /></button></td></tr>; })}</tbody></table></div>
                            <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800"><button className="text-xs font-bold text-orange-600 hover:text-orange-700">View all bookings <span aria-hidden="true">→</span></button></div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex items-start justify-between"><div><h3 className="font-display text-base font-bold">Verification queue</h3><p className="mt-1 text-xs text-slate-400">Review unverified sitter profiles</p></div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 dark:bg-orange-500/10">{overview.trust.pendingVerificationCount} waiting</span></div><div className="mt-5 space-y-1">{overview.verificationQueue.map((item) => { const name = `${item.user?.firstName || 'Unknown'} ${item.user?.lastName || 'sitter'}`; return <div key={item.id} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-sky-100 text-xs font-bold text-slate-700 dark:from-orange-500/20 dark:to-sky-500/20 dark:text-slate-200">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{name}</p><p className="truncate text-xs text-slate-400">Profile submitted · {format(new Date(item.createdAt), 'MMM d')}</p></div><button className="rounded-lg p-1.5 text-slate-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10" aria-label={`Review ${name}`}><ArrowUpRight className="h-4 w-4" /></button></div>; })}</div>{overview.verificationQueue.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No profiles waiting for verification.</p>}<button className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">Review all applications</button></div>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex items-start justify-between"><div><h3 className="font-display text-base font-bold">Operations activity</h3><p className="mt-1 text-xs text-slate-400">Latest live events across the platform</p></div><button className="text-xs font-bold text-orange-600">View audit log</button></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{overview.activity.map((event) => { const Icon = event.kind === 'booking' ? CheckCircle2 : event.kind === 'sitter' ? ShieldCheck : event.kind === 'review' ? Star : event.kind === 'message' ? Bell : Users; const tone = event.kind === 'booking' ? 'text-emerald-600 bg-emerald-50' : event.kind === 'sitter' ? 'text-sky-600 bg-sky-50' : 'text-orange-600 bg-orange-50'; return <div key={`${event.kind}-${event.time}-${event.text}`} className="flex gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone)}><Icon className="h-4 w-4" /></span><div><p className="text-xs font-semibold leading-5">{event.text}</p><p className="mt-1 text-[11px] text-slate-400">{format(new Date(event.time), 'MMM d, h:mm a')}</p></div></div>; })}</div></section>
                    <p className="flex items-center justify-center gap-2 pb-4 text-xs text-slate-400"><PawPrint className="h-3.5 w-3.5 text-orange-400" /> Data refreshes automatically every 5 minutes <span className="text-slate-300">·</span> {format(new Date(), 'MMM d, yyyy')}</p>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;

import React, { useState } from 'react';
import {
    BarChart3,
    CalendarDays,
    ClipboardCheck,
    CreditCard,
    ExternalLink,
    FileCheck2,
    LayoutDashboard,
    Menu,
    Settings,
    Users,
    X,
    Bell,
    ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { Wordmark } from '../ui/Wordmark';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

export const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Verification queue', path: '/admin/verification', icon: ClipboardCheck, hasBadge: true },
    { label: 'Users & sitters', path: '/admin/users', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
];

export const formatName = (str?: string) => {
    if (!str) return '';
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
};

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    // Fetch live overview to get dynamic pending verification count
    const { data: overview } = useQuery({
        queryKey: ['adminOverview', '30d'],
        queryFn: () => adminService.getOverview('30d'),
        staleTime: 60000,
    });

    const pendingCount = overview?.trust?.pendingVerificationCount ?? overview?.verificationQueue?.length ?? 0;

    const firstName = formatName(user?.firstName || 'Admin');
    const lastName = formatName(user?.lastName || '');
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const currentNav = navItems.find((item) => item.path === location.pathname);
    const activeTitle = currentNav?.label || (location.pathname.includes('settings') ? 'Settings' : location.pathname.includes('audit') ? 'Audit log' : 'Admin Console');

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-white">
            {/* Desktop and Tablet Sidebar */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white px-5 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900 shadow-sm',
                open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                {/* Brand Logo & Close */}
                <div className="flex items-center justify-between px-2">
                    <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                        <Logo className="h-9 w-12" />
                        <Wordmark className="text-lg" />
                    </Link>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Workspace Navigation */}
                <div className="mt-8 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Workspace
                </div>
                <nav className="mt-2.5 space-y-1">
                    {navItems.map(({ label, path, icon: Icon, hasBadge }) => {
                        const selected = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all',
                                    selected
                                        ? 'bg-orange-50 text-primary dark:bg-orange-500/10 dark:text-orange-300 font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                                )}
                            >
                                <Icon className={cn('h-[18px] w-[18px] transition-colors', selected ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />
                                <span className="flex-1">{label}</span>
                                {hasBadge && pendingCount > 0 && (
                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                                        {pendingCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Administration Nav */}
                <div className="mt-7 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Administration
                </div>
                <nav className="mt-2.5 space-y-1">
                    <Link
                        to="/admin/settings"
                        onClick={() => setOpen(false)}
                        className={cn(
                            'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all',
                            location.pathname.includes('settings')
                                ? 'bg-orange-50 text-primary dark:bg-orange-500/10 dark:text-orange-300 font-bold shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                        )}
                    >
                        <Settings className="h-[18px] w-[18px] text-slate-400" />
                        <span>System Settings</span>
                    </Link>
                    <Link
                        to="/admin/audit"
                        onClick={() => setOpen(false)}
                        className={cn(
                            'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all',
                            location.pathname.includes('audit')
                                ? 'bg-orange-50 text-primary dark:bg-orange-500/10 dark:text-orange-300 font-bold shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                        )}
                    >
                        <FileCheck2 className="h-[18px] w-[18px] text-slate-400" />
                        <span>Audit Log</span>
                    </Link>
                </nav>

                {/* Return to Marketplace link */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                        to="/"
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Public Site</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                </div>

                {/* Admin User Footer Card */}
                <div className="mt-auto rounded-2xl bg-slate-900 p-3.5 text-white dark:bg-slate-800 border border-slate-800 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-sm font-extrabold text-white shadow-xs">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={fullName} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                                firstName.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">{fullName}</p>
                            <p className="truncate text-[11px] font-medium text-slate-400">Platform Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop Overlay */}
            {open && (
                <button
                    className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation overlay"
                />
            )}

            {/* Main Area */}
            <main className="lg:pl-72">
                {/* Topbar Header */}
                <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10 dark:border-slate-800 dark:bg-slate-950/85">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOpen(true)}
                            className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden dark:border-slate-800 dark:bg-slate-900"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Admin Console</p>
                            <h1 className="font-display text-lg font-extrabold sm:text-xl tracking-tight text-slate-900 dark:text-white">
                                {activeTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                                {pendingCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900" />
                                )}
                            </button>
                        </div>

                        {/* Admin Badge */}
                        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-xs">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={fullName} className="h-full w-full object-cover rounded-xl" />
                                ) : (
                                    firstName.charAt(0)
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{fullName}</p>
                                <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Body */}
                <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto min-w-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export const AdminPageFrame: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, description, children, action }) => (
    <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Workspace
                </p>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">{description}</p>
            </div>
            {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </section>
        {children}
    </div>
);

export const AdminCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn('rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900', className)}>
        {children}
    </div>
);

export const AdminTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
            {children}
        </table>
    </div>
);

export const AdminStatus: React.FC<{ children: React.ReactNode; tone?: 'green' | 'orange' | 'blue' | 'red' }> = ({
    children,
    tone = 'blue'
}) => (
    <span className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
        tone === 'green' && 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300',
        tone === 'orange' && 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300',
        tone === 'red' && 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300',
        tone === 'blue' && 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300'
    )}>
        {children}
    </span>
);

export const AdminState: React.FC<{ loading?: boolean; error?: boolean; children: React.ReactNode }> = ({
    loading,
    error,
    children
}) => {
    if (loading) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-200 border-t-primary" />
                <p className="text-xs font-semibold text-slate-400">Loading workspace data...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="rounded-2xl bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300">
                <p>Unable to load this workspace data.</p>
                <p className="text-xs font-normal mt-1 opacity-80">Please check your connection and refresh.</p>
            </div>
        );
    }
    return <>{children}</>;
};

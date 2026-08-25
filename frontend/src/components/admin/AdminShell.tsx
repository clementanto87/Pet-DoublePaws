import React, { useState } from 'react';
import { BarChart3, CalendarDays, ClipboardCheck, DollarSign, FileCheck2, LayoutDashboard, Menu, Settings, Users, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Verification queue', path: '/admin/verification', icon: ClipboardCheck },
    { label: 'Users & sitters', path: '/admin/users', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const firstName = user?.firstName || 'Admin';
    const active = navItems.find((item) => item.path === location.pathname)?.label || (location.pathname.includes('settings') ? 'Settings' : 'Audit log');

    return (
        <div className="min-h-screen bg-[#f6f8fb] text-slate-900 dark:bg-slate-950 dark:text-white">
            <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
                <div className="flex items-center justify-between px-2">
                    <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                        <Logo className="h-9 w-12" />
                        <span className="font-display text-lg font-bold text-gradient">Double Paws</span>
                    </Link>
                    <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close navigation"><X className="h-5 w-5" /></button>
                </div>
                <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
                <nav className="mt-3 space-y-1">
                    {navItems.map(({ label, path, icon: Icon }) => {
                        const selected = location.pathname === path;
                        return <Link key={path} to={path} onClick={() => setOpen(false)} className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', selected ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white')}>
                            <Icon className={cn('h-[18px] w-[18px]', selected ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600')} />
                            <span className="flex-1">{label}</span>
                            {label === 'Verification queue' && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">!</span>}
                        </Link>;
                    })}
                </nav>
                <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Administration</div>
                <nav className="mt-3 space-y-1">
                    <Link to="/admin/settings" onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', active === 'Settings' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white')}><Settings className="h-[18px] w-[18px] text-slate-400" /> Settings</Link>
                    <Link to="/admin/audit" onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', active === 'Audit log' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white')}><FileCheck2 className="h-[18px] w-[18px] text-slate-400" /> Audit log</Link>
                </nav>
                <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-800">
                    <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold">{firstName[0]}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{firstName} {user?.lastName || 'Admin'}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">Platform administrator</p></div></div>
                </div>
            </aside>
            {open && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f6f8fb]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10 dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden dark:border-slate-800 dark:bg-slate-900" aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><p className="text-xs font-semibold text-slate-400">Admin console</p><h1 className="font-display text-lg font-bold sm:text-xl">{active}</h1></div></div>
                    <div className="flex items-center gap-3"><div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white sm:flex">{firstName[0]}</div><span className="hidden text-sm font-semibold text-slate-500 sm:block">{user?.email}</span></div>
                </header>
                {children}
            </main>
        </div>
    );
};

export const AdminPageFrame: React.FC<{ title: string; description: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, description, children, action }) => (
    <div className="mx-auto max-w-[1560px] space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-orange-600"><span className="h-2 w-2 rounded-full bg-orange-500" /> Workspace</p><h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}</section>
        {children}
    </div>
);

export const AdminCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={cn('rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6', className)}>{children}</div>;

export const AdminTable: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left">{children}</table></div>;

export const AdminStatus: React.FC<{ children: React.ReactNode; tone?: 'green' | 'orange' | 'blue' | 'red' }> = ({ children, tone = 'blue' }) => <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset', tone === 'green' && 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', tone === 'orange' && 'bg-amber-50 text-amber-700 ring-amber-600/20', tone === 'red' && 'bg-rose-50 text-rose-700 ring-rose-600/20', tone === 'blue' && 'bg-sky-50 text-sky-700 ring-sky-600/20')}>{children}</span>;

export const AdminState: React.FC<{ loading?: boolean; error?: boolean; children: React.ReactNode }> = ({ loading, error, children }) => loading ? <div className="flex min-h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" /></div> : error ? <p className="rounded-xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">Unable to load this workspace. Please refresh and try again.</p> : <>{children}</>;

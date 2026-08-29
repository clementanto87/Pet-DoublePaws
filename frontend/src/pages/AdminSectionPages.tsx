import React, { useState } from 'react';
import {
    ArrowUpRight,
    Check,
    CreditCard,
    Download,
    Eye,
    Globe,
    Mail,
    Search,
    Server,
    X
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import {
    AdminCard,
    AdminPageFrame,
    AdminShell,
    AdminState,
    AdminStatus,
    AdminTable,
    formatName
} from '../components/admin/AdminShell';
import {
    adminService,
    type AdminSitter,
    type AdminUser,
    type AdminPayment,
    type AdminAuditEvent
} from '../services/admin.service';

const name = (p?: { firstName: string; lastName: string; email?: string }) =>
    p ? `${formatName(p.firstName)} ${formatName(p.lastName)}`.trim() : 'Unknown';

const date = (v?: string) => (v ? format(new Date(v), 'MMM d, yyyy') : '—');
const dateTime = (v?: string) => (v ? format(new Date(v), 'MMM d, yyyy h:mm a') : '—');

const tone = (s: string): 'green' | 'orange' | 'blue' | 'red' =>
    ['COMPLETED', 'SUCCEEDED', 'ACCEPTED', 'VERIFIED'].includes(s)
        ? 'green'
        : ['REJECTED', 'FAILED', 'CANCELLED'].includes(s)
        ? 'red'
        : s === 'PENDING'
        ? 'orange'
        : 'blue';

const SearchBox: React.FC<{ value: string; placeholder: string; onChange: (value: string) => void }> = ({
    value,
    placeholder,
    onChange
}) => (
    <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-11 w-64 sm:w-80 rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900"
        />
    </div>
);

const PaginationFooter: React.FC<{
    data?: { page: number; totalPages: number; total: number };
    setPage: (p: number) => void;
}> = ({ data, setPage }) =>
    data ? (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 text-xs text-slate-500 gap-3">
            <span>
                {data.total} total record{data.total === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
                <button
                    disabled={data.page <= 1}
                    onClick={() => setPage(Math.max(1, data.page - 1))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                >
                    Previous
                </button>
                <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                    Page {data.page} of {data.totalPages}
                </span>
                <button
                    disabled={data.page >= data.totalPages}
                    onClick={() => setPage(data.page + 1)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                >
                    Next
                </button>
            </div>
        </div>
    ) : null;

// ==========================================
// 1. Sitter Verification Queue Page
// ==========================================
export const AdminVerificationPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'pending' | 'verified' | 'all'>('pending');
    const [page, setPage] = useState(1);
    const [inspectSitter, setInspectSitter] = useState<AdminSitter | null>(null);

    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['adminVerification', search, status, page],
        queryFn: () => adminService.getVerification({ search, status, page }),
    });

    const mutation = useMutation({
        mutationFn: ({ id, isVerified, notes }: { id: string; isVerified: boolean; notes?: string }) =>
            adminService.updateVerification(id, isVerified, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVerification'] });
            queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
            setInspectSitter(null);
        },
    });

    return (
        <AdminShell>
            <AdminPageFrame
                title="Sitter Verification Queue"
                description="Review applicant identities, government IDs, housing, and service rates before sitters go live."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as any);
                                setPage(1);
                            }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="pending">Pending Review</option>
                            <option value="verified">Verified Sitters</option>
                            <option value="all">All Applicants</option>
                        </select>
                        <SearchBox
                            value={search}
                            placeholder="Search by name, email, city..."
                            onChange={(v) => {
                                setSearch(v);
                                setPage(1);
                            }}
                        />
                    </div>
                }
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    <AdminCard className="p-0 sm:p-0 overflow-hidden">
                        <AdminTable>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 pl-6">Applicant</th>
                                    <th className="py-4 px-4">Location</th>
                                    <th className="py-4 px-4">Headline / Bio</th>
                                    <th className="py-4 px-4">Submitted</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {query.data?.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                                            No sitter applications match the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    query.data?.items.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden">
                                                        {s.user?.profileImage ? (
                                                            <img src={s.user.profileImage} alt={s.user.firstName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            s.user?.firstName?.charAt(0) || 'S'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{name(s.user)}</p>
                                                        <p className="text-xs text-slate-400">{s.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                                {s.address ? s.address.split(',')[0] : '—'}
                                            </td>
                                            <td className="py-4 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                                                {s.headline || s.bio || 'No headline provided'}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">{date(s.createdAt)}</td>
                                            <td className="py-4 px-4">
                                                <AdminStatus tone={s.isVerified ? 'green' : 'orange'}>
                                                    {s.isVerified ? 'Verified' : 'Pending'}
                                                </AdminStatus>
                                            </td>
                                            <td className="py-4 pr-6 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => setInspectSitter(s)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Inspect</span>
                                                    </button>
                                                    {!s.isVerified ? (
                                                        <button
                                                            onClick={() => mutation.mutate({ id: s.id, isVerified: true })}
                                                            disabled={mutation.isPending}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                            <span>Approve</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => mutation.mutate({ id: s.id, isVerified: false })}
                                                            disabled={mutation.isPending}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 text-rose-600 px-3 py-1.5 text-xs font-bold hover:bg-rose-50"
                                                        >
                                                            <span>Revoke</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </AdminTable>
                        <PaginationFooter data={query.data} setPage={setPage} />
                    </AdminCard>
                </AdminState>
            </AdminPageFrame>

            {/* Deep Sitter Inspection Modal */}
            {inspectSitter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-orange-100 text-primary font-extrabold text-lg flex items-center justify-center overflow-hidden">
                                    {inspectSitter.user?.profileImage ? (
                                        <img src={inspectSitter.user.profileImage} alt={inspectSitter.user.firstName} className="h-full w-full object-cover" />
                                    ) : (
                                        inspectSitter.user?.firstName?.charAt(0) || 'S'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                        {name(inspectSitter.user)}
                                    </h3>
                                    <p className="text-xs text-slate-400">{inspectSitter.user?.email} • {inspectSitter.address || 'No location'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setInspectSitter(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Bio & Headline */}
                        <div className="space-y-2 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <p className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 mb-1">Headline</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{inspectSitter.headline || 'None provided'}</p>
                            </div>

                            {inspectSitter.bio && (
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <p className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 mb-1">About & Experience</p>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{inspectSitter.bio}</p>
                                </div>
                            )}

                            {/* ID Document Preview */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">Government Identity Proof</p>
                                    <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                                        {inspectSitter.governmentIdUrl ? 'Document attached by applicant' : 'No ID document attached'}
                                    </p>
                                </div>
                                {inspectSitter.governmentIdUrl && (
                                    <a
                                        href={inspectSitter.governmentIdUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
                                    >
                                        <span>View Document</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>

                            {/* Service Rates Breakdown in Euro */}
                            {inspectSitter.services && (
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <p className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 mb-2">Offered Rates (€)</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Object.entries(inspectSitter.services).map(([key, val]: any) => val?.active && (
                                            <div key={key} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                                <p className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                <p className="text-sm font-extrabold text-primary">€{val.rate}/night</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => mutation.mutate({ id: inspectSitter.id, isVerified: false })}
                                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50"
                            >
                                Reject / Revoke
                            </button>
                            <button
                                onClick={() => mutation.mutate({ id: inspectSitter.id, isVerified: true })}
                                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-glow hover:bg-primary/90"
                            >
                                Approve & Verify Sitter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

// ==========================================
// 2. Users & Sitters Directory Page
// ==========================================
export const AdminUsersPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<'all' | 'owner' | 'sitter'>('all');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const query = useQuery({
        queryKey: ['adminUsers', search, role, page],
        queryFn: () => adminService.getUsers({ search, role, page }),
    });

    return (
        <AdminShell>
            <AdminPageFrame
                title="Users & Sitters Directory"
                description="Manage all registered platform accounts, pet owners, and sitter service providers."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value as any);
                                setPage(1);
                            }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="all">All Accounts</option>
                            <option value="owner">Pet Parents Only</option>
                            <option value="sitter">Sitters Only</option>
                        </select>
                        <SearchBox
                            value={search}
                            placeholder="Search by name, email, user ID..."
                            onChange={(v) => {
                                setSearch(v);
                                setPage(1);
                            }}
                        />
                    </div>
                }
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    <AdminCard className="p-0 sm:p-0 overflow-hidden">
                        <AdminTable>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 pl-6">User</th>
                                    <th className="py-4 px-4">Email</th>
                                    <th className="py-4 px-4">Role Badges</th>
                                    <th className="py-4 px-4">Pets</th>
                                    <th className="py-4 px-4">Joined</th>
                                    <th className="py-4 pr-6 text-right">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {query.data?.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                                            No user accounts match the current search.
                                        </td>
                                    </tr>
                                ) : (
                                    query.data?.items.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-orange-100 text-primary font-bold flex items-center justify-center shrink-0">
                                                        {u.profileImage ? (
                                                            <img src={u.profileImage} alt={u.firstName} className="h-full w-full object-cover rounded-xl" />
                                                        ) : (
                                                            u.firstName?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {name(u)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">{u.email}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {u.hasSitterProfile ? (
                                                        <AdminStatus tone={u.isVerifiedSitter ? 'green' : 'orange'}>
                                                            {u.isVerifiedSitter ? 'Verified Sitter' : 'Pending Sitter'}
                                                        </AdminStatus>
                                                    ) : (
                                                        <AdminStatus tone="blue">Pet Parent</AdminStatus>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                                                {u.petsCount || 0} pet{u.petsCount === 1 ? '' : 's'}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">{date(u.createdAt)}</td>
                                            <td className="py-4 pr-6 text-right">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </AdminTable>
                        <PaginationFooter data={query.data} setPage={setPage} />
                    </AdminCard>
                </AdminState>
            </AdminPageFrame>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-orange-100 text-primary font-extrabold text-lg flex items-center justify-center">
                                    {selectedUser.firstName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                                        {name(selectedUser)}
                                    </h3>
                                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Account ID:</span>
                                    <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedUser.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Joined Date:</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{dateTime(selectedUser.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Registered Pets:</span>
                                    <span className="text-primary font-bold">{selectedUser.petsCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Sitter Status:</span>
                                    <span className="font-bold">{selectedUser.hasSitterProfile ? (selectedUser.isVerifiedSitter ? 'Verified Sitter' : 'Pending Verification') : 'None'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

// ==========================================
// 3. Payments & Financials Page
// ==========================================
export const AdminPaymentsPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

    const query = useQuery({
        queryKey: ['adminPayments', search, status, page],
        queryFn: () => adminService.getPayments({ search, status, page }),
    });

    const handleExportCSV = () => {
        if (!query.data?.items.length) return;
        const rows = [
            ['Payment ID', 'Payer Name', 'Payer Email', 'Amount (€)', 'Currency', 'Status', 'Stripe PaymentIntent', 'Created At'],
            ...query.data.items.map((p) => [
                p.id,
                name(p.owner),
                p.owner?.email || '',
                (p.amount / 100).toFixed(2),
                p.currency.toUpperCase(),
                p.status,
                p.stripePaymentIntentId || '',
                format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm'),
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `doublepaws-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminShell>
            <AdminPageFrame
                title="Payments & Revenue"
                description="Monitor Stripe payment flows, transactions, platform commissions, and refunds."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="all">All Transactions</option>
                            <option value="SUCCEEDED">Succeeded</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                        <SearchBox
                            value={search}
                            placeholder="Search by Payment ID, Intent ID, Payer..."
                            onChange={(v) => {
                                setSearch(v);
                                setPage(1);
                            }}
                        />
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                }
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    <AdminCard className="p-0 sm:p-0 overflow-hidden">
                        <AdminTable>
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 pl-6">Transaction</th>
                                    <th className="py-4 px-4">Payer</th>
                                    <th className="py-4 px-4">Amount</th>
                                    <th className="py-4 px-4">Stripe Intent ID</th>
                                    <th className="py-4 px-4">Created</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 pr-6 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {query.data?.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                                            No payment records found.
                                        </td>
                                    </tr>
                                ) : (
                                    query.data?.items.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                                                #{p.id.slice(0, 8)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{name(p.owner)}</p>
                                                <p className="text-xs text-slate-400">{p.owner?.email}</p>
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-primary text-base">
                                                €{(p.amount / 100).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 font-mono text-xs text-slate-500 truncate max-w-[140px]">
                                                {p.stripePaymentIntentId || '—'}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">{dateTime(p.createdAt)}</td>
                                            <td className="py-4 px-4">
                                                <AdminStatus tone={tone(p.status)}>{p.status}</AdminStatus>
                                            </td>
                                            <td className="py-4 pr-6 text-right">
                                                <button
                                                    onClick={() => setSelectedPayment(p)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </AdminTable>
                        <PaginationFooter data={query.data} setPage={setPage} />
                    </AdminCard>
                </AdminState>
            </AdminPageFrame>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="font-mono text-xs font-bold text-slate-400">Payment ID: {selectedPayment.id}</span>
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                                    €{(selectedPayment.amount / 100).toFixed(2)} {selectedPayment.currency.toUpperCase()}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Payer Name:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{name(selectedPayment.owner)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Payer Email:</span>
                                <span className="text-slate-900 dark:text-white">{selectedPayment.owner?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Stripe Intent:</span>
                                <span className="font-mono text-primary font-bold truncate max-w-[200px]">
                                    {selectedPayment.stripePaymentIntentId || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created:</span>
                                <span className="text-slate-700 dark:text-slate-300">{dateTime(selectedPayment.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                                <span className="text-slate-500">Payment Status:</span>
                                <AdminStatus tone={tone(selectedPayment.status)}>{selectedPayment.status}</AdminStatus>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedPayment(null)}
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

// ==========================================
// 4. Reports & Analytics Page
// ==========================================
export const AdminReportsPage: React.FC = () => {
    const [period, setPeriod] = useState('30d');
    const query = useQuery({
        queryKey: ['adminReports', period],
        queryFn: () => adminService.getReports(period),
    });

    const handleExportCSV = () => {
        if (!query.data) return;
        const rows = [
            ['Report Dimension', 'Value'],
            ['Generated At', query.data.generatedAt],
            ['Period', query.data.period],
            ['Total Users', query.data.metrics.totalUsers],
            ['Total Sitters', query.data.metrics.totalSitters],
            ['Total Bookings', query.data.metrics.bookingCount],
            ['Gross Volume (€)', query.data.metrics.grossRevenue],
            ['Average Booking Value (€)', query.data.metrics.averageBookingValue.toFixed(2)],
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `doublepaws-analytics-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminShell>
            <AdminPageFrame
                title="Marketplace Reports & Analytics"
                description="Deep-dive reports on revenue growth, service adoption, and user acquisition."
                action={
                    <div className="flex items-center gap-2">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="year">This Year</option>
                        </select>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Report</span>
                        </button>
                    </div>
                }
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    {query.data && (
                        <div className="space-y-6">
                            {/* Summary 4-Col Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <AdminCard>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                                        {query.data.metrics.totalUsers}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">registered marketplace accounts</p>
                                </AdminCard>

                                <AdminCard>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sitters</p>
                                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                                        {query.data.metrics.totalSitters}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">service providers on platform</p>
                                </AdminCard>

                                <AdminCard>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Volume</p>
                                    <p className="mt-2 font-display text-3xl font-extrabold text-primary">
                                        €{query.data.metrics.grossRevenue.toFixed(0)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">{query.data.metrics.bookingCount} bookings in period</p>
                                </AdminCard>

                                <AdminCard>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Booking Value</p>
                                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                                        €{query.data.metrics.averageBookingValue.toFixed(0)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">per completed transaction</p>
                                </AdminCard>
                            </div>

                            {/* Service Volume Breakdown */}
                            <AdminCard>
                                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
                                    Service Breakdown & Revenue Distribution
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(query.data.serviceBreakdown || {}).map(([service, stat]) => (
                                        <div
                                            key={service}
                                            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 capitalize">
                                                {service.replace('-', ' ')}
                                            </p>
                                            <p className="mt-2 font-display text-xl font-extrabold text-primary">
                                                €{stat.volume.toFixed(0)}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">{stat.count} bookings</p>
                                        </div>
                                    ))}
                                </div>
                            </AdminCard>
                        </div>
                    )}
                </AdminState>
            </AdminPageFrame>
        </AdminShell>
    );
};

// ==========================================
// 5. System Settings & Diagnostics Page
// ==========================================
export const AdminSettingsPage: React.FC = () => {
    const query = useQuery({
        queryKey: ['adminSettings'],
        queryFn: adminService.getSettings,
    });

    return (
        <AdminShell>
            <AdminPageFrame
                title="System Settings & Diagnostics"
                description="Monitor production infrastructure, payment gateways, OAuth providers, and operational configuration."
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    {query.data && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Database Health Card */}
                            <AdminCard className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Database & Node Infrastructure</h3>
                                        <p className="text-xs text-slate-400">PostgreSQL Connection Engine</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Database Status:</span>
                                        <AdminStatus tone="green">{query.data.database.status.toUpperCase()}</AdminStatus>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Engine Type:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{query.data.database.type}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Runtime:</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{query.data.system.nodeVersion} ({query.data.system.platform})</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Server Uptime:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{Math.floor(query.data.system.uptime / 60)} minutes</span>
                                    </div>
                                </div>
                            </AdminCard>

                            {/* Payments & Integrations Card */}
                            <AdminCard className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Stripe & Financial Engine</h3>
                                        <p className="text-xs text-slate-400">Marketplace payouts & payment intents</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Stripe Payments:</span>
                                        <AdminStatus tone={query.data.payments.enabled ? 'green' : 'orange'}>
                                            {query.data.payments.enabled ? 'Active / Configured' : 'Not Configured'}
                                        </AdminStatus>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Default Currency:</span>
                                        <span className="font-bold text-primary">{query.data.payments.currency} (€ Euro)</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Stripe Connect Payouts:</span>
                                        <AdminStatus tone={query.data.payments.connectEnabled ? 'green' : 'blue'}>
                                            {query.data.payments.connectEnabled ? 'Enabled' : 'Ready'}
                                        </AdminStatus>
                                    </div>
                                </div>
                            </AdminCard>

                            {/* Authentication & Social Logins */}
                            <AdminCard className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Authentication Providers</h3>
                                        <p className="text-xs text-slate-400">OAuth single sign-on integrations</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Google OAuth 2.0:</span>
                                        <AdminStatus tone={query.data.authentication.googleLogin ? 'green' : 'orange'}>
                                            {query.data.authentication.googleLogin ? 'Active' : 'Unset'}
                                        </AdminStatus>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Facebook Login:</span>
                                        <AdminStatus tone={query.data.authentication.facebookLogin ? 'green' : 'orange'}>
                                            {query.data.authentication.facebookLogin ? 'Active' : 'Unset'}
                                        </AdminStatus>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Apple Sign-In:</span>
                                        <AdminStatus tone={query.data.authentication.appleLogin ? 'green' : 'orange'}>
                                            {query.data.authentication.appleLogin ? 'Active' : 'Unset'}
                                        </AdminStatus>
                                    </div>
                                </div>
                            </AdminCard>

                            {/* Transactional Email Card */}
                            <AdminCard className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Transactional Email Delivery</h3>
                                        <p className="text-xs text-slate-400">Notifications & booking confirmations</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Email Gateway:</span>
                                        <AdminStatus tone={query.data.email.configured ? 'green' : 'orange'}>
                                            {query.data.email.configured ? 'Active' : 'Mock/Dev Mode'}
                                        </AdminStatus>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Sender Address:</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{query.data.email.sender}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">App URL Origin:</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{query.data.email.appUrl}</span>
                                    </div>
                                </div>
                            </AdminCard>
                        </div>
                    )}
                </AdminState>
            </AdminPageFrame>
        </AdminShell>
    );
};

// ==========================================
// 6. Audit Log Page
// ==========================================
export const AdminAuditPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState<AdminAuditEvent | null>(null);

    const query = useQuery({
        queryKey: ['adminAudit', search, type, page],
        queryFn: () => adminService.getAudit({ search, type, page }),
    });

    const handleExportCSV = () => {
        if (!query.data?.items.length) return;
        const rows = [
            ['Event Type', 'Description', 'Actor', 'Timestamp'],
            ...query.data.items.map((e) => [
                e.type,
                e.label,
                e.actor || 'System',
                format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm:ss'),
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `doublepaws-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminShell>
            <AdminPageFrame
                title="Platform Audit Log"
                description="Chronological audit records of all user actions, booking modifications, and administrative decisions."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="all">All Event Types</option>
                            <option value="booking">Bookings</option>
                            <option value="verification">Verification</option>
                            <option value="user">User Signups</option>
                            <option value="payment">Payments</option>
                            <option value="review">Reviews</option>
                        </select>
                        <SearchBox
                            value={search}
                            placeholder="Search audit trail..."
                            onChange={(v) => {
                                setSearch(v);
                                setPage(1);
                            }}
                        />
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                }
            >
                <AdminState loading={query.isLoading} error={query.isError}>
                    <AdminCard className="p-0 sm:p-0 overflow-hidden">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {query.data?.items.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    No audit events found.
                                </div>
                            ) : (
                                query.data?.items.map((e, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedEvent(e)}
                                        className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <span className={cn(
                                                'h-2.5 w-2.5 rounded-full shrink-0',
                                                e.type === 'booking' ? 'bg-orange-500' :
                                                e.type === 'verification' ? 'bg-emerald-500' :
                                                e.type === 'payment' ? 'bg-sky-500' :
                                                e.type === 'review' ? 'bg-amber-500' :
                                                'bg-purple-500'
                                            )} />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {e.label}
                                                </p>
                                                <p className="text-[11px] text-slate-400">Actor: {e.actor || 'System'} • Type: {e.type.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0 pl-3">
                                            {dateTime(e.createdAt)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <PaginationFooter data={query.data} setPage={setPage} />
                    </AdminCard>
                </AdminState>
            </AdminPageFrame>

            {/* Audit Event Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-primary">Audit Record</span>
                                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                                    {selectedEvent.type.toUpperCase()} Event
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div>
                                <span className="text-slate-400 uppercase text-[10px] font-bold">Event Description:</span>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedEvent.label}</p>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                <span className="text-slate-500">Actor / Initiator:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.actor || 'System'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Recorded At:</span>
                                <span className="text-slate-700 dark:text-slate-300">{dateTime(selectedEvent.createdAt)}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PaymentModal } from './PaymentModal';
import { paymentService } from '../../services/payment.service';

interface PayButtonProps {
    bookingId: string;
    amountLabel?: string;
}

/**
 * Shows "Pay" for a completed-but-unpaid booking, or a "Paid" badge once
 * settled. Fetches its own status so booking lists don't need extra plumbing.
 */
export const PayButton: React.FC<PayButtonProps> = ({ bookingId, amountLabel }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['payment', bookingId],
        queryFn: () => paymentService.getForBooking(bookingId),
        // Payments are enabled per-environment; a failure here shouldn't spam retries.
        retry: false,
        // Stripe confirms in the browser first; the signed webhook updates our DB
        // shortly afterwards. Poll only while that server-side status is pending.
        refetchInterval: (query) => query.state.data?.status === 'PENDING' ? 2000 : false,
    });

    if (isLoading) return null;

    if (data?.status === 'SUCCEEDED') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                <CheckCircle className="w-3 h-3" />
                {t('payment.paid')}
            </span>
        );
    }

    if (data?.status === 'PENDING') {
        return (
            <Button size="sm" disabled className="cursor-wait bg-amber-500 text-white hover:bg-amber-500">
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {t('payment.processing')}
            </Button>
        );
    }

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                {t('payment.pay')}
            </Button>

            <PaymentModal
                isOpen={open}
                onClose={() => setOpen(false)}
                bookingId={bookingId}
                amountLabel={amountLabel}
                onPaid={() => {
                    setOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['payment', bookingId] });
                    queryClient.invalidateQueries({ queryKey: ['myBookings'] });
                }}
            />
        </>
    );
};

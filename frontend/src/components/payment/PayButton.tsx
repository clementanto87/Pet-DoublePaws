import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { PaymentModal } from './PaymentModal';
import { paymentService } from '../../services/payment.service';

interface PayButtonProps {
    bookingId: string;
    amountLabel?: string;
}

/**
 * Shows "Pay" for an accepted booking, or a "Paid · Escrow" badge once
 * payment is secured. Funds are safely held until mutual completion.
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
    });

    if (isLoading) return null;

    if (data?.status === 'SUCCEEDED') {
        return (
            <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide border border-emerald-300/80 dark:border-emerald-700 shadow-2xs"
                title={t('payment.escrowNote', 'Funds safely held in escrow until completion')}
            >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('payment.paidSecured', 'Paid · Escrow')}
            </span>
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

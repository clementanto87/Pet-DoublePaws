import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { paymentService, type PaymentConfig } from '../../services/payment.service';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    /** Human-readable amount for the header, e.g. "$45". */
    amountLabel?: string;
    onPaid?: () => void;
}

/** Cache the Stripe.js promise per publishable key — loadStripe should run once. */
const stripePromiseCache = new Map<string, Promise<Stripe | null>>();
const getStripePromise = (key: string) => {
    if (!stripePromiseCache.has(key)) {
        stripePromiseCache.set(key, loadStripe(key));
    }
    return stripePromiseCache.get(key)!;
};

/** The actual card form — must be rendered inside <Elements>. */
const CheckoutForm: React.FC<{ onPaid?: () => void; onClose: () => void }> = ({ onPaid, onClose }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError(null);

        // redirect: 'if_required' keeps the user in the app for card payments,
        // while still supporting methods that must redirect (e.g. iDEAL).
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (stripeError) {
            setError(stripeError.message ?? t('payment.genericError'));
            setSubmitting(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_capture') {
            setSucceeded(true);
            // The webhook is the source of truth for our DB; give it a moment,
            // then let the parent refetch.
            setTimeout(() => onPaid?.(), 1200);
        } else {
            setError(t('payment.notCompleted'));
        }
        setSubmitting(false);
    };

    if (succeeded) {
        return (
            <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('payment.successTitle')}</h3>
                <p className="text-sm text-gray-500 mb-6">{t('payment.successDesc')}</p>
                <Button onClick={onClose} className="w-full">{t('payment.done')}</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <PaymentElement />

            {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5" />
                {t('payment.secureNote')}
            </div>

            <Button type="submit" disabled={!stripe || submitting} className="w-full h-12">
                {submitting ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('payment.processing')}
                    </span>
                ) : (
                    t('payment.payNow')
                )}
            </Button>
        </form>
    );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingId, amountLabel, onPaid }) => {
    const { t } = useTranslation();
    const [config, setConfig] = useState<PaymentConfig | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setClientSecret(null);
            setError(null);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const cfg = await paymentService.getConfig();
                if (cancelled) return;
                setConfig(cfg);

                if (!cfg.enabled || !cfg.publishableKey) {
                    setError(t('payment.notConfigured'));
                    return;
                }

                const intent = await paymentService.createIntent(bookingId);
                if (cancelled) return;
                setClientSecret(intent.clientSecret);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || t('payment.genericError'));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isOpen, bookingId, t]);

    const stripePromise = useMemo(
        () => (config?.publishableKey ? getStripePromise(config.publishableKey) : null),
        [config?.publishableKey]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={amountLabel ? `${t('payment.title')} · ${amountLabel}` : t('payment.title')}
        >
            {config?.testMode && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {t('payment.testModeBadge')}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        {t('payment.testCardHint')}
                    </p>
                </div>
            )}

            {loading && (
                <div className="py-10 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}

            {!loading && error && (
                <div className="py-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">{error}</p>
                    <Button variant="outline" onClick={onClose} className="w-full">{t('payment.close')}</Button>
                </div>
            )}

            {!loading && !error && clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm onPaid={onPaid} onClose={onClose} />
                </Elements>
            )}
        </Modal>
    );
};

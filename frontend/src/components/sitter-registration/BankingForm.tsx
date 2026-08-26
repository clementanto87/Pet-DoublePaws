import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, CheckCircle, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { sitterService } from '../../services/sitter.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '../ui/Toast';

const BankingForm: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { data: payoutStatus, isLoading } = useQuery({ queryKey: ['payoutStatus'], queryFn: sitterService.getPayoutStatus, retry: false });
    const onboardingMutation = useMutation({
        mutationFn: sitterService.startPayoutOnboarding,
        onSuccess: ({ url }) => { window.location.href = url; },
        onError: () => showToast('Secure payout onboarding is currently unavailable.', 'error'),
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">{t('sitterRegistration.forms.banking.heading')}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('sitterRegistration.forms.banking.secure')}
                </p>
            </div>

            <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
                    <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{t('sitterRegistration.forms.banking.secureTitle')}</p><p className="mt-1">{t('sitterRegistration.forms.banking.secureDescription')}</p></div></div>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-foreground">{payoutStatus?.payoutsEnabled ? t('sitterRegistration.forms.banking.connected') : t('sitterRegistration.forms.banking.connectTitle')}</p><p className="mt-1 text-sm text-muted-foreground">{isLoading ? t('sitterRegistration.forms.banking.checking') : payoutStatus?.payoutsEnabled ? t('sitterRegistration.forms.banking.connectedDescription') : t('sitterRegistration.forms.banking.connectDescription')}</p></div>
                    {payoutStatus?.payoutsEnabled ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <Button type="button" onClick={() => onboardingMutation.mutate()} disabled={onboardingMutation.isPending}><ArrowUpRight className="mr-2 h-4 w-4" />{onboardingMutation.isPending ? t('sitterRegistration.forms.banking.opening') : t('sitterRegistration.forms.banking.connectButton')}</Button>}
                </div>
                <p className="text-xs text-muted-foreground">{t('sitterRegistration.forms.banking.providerNote')}</p>
            </div>
        </div>
    );
};

export default BankingForm;

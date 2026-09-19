import React, { useEffect, useState } from 'react';
import { Settings2, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

const STORAGE_KEY = 'double-paws-cookie-consent';

type Consent = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
};

const saveConsent = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: consent }));
};

const CookieConsent: React.FC = () => {
    const { t } = useTranslation();
    const [consent, setConsent] = useState<Consent | null>(null);
    const [showPreferences, setShowPreferences] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setConsent(JSON.parse(stored));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    if (consent) return null;

    const acceptAll = () => {
        const next = { necessary: true as const, analytics: true, marketing: true };
        saveConsent(next);
        setConsent(next);
    };

    const rejectOptional = () => {
        const next = { necessary: true as const, analytics: false, marketing: false };
        saveConsent(next);
        setConsent(next);
    };

    const savePreferences = () => {
        const next = { necessary: true as const, analytics, marketing };
        saveConsent(next);
        setConsent(next);
    };

    return (
        <aside
            role="dialog"
            aria-label={t('cookieConsent.title')}
            className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:inset-x-6 sm:p-5"
        >
            <div className="flex items-start gap-3">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300 sm:flex">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">{t('cookieConsent.title')}</h2>
                        <button type="button" onClick={rejectOptional} aria-label={t('cookieConsent.reject')} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{t('cookieConsent.description')}</p>
                    {showPreferences && (
                        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700 sm:grid-cols-3">
                            <label className="flex items-start gap-3 sm:col-span-3">
                                <input type="checkbox" checked disabled className="mt-1 accent-orange-500" />
                                <span><strong>{t('cookieConsent.necessaryTitle')}</strong><span className="block text-xs text-slate-500">{t('cookieConsent.necessaryDescription')}</span></span>
                            </label>
                            <label className="flex items-start gap-3">
                                <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1 accent-orange-500" />
                                <span><strong>{t('cookieConsent.analyticsTitle')}</strong><span className="block text-xs text-slate-500">{t('cookieConsent.analyticsDescription')}</span></span>
                            </label>
                            <label className="flex items-start gap-3">
                                <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} className="mt-1 accent-orange-500" />
                                <span><strong>{t('cookieConsent.marketingTitle')}</strong><span className="block text-xs text-slate-500">{t('cookieConsent.marketingDescription')}</span></span>
                            </label>
                        </div>
                    )}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreferences((open) => !open)}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            {t('cookieConsent.preferences')}
                        </Button>
                        {showPreferences && <Button type="button" variant="outline" size="sm" onClick={savePreferences}>{t('cookieConsent.save')}</Button>}
                        <Button type="button" variant="outline" size="sm" onClick={rejectOptional}>{t('cookieConsent.reject')}</Button>
                        <Button type="button" size="sm" onClick={acceptAll}>{t('cookieConsent.acceptAll')}</Button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CookieConsent;

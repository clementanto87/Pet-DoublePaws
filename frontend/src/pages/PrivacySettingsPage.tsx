import React, { useState } from 'react';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { privacyService } from '../services/privacy.service';

const PrivacySettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [busy, setBusy] = useState(false);

    const exportData = async () => {
        setBusy(true);
        try {
            const data = await privacyService.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `double-paws-data-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast(t('privacySettings.exportError'), 'error');
        } finally {
            setBusy(false);
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm(t('privacySettings.deleteConfirm'))) return;
        setBusy(true);
        try {
            await privacyService.deleteAccount();
            logout();
            navigate('/', { replace: true });
        } catch {
            showToast(t('privacySettings.deleteError'), 'error');
            setBusy(false);
        }
    };

    return <main className="min-h-[70vh] bg-slate-50 px-4 py-10 dark:bg-slate-950"><div className="mx-auto max-w-3xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">{t('privacySettings.eyebrow')}</p><h1 className="mt-2 text-3xl font-display font-bold text-slate-950 dark:text-white">{t('privacySettings.title')}</h1><p className="mt-2 text-slate-500">{t('privacySettings.subtitle')}</p></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" />{t('privacySettings.dataTitle')}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('privacySettings.dataDescription')}</p><Button variant="outline" onClick={exportData} disabled={busy}><Download className="mr-2 h-4 w-4" />{t('privacySettings.export')}</Button></CardContent></Card><Card className="border-red-200 dark:border-red-900/40"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300"><Trash2 className="h-5 w-5" />{t('privacySettings.deleteTitle')}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('privacySettings.deleteDescription')}</p><Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30" onClick={deleteAccount} disabled={busy}>{t('privacySettings.delete')}</Button></CardContent></Card></div></main>;
};

export default PrivacySettingsPage;

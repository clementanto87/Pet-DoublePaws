import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Lock } from 'lucide-react';

const BankingForm: React.FC = () => {
    const { t } = useTranslation();
    const { data, updateNestedData } = useSitterRegistration();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateNestedData('bankDetails', id, value);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">{t('sitterRegistration.forms.banking.heading')}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('sitterRegistration.forms.banking.secure')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="accountHolderName">{t('sitterRegistration.forms.banking.accountHolder')}</Label>
                    <Input
                        id="accountHolderName"
                        placeholder={t('sitterRegistration.forms.banking.accountHolderPlaceholder')}
                        value={data.bankDetails.accountHolderName}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bankName">{t('sitterRegistration.forms.banking.bankName')}</Label>
                    <Input
                        id="bankName"
                        placeholder={t('sitterRegistration.forms.banking.bankNamePlaceholder')}
                        value={data.bankDetails.bankName}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="routingNumber">{t('sitterRegistration.forms.banking.routingNumber')}</Label>
                        <Input
                            id="routingNumber"
                            type="password"
                            placeholder={t('sitterRegistration.forms.banking.routingPlaceholder')}
                            maxLength={9}
                            value={data.bankDetails.routingNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">{t('sitterRegistration.forms.banking.accountNumber')}</Label>
                        <Input
                            id="accountNumber"
                            type="password"
                            placeholder={t('sitterRegistration.forms.banking.accountNumberPlaceholder')}
                            value={data.bankDetails.accountNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p>
                        <strong>{t('sitterRegistration.forms.banking.noteLabel')}</strong> {t('sitterRegistration.forms.banking.note').replace(/^[^:]*:\s*/, '')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BankingForm;

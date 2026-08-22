import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Label } from '../ui/Label';

const HousingForm: React.FC = () => {
    const { t } = useTranslation();
    const { data, updateData } = useSitterRegistration();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">{t('sitterRegistration.forms.housing.heading')}</h2>
                <p className="text-muted-foreground text-sm">
                    {t('sitterRegistration.forms.housing.subtitle')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="homeType">{t('sitterRegistration.forms.housing.homeType')}</Label>
                    <select
                        id="homeType"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={data.homeType}
                        onChange={(e) => updateData('homeType', e.target.value)}
                    >
                        <option value="House">{t('sitterRegistration.forms.housing.house')}</option>
                        <option value="Apartment">{t('sitterRegistration.forms.housing.apartment')}</option>
                        <option value="Condo">{t('sitterRegistration.forms.housing.condo')}</option>
                        <option value="Farm">{t('sitterRegistration.forms.housing.farm')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="outdoorSpace">{t('sitterRegistration.forms.housing.outdoorSpace')}</Label>
                    <select
                        id="outdoorSpace"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={data.outdoorSpace}
                        onChange={(e) => updateData('outdoorSpace', e.target.value)}
                    >
                        <option value="Fenced Yard">{t('sitterRegistration.forms.housing.fencedYard')}</option>
                        <option value="Unfenced Yard">{t('sitterRegistration.forms.housing.unfencedYard')}</option>
                        <option value="No Yard">{t('sitterRegistration.forms.housing.noYard')}</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2">
                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">{t('sitterRegistration.forms.housing.children')}</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.hasChildren}
                            onChange={(e) => updateData('hasChildren', e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">{t('sitterRegistration.forms.housing.otherPets')}</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.hasOtherPets}
                            onChange={(e) => updateData('hasOtherPets', e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">{t('sitterRegistration.forms.housing.nonSmoking')}</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.isNonSmoking}
                            onChange={(e) => updateData('isNonSmoking', e.target.checked)}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default HousingForm;

import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import type { ServiceRate } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card } from '../ui/Card';

const ServiceProfileForm: React.FC = () => {
    const { data, updateNestedData, updateData } = useSitterRegistration();

    const handleServiceToggle = (serviceKey: string, checked: boolean) => {
        const currentService = data.services[serviceKey as keyof typeof data.services];
        updateNestedData('services', serviceKey, { ...currentService, active: checked });
    };

    const handleRateChange = (serviceKey: string, field: keyof ServiceRate, value: string) => {
        const currentService = data.services[serviceKey as keyof typeof data.services];
        updateNestedData('services', serviceKey, { ...currentService, [field]: parseFloat(value) || 0 });
    };

    const servicesList = [
        { key: 'boarding', label: 'Boarding', desc: 'In your home' },
        { key: 'houseSitting', label: 'House Sitting', desc: 'In owner\'s home' },
        { key: 'dropInVisits', label: 'Drop-In Visits', desc: 'Visits to feed/play' },
        { key: 'doggyDayCare', label: 'Doggy Day Care', desc: 'Daytime care in your home' },
        { key: 'dogWalking', label: 'Dog Walking', desc: 'Walks around the neighborhood' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Service Profile</h2>
                <p className="text-muted-foreground text-sm">
                    Select the services you want to offer and set your rates.
                </p>
            </div>

            <div className="space-y-4">
                {servicesList.map((service) => {
                    const serviceData = data.services[service.key as keyof typeof data.services];
                    return (
                        <Card key={service.key} className={`p-4 border transition-all ${serviceData.active ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={serviceData.active}
                                    onChange={(e) => handleServiceToggle(service.key, e.target.checked)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{service.label}</h3>
                                            <p className="text-sm text-muted-foreground">{service.desc}</p>
                                        </div>
                                    </div>

                                    {serviceData.active && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 animate-slide-down">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Base Rate ($)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={serviceData.rate}
                                                    onChange={(e) => handleRateChange(service.key, 'rate', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Holiday Rate ($)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={serviceData.holidayRate || ''}
                                                    placeholder={(serviceData.rate * 1.5).toFixed(0)}
                                                    onChange={(e) => handleRateChange(service.key, 'holidayRate', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}

                <div className="pt-4 border-t border-border">
                    <Label htmlFor="radius">Service Radius (miles)</Label>
                    <div className="flex items-center gap-4 mt-2">
                        <Input
                            id="radius"
                            type="range"
                            min="1"
                            max="50"
                            value={data.serviceRadius}
                            onChange={(e) => updateData('serviceRadius', parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="font-bold w-12 text-center">{data.serviceRadius} mi</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceProfileForm;

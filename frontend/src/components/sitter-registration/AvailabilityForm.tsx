import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Label } from '../ui/Label';

const AvailabilityForm: React.FC = () => {
    const { data, updateData, updateNestedData } = useSitterRegistration();

    const toggleGeneralAvailability = (day: string) => {
        const current = data.availability.general;
        const newGeneral = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        updateNestedData('availability', 'general', newGeneral);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Availability</h2>
                <p className="text-muted-foreground text-sm">
                    Set your general schedule. You can manage specific dates in your calendar later.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-base font-semibold">General Availability</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Weekdays', 'Weekends', 'Holidays', 'Full-Time'].map(item => (
                            <label key={item} className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${data.availability.general.includes(item) ? 'border-primary bg-primary/5 text-primary font-bold' : 'hover:bg-muted/50'}`}>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={data.availability.general.includes(item)}
                                    onChange={() => toggleGeneralAvailability(item)}
                                />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="noticePeriod">Advance Notice Required</Label>
                    <select
                        id="noticePeriod"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={data.noticePeriod}
                        onChange={(e) => updateData('noticePeriod', e.target.value)}
                    >
                        <option value="Same Day">Same Day</option>
                        <option value="1 day">1 day</option>
                        <option value="2 days">2 days</option>
                        <option value="3 days">3 days</option>
                        <option value="1 week">1 week</option>
                        <option value="2 weeks">2 weeks</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityForm;

import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Label } from '../ui/Label';

const PreferencesForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();

    const toggleArrayItem = (field: 'acceptedPetTypes' | 'acceptedPetSizes' | 'behavioralRestrictions', value: string) => {
        const currentArray = data[field];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateData(field, newArray);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Preferences & Limitations</h2>
                <p className="text-muted-foreground text-sm">
                    Set your boundaries to ensure you only get requests that match your comfort level.
                </p>
            </div>

            {/* Pet Types */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Accepted Pet Types</Label>
                <div className="grid grid-cols-2 gap-3">
                    {['Dog', 'Cat', 'Bird', 'Small Animal', 'Reptile'].map(type => (
                        <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={data.acceptedPetTypes.includes(type)}
                                onChange={() => toggleArrayItem('acceptedPetTypes', type)}
                            />
                            <span>{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pet Sizes */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Accepted Pet Sizes (Dogs)</Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Small (0-15 lbs)', value: 'Small' },
                        { label: 'Medium (16-40 lbs)', value: 'Medium' },
                        { label: 'Large (41-100 lbs)', value: 'Large' },
                        { label: 'Giant (101+ lbs)', value: 'Giant' },
                    ].map(size => (
                        <label key={size.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={data.acceptedPetSizes.includes(size.value)}
                                onChange={() => toggleArrayItem('acceptedPetSizes', size.value)}
                            />
                            <span>{size.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Other Restrictions */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Other Preferences</Label>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.isNeuteredOnly}
                            onChange={(e) => updateData('isNeuteredOnly', e.target.checked)}
                        />
                        <span>I only accept neutered/spayed pets</span>
                    </label>

                    <div className="pt-2">
                        <Label className="mb-2 block">Behavioral Comfort (Check if comfortable)</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {['Puppies (< 1 year)', 'Senior Dogs', 'Separation Anxiety', 'Oral Medication', 'Injected Medication'].map(item => (
                                <label key={item} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={data.behavioralRestrictions.includes(item)} // Reusing this field for "Comfortable With" for simplicity, or we can rename
                                        onChange={() => toggleArrayItem('behavioralRestrictions', item)}
                                    />
                                    <span className="text-sm">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferencesForm;

import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Label } from '../ui/Label';

const HousingForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Housing & Environment</h2>
                <p className="text-muted-foreground text-sm">
                    Important for Boarding and Day Care. Help owners visualize where their pet will stay.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="homeType">Home Type</Label>
                    <select
                        id="homeType"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={data.homeType}
                        onChange={(e) => updateData('homeType', e.target.value)}
                    >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Farm">Farm</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="outdoorSpace">Outdoor Space</Label>
                    <select
                        id="outdoorSpace"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={data.outdoorSpace}
                        onChange={(e) => updateData('outdoorSpace', e.target.value)}
                    >
                        <option value="Fenced Yard">Fenced Yard</option>
                        <option value="Unfenced Yard">Unfenced Yard</option>
                        <option value="No Yard">No Yard</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2">
                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">Children in home?</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.hasChildren}
                            onChange={(e) => updateData('hasChildren', e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">Other pets in home?</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={data.hasOtherPets}
                            onChange={(e) => updateData('hasOtherPets', e.target.checked)}
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="font-medium">Non-smoking home?</span>
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

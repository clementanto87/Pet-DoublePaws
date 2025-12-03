import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const ExperienceForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();

    const toggleArrayItem = (field: 'skills' | 'certifications', value: string) => {
        const currentArray = data[field];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateData(field, newArray);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Experience & Skills</h2>
                <p className="text-muted-foreground text-sm">
                    Showcase your expertise to build trust with pet owners.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        value={data.yearsExperience}
                        onChange={(e) => updateData('yearsExperience', parseInt(e.target.value))}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Special Skills</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['Oral Medication', 'Injected Medication', 'Senior Dog Experience', 'Puppy Training', 'Special Needs Care'].map(skill => (
                            <label key={skill} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={data.skills.includes(skill)}
                                    onChange={() => toggleArrayItem('skills', skill)}
                                />
                                <span className="text-sm">{skill}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Certifications</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['Pet CPR', 'First Aid', 'Professional Dog Trainer', 'Vet Tech'].map(cert => (
                            <label key={cert} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={data.certifications.includes(cert)}
                                    onChange={() => toggleArrayItem('certifications', cert)}
                                />
                                <span className="text-sm">{cert}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                        id="headline"
                        placeholder="e.g. Loving Pet Sitter with 5 Years Experience"
                        maxLength={100}
                        value={data.headline}
                        onChange={(e) => updateData('headline', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground text-right">{data.headline.length}/100</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                        id="bio"
                        className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="Tell owners about yourself, your experience with pets, and why you love what you do."
                        value={data.bio}
                        onChange={(e) => updateData('bio', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExperienceForm;

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import {
    ArrowLeft,
    Info,
    Plus,
    Minus,
    Dog,
    Cat,
    HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BoardingSettingsProps {
    onBack: () => void;
}

const BoardingSettings: React.FC<BoardingSettingsProps> = ({ onBack }) => {
    const [baseRate, setBaseRate] = useState('27');
    const [homeFullTime, setHomeFullTime] = useState<boolean | null>(null);
    const [pottyBreakFreq, setPottyBreakFreq] = useState<string>('');
    const [advanceNotice, setAdvanceNotice] = useState<string>('');
    const [petsPerDay, setPetsPerDay] = useState(1);
    const [cancellationPolicy, setCancellationPolicy] = useState('Three Day');

    const [petTypes, setPetTypes] = useState({
        smallDog: true,
        mediumDog: true,
        largeDog: false,
        giantDog: false,
        cat: false
    });

    const [homeType, setHomeType] = useState('House');
    const [yardType, setYardType] = useState('Fenced yard');

    const [homeExpectations, setHomeExpectations] = useState({
        smoking: false,
        children05: false,
        children612: false,
        dogsOnFurniture: false,
        dogsOnBed: false,
        catsInHome: false,
        cagedPets: false,
        none: false
    });

    const [hostCapabilities, setHostCapabilities] = useState({
        differentFamilies: true,
        puppies: false,
        notCrateTrained: false,
        unneutered: false,
        unspayed: false,
        femalesInHeat: false,
        none: false
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [availableDays, setAvailableDays] = useState<string[]>(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    const toggleDay = (day: string) => {
        if (availableDays.includes(day)) {
            setAvailableDays(availableDays.filter(d => d !== day));
        } else {
            setAvailableDays([...availableDays, day]);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-slide-up pb-20">
            <Button
                variant="ghost"
                onClick={onBack}
                className="mb-6 hover:bg-transparent hover:text-primary pl-0"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Service Setup
            </Button>

            <h1 className="text-3xl font-display font-bold mb-8">Boarding Settings</h1>

            <div className="bg-muted/30 p-4 rounded-xl flex gap-3 mb-10 border border-border/50">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                    We have suggested some default settings based on what works well for new sitters and walkers. You can edit now, or at any time in the future.
                </p>
            </div>

            <div className="space-y-12">
                {/* Rates */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">Rates</h2>
                        <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
                    </div>

                    <div className="space-y-2">
                        <Label>Set your base rate</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    value={baseRate}
                                    onChange={(e) => setBaseRate(e.target.value)}
                                    className="pl-8 text-right pr-4"
                                />
                            </div>
                            <span className="text-muted-foreground">/ night</span>
                        </div>
                        <p className="text-sm text-muted-foreground">What you'll earn per service: ${(parseFloat(baseRate || '0') * 0.8).toFixed(2)}</p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox id="additional-rates" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="additional-rates"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Update my additional rates based on my base rate
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Turn off to adjust your rates manually
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-900/50">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Review your short notice rate</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                This rate is set at $0 and applies to new bookings. It won't affect your locked rates.
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full rounded-xl py-6 border-border/50">
                        Show additional rates
                    </Button>
                </section>

                <hr className="border-border/50" />

                {/* Availability */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">Availability</h2>
                        <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">Are you home full-time during the week?</h3>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                    homeFullTime === true ? "border-primary" : "border-input"
                                )}>
                                    {homeFullTime === true && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <input type="radio" className="hidden" checked={homeFullTime === true} onChange={() => setHomeFullTime(true)} />
                                <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                    homeFullTime === false ? "border-primary" : "border-input"
                                )}>
                                    {homeFullTime === false && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <input type="radio" className="hidden" checked={homeFullTime === false} onChange={() => setHomeFullTime(false)} />
                                <span>No</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">What days of the week will you typically be available for Boarding?</h3>
                        <p className="text-sm text-muted-foreground">This will update your generic availability. You can edit any date individually by going to your calendar.</p>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border transition-all",
                                        availableDays.includes(day)
                                            ? "bg-primary text-white border-primary shadow-md"
                                            : "bg-background border-input hover:border-primary/50"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">How frequently can you provide potty breaks?</h3>
                        <div className="space-y-3">
                            {['0-2 hours', '2-4 hours', '4-8 hours', '8+ hours'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                        pottyBreakFreq === option ? "border-primary" : "border-input"
                                    )}>
                                        {pottyBreakFreq === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={pottyBreakFreq === option} onChange={() => setPottyBreakFreq(option)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
                            <h3 className="font-bold text-primary">How will advance notice be used?</h3>
                        </div>
                        <h3 className="font-bold">How far in advance do you need new clients to reach out to you before a booking?</h3>
                        <Select value={advanceNotice} onChange={(e) => setAdvanceNotice(e.target.value)}>
                            <option value="">Select the time you need</option>
                            <option value="1">1 day</option>
                            <option value="2">2 days</option>
                            <option value="3">3 days</option>
                            <option value="7">1 week</option>
                        </Select>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Pet Preferences */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">Pet preferences</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
                        <h3 className="font-bold text-primary">How should I set preferences?</h3>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">How many pets per day can you host in your home?</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setPetsPerDay(Math.max(1, petsPerDay - 1))}
                                className="w-10 h-10 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold w-8 text-center">{petsPerDay}</span>
                            <button
                                onClick={() => setPetsPerDay(petsPerDay + 1)}
                                className="w-10 h-10 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">What type of pets can you host in your home?</h3>
                        <p className="text-sm text-muted-foreground">(Check all that apply)</p>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={petTypes.smallDog}
                                    onCheckedChange={(checked) => setPetTypes({ ...petTypes, smallDog: checked })}
                                />
                                <Dog className="w-5 h-5 text-muted-foreground" />
                                <span>Small dog (0-15 lbs)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={petTypes.mediumDog}
                                    onCheckedChange={(checked) => setPetTypes({ ...petTypes, mediumDog: checked })}
                                />
                                <Dog className="w-5 h-5 text-muted-foreground" />
                                <span>Medium dog (16-40 lbs)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={petTypes.largeDog}
                                    onCheckedChange={(checked) => setPetTypes({ ...petTypes, largeDog: checked })}
                                />
                                <Dog className="w-5 h-5 text-muted-foreground" />
                                <span>Large dog (41-100 lbs)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={petTypes.giantDog}
                                    onCheckedChange={(checked) => setPetTypes({ ...petTypes, giantDog: checked })}
                                />
                                <Dog className="w-5 h-5 text-muted-foreground" />
                                <span>Giant dog (101+ lbs)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={petTypes.cat}
                                    onCheckedChange={(checked) => setPetTypes({ ...petTypes, cat: checked })}
                                />
                                <Cat className="w-5 h-5 text-muted-foreground" />
                                <span>Cat</span>
                            </label>
                        </div>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* About your home */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold">About your home</h2>

                    <div className="space-y-4">
                        <h3 className="font-bold">What type of home do you live in?</h3>
                        <div className="space-y-3">
                            {['House', 'Apartment', 'Farm'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                        homeType === option ? "border-primary" : "border-input"
                                    )}>
                                        {homeType === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={homeType === option} onChange={() => setHomeType(option)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">What type of yard do you have?</h3>
                        <div className="space-y-3">
                            {['Fenced yard', 'Unfenced yard', 'No yard'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                        yardType === option ? "border-primary" : "border-input"
                                    )}>
                                        {yardType === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={yardType === option} onChange={() => setYardType(option)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">What can pet owners expect when boarding at your home?</h3>
                        <p className="text-sm text-muted-foreground">(Check all that apply)</p>
                        <div className="space-y-3">
                            {[
                                { key: 'smoking', label: 'Smoking inside home' },
                                { key: 'children05', label: 'Children age 0-5' },
                                { key: 'children612', label: 'Children age 6-12' },
                                { key: 'dogsOnFurniture', label: 'Dogs are allowed on furniture' },
                                { key: 'dogsOnBed', label: 'Dogs are allowed on bed' },
                                { key: 'catsInHome', label: 'Cats in home' },
                                { key: 'cagedPets', label: 'Caged pets in home' },
                                { key: 'none', label: 'None of the above' },
                            ].map((item) => (
                                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        checked={homeExpectations[item.key as keyof typeof homeExpectations]}
                                        onCheckedChange={(checked) => setHomeExpectations({ ...homeExpectations, [item.key]: checked })}
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">Are you able to host any of the following?</h3>
                        <p className="text-sm text-muted-foreground">(Check all that apply)</p>
                        <div className="space-y-3">
                            {[
                                { key: 'differentFamilies', label: 'Pets from different families at the same time' },
                                { key: 'puppies', label: 'Puppies under 1 year old' },
                                { key: 'notCrateTrained', label: 'Dogs that are not crate trained' },
                                { key: 'unneutered', label: 'Unneutered male dogs' },
                                { key: 'unspayed', label: 'Unspayed female dogs' },
                                { key: 'femalesInHeat', label: 'Female dogs in heat' },
                                { key: 'none', label: 'None of the above' },
                            ].map((item) => (
                                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        checked={hostCapabilities[item.key as keyof typeof hostCapabilities]}
                                        onCheckedChange={(checked) => setHostCapabilities({ ...hostCapabilities, [item.key]: checked })}
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Cancellation Policy */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold">Cancellation Policy</h2>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
                        <h3 className="font-bold text-primary">What do these mean?</h3>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold">What is your cancellation policy for Dog Boarding?</h3>
                        <div className="space-y-3">
                            {['Same Day', 'One Day', 'Three Day', 'Seven Day'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                        cancellationPolicy === option ? "border-primary" : "border-input"
                                    )}>
                                        {cancellationPolicy === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={cancellationPolicy === option} onChange={() => setCancellationPolicy(option)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Note: service providers (e.g. sitters) must abide by applicable laws and regulations. <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        </p>
                    </div>
                </section>

                <div className="flex justify-center pt-8 gap-4">
                    <Button variant="outline" size="lg" onClick={onBack} className="px-8">
                        Cancel
                    </Button>
                    <Button size="lg" className="px-12 shadow-glow" onClick={onBack}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BoardingSettings;

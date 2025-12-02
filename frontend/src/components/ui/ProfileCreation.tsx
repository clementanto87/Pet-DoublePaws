import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import {
    ArrowLeft,
    Camera,
    Upload,
    Plus,
    Dog,
    Cat
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type ProfileStep = 'Basic Info' | 'Phone Numbers' | 'Details' | 'Photos' | 'Your Pets';

interface ProfileCreationProps {
    initialStep?: ProfileStep;
    onBack: () => void;
    onComplete: () => void;
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({
    initialStep = 'Basic Info',
    onBack,
    onComplete
}) => {
    const [currentStep, setCurrentStep] = useState<ProfileStep>(initialStep);

    const steps: ProfileStep[] = ['Basic Info', 'Phone Numbers', 'Details', 'Photos', 'Your Pets'];

    const handleNext = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        } else {
            onComplete();
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'Basic Info':
                return <BasicInfoForm onNext={handleNext} />;
            case 'Phone Numbers':
                return <PhoneNumbersForm onNext={handleNext} />;
            case 'Details':
                return <DetailsForm onNext={handleNext} />;
            case 'Photos':
                return <PhotosForm onNext={handleNext} />;
            case 'Your Pets':
                return <YourPetsForm onNext={handleNext} />;
            default:
                return null;
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
                Back to Profile Overview
            </Button>

            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {steps.map((step, index) => (
                    <div key={step} className="flex items-center shrink-0">
                        <div
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
                                currentStep === step
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => setCurrentStep(step)}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                                currentStep === step
                                    ? "border-primary bg-primary text-white"
                                    : "border-muted-foreground/30"
                            )}>
                                {index + 1}
                            </div>
                            {step}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-4 h-px bg-border mx-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-border/50 shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">{currentStep}</h2>
                {renderStepContent()}
            </div>
        </div>
    );
};

const BasicInfoForm = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="123 Pet Lover Lane" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="San Francisco" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="CA" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input id="zip" placeholder="94105" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <p className="text-xs text-muted-foreground mb-2">You must be at least 18 years old to be a sitter.</p>
                <Input id="birthday" type="date" />
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onNext} className="px-8 shadow-glow">Save & Continue</Button>
            </div>
        </div>
    );
};

const PhoneNumbersForm = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="phone">Mobile Phone Number</Label>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                <p className="text-xs text-muted-foreground">We need this to send you booking requests and updates.</p>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox id="sms" defaultChecked />
                <Label htmlFor="sms" className="font-normal">Receive text messages for new booking requests</Label>
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onNext} className="px-8 shadow-glow">Save & Continue</Button>
            </div>
        </div>
    );
};

const DetailsForm = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="headline">Profile Headline</Label>
                <Input id="headline" placeholder="Loving Pet Sitter in Downtown" />
                <p className="text-xs text-muted-foreground">This will appear in search results.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="about">About You</Label>
                <textarea
                    id="about"
                    className="flex min-h-[150px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Share your experience with pets, why you love them, and what makes you a great sitter."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input id="experience" type="number" min="0" placeholder="2" />
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onNext} className="px-8 shadow-glow">Save & Continue</Button>
            </div>
        </div>
    );
};

const PhotosForm = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="font-bold">Profile Photo</h3>
                <p className="text-sm text-muted-foreground">Upload a clear photo of yourself. Profiles with high-quality photos get more bookings.</p>

                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold">Additional Photos</h3>
                <p className="text-sm text-muted-foreground">Add photos of you with pets, your home, or your yard.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/80 transition-colors">
                        <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onNext} className="px-8 shadow-glow">Save & Continue</Button>
            </div>
        </div>
    );
};

const YourPetsForm = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <div className="flex justify-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Dog className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Cat className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Do you have any pets?</h3>
                <p className="text-muted-foreground mb-6">Adding your pets helps build trust with potential clients.</p>

                <Button variant="outline" className="mr-4">
                    No, I don't have pets
                </Button>
                <Button className="shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Pet
                </Button>
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onNext} className="px-8 shadow-glow">Finish Profile</Button>
            </div>
        </div>
    );
};

export default ProfileCreation;

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
    ArrowLeft,
    Briefcase,
    Footprints,
    Sun,
    Home,
    GraduationCap,
    Check,
    ChevronRight,
    ChevronDown,
    HelpCircle
} from 'lucide-react';
import BoardingSettings from '../components/ui/BoardingSettings';
import ProfileCreation, { type ProfileStep } from '../components/ui/ProfileCreation';

const PetSitterRegistration: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'boarding-settings' | 'profile-creation'>('dashboard');
    const [initialProfileStep, setInitialProfileStep] = useState<ProfileStep>('Basic Info');
    /*
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        experience: '0-1 years',
        services: [] as string[],
        about: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Registration submitted:', formData);
        alert('Application submitted! We will contact you shortly.');
    };
    */

    const [isProfileExpanded, setIsProfileExpanded] = useState(true);

    if (isRegistering) {
        if (currentView === 'boarding-settings') {
            return (
                <div className="min-h-screen bg-background-alt dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8">
                    <BoardingSettings onBack={() => setCurrentView('dashboard')} />
                </div>
            );
        }

        if (currentView === 'profile-creation') {
            return (
                <div className="min-h-screen bg-background-alt dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8">
                    <ProfileCreation
                        initialStep={initialProfileStep}
                        onBack={() => setCurrentView('dashboard')}
                        onComplete={() => setCurrentView('dashboard')}
                    />
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-3xl mx-auto animate-slide-up">
                    <Button
                        variant="ghost"
                        onClick={() => setIsRegistering(false)}
                        className="mb-8 hover:bg-transparent hover:text-primary pl-0 text-muted-foreground font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Overview
                    </Button>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">Complete the required steps to get approved.</h1>
                        <a href="#" className="text-[#FF5A00] hover:text-[#FF5A00]/80 text-sm font-medium flex items-center gap-2 transition-colors">
                            <HelpCircle className="w-4 h-4" />
                            How does approval work?
                        </a>
                    </div>

                    <div className="space-y-12">
                        {/* Service Setup */}
                        <section>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Service Setup</h2>
                                <a href="#" className="text-[#FF5A00] hover:text-[#FF5A00]/80 text-sm font-medium flex items-center gap-2 transition-colors">
                                    <HelpCircle className="w-4 h-4" />
                                    How do I add or modify my services?
                                </a>
                            </div>

                            <Card
                                className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer bg-white dark:bg-card rounded-2xl overflow-hidden group"
                                onClick={() => setCurrentView('boarding-settings')}
                            >
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-300">
                                            <Briefcase className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-0.5">Boarding</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Set your service preferences</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-400 font-medium">3 mins</span>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF5A00] transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Build Trust */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Build Trust</h2>

                            <div className="space-y-4">
                                {/* Create Your Profile */}
                                <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-white dark:bg-card rounded-2xl overflow-hidden">
                                    <div
                                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                                    >
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-0.5">Create Your Profile</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Make a great first impression</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400 font-medium">12 mins</span>
                                            {isProfileExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-gray-300" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                    </div>

                                    {isProfileExpanded && (
                                        <div className="border-t border-gray-100 dark:border-white/5">
                                            {[
                                                { label: 'Basic Info', completed: false },
                                                { label: 'Phone Numbers', completed: false },
                                                { label: 'Details', completed: false },
                                                { label: 'Photos', completed: false },
                                                { label: 'Your Pets', completed: false },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 pl-8 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 group"
                                                    onClick={() => {
                                                        setInitialProfileStep(item.label as ProfileStep);
                                                        setCurrentView('profile-creation');
                                                    }}
                                                >
                                                    <span className="text-[#FF5A00] font-medium group-hover:translate-x-1 transition-transform">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden bg-background-alt dark:bg-background-alt-dark">
                <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] animate-float"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 animate-slide-up leading-tight">
                            Do What You Love, <br />
                            <span className="text-gradient">Get Paid to Play</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Become a Double Paws sitter and earn money while spending time with adorable pets. Set your own schedule and prices.
                        </p>
                        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Button
                                size="lg"
                                className="text-xl px-8 py-6 h-auto shadow-glow hover:scale-105 transition-transform"
                                onClick={() => setIsRegistering(true)}
                            >
                                Start Creating Your Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-20 bg-gray-50 dark:bg-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">How it works</h2>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-border -z-10"></div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {/* Step 1 */}
                            <div className="text-center relative">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-card border-2 border-border flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-sm">
                                    1
                                </div>
                                <h3 className="text-xl font-bold mb-3">Create your profile</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We guide you through building a profile that showcases information pet owners care about.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center relative">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-card border-2 border-border flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-sm">
                                    2
                                </div>
                                <h3 className="text-xl font-bold mb-3">Accept requests</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Tell us the types of pets you want to care for and the dates that work for you. You make your own schedule.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center relative">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-card border-2 border-border flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-sm">
                                    3
                                </div>
                                <h3 className="text-xl font-bold mb-3">Get paid</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Payments are ready for withdrawal two days after you have completed a service.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-16">
                            <Button
                                size="lg"
                                className="px-8 py-6 h-auto text-lg shadow-glow hover:scale-105 transition-transform"
                                onClick={() => setIsRegistering(true)}
                            >
                                Get started
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services & Safety Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Services Column */}
                        <div className="space-y-12">
                            <h2 className="text-3xl font-display font-bold text-center lg:text-left">Services</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4 group">
                                    <div className="shrink-0">
                                        <Briefcase className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold">Boarding</h3>
                                            <span className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Highest Earners</span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Care for a dog or cat overnight in your home. Sitters who offer boarding can <span className="font-bold text-foreground">make up to 2x more</span> than sitters who don't.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="shrink-0">
                                        <Footprints className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Dog Walking</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Pick up dog walks that fit your schedule.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="shrink-0">
                                        <Sun className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Doggy Day Care</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Ideal for work-from-home dog lovers.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="shrink-0">
                                        <Home className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">House Sitting, Drop-In Visits</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Stay with or check up on pets in their own homes.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="shrink-0">
                                        <GraduationCap className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Dog Training</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Private training in your client's home or neighborhood. Available to credentialed trainers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety Column */}
                        <div className="space-y-12">
                            <h2 className="text-3xl font-display font-bold text-center lg:text-left">Safety first. Always.</h2>
                            <div className="space-y-8">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    We work tirelessly to ensure tails keep wagging and pet owners' minds are at ease.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <Check className="w-6 h-6 text-green-500 shrink-0" />
                                        <p className="text-lg text-muted-foreground">
                                            Every service you offer on Double Paws is backed by the <span className="font-bold text-foreground">Double Paws Guarantee</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Check className="w-6 h-6 text-green-500 shrink-0" />
                                        <p className="text-lg text-muted-foreground">
                                            Safe, secured, and convenient online payments
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Check className="w-6 h-6 text-green-500 shrink-0" />
                                        <p className="text-lg text-muted-foreground">
                                            A top tier support team available 24/7
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Check className="w-6 h-6 text-green-500 shrink-0" />
                                        <p className="text-lg text-muted-foreground">
                                            Ongoing pet care education for pet sitters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-background-alt dark:bg-background-alt-dark text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
                        Connect with pet owners once your profile is approved
                    </h2>
                    <Button
                        size="lg"
                        className="text-xl px-10 py-6 h-auto shadow-glow hover:scale-105 transition-transform"
                        onClick={() => setIsRegistering(true)}
                    >
                        Start Creating Your Profile
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default PetSitterRegistration;

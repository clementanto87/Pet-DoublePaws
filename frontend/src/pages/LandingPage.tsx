import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
    Shield,
    Heart,
    Stethoscope,
    Calendar,
    Camera,
    Clock,
    CheckCircle,
    Star,
    PawPrint,
    ArrowRight,
    MapPin,
    BadgeCheck,
    Sparkles,
    Lock,
    CreditCard,
    Headphones,
    Search,
    MessageCircle,
    Home,
    Award
} from 'lucide-react';
import { PawPrints } from '../components/ui/PawPrints';
import { cn } from '../lib/utils';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    // How it works steps
    const steps = [
        {
            step: 1,
            title: 'Search & Compare',
            description: 'Find trusted pet sitters in your area. Compare profiles, services, and reviews.',
            icon: Search,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            step: 2,
            title: 'Connect & Book',
            description: 'Message sitters, ask questions, and book with confidence through our secure platform.',
            icon: MessageCircle,
            color: 'from-purple-500 to-pink-500'
        },
        {
            step: 3,
            title: 'Relax & Enjoy',
            description: 'Your pet gets amazing care while you get peace of mind with photo updates.',
            icon: Heart,
            color: 'from-primary to-orange-500'
        }
    ];

    // Trust features
    const trustFeatures = [
        {
            icon: BadgeCheck,
            title: 'Verified Sitters',
            description: 'Every sitter passes identity verification and background checks'
        },
        {
            icon: Shield,
            title: 'Pet Insurance',
            description: 'Every booking includes comprehensive pet insurance coverage'
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Our dedicated team is always here when you need us'
        },
        {
            icon: Lock,
            title: 'Secure Payments',
            description: 'Your payments are protected with bank-level security'
        }
    ];

    // Services
    const services = [
        {
            icon: Home,
            title: 'Pet Boarding',
            description: 'Overnight stays in a loving home environment',
            price: 'from $25/night'
        },
        {
            icon: Calendar,
            title: 'Doggy Day Care',
            description: 'Fun-filled daytime care and socialization',
            price: 'from $20/day'
        },
        {
            icon: PawPrint,
            title: 'Dog Walking',
            description: 'Exercise and adventure in your neighborhood',
            price: 'from $15/walk'
        },
        {
            icon: Clock,
            title: 'Drop-in Visits',
            description: 'Quick check-ins for feeding and playtime',
            price: 'from $15/visit'
        }
    ];

    // Benefits
    const benefits = [
        { icon: Camera, text: 'Photo & video updates' },
        { icon: MapPin, text: 'GPS tracking on walks' },
        { icon: Stethoscope, text: 'Vet care coordination' },
        { icon: CreditCard, text: 'Easy online payments' },
        { icon: Star, text: 'Honest reviews' },
        { icon: Clock, text: 'Flexible scheduling' }
    ];

    return (
        <div className="flex-1 w-full overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-20" />
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-primary/15 blur-[120px] animate-float" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/15 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-yellow-400/10 blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
                </div>

                <PawPrints variant="floating" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 shadow-lg mb-8 animate-fade-in">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Trusted & Insured Pet Care</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.05] tracking-tight">
                                Your Pet Deserves <br />
                                <span className="text-gradient">The Best Care</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Connect with verified, loving pet sitters in your neighborhood. 
                                <span className="text-foreground font-semibold"> Book with confidence</span> — every stay is insured.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                                <Button
                                    onClick={() => navigate('/booking')}
                                    size="lg"
                                    className="text-lg px-8 py-6 h-auto shadow-glow hover:scale-105 transition-all duration-300 group"
                                >
                                    Find Pet Sitters Near You
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/become-a-sitter')}
                                    size="lg"
                                    className="text-lg px-8 py-6 h-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                                >
                                    Become a Sitter
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Background Checked</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Insurance Included</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">24/7 Support</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative mt-8 lg:mt-0">
                            <div className="relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Happy dog with sitter"
                                    className="rounded-3xl shadow-2xl w-full max-w-lg mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                                />

                                {/* Floating Card - Verified */}
                                <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white dark:bg-card p-4 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <BadgeCheck className="w-7 h-7 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">100% Verified</p>
                                            <p className="text-xs text-muted-foreground">All sitters background checked</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Card - Insurance */}
                                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-gray-800" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-7 h-7 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">Pet Insurance</p>
                                            <p className="text-xs text-muted-foreground">Every booking covered</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-full blur-3xl -z-10" />
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
                    <div className="w-8 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="py-8 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {trustFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 group">
                                <feature.icon className="w-6 h-6 text-primary" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{feature.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Simple & Easy</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            How <span className="text-gradient">Double Paws</span> Works
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Finding trusted pet care has never been easier. Three simple steps to peace of mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-[80px] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-primary" />

                        {steps.map((step, index) => (
                            <div key={index} className="relative text-center">
                                <div className={cn(
                                    "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl bg-gradient-to-br text-white relative z-10",
                                    step.color
                                )}>
                                    <step.icon className="w-10 h-10" />
                                </div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-primary border-2 border-primary -mt-2 z-20">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button onClick={() => navigate('/booking')} size="lg" className="shadow-glow">
                            Get Started Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Services for Every <span className="text-gradient">Pet Need</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            From overnight stays to daily walks, our sitters offer personalized care for your furry family members.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white dark:bg-gray-800 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                                        <service.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                                    <p className="text-muted-foreground mb-4">{service.description}</p>
                                    <p className="text-lg font-bold text-primary">{service.price}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Trust Us Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Your Peace of Mind</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                We Take <span className="text-gradient">Safety</span> Seriously
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Your pet's safety is our top priority. Every sitter on our platform goes through a rigorous verification process.
                            </p>

                            <div className="space-y-6">
                                {trustFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Happy dogs playing"
                                    className="rounded-2xl shadow-lg"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Dog with owner"
                                    className="rounded-2xl shadow-lg mt-8"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <img
                                                key={i}
                                                src={`https://i.pravatar.cc/60?img=${i + 20}`}
                                                alt="Pet owner"
                                                className="w-10 h-10 rounded-full border-2 border-white"
                                            />
                                        ))}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">Pet Parents Love Us</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            ))}
                                            <span className="text-sm text-muted-foreground ml-1">5.0 rating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Strip */}
            <section className="py-12 bg-primary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-white">
                                <benefit.icon className="w-5 h-5" />
                                <span className="font-medium">{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Guarantee Section */}
            <section className="py-24 bg-gradient-to-br from-primary/5 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white dark:bg-gray-800 border-0 shadow-2xl overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl">
                                        <Award className="w-12 h-12 md:w-16 md:h-16 text-white" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
                                            Our <span className="text-green-600">Happiness Guarantee</span>
                                        </h2>
                                        <p className="text-lg text-muted-foreground mb-6">
                                            If you're not completely satisfied with your pet's care, we'll make it right. 
                                            That's our promise to you and your furry family member.
                                        </p>
                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">Full Refund Policy</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">No Questions Asked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Start Today</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                            Your Pet's Perfect Sitter is Waiting
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Join thousands of pet parents who trust Double Paws for safe, loving pet care. 
                            Book your first stay today!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => navigate('/booking')}
                                size="lg"
                                className="text-lg px-12 py-6 h-auto bg-white text-primary hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all duration-300 group"
                            >
                                Find Sitters Near Me
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                        <p className="mt-8 text-white/70 text-sm">
                            Free to search • No booking fees • Cancel anytime
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

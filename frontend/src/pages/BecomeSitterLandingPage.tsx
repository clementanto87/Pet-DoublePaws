import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
    DollarSign,
    Clock,
    Heart,
    Shield,
    MapPin,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Users,
    Calendar,
    Briefcase,
    PawPrint,
    BadgeCheck,
    Wallet,
    Headphones,
    Camera,
    CreditCard,
    Gift,
    Home,
    Award,
    Zap,
    Target
} from 'lucide-react';
import { PawPrints } from '../components/ui/PawPrints';
import { cn } from '../lib/utils';

const BecomeSitterLandingPage: React.FC = () => {
    const navigate = useNavigate();

    // Benefits with earnings focus
    const benefits = [
        {
            icon: DollarSign,
            title: 'Set Your Own Rates',
            description: 'You decide what you charge. Keep 85% of every booking. Top sitters earn $1,000+ monthly.',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: Clock,
            title: 'Complete Flexibility',
            description: 'Work when you want, as much as you want. Perfect for students, retirees, or anyone with a flexible schedule.',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Heart,
            title: 'Do What You Love',
            description: 'Get paid to spend time with adorable pets. Turn your passion for animals into a rewarding side income.',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            icon: Home,
            title: 'Work From Home',
            description: 'Offer boarding and daycare right from your home. No commute, no office—just you and the pets.',
            gradient: 'from-primary to-orange-500'
        }
    ];

    // How it works - simplified
    const howItWorks = [
        {
            step: 1,
            title: 'Create Your Profile',
            description: 'Tell us about yourself and the services you want to offer. Add photos and set your rates.',
            icon: Users,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            step: 2,
            title: 'Get Verified',
            description: 'Complete a quick verification to build trust with pet parents. We make it easy and fast.',
            icon: BadgeCheck,
            color: 'from-purple-500 to-pink-500'
        },
        {
            step: 3,
            title: 'Start Earning',
            description: 'Receive booking requests, accept the ones you want, and get paid securely after each stay.',
            icon: Wallet,
            color: 'from-green-500 to-emerald-500'
        }
    ];

    // What you get
    const perks = [
        { icon: Shield, title: 'Insurance Coverage', description: 'Every booking is covered by our comprehensive pet insurance' },
        { icon: Headphones, title: '24/7 Support', description: 'Our dedicated team is always here to help you succeed' },
        { icon: CreditCard, title: 'Fast Payments', description: 'Get paid within 2 days after each completed booking' },
        { icon: Camera, title: 'Easy App', description: 'Manage bookings, chat with clients, and update availability easily' },
        { icon: Gift, title: 'No Upfront Costs', description: 'Completely free to join—we only earn when you earn' },
        { icon: Target, title: 'Marketing Support', description: 'We help connect you with pet parents in your area' }
    ];

    // Services you can offer
    const services = [
        { name: 'Pet Boarding', desc: 'Overnight care at your home', earning: '$25-50/night' },
        { name: 'Doggy Day Care', desc: 'Daytime care and play', earning: '$20-40/day' },
        { name: 'Dog Walking', desc: 'Exercise and adventure', earning: '$15-30/walk' },
        { name: 'Drop-in Visits', desc: 'Quick check-ins', earning: '$15-25/visit' },
        { name: 'House Sitting', desc: 'Stay at client\'s home', earning: '$40-75/night' }
    ];

    // Requirements - simplified
    const requirements = [
        { text: '18 years or older', icon: CheckCircle },
        { text: 'Love for animals', icon: Heart },
        { text: 'Safe, pet-friendly space', icon: Home },
        { text: 'Reliable & responsible', icon: BadgeCheck },
        { text: 'Pass background check', icon: Shield }
    ];

    return (
        <div className="flex-1 w-full overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-20" />
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-green-400/15 blur-[120px] animate-float" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/15 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
                </div>

                <PawPrints variant="floating" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            {/* Earnings Badge */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 shadow-lg mb-8 animate-fade-in">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Earn $1,000+/month doing what you love</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.05] tracking-tight">
                                Get Paid to <br />
                                <span className="text-gradient">Love Pets</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Join Double Paws and turn your love for animals into flexible income. 
                                <span className="text-foreground font-semibold"> Set your own schedule, your own rates.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                                <Button
                                    onClick={() => navigate('/become-a-sitter/register')}
                                    size="lg"
                                    className="text-lg px-8 py-6 h-auto shadow-glow hover:scale-105 transition-all duration-300 group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                >
                                    Start Earning Today
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    size="lg"
                                    className="text-lg px-8 py-6 h-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                                >
                                    See How It Works
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Free to Join</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Keep 85% of Earnings</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Insurance Included</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative mt-8 lg:mt-0">
                            <div className="relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Happy pet sitter with dogs"
                                    className="rounded-3xl shadow-2xl w-full max-w-lg mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                                />

                                {/* Earnings Card */}
                                <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white dark:bg-card p-5 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                            <DollarSign className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-2xl text-foreground">$1,000+</p>
                                            <p className="text-sm text-muted-foreground">Monthly potential</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Flexibility Card */}
                                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white dark:bg-card p-5 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-gray-800" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">Your Schedule</p>
                                            <p className="text-xs text-muted-foreground">Work when you want</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="py-8 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Insurance Included</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Headphones className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">24/7 Support</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Fast Payments</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Gift className="w-6 h-6 text-green-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Free to Join</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">Why Join Us</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            The <span className="text-gradient">Perfect Side Hustle</span> for Pet Lovers
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Whether you're looking for extra income or a career change, pet sitting offers flexibility, joy, and great earnings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white dark:bg-gray-800 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br text-white",
                                        benefit.gradient
                                    )}>
                                        <benefit.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{benefit.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Earning Potential Section */}
            <section className="py-24 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Services You Can <span className="text-gradient">Offer</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Choose which services to offer based on your availability and preferences. You're in control.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid gap-4">
                            {services.map((service, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <PawPrint className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{service.name}</h3>
                                            <p className="text-sm text-muted-foreground">{service.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-600">{service.earning}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Quick & Easy</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Start in <span className="text-gradient">3 Simple Steps</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Getting started is quick and easy. You could have your first booking within days!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full" />

                        {howItWorks.map((step, index) => (
                            <div key={index} className="relative text-center">
                                <div className={cn(
                                    "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl bg-gradient-to-br text-white relative z-10",
                                    step.color
                                )}>
                                    <step.icon className="w-12 h-12" />
                                </div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-primary border-4 border-primary -mt-2 z-20">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button 
                            onClick={() => navigate('/become-a-sitter/register')} 
                            size="lg" 
                            className="shadow-glow bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                            Create Your Free Profile
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* What You Get Section */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                                <Gift className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Everything You Need</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                We've Got Your <span className="text-gradient">Back</span>
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                We provide all the tools, support, and protection you need to succeed as a pet sitter.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {perks.map((perk, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <perk.icon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{perk.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{perk.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Dog playing"
                                    className="rounded-2xl shadow-lg"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Happy dog"
                                    className="rounded-2xl shadow-lg mt-8"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                        <Award className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">You're Protected</p>
                                        <p className="text-sm text-muted-foreground">Insurance on every booking</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Requirements Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
                                        What You Need to <span className="text-green-600">Get Started</span>
                                    </h2>
                                    <p className="text-lg text-muted-foreground">
                                        Simple requirements to join our community of pet sitters
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-4">
                                    {requirements.map((req, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-full shadow-md"
                                        >
                                            <req.icon className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-foreground">{req.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center mt-10">
                                    <Button 
                                        onClick={() => navigate('/become-a-sitter/register')}
                                        size="lg" 
                                        className="shadow-glow bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                    >
                                        Apply Now — It's Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Takes less than 15 minutes to complete
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-semibold">Join Today</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                            Ready to Start Earning?
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Turn your love for pets into extra income. Flexible hours, great pay, and adorable clients!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => navigate('/become-a-sitter/register')}
                                size="lg"
                                className="text-lg px-12 py-6 h-auto bg-white text-green-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all duration-300 group font-bold"
                            >
                                Create Your Free Profile
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                        <p className="mt-8 text-white/70 text-sm">
                            Free to join • No monthly fees • Start earning this week
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BecomeSitterLandingPage;

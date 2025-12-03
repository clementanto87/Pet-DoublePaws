import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    Clock,
    Dog,
    Cat,
    MapPin,
    Star,
    Shield,
    CheckCircle,
    PawPrint,
    MessageCircle,
    Info,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { DatePicker } from '../components/ui/DatePicker';
import { cn } from '../lib/utils';

// Service options
const services = [
    { id: 'boarding', label: 'Boarding', icon: '🏠' },
    { id: 'houseSitting', label: 'House Sitting', icon: '🏡' },
    { id: 'dropInVisits', label: 'Drop-in Visits', icon: '☀️' },
    { id: 'doggyDayCare', label: 'Doggy Day Care', icon: '🐕' },
    { id: 'dogWalking', label: 'Dog Walking', icon: '🦮' },
];

// Quick message templates
const messageTemplates = [
    "Hi! I'm interested in booking your services for my pet.",
    "Hello! I'd love to learn more about your experience with pets.",
    "Hi there! Can you tell me more about your home environment?",
    "Hello! I have some questions about your availability.",
];

const ContactSitterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const sitter = location.state?.sitter;

    // Form state
    const [selectedService, setSelectedService] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [petInfo, setPetInfo] = useState({ dogs: 0, cats: 0 });
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Handle send message
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setIsSending(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSending(false);
        setIsSent(true);
    };

    // If no sitter data, show error
    if (!sitter) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">No Sitter Selected</h2>
                    <p className="text-muted-foreground mb-6">Please select a sitter from the search results first.</p>
                    <Button onClick={() => navigate('/search')}>Find Sitters</Button>
                </Card>
            </div>
        );
    }

    // Success state
    if (isSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent! 🎉</h2>
                    <p className="text-muted-foreground mb-6">
                        Your message has been sent to {sitter.user?.firstName}. They'll get back to you soon!
                    </p>
                    <div className="space-y-3">
                        <Button onClick={() => navigate('/dashboard')} className="w-full shadow-glow">
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
                            Back to Profile
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Get sitter's available services
    const availableServices = sitter.services
        ? services.filter(s => sitter.services[s.id]?.active)
        : services;

    // Get minimum rate
    const minRate = sitter.services
        ? Math.min(...Object.values(sitter.services).filter((s: any) => s?.active).map((s: any) => s.rate))
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Profile</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Contact Sitter</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Send a Message to {sitter.user?.firstName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Introduce yourself and tell them about your pet care needs
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Selection */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">1</span>
                                    What service do you need?
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableServices.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service.id)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 transition-all text-left",
                                                selectedService === service.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                            )}
                                        >
                                            <span className="text-2xl mb-2 block">{service.icon}</span>
                                            <span className={cn(
                                                "font-medium text-sm",
                                                selectedService === service.id ? "text-primary" : "text-gray-700 dark:text-gray-300"
                                            )}>
                                                {service.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">2</span>
                                    When do you need care?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Start Date</Label>
                                        <DatePicker
                                            value={startDate}
                                            onChange={setStartDate}
                                            placeholder="Select start date"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">End Date</Label>
                                        <DatePicker
                                            value={endDate}
                                            onChange={setEndDate}
                                            placeholder="Select end date"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pet Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">3</span>
                                    How many pets?
                                </h2>
                                <div className="flex gap-6">
                                    {/* Dogs */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                            <Dog className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Dogs</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, dogs: Math.max(0, p.dogs - 1) }))}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center font-bold">{petInfo.dogs}</span>
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, dogs: Math.min(5, p.dogs + 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-600"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cats */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <Cat className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Cats</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, cats: Math.max(0, p.cats - 1) }))}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center font-bold">{petInfo.cats}</span>
                                                <button
                                                    onClick={() => setPetInfo(p => ({ ...p, cats: Math.min(5, p.cats + 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-600"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">4</span>
                                    Your Message
                                </h2>

                                {/* Quick Templates */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Quick templates:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {messageTemplates.map((template, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setMessage(template)}
                                                className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                {template.substring(0, 30)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi ${sitter.user?.firstName}! I'm looking for someone to care for my pet...`}
                                    className="w-full h-40 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                                />

                                <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Include details about your pet's personality, any special needs, and your expectations to help {sitter.user?.firstName} understand your requirements.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Send Button */}
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isSending}
                            className="w-full h-14 text-lg font-bold shadow-glow"
                        >
                            {isSending ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Sidebar - Sitter Preview */}
                    <div className="space-y-6">
                        {/* Sitter Card */}
                        <Card className="overflow-hidden">
                            <div className="h-20 bg-gradient-to-r from-primary to-orange-400" />
                            <CardContent className="p-6 -mt-10">
                                <div className="flex items-end gap-4 mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden border-4 border-white dark:border-gray-800 flex-shrink-0">
                                        {sitter.user?.profileImage ? (
                                            <img
                                                src={sitter.user.profileImage}
                                                alt={sitter.user.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                                                <span className="text-xl font-bold text-primary">
                                                    {sitter.user?.firstName?.[0]}{sitter.user?.lastName?.[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                            {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-medium">5.0</span>
                                            <span className="text-gray-400">(0 reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                {sitter.isVerified && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl mb-4">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified Sitter</span>
                                    </div>
                                )}

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span>{sitter.address?.split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <PawPrint className="w-4 h-4" />
                                        <span>{sitter.yearsExperience || 0}+ years experience</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Starting from</span>
                                        <span className="text-2xl font-bold text-primary">${minRate}<span className="text-sm font-normal text-gray-500">/night</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Response Time */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Quick Response</p>
                                        <p className="text-sm text-gray-500">Usually responds within a few hours</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-bold text-amber-900 dark:text-amber-300">Tips for a great intro</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Share your pet's name and personality</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Mention any special care needs</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Ask about their availability</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Request a meet & greet if possible</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSitterPage;


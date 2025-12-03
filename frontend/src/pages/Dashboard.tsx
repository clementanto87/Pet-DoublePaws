import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Plus,
    Calendar,
    Dog,
    Cat,
    Heart,
    Clock,
    MapPin,
    Star,
    ArrowRight,
    Sparkles,
    Bell,
    Shield,
    Camera,
    PawPrint
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { petService, type PetData } from '../services/pet.service';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { PawPrints } from '../components/ui/PawPrints';

interface Pet extends PetData {
    id: string;
}

// Quick action cards data
const quickActions = [
    {
        title: 'Book a Sitter',
        description: 'Find trusted pet sitters near you',
        icon: Calendar,
        path: '/booking',
        gradient: 'from-primary to-orange-400',
        bgGradient: 'from-primary/10 to-orange-400/10'
    },
    {
        title: 'Add New Pet',
        description: 'Create a profile for your pet',
        icon: Plus,
        path: '/pet-profile',
        gradient: 'from-blue-500 to-cyan-400',
        bgGradient: 'from-blue-500/10 to-cyan-400/10'
    },
    {
        title: 'Find Nearby',
        description: 'Discover sitters in your area',
        icon: MapPin,
        path: '/search',
        gradient: 'from-green-500 to-emerald-400',
        bgGradient: 'from-green-500/10 to-emerald-400/10'
    }
];

// Tips for pet owners
const tips = [
    { icon: Shield, text: 'All our sitters are verified and background-checked' },
    { icon: Camera, text: 'Request photo updates during your pet\'s stay' },
    { icon: Bell, text: 'Set up notifications for booking confirmations' }
];

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: pets, isLoading, error } = useQuery({
        queryKey: ['pets'],
        queryFn: petService.getPets,
    });

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        <div className="h-32 bg-gradient-to-r from-primary/20 to-orange-400/20 animate-pulse rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 bg-white/50 dark:bg-gray-800/50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-72 bg-white/50 dark:bg-gray-800/50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">😿</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h2>
                    <p className="text-muted-foreground mb-6">We couldn't load your dashboard. Please try again.</p>
                    <Button onClick={() => window.location.reload()} className="shadow-glow">
                        Refresh Page
                    </Button>
                </Card>
            </div>
        );
    }

    const hasPets = pets && pets.length > 0;
    const petCount = pets?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
                <PawPrints variant="floating" className="opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Welcome Section */}
                <div className="relative mb-10">
                    <div className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 rounded-3xl p-8 md:p-10 overflow-hidden">
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-sm font-medium text-white/80">{getGreeting()}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                                    Welcome back, {user?.firstName}! 👋
                                </h1>
                                <p className="text-white/80 text-lg">
                                    {hasPets 
                                        ? `You have ${petCount} adorable pet${petCount > 1 ? 's' : ''} registered`
                                        : 'Ready to add your furry friends?'
                                    }
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <Link to="/booking">
                                    <Button 
                                        variant="secondary" 
                                        size="lg"
                                        className="bg-white text-primary hover:bg-gray-100 shadow-xl font-bold"
                                    >
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Book Now
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-0 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} to={action.path}>
                                <Card className={cn(
                                    "group cursor-pointer border-0 overflow-hidden transition-all duration-300",
                                    "hover:shadow-xl hover:-translate-y-1",
                                    `bg-gradient-to-br ${action.bgGradient}`
                                )}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                                                    "bg-gradient-to-br text-white shadow-lg",
                                                    action.gradient
                                                )}>
                                                    <action.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* My Pets Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <PawPrint className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Pets</h2>
                                <p className="text-sm text-gray-500">{petCount} registered</p>
                            </div>
                        </div>
                        <Link to="/pet-profile">
                            <Button variant="outline" size="sm" className="group">
                                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                Add Pet
                            </Button>
                        </Link>
                    </div>

                    {!hasPets ? (
                        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-full flex items-center justify-center">
                                        <span className="text-5xl">🐾</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    No pets yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-6">
                                    Add your furry friends to start booking amazing pet sitters in your area
                                </p>
                                <Link to="/pet-profile">
                                    <Button className="shadow-glow">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Pet Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pets.map((pet: Pet) => (
                                <Card 
                                    key={pet.id} 
                                    className="group overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Pet Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        {pet.imageUrl ? (
                                            <img
                                                src={pet.imageUrl}
                                                alt={pet.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className={cn(
                                                "w-full h-full flex items-center justify-center",
                                                "bg-gradient-to-br",
                                                pet.species?.toLowerCase() === 'dog' 
                                                    ? "from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30"
                                                    : "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                                            )}>
                                                {pet.species?.toLowerCase() === 'dog' ? (
                                                    <Dog className="w-16 h-16 text-orange-300" />
                                                ) : (
                                                    <Cat className="w-16 h-16 text-purple-300" />
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        
                                        {/* Species badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold shadow-lg",
                                                pet.species?.toLowerCase() === 'dog'
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-purple-500 text-white"
                                            )}>
                                                {pet.species}
                                            </span>
                                        </div>

                                        {/* Pet name overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="text-2xl font-bold text-white mb-1">{pet.name}</h3>
                                            <p className="text-white/80 text-sm">{pet.breed}</p>
                                        </div>
                                    </div>

                                    {/* Pet Details */}
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {pet.age} {pet.age === 1 ? 'year' : 'years'}
                                                </span>
                                                {pet.weight && (
                                                    <span className="flex items-center gap-1">
                                                        {pet.weight} kg
                                                    </span>
                                                )}
                                            </div>
                                            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => navigate('/pet-profile', { state: { pet } })}
                                            >
                                                Edit Profile
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="flex-1 shadow-glow"
                                                onClick={() => navigate('/booking')}
                                            >
                                                Book Sitter
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add New Pet Card */}
                            <Link to="/pet-profile" className="block h-full">
                                <Card className="h-full min-h-[320px] border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group">
                                    <CardContent className="flex flex-col items-center justify-center text-center p-6">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                                            Add Another Pet
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Expand your furry family
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                <div className="mb-10">
                    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {tips.map((tip, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <tip.icon className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{tip.text}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Bookings Placeholder */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Bookings</h2>
                                <p className="text-sm text-gray-500">Your scheduled pet care</p>
                            </div>
                        </div>
                    </div>

                    <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No upcoming bookings
                            </h3>
                            <p className="text-gray-500 max-w-sm mb-6">
                                Book a trusted sitter for your next trip or busy day
                            </p>
                            <Link to="/booking">
                                <Button className="shadow-glow">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book a Sitter
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

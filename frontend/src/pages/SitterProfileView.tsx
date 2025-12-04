import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Star,
    Shield,
    Clock,
    Calendar,
    Home,
    Heart,
    Award,
    CheckCircle,
    Dog,
    Cat,
    PawPrint,
    MessageCircle,
    BadgeCheck,
    Briefcase,
    Users,
    Sun,
    Baby,
    TreeDeciduous
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';

// Service icons mapping
const serviceIcons: Record<string, React.ElementType> = {
    boarding: Home,
    houseSitting: Home,
    dropInVisits: Sun,
    doggyDayCare: Users,
    dogWalking: PawPrint
};

const serviceNames: Record<string, string> = {
    boarding: 'Boarding',
    houseSitting: 'House Sitting',
    dropInVisits: 'Drop-in Visits',
    doggyDayCare: 'Doggy Day Care',
    dogWalking: 'Dog Walking'
};

const serviceDescriptions: Record<string, string> = {
    boarding: 'Your pet stays overnight at the sitter\'s home',
    houseSitting: 'The sitter stays overnight at your home',
    dropInVisits: '30-60 minute visits to your home',
    doggyDayCare: 'Daytime care at the sitter\'s home',
    dogWalking: 'Walks in your neighborhood'
};

const SitterProfileView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get sitter data from navigation state or fetch it
    const sitterFromState = location.state?.sitter;
    
    // Preserve search params for contact page
    const searchParamsString = searchParams.toString();

    // For now, we use the sitter from state. In production, you'd fetch by ID
    const sitter = sitterFromState;

    if (!sitter) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8 mx-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PawPrint className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Sitter Not Found</h2>
                    <p className="text-muted-foreground mb-6">We couldn't find this sitter's profile.</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </Card>
            </div>
        );
    }

    // Get active services
    const activeServices = sitter.services
        ? Object.entries(sitter.services).filter(([_, service]: [string, any]) => service?.active)
        : [];

    // Get minimum rate
    const minRate = activeServices.length > 0
        ? Math.min(...activeServices.map(([_, service]: [string, any]) => service.rate))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark">
            {/* Header with Back Button */}
            <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Results</span>
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="bg-white dark:bg-card rounded-3xl shadow-lg overflow-hidden mb-6">
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden border-4 border-white dark:border-gray-800">
                                {sitter.user?.profileImage ? (
                                    <img
                                        src={sitter.user.profileImage}
                                        alt={sitter.user.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary">
                                            {sitter.user?.firstName?.[0]}{sitter.user?.lastName?.[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {sitter.isVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                                    <BadgeCheck className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                        {sitter.user?.firstName} {sitter.user?.lastName}
                                    </h1>
                                    {sitter.isVerified && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                            <Shield className="w-4 h-4" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-3">
                                    {sitter.headline || 'Loving Pet Sitter'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {sitter.address}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-primary" />
                                        {sitter.yearsExperience || 0}+ years experience
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">
                                        ${minRate}
                                        <span className="text-base text-gray-500 font-normal">/night</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-gray-900 dark:text-white">5.0</span>
                                        <span className="text-gray-500">(0 reviews)</span>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="shadow-glow w-full md:w-auto"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Contact Sitter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    About Me
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {sitter.bio || 'This sitter hasn\'t added a bio yet.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Services & Rates */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Services & Rates
                                </h2>
                                <div className="space-y-4">
                                    {activeServices.map(([key, service]: [string, any]) => {
                                        const Icon = serviceIcons[key] || Briefcase;
                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                        <Icon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                                            {serviceNames[key]}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {serviceDescriptions[key]}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-primary">${service.rate}</div>
                                                    <div className="text-sm text-gray-500">per night</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeServices.length === 0 && (
                                        <p className="text-gray-500 text-center py-4">No services listed yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Certifications */}
                        {(sitter.skills?.length > 0 || sitter.certifications?.length > 0) && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Skills & Certifications
                                    </h2>
                                    {sitter.skills?.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {sitter.skills.map((skill: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {sitter.certifications?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {sitter.certifications.map((cert: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Award className="w-3 h-3" />
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-primary" />
                                    Reviews
                                </h2>
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Star className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No reviews yet</h3>
                                    <p className="text-sm text-gray-500">Be the first to leave a review!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pet Preferences */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <PawPrint className="w-5 h-5 text-primary" />
                                    Accepts
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pet Types</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.preferences?.acceptedPetTypes?.map((type: string) => (
                                                <span
                                                    key={type}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2",
                                                        type === 'Dog'
                                                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                                    )}
                                                >
                                                    {type === 'Dog' ? <Dog className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pet Sizes</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.preferences?.acceptedPetSizes?.map((size: string) => (
                                                <span
                                                    key={size}
                                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Home Environment */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" />
                                    Home Environment
                                </h2>
                                <div className="space-y-3">
                                    {sitter.housing?.homeType && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Home className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">{sitter.housing.homeType}</span>
                                        </div>
                                    )}
                                    {sitter.housing?.outdoorSpace && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <TreeDeciduous className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">{sitter.housing.outdoorSpace}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {sitter.housing?.hasChildren && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium">
                                                <Baby className="w-3 h-3" />
                                                Has Children
                                            </span>
                                        )}
                                        {sitter.housing?.hasOtherPets && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                                                <PawPrint className="w-3 h-3" />
                                                Has Other Pets
                                            </span>
                                        )}
                                        {sitter.housing?.isNonSmoking && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                Non-Smoking
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Availability
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">General Availability</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sitter.availability?.general?.map((day: string) => (
                                                <span
                                                    key={day}
                                                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                                                >
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {sitter.noticePeriod && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>{sitter.noticePeriod} notice required</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-orange-400/5 border-primary/20">
                            <CardContent className="p-6 text-center">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Ready to book?
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Contact {sitter.user?.firstName} to discuss your pet's needs
                                </p>
                                <Button
                                    className="w-full shadow-glow mb-3"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/contact-sitter/${sitter.id}${searchParamsString ? `?${searchParamsString}` : ''}`, { state: { sitter } })}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Check Availability
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitterProfileView;


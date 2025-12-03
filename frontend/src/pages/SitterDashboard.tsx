import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    MapPin,
    Phone,
    Calendar,
    DollarSign,
    Star,
    Clock,
    Edit3,
    CheckCircle,
    AlertCircle,
    Home,
    Briefcase,
    Heart,
    Shield,
    Award,
    PawPrint,
    Settings,
    X,
    Save,
    ChevronRight,
    TrendingUp,
    Users,
    CalendarCheck,
    Wallet
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { sitterService, type SitterProfile } from '../services/sitter.service';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

// Service name mapping
const serviceNames: Record<string, string> = {
    boarding: 'Boarding',
    houseSitting: 'House Sitting',
    dropInVisits: 'Drop-in Visits',
    doggyDayCare: 'Doggy Day Care',
    dogWalking: 'Dog Walking'
};

// Service icons
const serviceIcons: Record<string, React.ElementType> = {
    boarding: Home,
    houseSitting: Home,
    dropInVisits: Clock,
    doggyDayCare: Users,
    dogWalking: PawPrint
};

// Edit Modal Component
interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSave: () => void;
    isSaving: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children, onSave, isSaving }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {children}
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SitterDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch sitter profile
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['sitterProfile'],
        queryFn: sitterService.getMyProfile,
        retry: false
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: sitterService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sitterProfile'] });
            setEditModal({ isOpen: false, section: '' });
        }
    });

    // Edit modal state
    const [editModal, setEditModal] = useState<{ isOpen: boolean; section: string }>({
        isOpen: false,
        section: ''
    });

    // Form data state for editing
    const [editFormData, setEditFormData] = useState<Partial<SitterProfile>>({});

    // Open edit modal
    const openEditModal = (section: string) => {
        setEditFormData(profile || {});
        setEditModal({ isOpen: true, section });
    };

    // Handle save
    const handleSave = () => {
        updateMutation.mutate(editFormData as any);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // No profile found - redirect to registration
    if (error || !profile) {
        return (
            <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PawPrint className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">No Sitter Profile Found</h2>
                    <p className="text-muted-foreground mb-6">
                        You haven't created a sitter profile yet. Start earning by becoming a pet sitter today!
                    </p>
                    <Button onClick={() => navigate('/become-a-sitter')} className="shadow-glow">
                        Become a Sitter
                    </Button>
                </Card>
            </div>
        );
    }

    // Calculate stats
    const activeServicesCount = profile.services
        ? Object.values(profile.services).filter(s => s?.active).length
        : 0;

    const minRate = profile.services
        ? Math.min(...Object.values(profile.services).filter(s => s?.active).map(s => s?.rate || 0))
        : 0;

    const maxRate = profile.services
        ? Math.max(...Object.values(profile.services).filter(s => s?.active).map(s => s?.rate || 0))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background-alt-dark pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Sitter Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your profile, services, and availability
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            <PawPrint className="w-4 h-4 mr-2" />
                            Pet Owner View
                        </Button>
                        <Button variant="primary" className="shadow-glow">
                            <Settings className="w-4 h-4 mr-2" />
                            Account Settings
                        </Button>
                    </div>
                </div>

                {/* Verification Banner */}
                {!profile.isVerified && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Verification Pending</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                Your profile is under review. You'll start receiving bookings once verified.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
                            Learn More
                        </Button>
                    </div>
                )}

                {profile.isVerified && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-green-800 dark:text-green-200">Profile Verified</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                You're all set! Pet parents can now book your services.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-orange-100 dark:from-primary/20 dark:to-orange-900/20 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                                    <p className="text-3xl font-bold text-foreground">{activeServicesCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rate Range</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        ${minRate}-${maxRate}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Service Radius</p>
                                    <p className="text-3xl font-bold text-foreground">{profile.serviceRadius || 5} mi</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                                    <p className="text-3xl font-bold text-foreground">{profile.yearsExperience || 0} yrs</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Overview */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('profile')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{user?.firstName} {user?.lastName}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{profile.address || 'No address set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{profile.phone || 'No phone set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {profile.headline && (
                                <div className="pt-4 border-t border-border">
                                    <p className="text-sm font-medium text-foreground">{profile.headline}</p>
                                </div>
                            )}

                            {profile.bio && (
                                <div className="pt-2">
                                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Services & Rates */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Services & Rates
                                </CardTitle>
                                <CardDescription>Your active services and pricing</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('services')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.services && Object.entries(profile.services).map(([key, service]) => {
                                    if (!service) return null;
                                    const Icon = serviceIcons[key] || Briefcase;
                                    return (
                                        <div
                                            key={key}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all",
                                                service.active
                                                    ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                                    : "bg-muted/30 border-border opacity-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                        service.active ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"
                                                    )}>
                                                        <Icon className={cn(
                                                            "w-5 h-5",
                                                            service.active ? "text-green-600" : "text-muted-foreground"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{serviceNames[key]}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {service.active ? 'Active' : 'Inactive'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-foreground">${service.rate}</p>
                                                    <p className="text-xs text-muted-foreground">per night</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pet Preferences */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    Pet Preferences
                                </CardTitle>
                                <CardDescription>Types and sizes of pets you accept</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('preferences')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Pet Types</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences?.acceptedPetTypes?.map((type) => (
                                        <span key={type} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            {type}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None specified</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Pet Sizes</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences?.acceptedPetSizes?.map((size) => (
                                        <span key={size} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                                            {size}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None specified</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    {profile.preferences?.isNeuteredOnly ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm text-foreground">Neutered only</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Housing */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" />
                                    Housing Details
                                </CardTitle>
                                <CardDescription>Your home environment</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('housing')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Home Type</p>
                                    <p className="font-medium text-foreground">{profile.housing?.homeType || 'Not specified'}</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Outdoor Space</p>
                                    <p className="font-medium text-foreground">{profile.housing?.outdoorSpace || 'Not specified'}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.hasChildren ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.hasChildren ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Has Children
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.hasOtherPets ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.hasOtherPets ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Has Other Pets
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    profile.housing?.isNonSmoking ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {profile.housing?.isNonSmoking ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Non-Smoking
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Availability */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Availability
                                </CardTitle>
                                <CardDescription>When you're available for bookings</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('availability')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">General Availability</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.availability?.general?.map((day) => (
                                        <span key={day} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                            {day}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">Not specified</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Notice Period</p>
                                <p className="text-foreground font-medium">{profile.noticePeriod || 'Not specified'}</p>
                            </div>
                            {profile.availability?.blockedDates && profile.availability.blockedDates.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Blocked Dates</p>
                                    <p className="text-sm text-foreground">{profile.availability.blockedDates.length} dates blocked</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Skills & Experience */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Skills & Certifications
                                </CardTitle>
                                <CardDescription>Your expertise and qualifications</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal('experience')}>
                                <Edit3 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills?.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    )) || <span className="text-muted-foreground text-sm">None added</span>}
                                </div>
                            </div>
                            {profile.certifications && profile.certifications.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.certifications.map((cert) => (
                                            <span key={cert} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => navigate('/become-a-sitter/register')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Edit3 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Edit Full Profile</p>
                                        <p className="text-xs text-muted-foreground">Update all your information</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => openEditModal('availability')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Update Availability</p>
                                        <p className="text-xs text-muted-foreground">Block dates or change schedule</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 justify-start"
                                onClick={() => openEditModal('services')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Adjust Rates</p>
                                        <p className="text-xs text-muted-foreground">Update your service pricing</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modals */}
            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'profile'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title="Edit Profile"
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div>
                        <Label>Phone Number</Label>
                        <Input
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            placeholder="Your phone number"
                        />
                    </div>
                    <div>
                        <Label>Headline</Label>
                        <Input
                            value={editFormData.headline || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
                            placeholder="A catchy headline for your profile"
                        />
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <textarea
                            className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editFormData.bio || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                            placeholder="Tell pet parents about yourself..."
                        />
                    </div>
                </div>
            </EditModal>

            <EditModal
                isOpen={editModal.isOpen && editModal.section === 'services'}
                onClose={() => setEditModal({ isOpen: false, section: '' })}
                title="Edit Services & Rates"
                onSave={handleSave}
                isSaving={updateMutation.isPending}
            >
                <div className="space-y-4">
                    {editFormData.services && Object.entries(editFormData.services).map(([key, service]) => {
                        if (!service) return null;
                        return (
                            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={service.active}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            services: {
                                                ...editFormData.services,
                                                [key]: { ...service, active: e.target.checked }
                                            }
                                        })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium">{serviceNames[key]}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        value={service.rate}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            services: {
                                                ...editFormData.services,
                                                [key]: { ...service, rate: parseFloat(e.target.value) || 0 }
                                            }
                                        })}
                                        className="w-20"
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <div>
                        <Label>Service Radius (miles)</Label>
                        <Input
                            type="number"
                            value={editFormData.serviceRadius || 5}
                            onChange={(e) => setEditFormData({ ...editFormData, serviceRadius: parseInt(e.target.value) || 5 })}
                        />
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default SitterDashboard;


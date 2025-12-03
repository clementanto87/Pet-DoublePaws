import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Dog } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { petService, type PetData } from '../services/pet.service';
import { useAuth } from '../context/AuthContext';

// Extend PetData to include id since the API returns it
interface Pet extends PetData {
    id: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: pets, isLoading, error } = useQuery({
        queryKey: ['pets'],
        queryFn: petService.getPets,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error loading dashboard</h2>
                    <p className="text-muted-foreground">Please try refreshing the page.</p>
                </div>
            </div>
        );
    }

    const hasPets = pets && pets.length > 0;

    return (
        <div className="min-h-screen bg-background pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your pets and bookings from here.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/booking">
                            <Button variant="primary" className="shadow-glow">
                                <Calendar className="w-4 h-4 mr-2" />
                                Book a Sitter
                            </Button>
                        </Link>
                        <Link to="/pet-profile">
                            <Button variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Pet
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Pets Section */}
                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Dog className="w-5 h-5 text-primary" />
                        Your Pets
                    </h2>

                    {!hasPets ? (
                        <Card className="border-dashed border-2 border-muted bg-muted/10">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Dog className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No pets added yet</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Create a profile for your furry friend to get started with bookings and care.
                                </p>
                                <Link to="/pet-profile">
                                    <Button variant="primary" className="shadow-glow">
                                        Create Pet Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pets.map((pet: Pet) => (
                                <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                    <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                        {pet.imageUrl ? (
                                            <img
                                                src={pet.imageUrl}
                                                alt={pet.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                <Dog className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>{pet.name}</span>
                                            <span className="text-sm font-normal px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {pet.species}
                                            </span>
                                        </CardTitle>
                                        <CardDescription>{pet.breed} • {pet.age} years old</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/pet-profile', { state: { pet } })}>
                                                Edit Profile
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add New Pet Card */}
                            <Link to="/pet-profile">
                                <Card className="h-full border-dashed border-2 border-muted bg-muted/5 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center p-6 cursor-pointer min-h-[300px]">
                                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Add Another Pet</h3>
                                </Card>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;

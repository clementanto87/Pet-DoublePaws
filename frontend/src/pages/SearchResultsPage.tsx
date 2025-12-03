import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sitterService } from '../services/sitter.service';
import { Button } from '../components/ui/Button';
import { MapPin, Star, Shield } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sitters, setSitters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSitters = async () => {
            setLoading(true);
            try {
                const params = Object.fromEntries(searchParams.entries());
                const data = await sitterService.searchSitters(params);
                setSitters(data);
            } catch (err) {
                console.error('Failed to fetch sitters:', err);
                setError('Failed to load sitters. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSitters();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-alt-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-alt-dark py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sitters.length} Sitter{sitters.length !== 1 ? 's' : ''} Found
                    </h1>
                    <Button variant="outline" onClick={() => navigate('/booking')}>
                        Modify Search
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {sitters.map((sitter) => (
                        <div key={sitter.id} className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                            {/* Avatar / Photo */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                                    {sitter.user?.profileImage ? (
                                        <img src={sitter.user.profileImage} alt={sitter.user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                            {sitter.user?.firstName?.[0]}
                                        </div>
                                    )}
                                    {sitter.isVerified && (
                                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm" title="Verified Sitter">
                                            <Shield className="w-4 h-4 text-primary fill-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {sitter.user?.firstName} {sitter.user?.lastName?.[0]}.
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                            {sitter.headline || 'Loving Pet Sitter'}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                                            <MapPin className="w-4 h-4" />
                                            {sitter.address?.split(',').slice(-2).join(', ')}
                                            {sitter.distance !== undefined && (
                                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
                                                    {parseFloat(sitter.distance).toFixed(1)} km away
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary">
                                            from ${Math.min(...Object.values(sitter.services || {}).map((s: any) => s.rate || 999))}
                                            <span className="text-sm text-gray-500 font-normal">/night</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-sm font-medium mt-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span>5.0</span>
                                            <span className="text-gray-400">(0 reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mt-2">
                                    {sitter.bio}
                                </p>

                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {/* Skills/Tags could go here */}
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={() => navigate(`/sitter/${sitter.id}`, { state: { sitter } })}
                                    >
                                        View Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {sitters.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sitters found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search filters or location.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;

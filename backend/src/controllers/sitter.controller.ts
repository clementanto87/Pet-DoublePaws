import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { User } from '../entities/User.entity';
import { AuthRequest } from '../middleware/auth.middleware';

export const createOrUpdateSitterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        const sitterRepository = AppDataSource.getRepository(SitterProfile);
        const userRepository = AppDataSource.getRepository(User);

        // Check if user exists
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Check if profile already exists
        let profile: SitterProfile | null = await sitterRepository.findOneBy({ userId });

        if (profile) {
            // Update existing profile
            sitterRepository.merge(profile, profileData);
        } else {
            // Create new profile
            profile = sitterRepository.create();
            sitterRepository.merge(profile, {
                ...profileData,
                user,
                userId
            });
        }

        if (!profile) {
            throw new Error("Failed to create or retrieve profile");
        }

        const savedProfile = await sitterRepository.save(profile);

        res.status(200).json(savedProfile);
    } catch (error) {
        console.error('Error saving sitter profile:', error);
        res.status(500).json({ message: 'Server error while saving profile' });
    }
};

export const searchSitters = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            latitude,
            longitude,
            serviceType,
            petType,
            weight,
            radius = 20,
            // Advanced filter parameters
            minPrice,
            maxPrice,
            minRating,
            maxDistance,
            minExperience,
            verifiedOnly,
            hasReviews,
            serviceTypes // Comma-separated list of service types
        } = req.query;

        const sitterRepository = AppDataSource.getRepository(SitterProfile);
        const query = sitterRepository.createQueryBuilder('sitter')
            .leftJoinAndSelect('sitter.user', 'user')
            .leftJoinAndSelect('sitter.reviews', 'reviews');

        // 1. Geolocation Filter
        if (latitude && longitude) {
            const lat = parseFloat(latitude as string);
            const lon = parseFloat(longitude as string);
            const rad = parseFloat(radius as string);

            query.addSelect(
                `(6371 * acos(cos(radians(:lat)) * cos(radians(sitter.latitude)) * cos(radians(sitter.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(sitter.latitude))))`,
                'distance'
            )
                .where(
                    `(6371 * acos(cos(radians(:lat)) * cos(radians(sitter.latitude)) * cos(radians(sitter.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(sitter.latitude)))) <= :radius`,
                    { lat, lon, radius: rad }
                )
                .orderBy('distance', 'ASC');
        }

        let sittersWithDistance;
        if (latitude && longitude) {
            const result = await query.getRawAndEntities();
            // Map distance from raw results to entities
            sittersWithDistance = result.entities.map((sitter, index) => {
                const raw = result.raw[index];
                (sitter as any).distance = raw?.distance || null;
                return sitter;
            });
        } else {
            sittersWithDistance = await query.getMany();
        }

        // 2. In-Memory Filtering for JSON fields (Robustness)
        const filteredSitters = sittersWithDistance.filter(sitter => {
            // Service Filter
            if (serviceType) {
                const type = serviceType as string;
                // Map frontend service IDs to backend keys if necessary
                // frontend: boarding, house-sitting, drop-in, day-care, walking
                // backend: boarding, houseSitting, dropInVisits, doggyDayCare, dogWalking
                let backendServiceKey = type;
                if (type === 'house-sitting') backendServiceKey = 'houseSitting';
                if (type === 'drop-in') backendServiceKey = 'dropInVisits';
                if (type === 'day-care') backendServiceKey = 'doggyDayCare';
                if (type === 'walking') backendServiceKey = 'dogWalking';

                const service = sitter.services?.[backendServiceKey as keyof typeof sitter.services];
                if (!service?.active) return false;
            }

            // Pet Type Filter
            if (petType) {
                // petType is 'dog' or 'cat' (from frontend counters)
                // backend: 'Dog', 'Cat' (capitalized)
                const type = (petType as string).charAt(0).toUpperCase() + (petType as string).slice(1);
                if (!sitter.preferences?.acceptedPetTypes?.includes(type)) return false;
            }

            // Pet Size Filter
            if (weight) {
                const weights = Array.isArray(weight) ? weight : [weight];
                const requiredSizes = new Set<string>();

                weights.forEach((wStr: any) => {
                    const w = parseFloat(wStr as string);
                    if (!isNaN(w)) {
                        let sizeCategory = 'Small';
                        if (w > 7 && w <= 18) sizeCategory = 'Medium';
                        if (w > 18 && w <= 45) sizeCategory = 'Large';
                        if (w > 45) sizeCategory = 'Giant';
                        requiredSizes.add(sizeCategory);
                    }
                });

                // Check if sitter accepts ALL required sizes
                for (const size of requiredSizes) {
                    if (!sitter.preferences?.acceptedPetSizes?.includes(size)) {
                        return false;
                    }
                }
            }

            // Advanced Filters

            // Price Range Filter
            if (minPrice || maxPrice) {
                const services = sitter.services || {};
                const rates = Object.values(services)
                    .map((s: any) => s?.rate || 999)
                    .filter((r: number) => r < 999);
                const minRate = rates.length > 0 ? Math.min(...rates) : 999;

                // Filter out if rate is below minimum or above maximum
                if (minPrice && minRate < parseFloat(minPrice as string)) return false;
                if (maxPrice && minRate > parseFloat(maxPrice as string)) return false;
            }

            // Verified Only Filter
            if (verifiedOnly === 'true' && !sitter.isVerified) return false;

            // Minimum Rating Filter
            if (minRating) {
                const reviews = sitter.reviews || [];
                if (reviews.length === 0) return false; // No reviews means no rating
                const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
                if (avgRating < parseFloat(minRating as string)) return false;
            }

            // Has Reviews Filter
            if (hasReviews === 'true') {
                const reviews = sitter.reviews || [];
                if (reviews.length === 0) return false;
            }

            // Minimum Experience Filter
            if (minExperience) {
                const exp = sitter.yearsExperience || 0;
                if (exp < parseFloat(minExperience as string)) return false;
            }

            // Max Distance Filter (already handled in query, but double-check)
            if (maxDistance && (sitter as any).distance !== null && (sitter as any).distance !== undefined) {
                const dist = parseFloat((sitter as any).distance);
                const maxDist = parseFloat(maxDistance as string);
                if (dist > maxDist) return false;
            }

            // Multiple Service Types Filter
            if (serviceTypes) {
                const serviceTypesArray = (serviceTypes as string).split(',');
                const services = sitter.services || {};
                const serviceMap: Record<string, keyof typeof services> = {
                    'boarding': 'boarding',
                    'housesitting': 'houseSitting',
                    'visits': 'dropInVisits',
                    'daycare': 'doggyDayCare',
                    'walking': 'dogWalking',
                };

                const hasMatchingService = serviceTypesArray.some(type => {
                    const backendKey = serviceMap[type] || type as keyof typeof services;
                    const service = services[backendKey];
                    return service?.active;
                });

                if (!hasMatchingService) return false;
            }

            // Availability Filter (Blocked Dates)
            // User requested to remove this filter for now (2025-12-03)
            /*
            if (req.query.startDate && req.query.endDate) {
                const start = new Date(req.query.startDate as string);
                start.setHours(0, 0, 0, 0);
                const end = new Date(req.query.endDate as string);
                end.setHours(0, 0, 0, 0);
                
                if (sitter.availability?.blockedDates && sitter.availability.blockedDates.length > 0) {
                    const hasConflict = sitter.availability.blockedDates.some(dateStr => {
                        const blockedDate = new Date(dateStr);
                        blockedDate.setHours(0, 0, 0, 0);
                        return blockedDate.getTime() >= start.getTime() && blockedDate.getTime() <= end.getTime();
                    });
                    
                    if (hasConflict) return false;
                }
            }
            */

            return true;
        });

        res.json(filteredSitters);
    } catch (error) {
        console.error('Error searching sitters:', error);
        res.status(500).json({ message: 'Server error while searching' });
    }
};

export const getSitterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const sitterRepository = AppDataSource.getRepository(SitterProfile);

        const profile = await sitterRepository.findOneBy({ userId });

        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching sitter profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

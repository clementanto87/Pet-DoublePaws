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

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        let profile: SitterProfile | null = await sitterRepository.findOneBy({ userId });

        if (profile) {
            sitterRepository.merge(profile, profileData);
        } else {
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
            serviceTypes // Comma-separated list
        } = req.body;

        const sitterRepository = AppDataSource.getRepository(SitterProfile);
        const query = sitterRepository.createQueryBuilder('sitter')
            .leftJoinAndSelect('sitter.user', 'user')
            .leftJoinAndSelect('sitter.reviews', 'reviews');

        // 1. Geolocation Filter
        if (latitude && longitude) {
            const lat = parseFloat(latitude as string);
            const lon = parseFloat(longitude as string);
            const rad = maxDistance ? parseFloat(maxDistance as string) : parseFloat(radius as string);

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
            sittersWithDistance = result.entities.map((sitter, index) => {
                const raw = result.raw[index];
                (sitter as any).distance = raw?.distance || null;
                return sitter;
            });
        } else {
            sittersWithDistance = await query.getMany();
        }

        // 2. In-Memory Filtering
        const filteredSitters = sittersWithDistance.filter(sitter => {
            // Service Type Filter (single service from basic search)
            if (serviceType) {
                const type = serviceType as string;
                const serviceMap: Record<string, string> = {
                    'boarding': 'boarding',
                    'house-sitting': 'houseSitting',
                    'drop-in': 'dropInVisits',
                    'day-care': 'doggyDayCare',
                    'walking': 'dogWalking'
                };

                const backendKey = serviceMap[type] || type;
                const service = sitter.services?.[backendKey as keyof typeof sitter.services];
                if (!service?.active) return false;
            }

            // Multiple Service Types Filter (from advanced filters)
            if (serviceTypes) {
                const serviceTypesArray = (serviceTypes as string).split(',').map(s => s.trim().toLowerCase());
                const services = sitter.services || {};

                const serviceMap: Record<string, keyof typeof services> = {
                    'boarding': 'boarding',
                    'house-sitting': 'houseSitting',
                    'housesitting': 'houseSitting',
                    'drop-in': 'dropInVisits',
                    'visits': 'dropInVisits',
                    'day-care': 'doggyDayCare',
                    'daycare': 'doggyDayCare',
                    'walking': 'dogWalking'
                };

                const hasMatchingService = serviceTypesArray.some(type => {
                    const backendKey = serviceMap[type] || type as keyof typeof services;
                    const service = services[backendKey];
                    return service?.active === true;
                });

                if (!hasMatchingService) return false;
            }

            // Pet Type Filter
            if (petType) {
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

                for (const size of requiredSizes) {
                    if (!sitter.preferences?.acceptedPetSizes?.includes(size)) {
                        return false;
                    }
                }
            }

            // Price Range Filter (check against all active service rates)
            if (minPrice || maxPrice) {
                const services = sitter.services || {};
                const rates = Object.values(services)
                    .filter((s: any) => s?.active === true && s?.rate != null && s?.rate > 0)
                    .map((s: any) => s.rate);

                if (rates.length === 0) return false; // No active services with prices

                const minRate = Math.min(...rates);
                const maxRate = Math.max(...rates);

                // Check if any rate falls within the range
                const min = minPrice ? parseFloat(minPrice as string) : 0;
                const max = maxPrice ? parseFloat(maxPrice as string) : Infinity;

                // At least one service rate should be within range
                const hasRateInRange = rates.some(rate => rate >= min && rate <= max);
                if (!hasRateInRange) return false;
            }

            // Verified Only Filter
            if (verifiedOnly === 'true' && !sitter.isVerified) return false;

            // Minimum Rating Filter
            if (minRating) {
                const reviews = sitter.reviews || [];
                if (reviews.length === 0) return false;

                const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
                const threshold = parseFloat(minRating as string);

                if (avgRating < threshold) return false;
            }

            // Has Reviews Filter
            if (hasReviews === 'true') {
                const reviews = sitter.reviews || [];
                if (reviews.length === 0) return false;
            }

            // Minimum Experience Filter
            if (minExperience) {
                const exp = sitter.yearsExperience || 0;
                const threshold = parseFloat(minExperience as string);

                if (exp < threshold) return false;
            }

            // Max Distance is already handled in the SQL query above
            // But double-check for consistency
            if (maxDistance && (sitter as any).distance !== null && (sitter as any).distance !== undefined) {
                const dist = parseFloat((sitter as any).distance);
                const maxDist = parseFloat(maxDistance as string);
                if (dist > maxDist) return false;
            }

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
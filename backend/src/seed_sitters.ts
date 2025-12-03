import * as dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from './config/database';
import { User } from './entities/User.entity';
import { SitterProfile } from './entities/SitterProfile.entity';
import * as bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const userRepository = AppDataSource.getRepository(User);
        const sitterRepository = AppDataSource.getRepository(SitterProfile);

        // Clear existing data (optional, be careful in prod!)
        // await sitterRepository.delete({});
        // await userRepository.delete({});

        const password = await bcrypt.hash('password123', 10);

        const sitters = [
            {
                firstName: 'Alice',
                lastName: 'Walker',
                email: 'alice@example.com',
                address: 'Central Park, New York, NY',
                latitude: 40.785091,
                longitude: -73.968285,
                services: {
                    dogWalking: { active: true, rate: 20 },
                    boarding: { active: true, rate: 40 }
                },
                preferences: {
                    acceptedPetTypes: ['Dog'],
                    acceptedPetSizes: ['Small', 'Medium', 'Large']
                },
                availability: {
                    general: ['Weekdays', 'Weekends'],
                    blockedDates: ['2025-12-25']
                }
            },
            {
                firstName: 'Bob',
                lastName: 'Sitter',
                email: 'bob@example.com',
                address: 'Brooklyn Bridge, NY',
                latitude: 40.706086,
                longitude: -73.996864, // ~9km from Central Park
                services: {
                    doggyDayCare: { active: true, rate: 30 },
                    houseSitting: { active: true, rate: 50 }
                },
                preferences: {
                    acceptedPetTypes: ['Dog', 'Cat'],
                    acceptedPetSizes: ['Small']
                }
            },
            {
                firstName: 'Charlie',
                lastName: 'Catlover',
                email: 'charlie@example.com',
                address: 'Statue of Liberty, NY',
                latitude: 40.689247,
                longitude: -74.044502, // ~12km from Central Park
                services: {
                    dropInVisits: { active: true, rate: 15 }
                },
                preferences: {
                    acceptedPetTypes: ['Cat'],
                    acceptedPetSizes: ['Small', 'Medium', 'Large', 'Giant']
                }
            },
            {
                firstName: 'David',
                lastName: 'Faraway',
                email: 'david@example.com',
                address: 'Philadelphia, PA',
                latitude: 39.952583,
                longitude: -75.165222, // ~130km from NY
                services: {
                    boarding: { active: true, rate: 35 }
                },
                preferences: {
                    acceptedPetTypes: ['Dog'],
                    acceptedPetSizes: ['Large']
                }
            }
        ];

        for (const data of sitters) {
            let user = await userRepository.findOneBy({ email: data.email });
            if (!user) {
                user = userRepository.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password
                });
                await userRepository.save(user);
                console.log(`Created user: ${user.firstName}`);
            }

            let profile = await sitterRepository.findOneBy({ userId: user.id });
            if (!profile) {
                profile = sitterRepository.create({
                    user,
                    userId: user.id,
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    services: data.services,
                    preferences: data.preferences as any,
                    availability: (data as any).availability,
                    isVerified: true,
                    headline: `Expert ${data.firstName}`,
                    bio: `I love pets! I am located at ${data.address}.`
                });
                await sitterRepository.save(profile);
                await sitterRepository.save(profile);
                console.log(`Created profile for: ${user.firstName}`);
            } else {
                // Update existing profile
                sitterRepository.merge(profile, {
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    services: data.services,
                    preferences: data.preferences as any,
                    availability: (data as any).availability,
                });
                await sitterRepository.save(profile);
                console.log(`Updated profile for: ${user.firstName}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Pet } from '../entities/Pet.entity';
import { Booking } from '../entities/Booking.entity';
import { Message } from '../entities/Message.entity';
import { Review } from '../entities/Review.entity';
import { SupportRequest } from '../entities/SupportRequest.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';

const userId = (req: Request): string => (req as any).user.id;

export const exportMyData = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = userId(req);
        const [user, pets, bookings, messages, reviews, supportRequests, sitterProfile] = await Promise.all([
            AppDataSource.getRepository(User).findOne({ where: { id }, select: ['id', 'email', 'firstName', 'lastName', 'profileImage', 'createdAt', 'updatedAt'] }),
            AppDataSource.getRepository(Pet).find({ where: { ownerId: id } }),
            AppDataSource.getRepository(Booking).find({ where: [{ ownerId: id }, { sitter: { userId: id } as any }] }),
            AppDataSource.getRepository(Message).find({ where: [{ senderId: id }, { receiverId: id }] }),
            AppDataSource.getRepository(Review).find({ where: { ownerId: id } }),
            AppDataSource.getRepository(SupportRequest).find({ where: { reporterId: id } }),
            AppDataSource.getRepository(SitterProfile).findOne({ where: { userId: id }, select: ['id', 'userId', 'isVerified', 'services', 'preferences', 'housing', 'yearsExperience', 'skills', 'certifications', 'headline', 'bio', 'availability', 'noticePeriod', 'stripeConnectStatus', 'createdAt', 'updatedAt'] }),
        ]);

        res.json({ exportedAt: new Date().toISOString(), user, pets, bookings, messages, reviews, supportRequests, sitterProfile });
    } catch (error) {
        console.error('Privacy export error:', error);
        res.status(500).json({ message: 'Unable to export personal data' });
    }
};

export const deleteMyAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = userId(req);
        await AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User);
            const user = await userRepository.findOneBy({ id });
            if (!user) throw new Error('User not found');

            await manager.getRepository(Pet).delete({ ownerId: id });
            await manager.getRepository(Message).createQueryBuilder().delete().where('senderId = :id OR receiverId = :id', { id }).execute();
            await manager.getRepository(Review).delete({ ownerId: id });
            await manager.getRepository(SupportRequest).delete({ reporterId: id });
            await manager.getRepository(Booking).createQueryBuilder().update().set({ message: null as any }).where('ownerId = :id', { id }).execute();

            const sitter = await manager.getRepository(SitterProfile).findOneBy({ userId: id });
            if (sitter) {
                sitter.address = null as any;
                sitter.phone = null as any;
                sitter.governmentIdUrl = null as any;
                sitter.bio = null as any;
                sitter.headline = null as any;
                sitter.skills = [];
                sitter.certifications = [];
                sitter.stripeConnectAccountId = undefined;
                sitter.stripeConnectStatus = 'NOT_STARTED';
                await manager.getRepository(SitterProfile).save(sitter);
            }

            user.email = `deleted-${id}@deleted.doublepaws24.com`;
            user.firstName = 'Deleted';
            user.lastName = 'User';
            user.password = undefined;
            user.googleId = undefined;
            user.profileImage = undefined;
            await userRepository.save(user);
        });

        res.json({ message: 'Your account has been deleted and personal data anonymized.' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ message: 'Unable to delete account' });
    }
};

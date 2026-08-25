import { Request, Response } from 'express';
import { Between, Brackets } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { Message } from '../entities/Message.entity';
import { Review } from '../entities/Review.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { SupportRequest, SupportRequestStatus, SupportRequestType } from '../entities/SupportRequest.entity';
import { User } from '../entities/User.entity';

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getAdminOverview = async (_req: Request, res: Response): Promise<void> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const sitterRepository = AppDataSource.getRepository(SitterProfile);
        const bookingRepository = AppDataSource.getRepository(Booking);
        const reviewRepository = AppDataSource.getRepository(Review);
        const messageRepository = AppDataSource.getRepository(Message);
        const supportRepository = AppDataSource.getRepository(SupportRequest);

        const now = new Date();
        const periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - 30);

        const [userCount, sitterCount, verifiedSitterCount, pendingVerificationCount, bookings, supportRequests] = await Promise.all([
            userRepository.count(),
            sitterRepository.count(),
            sitterRepository.count({ where: { isVerified: true } }),
            sitterRepository.count({ where: { isVerified: false } }),
            bookingRepository.find({
                where: { createdAt: Between(periodStart, now) },
                relations: ['owner', 'sitter', 'sitter.user'],
                order: { createdAt: 'DESC' },
            }),
            supportRepository.find({ order: { createdAt: 'DESC' }, take: 100 }),
        ]);

        const [recentUsers, recentSitters, recentReviews, recentMessages] = await Promise.all([
            userRepository.find({ order: { createdAt: 'DESC' }, take: 4 }),
            sitterRepository.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 4 }),
            reviewRepository.find({ relations: ['owner', 'sitter', 'sitter.user'], order: { createdAt: 'DESC' }, take: 4 }),
            messageRepository.find({ relations: ['sender'], order: { createdAt: 'DESC' }, take: 4 }),
        ]);

        const grossRevenue = bookings
            .filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status))
            .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);
        const completedBookings = bookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length;
        const eligibleBookings = bookings.filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status)).length;
        const openDisputes = supportRequests.filter((request) => request.type === SupportRequestType.DISPUTE && ![SupportRequestStatus.RESOLVED, SupportRequestStatus.CLOSED].includes(request.status)).length;
        const responseTimes = supportRequests
            .filter((request) => request.firstResponseAt)
            .map((request) => new Date(request.firstResponseAt!).getTime() - new Date(request.createdAt).getTime())
            .filter((milliseconds) => milliseconds >= 0);
        const averageResponseMinutes = responseTimes.length
            ? responseTimes.reduce((total, milliseconds) => total + milliseconds, 0) / responseTimes.length / 60000
            : null;

        const chart = Array.from({ length: 30 }, (_, index) => {
            const date = new Date(periodStart);
            date.setDate(periodStart.getDate() + index);
            const start = dayStart(date);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            const dayBookings = bookings.filter((booking) => booking.createdAt >= start && booking.createdAt < end);
            return {
                date: start.toISOString(),
                bookings: dayBookings.length,
                revenue: dayBookings
                    .filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status))
                    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0),
            };
        });

        const activity = [
            ...bookings.slice(0, 4).map((booking) => ({
                kind: 'booking',
                text: `Booking #${booking.id.slice(0, 8)} is ${booking.status.toLowerCase()}`,
                time: booking.createdAt,
            })),
            ...recentSitters.slice(0, 2).map((sitter) => ({
                kind: 'sitter',
                text: `${sitter.user?.firstName || 'A sitter'} submitted a sitter profile`,
                time: sitter.createdAt,
            })),
            ...recentReviews.slice(0, 2).map((review) => ({
                kind: 'review',
                text: `New ${review.rating}-star review received`,
                time: review.createdAt,
            })),
            ...recentMessages.slice(0, 2).map((message) => ({
                kind: 'message',
                text: `New message from ${message.sender?.firstName || 'a user'}`,
                time: message.createdAt,
            })),
            ...recentUsers.slice(0, 2).map((user) => ({
                kind: 'user',
                text: `${user.firstName} ${user.lastName} joined Double Paws`,
                time: user.createdAt,
            })),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

        res.json({
            metrics: {
                userCount,
                sitterCount,
                verifiedSitterCount,
                bookingCount: bookings.length,
                grossRevenue,
                completionRate: eligibleBookings ? (completedBookings / eligibleBookings) * 100 : 0,
                averageBookingValue: eligibleBookings ? grossRevenue / eligibleBookings : 0,
            },
            chart,
            verificationQueue: await sitterRepository.find({
                where: { isVerified: false },
                relations: ['user'],
                order: { createdAt: 'ASC' },
                take: 5,
            }),
            recentBookings: bookings.slice(0, 8),
            activity,
            trust: {
                pendingVerificationCount,
                openDisputes,
                averageResponseMinutes,
                disputesTracked: true,
                responseTimeTracked: responseTimes.length > 0,
            },
        });
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        res.status(500).json({ message: 'Unable to load admin overview' });
    }
};

// Maps the human-readable status filter used by the admin UI to the underlying
// BookingStatus enum values. "Needs review" groups rejected and cancelled.
const statusFilterMap: Record<string, BookingStatus[]> = {
    Pending: [BookingStatus.PENDING],
    Confirmed: [BookingStatus.ACCEPTED],
    Completed: [BookingStatus.COMPLETED],
    'Needs review': [BookingStatus.REJECTED, BookingStatus.CANCELLED],
};

export const getAdminBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookingRepository = AppDataSource.getRepository(Booking);

        const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
        const status = typeof req.query.status === 'string' ? req.query.status : 'All';
        const service = typeof req.query.service === 'string' ? req.query.service : 'All';
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

        const query = bookingRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.owner', 'owner')
            .leftJoinAndSelect('booking.sitter', 'sitter')
            .leftJoinAndSelect('sitter.user', 'sitterUser')
            .orderBy('booking.createdAt', 'DESC');

        const statuses = statusFilterMap[status];
        if (statuses) {
            query.andWhere('booking.status IN (:...statuses)', { statuses });
        }

        if (service && service !== 'All') {
            query.andWhere('booking.serviceType = :service', { service });
        }

        if (search) {
            const term = `%${search}%`;
            query.andWhere(
                new Brackets((qb) => {
                    qb.where('owner.firstName ILIKE :term', { term })
                        .orWhere('owner.lastName ILIKE :term', { term })
                        .orWhere('sitterUser.firstName ILIKE :term', { term })
                        .orWhere('sitterUser.lastName ILIKE :term', { term })
                        .orWhere('CAST(booking.id AS TEXT) ILIKE :term', { term });
                })
            );
        }

        const [bookings, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        res.json({
            bookings,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        res.status(500).json({ message: 'Unable to load bookings' });
    }
};

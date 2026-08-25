import { Request, Response } from 'express';
import { Between, Brackets } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { Message } from '../entities/Message.entity';
import { Review } from '../entities/Review.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { SupportRequest, SupportRequestStatus, SupportRequestType } from '../entities/SupportRequest.entity';
import { User } from '../entities/User.entity';
import { Payment } from '../entities/Payment.entity';
import { bookingReference } from '../utils/bookingReference';

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
                text: `Booking ${bookingReference(booking.id)} is ${booking.status.toLowerCase()}`,
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

const repositories = () => ({
    users: AppDataSource.getRepository(User),
    sitters: AppDataSource.getRepository(SitterProfile),
    bookings: AppDataSource.getRepository(Booking),
    payments: AppDataSource.getRepository(Payment),
    support: AppDataSource.getRepository(SupportRequest),
    reviews: AppDataSource.getRepository(Review),
    messages: AppDataSource.getRepository(Message),
});

export const getAdminVerification = async (_req: Request, res: Response): Promise<void> => {
    try {
        const items = await repositories().sitters.find({
            where: { isVerified: false },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching verification queue:', error);
        res.status(500).json({ message: 'Unable to load verification queue' });
    }
};

export const updateVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { isVerified } = req.body as { isVerified?: boolean };
        if (typeof isVerified !== 'boolean') {
            res.status(400).json({ message: 'isVerified must be a boolean' });
            return;
        }
        const sitter = await repositories().sitters.findOneBy({ id: req.params.id });
        if (!sitter) {
            res.status(404).json({ message: 'Sitter profile not found' });
            return;
        }
        sitter.isVerified = isVerified;
        await repositories().sitters.save(sitter);
        res.json({ id: sitter.id, isVerified: sitter.isVerified });
    } catch (error) {
        console.error('Error updating verification:', error);
        res.status(500).json({ message: 'Unable to update verification status' });
    }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = String(req.query.search || '').trim().toLowerCase();
        const users = await repositories().users.find({ order: { createdAt: 'DESC' }, take: 200 });
        const filtered = search
            ? users.filter((user) => `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(search))
            : users;
        res.json(filtered.map((user) => ({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, createdAt: user.createdAt })));
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Unable to load users' });
    }
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

export const getAdminPayments = async (_req: Request, res: Response): Promise<void> => {
    try {
        const payments = await repositories().payments.find({
            relations: ['owner', 'booking'],
            order: { createdAt: 'DESC' },
            take: 200,
        });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching admin payments:', error);
        res.status(500).json({ message: 'Unable to load payments' });
    }
};

export const getAdminReports = async (_req: Request, res: Response): Promise<void> => {
    try {
        const overviewResponse = await new Promise<any>((resolve, reject) => {
            getAdminOverview({} as Request, { json: resolve, status: () => ({ json: reject }) } as unknown as Response).catch(reject);
        });
        res.json({ generatedAt: new Date().toISOString(), ...overviewResponse });
    } catch (error) {
        console.error('Error generating admin report:', error);
        res.status(500).json({ message: 'Unable to generate report' });
    }
};

export const getAdminSettings = async (_req: Request, res: Response): Promise<void> => {
    res.json({
        environment: process.env.NODE_ENV || 'development',
        emailFrom: process.env.EMAIL_FROM || null,
        emailAppUrl: process.env.EMAIL_APP_URL || null,
        paymentsEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
        googleLoginEnabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    });
};

export const getAdminAudit = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { bookings, sitters, reviews, messages, users } = repositories();
        const [recentBookings, recentSitters, recentReviews, recentMessages, recentUsers] = await Promise.all([
            bookings.find({ order: { createdAt: 'DESC' }, take: 20 }),
            sitters.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 20 }),
            reviews.find({ order: { createdAt: 'DESC' }, take: 20 }),
            messages.find({ order: { createdAt: 'DESC' }, take: 20 }),
            users.find({ order: { createdAt: 'DESC' }, take: 20 }),
        ]);
        const events = [
            ...recentBookings.map((item) => ({ type: 'booking', label: `Booking ${item.id.slice(0, 8)} created`, createdAt: item.createdAt })),
            ...recentSitters.map((item) => ({ type: 'verification', label: `Sitter profile ${item.isVerified ? 'verified' : 'submitted'}`, createdAt: item.createdAt })),
            ...recentReviews.map((item) => ({ type: 'review', label: `${item.rating}-star review received`, createdAt: item.createdAt })),
            ...recentMessages.map((item) => ({ type: 'message', label: 'Message sent', createdAt: item.createdAt })),
            ...recentUsers.map((item) => ({ type: 'user', label: `${item.email} joined`, createdAt: item.createdAt })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
        res.json(events);
    } catch (error) {
        console.error('Error fetching admin audit:', error);
        res.status(500).json({ message: 'Unable to load audit log' });
    }
};

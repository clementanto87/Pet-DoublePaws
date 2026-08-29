import { Request, Response } from 'express';
import { Between, Brackets, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { Message } from '../entities/Message.entity';
import { Review } from '../entities/Review.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { SupportRequest, SupportRequestStatus, SupportRequestType } from '../entities/SupportRequest.entity';
import { User } from '../entities/User.entity';
import { Payment } from '../entities/Payment.entity';
import { Pet } from '../entities/Pet.entity';
import { bookingReference } from '../utils/bookingReference';

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const pagination = (req: Request) => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

const paginated = <T>(items: T[], total: number, page: number, limit: number) => ({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
});

const repositories = () => ({
    users: AppDataSource.getRepository(User),
    sitters: AppDataSource.getRepository(SitterProfile),
    bookings: AppDataSource.getRepository(Booking),
    payments: AppDataSource.getRepository(Payment),
    support: AppDataSource.getRepository(SupportRequest),
    reviews: AppDataSource.getRepository(Review),
    messages: AppDataSource.getRepository(Message),
    pets: AppDataSource.getRepository(Pet),
});

const parsePeriod = (periodStr?: string) => {
    const now = new Date();
    const periodStart = new Date(now);
    let days = 30;

    switch (periodStr) {
        case 'today':
            periodStart.setHours(0, 0, 0, 0);
            days = 1;
            break;
        case '7d':
            periodStart.setDate(periodStart.getDate() - 7);
            days = 7;
            break;
        case '90d':
            periodStart.setDate(periodStart.getDate() - 90);
            days = 90;
            break;
        case 'year':
            periodStart.setDate(periodStart.getDate() - 365);
            days = 365;
            break;
        case 'all':
            periodStart.setFullYear(periodStart.getFullYear() - 5);
            days = 365 * 5;
            break;
        case '30d':
        default:
            periodStart.setDate(periodStart.getDate() - 30);
            days = 30;
            break;
    }
    return { now, periodStart, days };
};

export const getAdminOverview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { users, sitters, bookings, reviews, messages, support } = repositories();
        const periodParam = String(req.query.period || '30d');
        const { now, periodStart, days } = parsePeriod(periodParam);

        // Previous period for delta comparison
        const prevPeriodStart = new Date(periodStart);
        prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

        const [
            userCount,
            sitterCount,
            verifiedSitterCount,
            pendingVerificationCount,
            periodBookings,
            prevPeriodBookings,
            supportRequests
        ] = await Promise.all([
            users.count(),
            sitters.count(),
            sitters.count({ where: { isVerified: true } }),
            sitters.count({ where: { isVerified: false } }),
            bookings.find({
                where: { createdAt: Between(periodStart, now) },
                relations: ['owner', 'sitter', 'sitter.user'],
                order: { createdAt: 'DESC' },
            }),
            bookings.find({
                where: { createdAt: Between(prevPeriodStart, periodStart) },
            }),
            support.find({ order: { createdAt: 'DESC' }, take: 100 }),
        ]);

        const [recentUsers, recentSitters, recentReviews, recentMessages] = await Promise.all([
            users.find({ order: { createdAt: 'DESC' }, take: 5 }),
            sitters.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 5 }),
            reviews.find({ relations: ['owner', 'sitter', 'sitter.user'], order: { createdAt: 'DESC' }, take: 5 }),
            messages.find({ relations: ['sender'], order: { createdAt: 'DESC' }, take: 5 }),
        ]);

        // Revenue calculations
        const grossRevenue = periodBookings
            .filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status))
            .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

        const prevGrossRevenue = prevPeriodBookings
            .filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status))
            .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

        const revenueGrowth = prevGrossRevenue > 0
            ? Math.round(((grossRevenue - prevGrossRevenue) / prevGrossRevenue) * 100)
            : 0;

        const completedBookings = periodBookings.filter((b) => b.status === BookingStatus.COMPLETED).length;
        const eligibleBookings = periodBookings.filter((b) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(b.status)).length;
        const openDisputes = supportRequests.filter((request) => request.type === SupportRequestType.DISPUTE && ![SupportRequestStatus.RESOLVED, SupportRequestStatus.CLOSED].includes(request.status)).length;

        const responseTimes = supportRequests
            .filter((request) => request.firstResponseAt)
            .map((request) => new Date(request.firstResponseAt!).getTime() - new Date(request.createdAt).getTime())
            .filter((milliseconds) => milliseconds >= 0);
        const averageResponseMinutes = responseTimes.length
            ? responseTimes.reduce((total, milliseconds) => total + milliseconds, 0) / responseTimes.length / 60000
            : null;

        // Chart intervals
        const chartPoints = Math.min(days, 30);
        const intervalStep = Math.max(1, Math.floor(days / chartPoints));
        const chart = Array.from({ length: chartPoints }, (_, index) => {
            const date = new Date(periodStart);
            date.setDate(periodStart.getDate() + index * intervalStep);
            const start = dayStart(date);
            const end = new Date(start);
            end.setDate(end.getDate() + intervalStep);

            const dayBookings = periodBookings.filter((booking) => booking.createdAt >= start && booking.createdAt < end);
            return {
                date: start.toISOString(),
                label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bookings: dayBookings.length,
                revenue: dayBookings
                    .filter((booking) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(booking.status))
                    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0),
            };
        });

        // Activity timeline
        const activity = [
            ...periodBookings.slice(0, 5).map((booking) => ({
                kind: 'booking',
                text: `Booking ${bookingReference(booking.id)} is ${booking.status.toLowerCase()}`,
                time: booking.createdAt,
            })),
            ...recentSitters.slice(0, 3).map((sitter) => ({
                kind: 'sitter',
                text: `${sitter.user?.firstName || 'A sitter'} submitted a sitter profile`,
                time: sitter.createdAt,
            })),
            ...recentReviews.slice(0, 3).map((review) => ({
                kind: 'review',
                text: `New ${review.rating}-star review received`,
                time: review.createdAt,
            })),
            ...recentMessages.slice(0, 3).map((message) => ({
                kind: 'message',
                text: `New message from ${message.sender?.firstName || 'a user'}`,
                time: message.createdAt,
            })),
            ...recentUsers.slice(0, 3).map((user) => ({
                kind: 'user',
                text: `${user.firstName} ${user.lastName} joined Double Paws`,
                time: user.createdAt,
            })),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

        res.json({
            period: periodParam,
            metrics: {
                userCount,
                sitterCount,
                verifiedSitterCount,
                bookingCount: periodBookings.length,
                grossRevenue,
                revenueGrowth,
                completionRate: eligibleBookings ? (completedBookings / eligibleBookings) * 100 : 0,
                averageBookingValue: eligibleBookings ? grossRevenue / eligibleBookings : 0,
            },
            chart,
            verificationQueue: await sitters.find({
                where: { isVerified: false },
                relations: ['user'],
                order: { createdAt: 'ASC' },
                take: 6,
            }),
            recentBookings: periodBookings.slice(0, 10),
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

export const getAdminVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, skip } = pagination(req);
        const search = String(req.query.search || '').trim().toLowerCase();
        const status = String(req.query.status || 'pending').toLowerCase();

        let whereClause: any = {};
        if (status === 'pending') {
            whereClause = { isVerified: false };
        } else if (status === 'verified') {
            whereClause = { isVerified: true };
        }

        const all = await repositories().sitters.find({
            where: whereClause,
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        const filtered = search
            ? all.filter((item) => `${item.user?.firstName || ''} ${item.user?.lastName || ''} ${item.user?.email || ''} ${item.headline || ''} ${item.address || ''}`.toLowerCase().includes(search))
            : all;

        res.json(paginated(filtered.slice(skip, skip + limit), filtered.length, page, limit));
    } catch (error) {
        console.error('Error fetching verification queue:', error);
        res.status(500).json({ message: 'Unable to load verification queue' });
    }
};

export const getAdminSitterDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const sitter = await repositories().sitters.findOne({
            where: { id: req.params.id },
            relations: ['user'],
        });
        if (!sitter) {
            res.status(404).json({ message: 'Sitter profile not found' });
            return;
        }
        res.json(sitter);
    } catch (error) {
        console.error('Error fetching sitter details:', error);
        res.status(500).json({ message: 'Unable to load sitter details' });
    }
};

export const updateVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { isVerified } = req.body as { isVerified?: boolean; notes?: string };
        if (typeof isVerified !== 'boolean') {
            res.status(400).json({ message: 'isVerified must be a boolean' });
            return;
        }
        const sitter = await repositories().sitters.findOne({
            where: { id: req.params.id },
            relations: ['user'],
        });
        if (!sitter) {
            res.status(404).json({ message: 'Sitter profile not found' });
            return;
        }
        sitter.isVerified = isVerified;
        await repositories().sitters.save(sitter);
        res.json({ id: sitter.id, isVerified: sitter.isVerified, user: sitter.user });
    } catch (error) {
        console.error('Error updating verification:', error);
        res.status(500).json({ message: 'Unable to update verification status' });
    }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, skip } = pagination(req);
        const search = String(req.query.search || '').trim().toLowerCase();
        const role = String(req.query.role || 'all').toLowerCase();

        const users = await repositories().users.find({
            relations: ['sitterProfile', 'pets'],
            order: { createdAt: 'DESC' },
        });

        let filtered = users;
        if (role === 'sitter') {
            filtered = filtered.filter((u) => !!u.sitterProfile);
        } else if (role === 'owner') {
            filtered = filtered.filter((u) => !u.sitterProfile);
        }

        if (search) {
            filtered = filtered.filter((user) =>
                `${user.firstName} ${user.lastName} ${user.email} ${user.id}`.toLowerCase().includes(search)
            );
        }

        const items = filtered.slice(skip, skip + limit).map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            hasSitterProfile: !!user.sitterProfile,
            isVerifiedSitter: Boolean(user.sitterProfile?.isVerified),
            petsCount: user.pets?.length || 0,
            createdAt: user.createdAt,
        }));

        res.json(paginated(items, filtered.length, page, limit));
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Unable to load users' });
    }
};

export const getAdminUserDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await repositories().users.findOne({
            where: { id: req.params.id },
            relations: ['sitterProfile', 'pets', 'bookings', 'bookings.sitter', 'bookings.sitter.user'],
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Unable to load user details' });
    }
};

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
                        .orWhere('owner.email ILIKE :term', { term })
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

export const getAdminBookingDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking = await repositories().bookings.findOne({
            where: { id: req.params.id },
            relations: ['owner', 'sitter', 'sitter.user'],
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // Fetch associated payments
        const payments = await repositories().payments.find({
            where: { bookingId: booking.id },
        });

        res.json({ ...booking, payments });
    } catch (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({ message: 'Unable to load booking details' });
    }
};

export const updateAdminBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body as { status?: BookingStatus };
        if (!status || !Object.values(BookingStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid booking status' });
            return;
        }

        const booking = await repositories().bookings.findOne({
            where: { id: req.params.id },
            relations: ['owner', 'sitter', 'sitter.user'],
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        booking.status = status;
        await repositories().bookings.save(booking);
        res.json(booking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Unable to update booking status' });
    }
};

export const getAdminPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, skip } = pagination(req);
        const search = String(req.query.search || '').trim().toLowerCase();
        const status = String(req.query.status || 'all').toUpperCase();

        const payments = await repositories().payments.find({
            relations: ['owner', 'booking', 'booking.sitter', 'booking.sitter.user'],
            order: { createdAt: 'DESC' },
        });

        let filtered = payments;
        if (status !== 'ALL') {
            filtered = filtered.filter((p) => p.status === status);
        }

        if (search) {
            filtered = filtered.filter((payment) =>
                `${payment.id} ${payment.stripePaymentIntentId} ${payment.owner?.firstName || ''} ${payment.owner?.lastName || ''} ${payment.owner?.email || ''} ${payment.bookingId || ''}`.toLowerCase().includes(search)
            );
        }

        res.json(paginated(filtered.slice(skip, skip + limit), filtered.length, page, limit));
    } catch (error) {
        console.error('Error fetching admin payments:', error);
        res.status(500).json({ message: 'Unable to load payments' });
    }
};

export const getAdminReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookings, users, sitters } = repositories();
        const periodParam = String(req.query.period || '30d');
        const { now, periodStart } = parsePeriod(periodParam);

        const [allBookings, allUsers, allSitters] = await Promise.all([
            bookings.find({
                where: { createdAt: MoreThanOrEqual(periodStart) },
                order: { createdAt: 'DESC' },
            }),
            users.count(),
            sitters.count(),
        ]);

        const serviceBreakdown: Record<string, { count: number; volume: number }> = {};
        allBookings.forEach((b) => {
            const svc = b.serviceType || 'boarding';
            if (!serviceBreakdown[svc]) serviceBreakdown[svc] = { count: 0, volume: 0 };
            serviceBreakdown[svc].count += 1;
            serviceBreakdown[svc].volume += Number(b.totalPrice || 0);
        });

        const statusBreakdown: Record<string, number> = {};
        allBookings.forEach((b) => {
            statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1;
        });

        const grossRevenue = allBookings
            .filter((b) => ![BookingStatus.REJECTED, BookingStatus.CANCELLED].includes(b.status))
            .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

        res.json({
            generatedAt: new Date().toISOString(),
            period: periodParam,
            metrics: {
                totalUsers: allUsers,
                totalSitters: allSitters,
                bookingCount: allBookings.length,
                grossRevenue,
                averageBookingValue: allBookings.length ? grossRevenue / allBookings.length : 0,
            },
            serviceBreakdown,
            statusBreakdown,
        });
    } catch (error) {
        console.error('Error generating admin report:', error);
        res.status(500).json({ message: 'Unable to generate report' });
    }
};

export const getAdminSettings = async (_req: Request, res: Response): Promise<void> => {
    try {
        let dbStatus = 'healthy';
        try {
            await AppDataSource.query('SELECT 1');
        } catch {
            dbStatus = 'degraded';
        }

        res.json({
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: dbStatus,
                type: 'PostgreSQL',
            },
            email: {
                configured: Boolean(process.env.EMAIL_FROM || process.env.SMTP_HOST || process.env.SENDGRID_API_KEY),
                sender: process.env.EMAIL_FROM || 'support@doublepaws24.com',
                appUrl: process.env.EMAIL_APP_URL || 'https://doublepaws24.com',
            },
            payments: {
                enabled: Boolean(process.env.STRIPE_SECRET_KEY),
                currency: 'EUR',
                connectEnabled: Boolean(process.env.STRIPE_CONNECT_CLIENT_ID || process.env.STRIPE_SECRET_KEY),
            },
            authentication: {
                googleLogin: Boolean(process.env.GOOGLE_CLIENT_ID),
                facebookLogin: Boolean(process.env.FACEBOOK_APP_ID),
                appleLogin: Boolean(process.env.APPLE_CLIENT_ID),
            },
            system: {
                nodeVersion: process.version,
                uptime: Math.floor(process.uptime()),
                platform: process.platform,
            }
        });
    } catch (error) {
        console.error('Error loading admin settings:', error);
        res.status(500).json({ message: 'Unable to load settings' });
    }
};

export const getAdminAudit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookings, sitters, reviews, messages, users, payments } = repositories();
        const [recentBookings, recentSitters, recentReviews, recentMessages, recentUsers, recentPayments] = await Promise.all([
            bookings.find({ relations: ['owner'], order: { createdAt: 'DESC' }, take: 25 }),
            sitters.find({ relations: ['user'], order: { createdAt: 'DESC' }, take: 25 }),
            reviews.find({ relations: ['owner'], order: { createdAt: 'DESC' }, take: 25 }),
            messages.find({ relations: ['sender'], order: { createdAt: 'DESC' }, take: 25 }),
            users.find({ order: { createdAt: 'DESC' }, take: 25 }),
            payments.find({ relations: ['owner'], order: { createdAt: 'DESC' }, take: 25 }),
        ]);

        const allEvents = [
            ...recentBookings.map((item) => ({
                id: item.id,
                type: 'booking',
                label: `Booking ${bookingReference(item.id)} created by ${item.owner?.firstName || 'Owner'} (${item.serviceType})`,
                actor: item.owner?.email || 'Customer',
                createdAt: item.createdAt,
            })),
            ...recentSitters.map((item) => ({
                id: item.id,
                type: 'verification',
                label: `Sitter profile for ${item.user?.firstName || 'User'} is ${item.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}`,
                actor: item.user?.email || 'Sitter',
                createdAt: item.createdAt,
            })),
            ...recentReviews.map((item) => ({
                id: item.id,
                type: 'review',
                label: `${item.rating}-star review published by ${item.owner?.firstName || 'Pet Parent'}`,
                actor: item.owner?.email || 'User',
                createdAt: item.createdAt,
            })),
            ...recentMessages.map((item) => ({
                id: item.id,
                type: 'message',
                label: `Direct message sent by ${item.sender?.firstName || 'User'}`,
                actor: item.sender?.email || 'User',
                createdAt: item.createdAt,
            })),
            ...recentUsers.map((item) => ({
                id: item.id,
                type: 'user',
                label: `User account registered: ${item.firstName} ${item.lastName}`,
                actor: item.email,
                createdAt: item.createdAt,
            })),
            ...recentPayments.map((item) => ({
                id: item.id,
                type: 'payment',
                label: `Payment of €${(item.amount / 100).toFixed(2)} status: ${item.status}`,
                actor: item.owner?.email || 'Payer',
                createdAt: item.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const { page, limit, skip } = pagination(req);
        const search = String(req.query.search || '').trim().toLowerCase();
        const type = String(req.query.type || 'all').toLowerCase();

        let filtered = allEvents;
        if (type !== 'all') {
            filtered = filtered.filter((e) => e.type === type);
        }

        if (search) {
            filtered = filtered.filter((event) =>
                `${event.type} ${event.label} ${event.actor} ${event.id}`.toLowerCase().includes(search)
            );
        }

        res.json(paginated(filtered.slice(skip, skip + limit), filtered.length, page, limit));
    } catch (error) {
        console.error('Error fetching admin audit:', error);
        res.status(500).json({ message: 'Unable to load audit log' });
    }
};

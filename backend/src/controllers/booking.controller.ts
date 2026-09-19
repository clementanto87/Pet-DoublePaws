import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { User } from '../entities/User.entity';
import { Message } from '../entities/Message.entity';
import { getIO } from '../socket';
import { emailService } from '../services/email.service';
import { Payment } from '../entities/Payment.entity';
import { Pet } from '../entities/Pet.entity';
import { stripe, isStripeConfigured } from '../config/stripe';

const bookingRepository = AppDataSource.getRepository(Booking);
const sitterRepository = AppDataSource.getRepository(SitterProfile);
const userRepository = AppDataSource.getRepository(User);
const messageRepository = AppDataSource.getRepository(Message);
const petRepository = AppDataSource.getRepository(Pet);
const paymentRepository = AppDataSource.getRepository(Payment);

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { sitterId, serviceType, startDate, endDate, petIds, message, totalPrice } = req.body;
        const ownerId = (req as any).user.id; // Assuming auth middleware adds user to req

        const start = new Date(startDate);
        const end = new Date(endDate);
        const numericTotal = Number(totalPrice);
        if (!serviceType || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start || !Number.isFinite(numericTotal) || numericTotal < 0) {
            return res.status(400).json({ message: 'Valid service, dates, and total price are required' });
        }

        const requestedPetIds = Array.isArray(petIds) ? [...new Set(petIds.map((petId: unknown) => String(petId)))] : [];
        if (requestedPetIds.length > 0) {
            const ownedPets = await petRepository.count({ where: requestedPetIds.map((id) => ({ id, ownerId })) });
            if (ownedPets !== requestedPetIds.length) {
                return res.status(403).json({ message: 'You can only book with pets in your profile' });
            }
        }

        const sitter = await sitterRepository.findOne({ where: { id: sitterId } });
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        const booking = bookingRepository.create({
            sitterId,
            ownerId,
            serviceType,
            startDate: start,
            endDate: end,
            petIds: requestedPetIds,
            message,
            totalPrice: numericTotal,
            status: BookingStatus.PENDING
        });

        await bookingRepository.save(booking);

        const [owner, sitterUser] = await Promise.all([
            userRepository.findOneBy({ id: ownerId }),
            userRepository.findOneBy({ id: sitter.userId }),
        ]);
        if (owner && sitterUser) {
            void emailService.sendBookingCreated(owner, sitterUser, booking);
        }

        // Notify Sitter via Socket
        try {
            const io = getIO();
            io.to(sitter.userId).emit('new_booking', {
                message: 'You have a new booking request!',
                bookingId: booking.id,
                serviceType: booking.serviceType
            });
            console.log(`Notification sent to sitter ${sitter.userId}`);
        } catch (socketError) {
            console.error('Socket notification failed:', socketError);
        }

        // If a message was provided, create a conversation entry
        if (message && message.trim()) {
            try {
                const newMessage = messageRepository.create({
                    senderId: ownerId,
                    receiverId: sitter.userId, // Sitter's user ID
                content: `Booking request\n\nService: ${serviceType}\nDates: ${start.toLocaleString()} - ${end.toLocaleString()}\nEstimated total: €${numericTotal.toFixed(2)}\n\nMessage from the customer:\n${message.trim()}`,
                    bookingId: booking.id,
                    read: false
                });
                await messageRepository.save(newMessage);
            } catch (msgError) {
                console.error('Error creating initial message:', msgError);
                // Don't fail the booking if message creation fails, but log it
            }
        }

        return res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const role = req.query.role === 'sitter' ? 'sitter' : 'owner';
        const bucket = req.query.bucket === 'history' ? 'history' : 'upcoming';
        const search = String(req.query.search || '').trim().toLowerCase();
        const requestedStatus = String(req.query.status || '').trim().toUpperCase();
        const pageSize = 5;
        const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);

        const upcomingStatuses = [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.COMPLETION_REQUESTED];
        const historyStatuses = [BookingStatus.COMPLETED, BookingStatus.REJECTED, BookingStatus.CANCELLED];
        const statuses = requestedStatus && [...upcomingStatuses, ...historyStatuses].includes(requestedStatus as BookingStatus)
            ? [requestedStatus as BookingStatus]
            : bucket === 'history' ? historyStatuses : upcomingStatuses;

        let sitterProfileId: string | undefined;
        if (role === 'sitter') {
            // Find sitter profile for this user first
            const sitterProfile = await sitterRepository.findOne({ where: { userId } });
            if (!sitterProfile) {
                return res.status(404).json({ message: 'Sitter profile not found' });
            }
            sitterProfileId = sitterProfile.id;
        }

        const query = bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.sitter', 'sitter')
            .leftJoinAndSelect('sitter.user', 'sitterUser')
            .leftJoinAndSelect('booking.owner', 'owner')
            .leftJoinAndSelect('owner.pets', 'ownerPets')
            .where(role === 'sitter' ? 'booking.sitterId = :sitterProfileId' : 'booking.ownerId = :userId', {
                ...(role === 'sitter' ? { sitterProfileId } : { userId }),
            })
            .orderBy('booking.createdAt', 'DESC')
            .addOrderBy('booking.id', 'DESC')
            .distinct(true);

        if (role === 'owner') {
            query.leftJoin(Payment, 'payment', 'payment.bookingId = booking.id');
            if (bucket === 'upcoming' && !requestedStatus) {
                query.andWhere(
                    '(booking.status IN (:...upcomingStatuses) OR (booking.status = :completed AND (payment.status IS NULL OR payment.status != :paid)))',
                    { upcomingStatuses, completed: BookingStatus.COMPLETED, paid: 'SUCCEEDED' },
                );
            } else if (bucket === 'history' && !requestedStatus) {
                query.andWhere(
                    '(booking.status IN (:...historyStatuses) AND (booking.status != :completed OR payment.status = :paid))',
                    { historyStatuses, completed: BookingStatus.COMPLETED, paid: 'SUCCEEDED' },
                );
            } else {
                query.andWhere('booking.status IN (:...statuses)', { statuses });
            }
        } else {
            query.andWhere('booking.status IN (:...statuses)', { statuses });
        }

        if (search) {
            const likeSearch = `%${search}%`;
            query.andWhere(
                '(LOWER(booking.serviceType) LIKE :likeSearch OR LOWER(owner.firstName) LIKE :likeSearch OR LOWER(owner.lastName) LIKE :likeSearch OR LOWER(sitterUser.firstName) LIKE :likeSearch OR LOWER(sitterUser.lastName) LIKE :likeSearch OR LOWER(CAST(booking.id AS TEXT)) LIKE :likeSearch OR LOWER(CAST(booking.startDate AS TEXT)) LIKE :likeSearch OR LOWER(CAST(booking.endDate AS TEXT)) LIKE :likeSearch)',
                { likeSearch },
            );
        }

        const [total, bookings] = await Promise.all([
            query.clone().getCount(),
            query.skip((page - 1) * pageSize).take(pageSize).getMany(),
        ]);

        return res.json({
            items: bookings,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBookingsBySitterId = async (req: Request, res: Response) => {
    try {
        const { sitterId } = req.params;

        // Verify sitter exists
        const sitter = await sitterRepository.findOne({ where: { id: sitterId } });
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        // Get all bookings for this sitter (only accepted and pending to show on calendar)
        const bookings = await bookingRepository.find({
            where: [
                { sitterId, status: BookingStatus.ACCEPTED },
                { sitterId, status: BookingStatus.PENDING }
            ],
            select: ['id', 'startDate', 'endDate', 'status', 'serviceType'],
            order: { startDate: 'ASC' }
        });

        return res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings by sitter:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (req as any).user.id;

        const booking = await bookingRepository.findOne({
            where: { id },
            relations: ['sitter', 'sitter.user', 'owner']
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify ownership (only sitter can accept/reject, owner can cancel)
        const isSitter = booking.sitter.userId === userId;
        const isOwner = booking.ownerId === userId;

        if (!isSitter && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let isValidUpdate = false;

        if (isSitter && [BookingStatus.ACCEPTED, BookingStatus.REJECTED].includes(status)) {
            isValidUpdate = true;
        } else if (isSitter && status === BookingStatus.COMPLETION_REQUESTED) {
            // The sitter can request completion, but the customer must confirm it.
            isValidUpdate = booking.status === BookingStatus.ACCEPTED;
        } else if (isOwner && status === BookingStatus.COMPLETED) {
            isValidUpdate = booking.status === BookingStatus.COMPLETION_REQUESTED;
        } else if (isOwner && status === BookingStatus.CANCELLED) {
            isValidUpdate = true;
        }

        if (!isValidUpdate) {
            return res.status(400).json({ message: 'Invalid status update for your role' });
        }

        if (isOwner && status === BookingStatus.COMPLETED) {
            const payment = await paymentRepository.findOne({ where: { bookingId: booking.id } });
            if (!payment || payment.status !== 'PENDING' || !isStripeConfigured() || !stripe) {
                return res.status(400).json({ message: 'Payment must be authorized before confirming completion' });
            }
            const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
            if (intent.status !== 'requires_capture') {
                return res.status(400).json({ message: 'The payment authorization is no longer available' });
            }
            await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
        }

        booking.status = status;
        await bookingRepository.save(booking);

        const statusMessages: Partial<Record<BookingStatus, string>> = {
            [BookingStatus.ACCEPTED]: 'The sitter accepted your booking request. Please authorize the payment from your dashboard to confirm the booking.',
            [BookingStatus.REJECTED]: 'The sitter declined this booking request.',
            [BookingStatus.COMPLETION_REQUESTED]: 'The sitter marked the service as ready for completion. Please review the service and confirm completion from your dashboard.',
            [BookingStatus.COMPLETED]: 'The customer confirmed that the service was completed. Thank you for using Double Paws.',
            [BookingStatus.CANCELLED]: 'The customer cancelled this booking.',
        };
        const statusMessage = statusMessages[status as BookingStatus];
        if (statusMessage) {
            const receiverId = isSitter ? booking.ownerId : booking.sitter.userId;
            const lifecycleMessage = messageRepository.create({
                senderId: userId,
                receiverId,
                bookingId: booking.id,
                content: statusMessage,
                read: false,
            });
            await messageRepository.save(lifecycleMessage);
        }

        if (status === BookingStatus.ACCEPTED || status === BookingStatus.REJECTED || status === BookingStatus.COMPLETION_REQUESTED || status === BookingStatus.COMPLETED) {
            if (booking.owner) {
                void emailService.sendBookingStatus(
                    booking.owner,
                    booking,
                    status === BookingStatus.ACCEPTED ? 'accepted' : status === BookingStatus.REJECTED ? 'rejected' : 'completed',
                );
            }
        } else if (status === BookingStatus.CANCELLED && booking.sitter?.user) {
            void emailService.sendBookingStatus(booking.sitter.user, booking, 'cancelled');
        }

        return res.json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

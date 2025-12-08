import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { User } from '../entities/User.entity';
import { Message } from '../entities/Message.entity';

const bookingRepository = AppDataSource.getRepository(Booking);
const sitterRepository = AppDataSource.getRepository(SitterProfile);
const userRepository = AppDataSource.getRepository(User);
const messageRepository = AppDataSource.getRepository(Message);

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { sitterId, serviceType, startDate, endDate, petIds, message, totalPrice } = req.body;
        const ownerId = (req as any).user.id; // Assuming auth middleware adds user to req

        const sitter = await sitterRepository.findOne({ where: { id: sitterId } });
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        const booking = bookingRepository.create({
            sitterId,
            ownerId,
            serviceType,
            startDate,
            endDate,
            petIds,
            message,
            totalPrice,
            status: BookingStatus.PENDING
        });

        await bookingRepository.save(booking);

        // If a message was provided, create a conversation entry
        if (message && message.trim()) {
            try {
                const newMessage = messageRepository.create({
                    senderId: ownerId,
                    receiverId: sitter.userId, // Sitter's user ID
                    content: message,
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
        const { role } = req.query; // 'owner' or 'sitter'

        let whereClause: any = {};
        if (role === 'sitter') {
            // Find sitter profile for this user first
            const sitterProfile = await sitterRepository.findOne({ where: { userId } });
            if (!sitterProfile) {
                return res.status(404).json({ message: 'Sitter profile not found' });
            }
            whereClause = { sitterId: sitterProfile.id };
        } else {
            whereClause = { ownerId: userId };
        }

        const bookings = await bookingRepository.find({
            where: whereClause,
            relations: ['sitter', 'sitter.user', 'owner', 'owner.pets'],
            order: { createdAt: 'DESC' }
        });

        return res.json(bookings);
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
            relations: ['sitter']
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
        } else if (isOwner && status === BookingStatus.CANCELLED) {
            isValidUpdate = true;
        }

        if (!isValidUpdate) {
            return res.status(400).json({ message: 'Invalid status update for your role' });
        }

        booking.status = status;
        await bookingRepository.save(booking);

        return res.json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

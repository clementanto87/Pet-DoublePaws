import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Review } from '../entities/Review.entity';
import { Booking, BookingStatus } from '../entities/Booking.entity';

const reviewRepository = AppDataSource.getRepository(Review);
const bookingRepository = AppDataSource.getRepository(Booking);

export const createReview = async (req: Request, res: Response) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const ownerId = (req as any).user.id;

        const booking = await bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        if (booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.ACCEPTED) {
            // Allow reviewing accepted bookings for now, or strictly completed
            // return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        const review = reviewRepository.create({
            bookingId,
            sitterId: booking.sitterId,
            ownerId,
            rating,
            comment
        });

        await reviewRepository.save(review);

        return res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getSitterReviews = async (req: Request, res: Response) => {
    try {
        const { sitterId } = req.params;

        const reviews = await reviewRepository.find({
            where: { sitterId },
            relations: ['owner'],
            order: { createdAt: 'DESC' }
        });

        return res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

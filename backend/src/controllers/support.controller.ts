import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking } from '../entities/Booking.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { SupportRequest, SupportRequestStatus, SupportRequestType } from '../entities/SupportRequest.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../entities/User.entity';
import { emailService } from '../services/email.service';

const requestRepository = AppDataSource.getRepository(SupportRequest);
const bookingRepository = AppDataSource.getRepository(Booking);
const sitterRepository = AppDataSource.getRepository(SitterProfile);
const userRepository = AppDataSource.getRepository(User);

export const createSupportRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, subject, description, bookingId } = req.body;
        const reporterId = req.user.id;

        if (!Object.values(SupportRequestType).includes(type) || !subject?.trim() || !description?.trim()) {
            res.status(400).json({ message: 'Type, subject, and description are required' });
            return;
        }

        if (bookingId) {
            const booking = await bookingRepository.findOne({ where: { id: bookingId }, relations: ['sitter', 'sitter.user'] });
            const sitterProfile = await sitterRepository.findOne({ where: { userId: reporterId } });
            const canReport = booking && (booking.ownerId === reporterId || booking.sitter?.userId === reporterId || sitterProfile?.id === booking.sitterId);
            if (!canReport) {
                res.status(403).json({ message: 'You can only report a booking you are involved in' });
                return;
            }
        }

        const request = requestRepository.create({
            reporterId,
            bookingId,
            type,
            subject: subject.trim(),
            description: description.trim(),
            status: SupportRequestStatus.OPEN,
        });
        await requestRepository.save(request);
        const reporter = await userRepository.findOneBy({ id: reporterId });
        if (reporter) {
            void emailService.sendSupportUpdate(reporter, request);
        }
        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating support request:', error);
        res.status(500).json({ message: 'Unable to submit support request' });
    }
};

export const getMySupportRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await requestRepository.find({
            where: { reporterId: req.user.id },
            relations: ['booking'],
            order: { createdAt: 'DESC' },
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching support requests:', error);
        res.status(500).json({ message: 'Unable to load support requests' });
    }
};

export const updateSupportRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;
        if (!Object.values(SupportRequestStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid support request status' });
            return;
        }

        const request = await requestRepository.findOne({ where: { id }, relations: ['reporter'] });
        if (!request) {
            res.status(404).json({ message: 'Support request not found' });
            return;
        }

        request.status = status;
        if (adminResponse?.trim()) {
            request.adminResponse = adminResponse.trim();
            request.firstResponseAt ??= new Date();
        }
        await requestRepository.save(request);
        if (request.adminResponse && request.reporter) {
            void emailService.sendSupportUpdate(request.reporter, request);
        }
        res.json(request);
    } catch (error) {
        console.error('Error updating support request:', error);
        res.status(500).json({ message: 'Unable to update support request' });
    }
};

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Message } from '../entities/Message.entity';
import { User } from '../entities/User.entity';
import { Booking } from '../entities/Booking.entity';
import { In } from 'typeorm';

const messageRepository = AppDataSource.getRepository(Message);
const userRepository = AppDataSource.getRepository(User);
const bookingRepository = AppDataSource.getRepository(Booking);

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const senderId = (req as any).user.id;
        const { receiverId, content, bookingId, imageUrl } = req.body;

        if (!receiverId || (!content && !imageUrl)) {
            return res.status(400).json({ message: 'Receiver and content (or image) are required' });
        }

        const receiver = await userRepository.findOneBy({ id: receiverId });
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = new Message();
        message.senderId = senderId;
        message.receiverId = receiverId;
        message.content = content || '';
        message.imageUrl = imageUrl;

        if (bookingId) {
            const booking = await bookingRepository.findOneBy({ id: bookingId });
            if (booking) {
                message.booking = booking;
            }
        }

        await messageRepository.save(message);

        return res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { otherUserId } = req.params;

        const messages = await messageRepository.find({
            where: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ],
            order: { createdAt: 'ASC' },
            relations: ['sender', 'receiver']
        });

        // Mark messages as read
        const unreadMessages = messages.filter((m: Message) => m.receiverId === userId && !m.read);
        if (unreadMessages.length > 0) {
            await messageRepository.update(
                { id: In(unreadMessages.map((m: Message) => m.id)) },
                { read: true }
            );
        }

        return res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Get all messages involving the user
        const messages = await messageRepository.find({
            where: [
                { senderId: userId },
                { receiverId: userId }
            ],
            order: { createdAt: 'DESC' },
            relations: ['sender', 'receiver']
        });

        // Group by other user
        const conversationsMap = new Map<string, any>();

        messages.forEach((message: Message) => {
            const otherUser = message.senderId === userId ? message.receiver : message.sender;
            if (!conversationsMap.has(otherUser.id)) {
                conversationsMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: message,
                    unreadCount: 0
                });
            }

            if (message.receiverId === userId && !message.read) {
                const conv = conversationsMap.get(otherUser.id);
                conv.unreadCount++;
            }
        });

        return res.json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

/** Protect operational admin data with an explicit allow-list in production. */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = userId
            ? await AppDataSource.getRepository(User).findOneBy({ id: userId })
            : null;
        const allowedEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        if (!user || !allowedEmails.includes(user.email.toLowerCase())) {
            res.status(403).json({ message: 'Administrator access required' });
            return;
        }

        req.user = { ...req.user, role: 'admin' };
        next();
    } catch (error) {
        console.error('Admin authorization error:', error);
        res.status(500).json({ message: 'Unable to verify administrator access' });
    }
};

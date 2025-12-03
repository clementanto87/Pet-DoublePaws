import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await userRepository.save(newUser);

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        // We need to explicitly select password because it's set to select: false in the entity
        const user = await userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName'],
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body;

        // Verify access token and get user info
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const payload = await response.json();
        const { email, given_name, family_name, sub: googleId } = payload;

        if (!email) {
            res.status(400).json({ message: 'Email not found in Google token' });
            return;
        }

        // Check if user exists
        let user = await userRepository.findOneBy({ email });

        if (user) {
            // Update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                await userRepository.save(user);
            }
        } else {
            // Create new user
            user = userRepository.create({
                email,
                firstName: given_name || 'User',
                lastName: family_name || '',
                googleId,
                password: '', // No password for Google users
            });
            await userRepository.save(user);
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Google login successful',
            token: jwtToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

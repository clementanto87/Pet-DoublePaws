import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const userRepository = AppDataSource.getRepository(User);
const googleClient = new OAuth2Client();

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
        if (!token || typeof token !== 'string') {
            res.status(400).json({ message: 'Missing Google token' });
            return;
        }

        // The web app can send either:
        // - OAuth access_token (from @react-oauth/google useGoogleLogin)
        // - ID token JWT credential (from Google One Tap)
        //
        // We support both for reliability across web + mobile.
        const looksLikeJwt = token.split('.').length === 3;

        let email: string | undefined;
        let given_name: string | undefined;
        let family_name: string | undefined;
        let googleId: string | undefined;

        if (looksLikeJwt) {
            const rawClientIds = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '';
            const audiences = rawClientIds
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            let payload: any;
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    // If you set GOOGLE_CLIENT_IDS, we enforce aud checks for safety.
                    // If not set, verification still happens but without aud enforcement.
                    audience: audiences.length > 0 ? audiences : undefined,
                });
                payload = ticket.getPayload();
            } catch (e: any) {
                const details = e?.message || 'Failed to verify Google ID token';
                res.status(401).json({
                    message: 'Invalid Google ID token',
                    ...(process.env.NODE_ENV !== 'production'
                        ? {
                            details,
                            hint: audiences.length === 0
                                ? 'Set GOOGLE_CLIENT_IDS (comma-separated) to your Web/Android/iOS OAuth client IDs.'
                                : undefined,
                        }
                        : {}),
                });
                return;
            }

            email = payload?.email || undefined;
            given_name = (payload as any)?.given_name || undefined;
            family_name = (payload as any)?.family_name || undefined;
            googleId = payload?.sub || undefined;
        } else {
            // Verify access token and get user info
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                res.status(401).json({ message: 'Invalid Google access token' });
                return;
            }

            const payload = await response.json();
            email = payload?.email;
            given_name = payload?.given_name;
            family_name = payload?.family_name;
            googleId = payload?.sub;
        }

        if (!email) {
            res.status(400).json({ message: 'Email not found in Google token' });
            return;
        }
        if (!googleId) {
            res.status(400).json({ message: 'Google user id not found in Google token' });
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
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const user = await userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'firstName', 'lastName'],
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

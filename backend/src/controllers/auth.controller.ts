import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { emailService } from '../services/email.service';

const userRepository = AppDataSource.getRepository(User);
const googleClient = new OAuth2Client();

export const formatUserResponse = async (user: User) => {
    const sitterRepo = AppDataSource.getRepository(SitterProfile);
    const sitterProfile = await sitterRepo.findOneBy({ userId: user.id });
    const isSitter = Boolean(sitterProfile);

    const allowedEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
    const isAdmin = allowedEmails.includes(user.email.toLowerCase());

    const role: 'admin' | 'sitter' | 'user' = isAdmin ? 'admin' : isSitter ? 'sitter' : 'user';

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        role,
        isSitter,
        sitterProfileId: sitterProfile?.id,
    };
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, password } = req.body;
        // Normalize email so casing/whitespace can't create duplicate accounts
        const email = (req.body.email || '').trim().toLowerCase();

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

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

        void emailService.sendWelcome(newUser);

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        const userResponse = await formatUserResponse(newUser);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { password } = req.body;
        const email = (req.body.email || '').trim().toLowerCase();

        // Find user
        // We need to explicitly select password because it's set to select: false in the entity
        const user = await userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'profileImage'],
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

        const userResponse = await formatUserResponse(user);

        res.json({
            message: 'Login successful',
            token,
            user: userResponse,
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

            email = payload?.email ? String(payload.email).trim().toLowerCase() : undefined;
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

            const data = await response.json();
            email = data.email ? String(data.email).trim().toLowerCase() : undefined;
            given_name = data.given_name || undefined;
            family_name = data.family_name || undefined;
            googleId = data.sub || undefined;
        }

        if (!email) {
            res.status(400).json({ message: 'Google account did not provide an email address' });
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
            void emailService.sendWelcome(user);
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        const userResponse = await formatUserResponse(user);

        res.json({
            message: 'Google login successful',
            token: jwtToken,
            user: userResponse,
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const facebookLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accessToken } = req.body;
        if (!accessToken || typeof accessToken !== 'string') {
            res.status(400).json({ message: 'Missing Facebook access token' });
            return;
        }

        // Verify token against Facebook Graph API
        const response = await fetch(
            `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            res.status(401).json({ message: 'Invalid Facebook token', details: errData });
            return;
        }

        const data = await response.json();
        const facebookId = data.id;
        const email = data.email ? String(data.email).trim().toLowerCase() : `fb_${facebookId}@facebook.doublepaws24.com`;
        const firstName = data.first_name || 'Facebook';
        const lastName = data.last_name || 'User';
        const profileImage = data.picture?.data?.url || undefined;

        // Check if user exists by facebookId or email
        let user = await userRepository.findOne({
            where: [{ facebookId }, { email }],
        });

        if (user) {
            let needsSave = false;
            if (!user.facebookId) {
                user.facebookId = facebookId;
                needsSave = true;
            }
            if (!user.profileImage && profileImage) {
                user.profileImage = profileImage;
                needsSave = true;
            }
            if (needsSave) {
                await userRepository.save(user);
            }
        } else {
            user = userRepository.create({
                email,
                firstName,
                lastName,
                facebookId,
                profileImage,
                password: '',
            });
            await userRepository.save(user);
            void emailService.sendWelcome(user);
        }

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        const userResponse = await formatUserResponse(user);

        res.json({
            message: 'Facebook login successful',
            token: jwtToken,
            user: userResponse,
        });
    } catch (error) {
        console.error('Facebook login error:', error);
        res.status(500).json({ message: 'Server error during Facebook login' });
    }
};

export const appleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_token, user: userPayload } = req.body;
        if (!id_token || typeof id_token !== 'string') {
            res.status(400).json({ message: 'Missing Apple ID token' });
            return;
        }

        // Decode Apple JWT to extract claims (sub, email)
        const decoded = jwt.decode(id_token) as any;
        if (!decoded || !decoded.sub) {
            res.status(401).json({ message: 'Invalid Apple ID token payload' });
            return;
        }

        const appleId = decoded.sub;
        const email = decoded.email
            ? String(decoded.email).trim().toLowerCase()
            : userPayload?.email
            ? String(userPayload.email).trim().toLowerCase()
            : `apple_${appleId}@apple.doublepaws24.com`;

        let firstName = 'Apple';
        let lastName = 'User';

        if (userPayload?.name?.firstName) {
            firstName = userPayload.name.firstName;
            lastName = userPayload.name.lastName || '';
        }

        // Check if user exists by appleId or email
        let user = await userRepository.findOne({
            where: [{ appleId }, { email }],
        });

        if (user) {
            if (!user.appleId) {
                user.appleId = appleId;
                await userRepository.save(user);
            }
        } else {
            user = userRepository.create({
                email,
                firstName,
                lastName,
                appleId,
                password: '',
            });
            await userRepository.save(user);
            void emailService.sendWelcome(user);
        }

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        const userResponse = await formatUserResponse(user);

        res.json({
            message: 'Apple login successful',
            token: jwtToken,
            user: userResponse,
        });
    } catch (error) {
        console.error('Apple login error:', error);
        res.status(500).json({ message: 'Server error during Apple login' });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const user = await userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userResponse = await formatUserResponse(user);
        res.json(userResponse);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

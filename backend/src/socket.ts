import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { isAllowedOrigin } from './config/cors';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || isAllowedOrigin(origin)) {
                    return callback(null, true);
                }
                return callback(new Error(`Origin ${origin} not allowed by CORS`));
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token || typeof token !== 'string') {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            const payload = decoded as jwt.JwtPayload & { id?: string };
            if (!payload.id) {
                return next(new Error('Invalid authentication token'));
            }
            socket.data.userId = payload.id;
            return next();
        } catch {
            return next(new Error('Invalid authentication token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId as string;
        console.log(`User ${userId} connected via socket`);
        socket.join(userId);

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from socket`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

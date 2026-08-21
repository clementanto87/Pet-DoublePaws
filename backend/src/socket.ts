import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
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

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_user', (userId: string) => {
            console.log(`User ${userId} joined their room`);
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
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

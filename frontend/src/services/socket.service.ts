import { io, type Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

export const createUserSocket = (): Socket | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    return io(getSocketUrl(), {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
    });
};

import api from '../lib/api';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string;
    read: boolean;
    createdAt: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
    };
    receiver: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface Conversation {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    lastMessage: Message;
    unreadCount: number;
}

export const messageService = {
    async sendMessage(receiverId: string, content: string, bookingId?: string, imageUrl?: string): Promise<Message> {
        const response = await api.post('/messages', { receiverId, content, bookingId, imageUrl });
        return response.data;
    },

    async getConversations(): Promise<Conversation[]> {
        const response = await api.get('/messages/conversations');
        return response.data;
    },

    async getConversation(otherUserId: string): Promise<Message[]> {
        const response = await api.get(`/messages/conversation/${otherUserId}`);
        return response.data;
    }
};

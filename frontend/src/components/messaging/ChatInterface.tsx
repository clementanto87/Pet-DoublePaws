import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../../services/message.service';
import { useAuth } from '../../context/AuthContext';
import { Send, User, Search, MessageSquare, Circle, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface ChatInterfaceProps {
    defaultSelectedUserId?: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ defaultSelectedUserId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(defaultSelectedUserId || null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations
    const { data: conversations, isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 5000
    });

    // Filter conversations
    const filteredConversations = conversations?.filter(c =>
        c.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch active conversation messages
    const { data: messages, isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', selectedUserId],
        queryFn: () => selectedUserId ? messageService.getConversation(selectedUserId) : Promise.resolve([]),
        enabled: !!selectedUserId,
        refetchInterval: 3000
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: ({ receiverId, content, imageUrl }: { receiverId: string, content: string, imageUrl?: string }) =>
            messageService.sendMessage(receiverId, content, undefined, imageUrl),
        onSuccess: () => {
            setMessageInput('');
            setSelectedImage(null);
            queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || (!messageInput.trim() && !selectedImage)) return;
        sendMessageMutation.mutate({ receiverId: selectedUserId, content: messageInput, imageUrl: selectedImage || undefined });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectedConversation = conversations?.find(c => c.user.id === selectedUserId);

    return (
        <div className="flex h-full min-h-[500px] md:min-h-[750px] bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Left Sidebar - Conversations List */}
            <div
                className={cn(
                    "w-full md:w-[360px] border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800",
                    selectedUserId && "hidden md:flex"
                )}
            >
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-4 md:mb-5">
                        Messages
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 md:p-6 text-center text-gray-500 text-sm">Loading conversations...</div>
                    ) : filteredConversations?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 md:p-8">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-5">
                                <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                            </div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">No chats yet</p>
                            <p className="text-xs md:text-sm text-gray-500 max-w-xs">Book a service to start chatting with sitters</p>
                        </div>
                    ) : (
                        <div className="p-2 md:p-3">
                            {filteredConversations?.map((conv) => (
                                <motion.div
                                    key={conv.user.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => setSelectedUserId(conv.user.id)}
                                    className={cn(
                                        "p-3 md:p-4 cursor-pointer rounded-xl transition-all mb-2",
                                        selectedUserId === conv.user.id
                                            ? "bg-primary text-white shadow-md"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div className={cn(
                                                "w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center",
                                                selectedUserId === conv.user.id
                                                    ? "ring-2 ring-white/30"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            )}>
                                                {conv.user.profileImage ? (
                                                    <img
                                                        src={conv.user.profileImage}
                                                        alt={conv.user.firstName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className={cn(
                                                        "w-6 h-6 md:w-7 md:h-7",
                                                        selectedUserId === conv.user.id ? "text-white" : "text-gray-400"
                                                    )} />
                                                )}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold border-2 border-white shadow-sm">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1 md:mb-1.5">
                                                <h3 className={cn(
                                                    "font-semibold text-sm md:text-base truncate",
                                                    selectedUserId === conv.user.id ? "text-white" : "text-gray-900 dark:text-white"
                                                )}>
                                                    {conv.user.firstName} {conv.user.lastName}
                                                </h3>
                                                <span className={cn(
                                                    "text-xs flex-shrink-0 ml-2 md:ml-3",
                                                    selectedUserId === conv.user.id ? "text-white/80" : "text-gray-400"
                                                )}>
                                                    {format(new Date(conv.lastMessage.createdAt), 'h:mm a')}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs md:text-sm truncate",
                                                selectedUserId === conv.user.id
                                                    ? "text-white/90"
                                                    : "text-gray-500 dark:text-gray-400"
                                            )}>
                                                {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}{conv.lastMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/30",
                    !selectedUserId && "hidden md:flex"
                )}
            >
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* Back button for mobile */}
                                <button
                                    onClick={() => setSelectedUserId(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0">
                                    {selectedConversation?.user.profileImage ? (
                                        <img
                                            src={selectedConversation.user.profileImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white truncate">
                                        {selectedConversation?.user.firstName} {selectedConversation?.user.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                                        <Circle className="w-2 h-2 md:w-2.5 md:h-2.5 fill-emerald-500 text-emerald-500 flex-shrink-0" />
                                        <span className="text-xs md:text-sm text-gray-500">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="text-sm text-gray-400">Loading messages...</div>
                                </div>
                            ) : messages && messages.length > 0 ? (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                                        >
                                            <div className={cn(
                                                "max-w-[85%] md:max-w-[75%] flex flex-col gap-1 md:gap-1.5",
                                                isMe ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-sm leading-relaxed",
                                                    isMe
                                                        ? "bg-primary text-white rounded-br-md shadow-sm"
                                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm"
                                                )}>
                                                    {msg.imageUrl && (
                                                        <div className="mb-2 rounded-lg overflow-hidden max-w-[200px] md:max-w-[300px]">
                                                            <img src={msg.imageUrl} alt="Shared image" className="w-full h-auto" />
                                                        </div>
                                                    )}
                                                    {msg.content && (
                                                        <div>{msg.content}</div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] md:text-xs text-gray-400 px-2">
                                                    {format(new Date(msg.createdAt), 'h:mm a')}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 md:p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSendMessage} className="flex flex-col gap-2 w-full">
                                {selectedImage && (
                                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2 md:gap-3 items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 flex-shrink-0"
                                        title="Attach image"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </Button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 md:px-5 py-2.5 md:py-3 rounded-full bg-gray-100 dark:bg-gray-700 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={(!messageInput.trim() && !selectedImage) || sendMessageMutation.isPending}
                                        className="rounded-full w-11 h-11 md:w-12 md:h-12 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all flex-shrink-0"
                                    >
                                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-5 md:mb-6">
                            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                            Start Chatting!
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 max-w-sm leading-relaxed">
                            Select a conversation from the left or book a service to connect with a sitter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

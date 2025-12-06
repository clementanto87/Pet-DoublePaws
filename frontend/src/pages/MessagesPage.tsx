import React from 'react';
import { ChatInterface } from '../components/messaging/ChatInterface';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const MessagesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultUserId = location.state?.userId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
                {/* Header */}
                <div className="mb-4 md:mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-3 md:mb-4 text-sm md:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Chat with your sitters</p>
                        </div>
                    </div>
                </div>

                {/* Chat Interface - Full Height */}
                <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-220px)]">
                    <ChatInterface defaultSelectedUserId={defaultUserId} />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;


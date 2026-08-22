import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatPageLayout } from '../components/messaging/ChatPageLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const MessagesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const defaultUserId = location.state?.userId;

    return (
        <ChatPageLayout
            title={t('messages.title')}
            subtitle={t('messages.subtitle')}
            backLabel={t('messages.backToDashboard')}
            onBack={() => navigate('/dashboard')}
            defaultUserId={defaultUserId}
        />
    );
};

export default MessagesPage;

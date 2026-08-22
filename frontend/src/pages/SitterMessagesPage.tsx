import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatPageLayout } from '../components/messaging/ChatPageLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const SitterMessagesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const defaultUserId = location.state?.userId;

    return (
        <ChatPageLayout
            title={t('sitterMessages.title')}
            subtitle={t('sitterMessages.subtitle')}
            backLabel={t('sitterMessages.backToDashboard')}
            onBack={() => navigate('/sitter-dashboard')}
            defaultUserId={defaultUserId}
        />
    );
};

export default SitterMessagesPage;

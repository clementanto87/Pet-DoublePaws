import React from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const GoogleOneTap: React.FC = () => {
    const { googleLogin, isAuthenticated } = useAuth();

    console.log('GoogleOneTap: Mounting. isAuthenticated:', isAuthenticated);

    useGoogleOneTapLogin({
        onSuccess: async (credentialResponse) => {
            console.log('GoogleOneTap: Success credential received');
            if (credentialResponse.credential) {
                try {
                    await googleLogin(credentialResponse.credential);
                    console.log('GoogleOneTap: Sign-in successful');
                } catch (error) {
                    console.error('GoogleOneTap: Sign-in failed:', error);
                }
            }
        },
        onError: () => {
            console.error('GoogleOneTap: Sign-in Failed (onError callback triggered)');
        },
        disabled: isAuthenticated,
        auto_select: false,
    });

    return null;
};

export default GoogleOneTap;

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SocialAuthButtonsProps {
    mode?: 'login' | 'signup';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode = 'login' }) => {
    const { googleLogin, facebookLogin, appleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'apple' | null>(null);
    const [socialError, setSocialError] = useState<string | null>(null);

    const redirectPath = location.state?.from?.pathname || (mode === 'signup' ? '/' : '/dashboard');

    const handleGoogleLogin = useGoogleLogin({
        scope: 'openid profile email',
        onSuccess: async (tokenResponse) => {
            setLoadingProvider('google');
            setSocialError(null);
            try {
                await googleLogin(tokenResponse.access_token);
                navigate(redirectPath, { replace: true });
            } catch (err: any) {
                console.error('Google login failed', err);
                setSocialError(err.response?.data?.message || 'Google sign-in failed');
            } finally {
                setLoadingProvider(null);
            }
        },
        onError: () => {
            setSocialError('Google sign-in was cancelled or failed.');
            setLoadingProvider(null);
        },
    });

    const handleFacebookLogin = async () => {
        setLoadingProvider('facebook');
        setSocialError(null);

        const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
        if (!fbAppId) {
            setSocialError('Facebook Login requires VITE_FACEBOOK_APP_ID to be configured in your environment.');
            setLoadingProvider(null);
            return;
        }

        // Initialize Facebook SDK if available or load it dynamically
        const FB = (window as any).FB;
        if (FB) {
            FB.login((response: any) => {
                if (response.authResponse?.accessToken) {
                    facebookLogin(response.authResponse.accessToken)
                        .then(() => navigate(redirectPath, { replace: true }))
                        .catch((err: any) => setSocialError(err.response?.data?.message || 'Facebook authentication failed'))
                        .finally(() => setLoadingProvider(null));
                } else {
                    setSocialError('Facebook login cancelled.');
                    setLoadingProvider(null);
                }
            }, { scope: 'public_profile,email' });
        } else {
            // Load FB SDK dynamically
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.onload = () => {
                const loadedFB = (window as any).FB;
                loadedFB.init({
                    appId: fbAppId,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0',
                });
                loadedFB.login((response: any) => {
                    if (response.authResponse?.accessToken) {
                        facebookLogin(response.authResponse.accessToken)
                            .then(() => navigate(redirectPath, { replace: true }))
                            .catch((err: any) => setSocialError(err.response?.data?.message || 'Facebook authentication failed'))
                            .finally(() => setLoadingProvider(null));
                    } else {
                        setSocialError('Facebook login cancelled.');
                        setLoadingProvider(null);
                    }
                }, { scope: 'public_profile,email' });
            };
            script.onerror = () => {
                setSocialError('Failed to load Facebook SDK.');
                setLoadingProvider(null);
            };
            document.body.appendChild(script);
        }
    };

    const handleAppleLogin = async () => {
        setLoadingProvider('apple');
        setSocialError(null);

        const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
        if (!appleClientId) {
            setSocialError('Apple Sign In requires VITE_APPLE_CLIENT_ID to be configured in your environment.');
            setLoadingProvider(null);
            return;
        }

        // Initialize Apple Sign In SDK dynamically
        const AppleID = (window as any).AppleID;
        const initiateApple = async (SDK: any) => {
            try {
                SDK.auth.init({
                    clientId: appleClientId,
                    scope: 'name email',
                    redirectURI: window.location.origin,
                    usePopup: true,
                });
                const response = await SDK.auth.signIn();
                if (response?.authorization?.id_token) {
                    await appleLogin(response.authorization.id_token, response.user);
                    navigate(redirectPath, { replace: true });
                }
            } catch (err: any) {
                if (err?.error !== 'popup_closed_by_user') {
                    setSocialError(err?.message || err?.response?.data?.message || 'Apple sign-in failed');
                }
            } finally {
                setLoadingProvider(null);
            }
        };

        if (AppleID) {
            await initiateApple(AppleID);
        } else {
            const script = document.createElement('script');
            script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth.js';
            script.async = true;
            script.onload = () => {
                const loadedAppleID = (window as any).AppleID;
                void initiateApple(loadedAppleID);
            };
            script.onerror = () => {
                setSocialError('Failed to load Apple Sign In SDK.');
                setLoadingProvider(null);
            };
            document.body.appendChild(script);
        }
    };

    const isLogin = mode === 'login';

    return (
        <div className="space-y-3 w-full">
            {socialError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl">
                    {socialError}
                </div>
            )}

            {/* Google Button */}
            <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loadingProvider === 'google' ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-primary rounded-full animate-spin" />
                ) : (
                    <svg className="h-5 w-5 shrink-0" aria-hidden="true" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                )}
                <span>{isLogin ? t('auth.logInWithGoogle', 'Log in with Google') : t('auth.signUpWithGoogle', 'Sign up with Google')}</span>
            </button>

            {/* Facebook Button */}
            <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loadingProvider === 'facebook' ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                    <svg className="h-5 w-5 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                )}
                <span>{isLogin ? t('auth.logInWithFacebook', 'Log in with Facebook') : t('auth.signUpWithFacebook', 'Sign up with Facebook')}</span>
            </button>

            {/* Apple Button */}
            <button
                type="button"
                onClick={handleAppleLogin}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loadingProvider === 'apple' ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 dark:border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.62-.75 1.04-1.8 1.01-2.88 0-.01-.01-.01-.01-.01-.93.04-2.07.62-2.73 1.4-.58.67-1.1 1.74-1.03 2.81 1.05.08 2.15-.56 2.76-1.32z" />
                    </svg>
                )}
                <span>{isLogin ? t('auth.logInWithApple', 'Log in with Apple') : t('auth.signUpWithApple', 'Sign up with Apple')}</span>
            </button>
        </div>
    );
};

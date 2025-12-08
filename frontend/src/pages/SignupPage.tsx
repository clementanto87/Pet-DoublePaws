import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signup, googleLogin, error } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await signup(firstName, lastName, email, password);
            navigate('/');
        } catch (err) {
            console.error('Signup failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    const googleSignupAction = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await googleLogin(tokenResponse.access_token);
                navigate('/');
            } catch (err) {
                console.error('Google signup failed', err);
            }
        },
        onError: () => {
            console.error('Google Signup Failed');
        },
    });

    return (
        <div className="min-h-screen bg-background-alt dark:bg-background-alt-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Link to="/">
                        <Logo className="h-10 w-auto" />
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-foreground">
                    {t('auth.signupTitle')}
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    {t('auth.signupSubtitle')}{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary/90 hover:underline">
                        {t('navigation.login')}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border-border/50 shadow-lg bg-white dark:bg-card">
                    <CardContent className="p-8">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSignup}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                                    <div className="mt-1">
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            required
                                            placeholder="Jane"
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                                    <div className="mt-1">
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            required
                                            placeholder="Doe"
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <div className="mt-1">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder={t('auth.emailPlaceholder')}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">{t('auth.password')}</Label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        className="h-11 pr-10"
                                        placeholder={t('auth.passwordPlaceholder')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {t('auth.passwordMinLength')}
                                </p>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base shadow-glow"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t('auth.signingUp') : t('auth.signUp')}
                                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-card text-muted-foreground">
                                        {t('auth.orContinueWith')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full h-11 font-medium border-border/50 hover:bg-muted/50"
                                    onClick={() => googleSignupAction()}
                                >
                                    <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
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
                                    {t('auth.signUpWithGoogle')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;

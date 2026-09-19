import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';

const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signup, error } = useAuth();
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 sm:p-10">
                        {/* Logo & Header */}
                        <div className="text-center mb-7">
                            <Link to="/" className="inline-block mb-3 transition-transform hover:scale-105">
                                <Logo className="h-10 sm:h-12 w-auto mx-auto" />
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {t('auth.signupTitle', 'Create your account')}
                            </h1>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-2xl text-xs sm:text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Top Social Signups (Google, Facebook, Apple) */}
                        <SocialAuthButtons mode="signup" />

                        {/* Divider */}
                        <div className="relative my-6 sm:my-7">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm">
                                <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-medium">
                                    {t('auth.or', 'or')}
                                </span>
                            </div>
                        </div>

                        {/* Signup Form */}
                        <form className="space-y-4 sm:space-y-5" onSubmit={handleSignup}>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('auth.firstName', 'First Name')}
                                    </Label>
                                    <div className="mt-1.5">
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            required
                                            placeholder={t('auth.firstNamePlaceholder', 'Jane')}
                                            className="h-12 rounded-xl text-sm border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('auth.lastName', 'Last Name')}
                                    </Label>
                                    <div className="mt-1.5">
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            required
                                            placeholder={t('auth.lastNamePlaceholder', 'Doe')}
                                            className="h-12 rounded-xl text-sm border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {t('auth.email', 'E-mail')}
                                </Label>
                                <div className="mt-1.5">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder={t('auth.emailPlaceholder', 'you@example.com')}
                                        className="h-12 rounded-xl text-sm border-slate-200 dark:border-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {t('auth.password', 'Password')}
                                </Label>
                                <div className="mt-1.5 relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        className="h-12 rounded-xl text-sm pr-16 border-slate-200 dark:border-slate-800"
                                        placeholder={t('auth.passwordPlaceholder', '••••••••')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? t('auth.hide', 'Hide') : t('auth.show', 'Show')}
                                    </button>
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {t('auth.passwordMinLength', 'Must be at least 8 characters long.')}
                                </p>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold rounded-2xl shadow-glow bg-primary hover:bg-primary/90 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t('auth.signingUp', 'Creating account...') : t('auth.signUp', 'Sign up')}
                                </Button>
                            </div>
                        </form>

                        {/* Login Link */}
                        <div className="mt-7 text-center">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
                                <Link
                                    to="/login"
                                    className="font-bold text-primary hover:text-primary/90 hover:underline"
                                >
                                    {t('auth.logInHere', 'Log in here.')}
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAuth } from '../../context/AuthContext';
import { SocialAuthButtons } from './SocialAuthButtons';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'login' | 'signup';
    title?: string;
    subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialMode = 'login',
    title,
    subtitle,
}) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { login, signup } = useAuth();

    const handleModeSwitch = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setErrorMsg(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                if (!firstName.trim() || !lastName.trim()) {
                    setErrorMsg('Please enter both your first and last name.');
                    setIsLoading(false);
                    return;
                }
                await signup(firstName, lastName, email, password);
            }
            onSuccess();
        } catch (err: any) {
            console.error('Authentication failed:', err);
            setErrorMsg(
                err.response?.data?.message ||
                (mode === 'login' ? 'Invalid email or password.' : 'Failed to create account. Please try again.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const modalTitle = title || (mode === 'login' ? 'Log in to continue' : 'Create an account');
    const modalSubtitle = subtitle || (mode === 'login'
        ? 'Sign in to send your request and connect with your pet sitter.'
        : 'Create your Double Paws account to request your booking.');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} className="max-w-md">
            <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 -mt-2">
                    {modalSubtitle}
                </p>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => handleModeSwitch('login')}
                        className={cn(
                            "flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all",
                            mode === 'login'
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeSwitch('signup')}
                        className={cn(
                            "flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all",
                            mode === 'signup'
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium animate-in fade-in duration-200">
                        {errorMsg}
                    </div>
                )}

                {/* Social Login */}
                <SocialAuthButtons mode={mode} onSuccess={onSuccess} />

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Or continue with email
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">First Name</Label>
                                <div className="relative">
                                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <Input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Alex"
                                        className="pl-9 h-10 text-xs sm:text-sm rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Last Name</Label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Smith"
                                    className="h-10 text-xs sm:text-sm rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Email address</Label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="pl-9 h-10 text-xs sm:text-sm rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Password</Label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm shadow-glow bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{mode === 'login' ? 'Log In & Continue' : 'Create Account & Continue'}</span>
                                <Sparkles className="w-4 h-4 opacity-80" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Footer Switcher */}
                <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? (
                        <p>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => handleModeSwitch('signup')}
                                className="font-bold text-primary hover:underline"
                            >
                                Sign up here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => handleModeSwitch('login')}
                                className="font-bold text-primary hover:underline"
                            >
                                Log in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const getToastConfig = () => {
        switch (toast.type) {
            case 'success':
                return {
                    icon: CheckCircle2,
                    bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
                    iconColor: 'text-emerald-600',
                    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
                    borderColor: 'border-emerald-200 dark:border-emerald-800',
                    emoji: '🎉',
                    sparkleColor: 'text-emerald-400'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-gradient-to-r from-red-500 to-rose-500',
                    iconColor: 'text-red-600',
                    bgLight: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    emoji: '😢',
                    sparkleColor: 'text-red-400'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
                    iconColor: 'text-amber-600',
                    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
                    borderColor: 'border-amber-200 dark:border-amber-800',
                    emoji: '⚠️',
                    sparkleColor: 'text-amber-400'
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    iconColor: 'text-blue-600',
                    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    emoji: '💡',
                    sparkleColor: 'text-blue-400'
                };
        }
    };

    const config = getToastConfig();
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto"
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-2xl shadow-2xl border-2',
                    config.bgLight,
                    config.borderColor,
                    'backdrop-blur-sm'
                )}
            >
                {/* Sparkle effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn('absolute', config.sparkleColor)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: 'easeInOut',
                            }}
                            style={{
                                left: `${20 + i * 30}%`,
                                top: `${10 + i * 20}%`,
                            }}
                        >
                            <Sparkles className="w-3 h-3" />
                        </motion.div>
                    ))}
                </div>

                <div className="relative flex items-start gap-4 p-4 pr-12">
                    {/* Icon with gradient background */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                            config.bgColor
                        )}
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Message */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{config.emoji}</span>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                                {toast.message}
                            </p>
                        </div>
                    </div>

                    {/* Close button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemove(toast.id)}
                        className={cn(
                            'absolute top-3 right-3 p-1.5 rounded-lg transition-colors',
                            'hover:bg-white/20 dark:hover:bg-gray-800/20',
                            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                    >
                        <X className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Progress bar */}
                {toast.duration && toast.duration > 0 && (
                    <motion.div
                        className={cn('h-1', config.bgColor)}
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default ToastProvider;


import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import type { ServiceRate } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building, Sun, Dog, PawPrint, DollarSign, MapPin, Check, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

const ServiceProfileForm: React.FC = () => {
    const { data, updateNestedData, updateData } = useSitterRegistration();

    const handleServiceToggle = (serviceKey: string, checked: boolean) => {
        const currentService = data.services[serviceKey as keyof typeof data.services];
        updateNestedData('services', serviceKey, { ...currentService, active: checked });
    };

    const handleRateChange = (serviceKey: string, field: keyof ServiceRate, value: string) => {
        const currentService = data.services[serviceKey as keyof typeof data.services];
        updateNestedData('services', serviceKey, { ...currentService, [field]: parseFloat(value) || 0 });
    };

    const servicesList = [
        { 
            key: 'boarding', 
            label: 'Pet Boarding', 
            desc: 'Pets stay overnight at your home',
            icon: Home,
            emoji: '🏠',
            color: 'from-orange-400 to-amber-500',
            avgRate: '$25-50/night'
        },
        { 
            key: 'houseSitting', 
            label: 'House Sitting', 
            desc: 'You stay at the pet owner\'s home',
            icon: Building,
            emoji: '🏡',
            color: 'from-blue-400 to-cyan-500',
            avgRate: '$35-75/night'
        },
        { 
            key: 'dropInVisits', 
            label: 'Drop-In Visits', 
            desc: 'Quick visits for feeding & playtime',
            icon: Sun,
            emoji: '☀️',
            color: 'from-yellow-400 to-orange-500',
            avgRate: '$15-30/visit'
        },
        { 
            key: 'doggyDayCare', 
            label: 'Doggy Day Care', 
            desc: 'Daytime care at your home',
            icon: Dog,
            emoji: '🐕',
            color: 'from-green-400 to-emerald-500',
            avgRate: '$20-40/day'
        },
        { 
            key: 'dogWalking', 
            label: 'Dog Walking', 
            desc: 'Exercise in the neighborhood',
            icon: PawPrint,
            emoji: '🦮',
            color: 'from-purple-400 to-pink-500',
            avgRate: '$15-25/walk'
        },
    ];

    const activeServicesCount = Object.values(data.services).filter(s => s.active).length;

    return (
        <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">Time to set up your services! 💰</h3>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            Choose the services you'd like to offer and set competitive rates. 
                            You can adjust these anytime in your dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Services Counter */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Services selected</span>
                <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-bold",
                    activeServicesCount > 0 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}>
                    {activeServicesCount} / {servicesList.length}
                </span>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                {servicesList.map((service, index) => {
                    const serviceData = data.services[service.key as keyof typeof data.services];
                    const ServiceIcon = service.icon;
                    
                    return (
                        <motion.div
                            key={service.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "rounded-2xl border-2 overflow-hidden transition-all",
                                serviceData.active 
                                    ? "border-primary bg-primary/5 shadow-lg" 
                                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                        >
                            <div 
                                className="p-5 cursor-pointer"
                                onClick={() => handleServiceToggle(service.key, !serviceData.active)}
                            >
                            <div className="flex items-start gap-4">
                                    {/* Toggle */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1",
                                        serviceData.active 
                                            ? "bg-primary border-primary" 
                                            : "border-gray-300 dark:border-gray-600"
                                    )}>
                                        {serviceData.active && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        serviceData.active 
                                            ? `bg-gradient-to-br ${service.color} text-white shadow-lg` 
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                    )}>
                                        <ServiceIcon className="w-6 h-6" />
                                    </div>

                                    {/* Content */}
                                <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                        <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {service.label}
                                                    <span className="text-lg">{service.emoji}</span>
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">{service.desc}</p>
                                            </div>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                                                Avg: {service.avgRate}
                                            </span>
                                        </div>
                                    </div>
                                        </div>
                                    </div>

                            {/* Rate Settings */}
                            <AnimatePresence>
                                    {serviceData.active && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-0">
                                            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                                <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                        <Label className="text-xs font-medium flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" />
                                                            Your Rate
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={serviceData.rate}
                                                    onChange={(e) => handleRateChange(service.key, 'rate', e.target.value)}
                                                                className="h-10 pl-8 font-bold"
                                                                onClick={(e) => e.stopPropagation()}
                                                />
                                                        </div>
                                            </div>
                                            <div className="space-y-2">
                                                        <Label className="text-xs font-medium flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            Holiday Rate
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={serviceData.holidayRate || ''}
                                                    placeholder={(serviceData.rate * 1.5).toFixed(0)}
                                                    onChange={(e) => handleRateChange(service.key, 'holidayRate', e.target.value)}
                                                                className="h-10 pl-8"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Earnings Breakdown - Cute & Dynamic */}
                                                {serviceData.rate > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3"
                                                    >
                                                        {/* Standard Rate Breakdown */}
                                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                                                                    <TrendingUp className="w-4 h-4 text-white" />
                                                                </div>
                                                                <span className="text-sm font-bold text-green-900 dark:text-green-300">Standard Rate Breakdown</span>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                {/* Total Rate */}
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                        <DollarSign className="w-3.5 h-3.5" />
                                                                        Customer pays:
                                                                    </span>
                                                                    <span className="font-bold text-gray-900 dark:text-white">${serviceData.rate.toFixed(0)}</span>
                                                                </div>
                                                                
                                                                {/* Sitter Earnings */}
                                                                <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-700">
                                                                    <span className="text-sm font-bold text-green-700 dark:text-green-300 flex items-center gap-1.5">
                                                                        <Sparkles className="w-4 h-4" />
                                                                        You earn:
                                                                    </span>
                                                                    <span className="text-lg font-black text-green-600 dark:text-green-400">
                                                                        ${(serviceData.rate * 0.85).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Holiday Rate Breakdown */}
                                                        {serviceData.holidayRate && serviceData.holidayRate > 0 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                                                                        <Sparkles className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-amber-900 dark:text-amber-300">Holiday Rate Breakdown</span>
                                                                </div>
                                                                
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                            <DollarSign className="w-3.5 h-3.5" />
                                                                            Customer pays:
                                                                        </span>
                                                                        <span className="font-bold text-gray-900 dark:text-white">${serviceData.holidayRate.toFixed(0)}</span>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-700">
                                                                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                                                            <Sparkles className="w-4 h-4" />
                                                                            You earn:
                                                                        </span>
                                                                        <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                                                                            ${(serviceData.holidayRate * 0.85).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        
                                                        {/* Monthly Estimate */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                                With 10 bookings/month: <span className="font-bold text-primary">${(serviceData.rate * 0.85 * 10).toFixed(0)}</span>
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                    )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Service Radius */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <Label className="text-base font-semibold">Service Radius</Label>
                        <p className="text-sm text-gray-500">How far will you travel?</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <input
                            type="range"
                            min="1"
                            max="50"
                            value={data.serviceRadius}
                            onChange={(e) => updateData('serviceRadius', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    <div className="w-20 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{Math.round(data.serviceRadius * 1.60934)}</span>
                        <span className="text-sm text-primary ml-1">km</span>
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    🗺️ Pet parents within {Math.round(data.serviceRadius * 1.60934)} kilometers of your location will see your profile.
                </p>
            </motion.div>
        </div>
    );
};

export default ServiceProfileForm;

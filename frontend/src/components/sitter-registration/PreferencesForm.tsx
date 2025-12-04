import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Label } from '../ui/Label';
import { motion } from 'framer-motion';
import { Heart, Check, Dog, Cat, Bird, Rabbit, Turtle, Scale, Baby, Pill, Syringe, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PreferencesForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();

    const toggleArrayItem = (field: 'acceptedPetTypes' | 'acceptedPetSizes' | 'behavioralRestrictions', value: string) => {
        const currentArray = data[field];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        updateData(field, newArray);
    };

    const petTypes = [
        { value: 'Dog', emoji: '🐕', label: 'Dogs', icon: Dog, color: 'from-orange-400 to-amber-500' },
        { value: 'Cat', emoji: '🐈', label: 'Cats', icon: Cat, color: 'from-purple-400 to-pink-500' },
        { value: 'Bird', emoji: '🐦', label: 'Birds', icon: Bird, color: 'from-blue-400 to-cyan-500' },
        { value: 'Small Animal', emoji: '🐰', label: 'Small Pets', icon: Rabbit, color: 'from-pink-400 to-rose-500' },
        { value: 'Reptile', emoji: '🦎', label: 'Reptiles', icon: Turtle, color: 'from-green-400 to-emerald-500' },
    ];

    const petSizes = [
        { value: 'Small', label: 'Small', weight: '0-15 lbs', emoji: '🐕', desc: 'Chihuahua, Pom' },
        { value: 'Medium', label: 'Medium', weight: '16-40 lbs', emoji: '🐕‍🦺', desc: 'Beagle, Corgi' },
        { value: 'Large', label: 'Large', weight: '41-100 lbs', emoji: '🦮', desc: 'Lab, Golden' },
        { value: 'Giant', label: 'Giant', weight: '101+ lbs', emoji: '🐕', desc: 'Great Dane' },
    ];

    const specialCare = [
        { value: 'Puppies (< 1 year)', emoji: '🐶', label: 'Puppies', desc: 'Under 1 year old', icon: Baby },
        { value: 'Senior Dogs', emoji: '🦴', label: 'Senior Pets', desc: 'Older pets with gentle needs', icon: Heart },
        { value: 'Separation Anxiety', emoji: '😰', label: 'Separation Anxiety', desc: 'Pets needing extra attention', icon: AlertCircle },
        { value: 'Oral Medication', emoji: '💊', label: 'Oral Medication', desc: 'Pills and liquid meds', icon: Pill },
        { value: 'Injected Medication', emoji: '💉', label: 'Injections', desc: 'Insulin, etc.', icon: Syringe },
    ];

    return (
        <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-5 border border-pink-100 dark:border-pink-800">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-pink-900 dark:text-pink-300 mb-1">What pets do you love? 🐾</h3>
                        <p className="text-sm text-pink-700 dark:text-pink-400">
                            Tell us about the furry (and scaly!) friends you'd enjoy caring for.
                            Be honest—it helps us match you with the perfect pets!
                        </p>
                    </div>
                </div>
            </div>

            {/* Pet Types */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        🐾 Pet Types I Accept
                    </Label>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                        {data.acceptedPetTypes.length} selected
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {petTypes.map((type, index) => {
                        const isSelected = data.acceptedPetTypes.includes(type.value);
                        const TypeIcon = type.icon;

                        return (
                            <motion.button
                                key={type.value}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => toggleArrayItem('acceptedPetTypes', type.value)}
                                className={cn(
                                    "relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-lg"
                                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all",
                                    isSelected
                                        ? `bg-gradient-to-br ${type.color} text-white`
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-primary"
                                )}>
                                    <TypeIcon className="w-5 h-5" />
                                </div>

                                <p className={cn(
                                    "font-semibold text-sm",
                                    isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                                )}>
                                    {type.label}
                                </p>
                                <p className="text-xl mt-1">{type.emoji}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Pet Sizes */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <Scale className="w-4 h-4 text-primary" />
                        Dog Sizes I Accept
                    </Label>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                        {data.acceptedPetSizes.length} selected
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {petSizes.map((size, index) => {
                        const isSelected = data.acceptedPetSizes.includes(size.value);

                        return (
                            <motion.button
                                key={size.value}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => toggleArrayItem('acceptedPetSizes', size.value)}
                                className={cn(
                                    "relative p-4 rounded-2xl border-2 transition-all text-center",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-lg"
                                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                <p className="text-2xl mb-1">{size.emoji}</p>
                                <p className={cn(
                                    "font-bold text-sm",
                                    isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                                )}>
                                    {size.label}
                                </p>
                                <p className="text-xs text-gray-500">{size.weight}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Spayed/Neutered Preference */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <button
                    onClick={() => updateData('isNeuteredOnly', !data.isNeuteredOnly)}
                    className={cn(
                        "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                        data.isNeuteredOnly
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">✂️</span>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900 dark:text-white">Only Spayed/Neutered Pets</p>
                            <p className="text-sm text-gray-500">I prefer pets that are fixed</p>
                        </div>
                    </div>
                    <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        data.isNeuteredOnly
                            ? "bg-primary border-primary"
                            : "border-gray-300 dark:border-gray-600"
                    )}>
                        {data.isNeuteredOnly && <Check className="w-4 h-4 text-white" />}
                    </div>
                </button>
            </motion.div>

            {/* Special Care Capabilities */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                <Label className="text-base font-semibold flex items-center gap-2">
                    ⭐ Special Care I Can Provide
                </Label>
                <p className="text-sm text-gray-500 -mt-2">
                    Check the special care situations you're comfortable handling.
                </p>

                <div className="space-y-3">
                    {specialCare.map((item, index) => {
                        const isSelected = data.behavioralRestrictions.includes(item.value);
                        const ItemIcon = item.icon;

                        return (
                            <motion.button
                                key={item.value}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => toggleArrayItem('behavioralRestrictions', item.value)}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                                    isSelected
                                        ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        isSelected
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                    )}>
                                        <ItemIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className={cn(
                                            "font-semibold text-sm",
                                            isSelected ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white"
                                        )}>
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.emoji}</span>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        isSelected
                                            ? "bg-green-500 border-green-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Helpful tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>Being flexible with pet types and sizes can increase your bookings by up to 60%!</span>
                </p>
            </div>
        </div>
    );
};

export default PreferencesForm;

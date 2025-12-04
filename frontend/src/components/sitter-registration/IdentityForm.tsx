import React, { useState } from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, MapPin, Phone, Calendar, CheckCircle, FileCheck, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const IdentityForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateData(id as any, value);
    };

    const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateData('address', value);

        if (value.length > 2) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
                const results = await response.json();
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (place: any) => {
        updateData('address', place.display_name);
        if (place.lat && place.lon) {
            updateData('latitude', parseFloat(place.lat));
            updateData('longitude', parseFloat(place.lon));
        }
        setShowSuggestions(false);
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            updateData('governmentIdUrl', objectUrl);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            updateData('governmentIdUrl', objectUrl);
        }
    };

    const isAddressValid = data.address && data.latitude && data.longitude;
    const isPhoneValid = data.phone && data.phone.length >= 10;
    const isDobValid = data.dob;

    return (
        <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Let's get to know you!</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            This information helps pet parents feel confident about who's caring for their furry friends.
                            Don't worry, your personal details are secure with us! 🔒
                        </p>
                    </div>
                </div>
            </div>

            {/* Date of Birth */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <Label htmlFor="dob" className="flex items-center gap-2 text-base font-semibold">
                        <Calendar className="w-4 h-4 text-primary" />
                        Date of Birth
                    </Label>
                    {isDobValid && (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4" /> Looks good!
                        </span>
                    )}
                </div>
                    <Input
                        id="dob"
                        type="date"
                        value={data.dob}
                        onChange={handleChange}
                    className={cn(
                        "h-12 text-base",
                        isDobValid && "border-green-300 focus:border-green-500"
                    )}
                        required
                    />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    🎂 You must be 18 years or older to become a sitter.
                </p>
            </motion.div>

            {/* Physical Address */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <Label htmlFor="address" className="flex items-center gap-2 text-base font-semibold">
                        <MapPin className="w-4 h-4 text-primary" />
                        Your Address
                    </Label>
                    {isAddressValid && (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4" /> Location found!
                        </span>
                    )}
                </div>
                    <div className="relative">
                        <Input
                            id="address"
                        placeholder="Start typing your address..."
                        className={cn(
                            "h-12 pl-12 text-base",
                            isAddressValid && "border-green-300 focus:border-green-500"
                        )}
                            value={data.address}
                            onChange={handleAddressChange}
                            onFocus={() => data.address.length > 2 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            required
                        />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary">
                        <MapPin className="w-5 h-5" />
                    </div>

                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                            >
                                {suggestions.map((place, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-start gap-3"
                                        onClick={() => selectAddress(place)}
                                    >
                                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {place.display_name.split(',')[0]}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{place.display_name}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    📍 This helps us show you to nearby pet parents.
                </p>
            </motion.div>

            {/* Phone Number */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-base font-semibold">
                        <Phone className="w-4 h-4 text-primary" />
                        Phone Number
                    </Label>
                    {isPhoneValid && (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4" /> Perfect!
                        </span>
                    )}
                </div>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={data.phone}
                        onChange={handleChange}
                    className={cn(
                        "h-12 text-base",
                        isPhoneValid && "border-green-300 focus:border-green-500"
                    )}
                        required
                    />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    📱 We'll only share this with pet parents after you confirm a booking.
                </p>
            </motion.div>

            {/* Government ID Upload */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                        <FileCheck className="w-4 h-4 text-primary" />
                        Government ID
                    </Label>
                    {data.governmentIdUrl && (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4" /> Uploaded!
                        </span>
                    )}
                </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileChange}
                    />
                
                <motion.div
                        onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                        isDragging 
                            ? "border-primary bg-primary/5" 
                            : data.governmentIdUrl 
                                ? "border-green-300 bg-green-50 dark:bg-green-900/20" 
                                : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                    )}
                    >
                        {data.governmentIdUrl ? (
                            <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            <p className="font-semibold text-green-600">Document Uploaded! ✨</p>
                            <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                            </>
                        ) : (
                            <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-primary" />
                                </div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                Drop your ID here or click to upload
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Driver's License or Passport (PNG, JPG, PDF)
                            </p>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}>
                                <Upload className="w-4 h-4 mr-2" />
                                    Select File
                                </Button>
                            </>
                        )}
                </motion.div>
                
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    🔒 Your ID is encrypted and only used for verification. It won't be shared.
                </p>
            </motion.div>
        </div>
    );
};

export default IdentityForm;

import React, { useState } from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Upload, MapPin } from 'lucide-react';

const IdentityForm: React.FC = () => {
    const { data, updateData } = useSitterRegistration();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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
                const data = await response.json();
                setSuggestions(data);
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
            // Create a fake URL for preview/storage since we don't have a real backend upload yet
            const objectUrl = URL.createObjectURL(file);
            updateData('governmentIdUrl', objectUrl);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Identity & Contact</h2>
                <p className="text-muted-foreground text-sm">
                    This information is for verification purposes and will not be shared publicly until you confirm a booking.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                        id="dob"
                        type="date"
                        value={data.dob}
                        onChange={handleChange}
                        required
                    />
                    <p className="text-xs text-muted-foreground">You must be 18 years or older.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <div className="relative">
                        <Input
                            id="address"
                            placeholder="123 Main St, City, State, Zip"
                            className="pl-10"
                            value={data.address}
                            onChange={handleAddressChange}
                            onFocus={() => data.address.length > 2 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            required
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />

                        {/* Address Suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
                                {suggestions.map((place, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm border-b border-gray-50 last:border-0"
                                        onClick={() => selectAddress(place)}
                                    >
                                        <p className="font-medium text-foreground truncate">{place.display_name.split(',')[0]}</p>
                                        <p className="text-xs text-muted-foreground truncate">{place.display_name}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Used to calculate your service radius.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={data.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Government ID</Label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileChange}
                    />
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={handleUploadClick}
                    >
                        {data.governmentIdUrl ? (
                            <>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="font-medium text-green-600 dark:text-green-400">File Selected</p>
                                <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-medium">Upload Driver's License or Passport</p>
                                <p className="text-sm text-muted-foreground mt-1">PNG, JPG or PDF up to 10MB</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.preventDefault(); handleUploadClick(); }}>
                                    Select File
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdentityForm;

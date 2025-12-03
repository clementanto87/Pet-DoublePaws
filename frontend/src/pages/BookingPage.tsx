import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import {
  MapPin,
  Home,
  Building,
  Sun,
  PawPrint,
  ChevronDown,
  Minus,
  Plus,
  Search,
  Sparkles,
  Dog,
  Cat,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PawPrints } from '../components/ui/PawPrints';

// Pet size categories with visual representations
const PET_SIZES = [
  { id: 'small', label: 'Small', weight: '0-7 kg', icon: '🐕', description: 'Chihuahua, Pomeranian' },
  { id: 'medium', label: 'Medium', weight: '7-18 kg', icon: '🐕‍🦺', description: 'Beagle, Cocker Spaniel' },
  { id: 'large', label: 'Large', weight: '18-45 kg', icon: '🦮', description: 'Labrador, German Shepherd' },
  { id: 'giant', label: 'Giant', weight: '45+ kg', icon: '🐕‍🦺', description: 'Great Dane, St. Bernard' },
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [petCounts, setPetCounts] = useState({ dog: 0, cat: 0 });
  const [isPetDropdownOpen, setIsPetDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('boarding');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [bookingType, setBookingType] = useState<'one-time' | 'recurring'>('one-time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const petDropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (petDropdownRef.current && !petDropdownRef.current.contains(event.target as Node)) {
        setIsPetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePetCount = (type: 'dog' | 'cat', delta: number) => {
    setPetCounts(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(5, prev[type] + delta))
    }));
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
        );
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

  const selectLocation = (place: any) => {
    setLocation(place.display_name.split(',').slice(0, 2).join(','));
    if (place.lat && place.lon) {
      setCoordinates({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    }
    setShowSuggestions(false);
  };

  const getPetSummary = () => {
    const parts = [];
    if (petCounts.dog > 0) parts.push(`${petCounts.dog} Dog${petCounts.dog > 1 ? 's' : ''}`);
    if (petCounts.cat > 0) parts.push(`${petCounts.cat} Cat${petCounts.cat > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(' & ') : 'Add your pets';
  };

  const hasPets = petCounts.dog > 0 || petCounts.cat > 0;
  const needsTimeSelection = selectedService === 'day-care' || selectedService === 'walking' || selectedService === 'drop-in';
  const needsEndDate = selectedService === 'boarding' || selectedService === 'house-sitting' || bookingType === 'recurring';

  const services = [
    {
      id: 'boarding',
      label: 'Boarding',
      icon: Home,
      description: 'Your pet stays at the sitter\'s home',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'house-sitting',
      label: 'House Sitting',
      icon: Building,
      description: 'Sitter stays at your home',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'drop-in',
      label: 'Drop-In Visits',
      icon: Sun,
      description: '30-60 min check-ins at your home',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'day-care',
      label: 'Doggy Day Care',
      icon: Dog,
      description: 'Daytime care at sitter\'s home',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'walking',
      label: 'Dog Walking',
      icon: PawPrint,
      description: 'Regular walks in your neighborhood',
      color: 'from-purple-500 to-pink-500'
    },
  ];

  const handleSearch = () => {
    setIsSearching(true);

    const params = new URLSearchParams();
    if (coordinates) {
      params.append('latitude', coordinates.lat.toString());
      params.append('longitude', coordinates.lon.toString());
    }
    params.append('serviceType', selectedService);

    const petType = petCounts.dog > 0 ? 'dog' : (petCounts.cat > 0 ? 'cat' : '');
    if (petType) params.append('petType', petType);

    if (selectedSizes.length > 0) {
      const sizeWeights: Record<string, number> = { small: 5, medium: 12, large: 30, giant: 50 };
      selectedSizes.forEach(size => {
        params.append('weight', sizeWeights[size].toString());
      });
    }

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    setTimeout(() => {
      navigate(`/search?${params.toString()}`);
    }, 500);
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    );
  };

  const isFormValid = hasPets && location && startDate && (needsEndDate ? endDate : true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        <PawPrints variant="floating" className="opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm mb-6 border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Find Your Perfect Match</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Book a pet sitter for
          </h1>

          {/* Pet Selection Inline */}
          <div className="relative inline-block" ref={petDropdownRef}>
            <button
              onClick={() => setIsPetDropdownOpen(!isPetDropdownOpen)}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300",
                "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl",
                hasPets
                  ? "border-primary text-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 animate-pulse"
              )}
            >
              {petCounts.dog > 0 && <Dog className="w-5 h-5" />}
              {petCounts.cat > 0 && <Cat className="w-5 h-5" />}
              <span className="text-xl md:text-2xl font-bold">{getPetSummary()}</span>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform duration-300",
                isPetDropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Pet Dropdown */}
            {isPetDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-6">
                  {/* Dog Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                        <Dog className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Dogs</p>
                        <p className="text-xs text-gray-500">Max 5 per booking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updatePetCount('dog', -1)}
                        disabled={petCounts.dog === 0}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          petCounts.dog === 0
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        {petCounts.dog}
                      </span>
                      <button
                        onClick={() => updatePetCount('dog', 1)}
                        disabled={petCounts.dog >= 5}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          petCounts.dog >= 5
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            : "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/30"
                        )}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Cat Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                        <Cat className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Cats</p>
                        <p className="text-xs text-gray-500">Max 5 per booking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updatePetCount('cat', -1)}
                        disabled={petCounts.cat === 0}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          petCounts.cat === 0
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        {petCounts.cat}
                      </span>
                      <button
                        onClick={() => updatePetCount('cat', 1)}
                        disabled={petCounts.cat >= 5}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          petCounts.cat >= 5
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            : "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/30"
                        )}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsPetDropdownOpen(false)}
                  className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Service Selection */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Select Service
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {services.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setStartDate('');
                      setEndDate('');
                      setStartTime('');
                      setEndTime('');
                      setBookingType('one-time');
                    }}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800/50"
                    )}
                  >
                    {/* Gradient background on hover/select */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                      service.color,
                      isSelected ? "opacity-10" : "group-hover:opacity-5"
                    )} />

                    <div className="relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all",
                        isSelected
                          ? `bg-gradient-to-br ${service.color} text-white shadow-lg`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:text-primary"
                      )}>
                        <service.icon className="w-5 h-5" />
                      </div>
                      <p className={cn(
                        "font-bold text-sm transition-colors",
                        isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                      )}>
                        {service.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 hidden md:block line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Dates */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Location */}
            <div className="relative">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Location
              </h2>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Enter city or zip code"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => location.length > 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={cn(
                    "w-full h-14 px-4 pl-12 rounded-2xl border-2 transition-all duration-300",
                    "bg-white dark:bg-gray-900/50 backdrop-blur-sm",
                    "text-gray-900 dark:text-white placeholder:text-gray-400",
                    "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                    "border-gray-200 dark:border-gray-700"
                  )}
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />

                {location && (
                  <button
                    onClick={() => {
                      setLocation('');
                      setCoordinates(null);
                      locationInputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {/* Location Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((place, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                        onClick={() => selectLocation(place)}
                      >
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {place.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {place.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Type Toggle (for day-care/walking) */}
            {needsTimeSelection && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Booking Type
                </h2>
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                  <button
                    onClick={() => setBookingType('one-time')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all",
                      bookingType === 'one-time'
                        ? "bg-white dark:bg-gray-800 text-primary shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    One Time
                  </button>
                  <button
                    onClick={() => setBookingType('recurring')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all",
                      bookingType === 'recurring'
                        ? "bg-white dark:bg-gray-800 text-primary shadow-md"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Recurring
                  </button>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                When do you need care?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {needsEndDate ? 'Start Date' : 'Date'}
                  </label>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Select start date"
                  />
                </div>

                {needsEndDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      End Date
                    </label>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="Select end date"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time Selection (for day-care/walking/drop-in) */}
            {needsTimeSelection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Start Time
                  </label>
                  <TimePicker
                    value={startTime}
                    onChange={setStartTime}
                    placeholder="Select start time"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    End Time
                  </label>
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
                    placeholder="Select end time"
                  />
                </div>
              </div>
            )}

            {/* Pet Size Selection */}
            {petCounts.dog > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  What size is your dog?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PET_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size.id);
                    return (
                      <button
                        key={size.id}
                        onClick={() => toggleSize(size.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all duration-300 text-center",
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800/50"
                        )}
                      >
                        <div className="text-3xl mb-2">{size.icon}</div>
                        <p className={cn(
                          "font-bold text-sm",
                          isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                        )}>
                          {size.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{size.weight}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <Button
              onClick={handleSearch}
              disabled={!isFormValid || isSearching}
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 group",
                isFormValid
                  ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary-600 hover:to-orange-600 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {isSearching ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Search className="w-5 h-5" />
                  Find Perfect Sitters
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            {!isFormValid && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please add your pets, location, and dates to search
              </p>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Verified Sitters</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Insurance Included</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Free Cancellation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

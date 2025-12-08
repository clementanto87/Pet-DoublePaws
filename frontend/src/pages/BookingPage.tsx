import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Search,
  ArrowRight,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { cities } from '../data/cities';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedService, setSelectedService] = useState('boarding');
  const [location, setLocation] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Animated placeholder text
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    t('booking.enterCity'),
    t('booking.tryLocation'),
    t('booking.wherePetCare'),
    t('booking.searchByZip')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const serviceOptions = [
    { id: 'boarding', icon: '🏠', label: t('landing.services.boarding.label'), desc: t('landing.services.boarding.desc'), color: 'from-orange-500 to-amber-500' },
    { id: 'house-sitting', icon: '🏡', label: t('landing.services.houseSitting.label'), desc: t('landing.services.houseSitting.desc'), color: 'from-blue-500 to-blue-600' },
    { id: 'drop-in', icon: '☀️', label: t('landing.services.dropInVisits.label'), desc: t('landing.services.dropInVisits.desc'), color: 'from-amber-500 to-yellow-500' },
    { id: 'day-care', icon: '🐕', label: t('landing.services.dayCare.label'), desc: t('landing.services.dayCare.desc'), color: 'from-green-500 to-emerald-600' },
    { id: 'walking', icon: '🦮', label: t('landing.services.walking.label'), desc: t('landing.services.walking.desc'), color: 'from-rose-500 to-rose-400' },
  ];

  const popularLocations = [
    { city: 'New York, NY', count: 'Popular' },
    { city: 'Los Angeles, CA', count: 'Popular' },
    { city: 'Chicago, IL', count: 'Popular' },
    { city: 'Houston, TX', count: 'Popular' },
  ];

  const filteredLocations = location.length > 0
    ? cities.filter(city => city.toLowerCase().includes(location.toLowerCase())).slice(0, 5).map(city => ({ city, count: '' }))
    : popularLocations;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedService) params.set('service', selectedService);
    if (location) params.set('location', location);
      navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight text-gray-900 dark:text-white"
            >
              {t('booking.title')}<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
                  {t('booking.titleHighlight')}
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('booking.subtitle')}
            </motion.p>
          </motion.div>

          {/* ✨ STUNNING SEARCH BOX ✨ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative z-20"
          >
            {/* Glow Effect Behind Search */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-amber-400/20 to-primary/20 rounded-[40px] blur-2xl opacity-60" />

            {/* Main Search Container */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 transition-all duration-500 overflow-visible ${isSearchFocused
              ? 'border-primary shadow-primary/20 shadow-2xl scale-[1.02]'
              : 'border-gray-100 dark:border-gray-700'
              }`}>
              {/* Service Selection - Beautiful Pills */}
              <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <span className="text-lg">🎯</span> {t('booking.whatServiceNeeded')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {serviceOptions.map((service, index) => (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.08 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedService(service.id)}
                      className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${selectedService === service.id
                        ? 'bg-gradient-to-br ' + service.color + ' text-white shadow-lg ring-2 ring-offset-2 ring-primary/50'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                    >
                      {/* Shine Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      <div className="relative z-10">
                        {/* Icon Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${selectedService === service.id
                          ? 'bg-white/20'
                          : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                          <span className="text-2xl">{service.icon}</span>
                      </div>
                        <p className={`font-bold text-sm mb-1 ${selectedService === service.id ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                          {service.label}
                        </p>
                        <p className={`text-xs leading-relaxed ${selectedService === service.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          {service.desc}
                        </p>
                      </div>

                      {/* Checkmark for Selected */}
                      {selectedService === service.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
                        >
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                    </div>
                  </div>

              {/* Location Search */}
              <div className="p-6 pt-5 overflow-visible">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {t('booking.whereNeedCare')}
                </p>

                <div className="flex flex-col md:flex-row gap-3 relative">
                  {/* Beautiful Location Input */}
                  <div className="flex-1 relative">
                    <div className={`relative flex items-center rounded-full transition-all duration-300 ${showLocationSuggestions
                      ? 'ring-2 ring-primary/50 ring-offset-2 bg-white dark:bg-gray-700 shadow-lg shadow-primary/10'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-white shadow-sm hover:shadow-md'
                      }`}>
                      {/* Location Icon */}
                      <div className={`flex items-center justify-center w-14 h-14 rounded-l-full transition-colors ${showLocationSuggestions ? 'text-primary' : 'text-gray-400'
                        }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showLocationSuggestions ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                          <MapPin className="w-5 h-5" />
                      </div>
                      </div>

                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onFocus={() => {
                          setIsSearchFocused(true);
                          setShowLocationSuggestions(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setIsSearchFocused(false);
                            setShowLocationSuggestions(false);
                          }, 200);
                        }}
                        placeholder={placeholders[placeholderIndex]}
                        className="flex-1 h-14 pr-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base font-medium !border-0 !outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0"
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                      />

                      {/* Near Me Button */}
                      <button
                        onClick={() => setLocation('Current Location')}
                        className="mr-2 px-4 py-2.5 rounded-full bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold text-sm transition-all group flex items-center gap-2 whitespace-nowrap border border-primary/20 hover:border-primary"
                        title="Use current location"
                      >
                        <Navigation className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline">{t('booking.nearMe')}</span>
                      </button>
                  </div>
                </div>

                  {/* Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    className="relative h-14 px-8 md:px-10 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all overflow-hidden group"
                  >
                    {/* Animated Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      <Search className="w-5 h-5" />
                      <span>{t('booking.searchSitters')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>

                  {/* Location Suggestions Dropdown */}
                  <AnimatePresence>
                    {showLocationSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 md:right-auto md:w-[calc(100%-180px)] top-[calc(100%+12px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[100]"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {location.length > 0 ? t('booking.suggestions') : t('booking.popularLocations')}
                          </p>
                        </div>
                        <div className="max-h-[240px] overflow-y-auto">
                          {filteredLocations.map((loc, i) => (
                            <button
                              key={i}
                              onMouseDown={() => setLocation(loc.city)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors flex-shrink-0">
                                <MapPin className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{loc.city}</p>
                                {loc.count && <p className="text-xs text-gray-500">{loc.count}</p>}
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

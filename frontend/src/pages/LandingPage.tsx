import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Heart,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Search,
  MessageCircle,
  Home,
  Calendar,
  PawPrint,
  Headphones,
  Lock,
  Camera,
  MapPin,
  Stethoscope,
  CreditCard,
  Award,
  Sparkles,
  Navigation
} from 'lucide-react';
import { cities } from '../data/cities';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('boarding');
  const [location, setLocation] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Animated placeholder text
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    'Enter your city or neighborhood...',
    'Try "New York, NY"...',
    'Where does your pet need care?',
    'Search by zip code or address...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const serviceOptions = [
    { id: 'boarding', icon: '🏠', label: 'Boarding', desc: 'Your pet stays at the sitter\'s home', color: 'from-primary to-orange-500' },
    { id: 'housesitting', icon: '🏡', label: 'House Sitting', desc: 'Sitter stays at your home', color: 'from-blue-500 to-blue-600' },
    { id: 'visits', icon: '☀️', label: 'Drop-In Visits', desc: '30-60 min check-ins at your home', color: 'from-amber-500 to-yellow-500' },
    { id: 'daycare', icon: '🐕', label: 'Doggy Day Care', desc: 'Daytime care at sitter\'s home', color: 'from-rose-400 to-pink-500' },
    { id: 'walking', icon: '🦮', label: 'Dog Walking', desc: 'Regular walks in your neighborhood', color: 'from-green-500 to-emerald-600' },
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

  const trustFeatures = [
    { icon: CheckCircle, label: 'Verified Sitters' },
    { icon: Shield, label: 'Pet Insurance' },
    { icon: Headphones, label: '24/7 Support' },
    { icon: Lock, label: 'Secure Payments' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Search & Compare',
      desc: 'Find trusted pet sitters in your area. Compare profiles, services, and reviews.',
      icon: Search,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Connect & Book',
      desc: 'Message sitters, ask questions, and book with confidence through our secure platform.',
      icon: MessageCircle,
      color: 'bg-primary'
    },
    {
      step: 3,
      title: 'Relax & Enjoy',
      desc: 'Your pet gets amazing care while you get peace of mind with photo updates.',
      icon: Heart,
      color: 'bg-rose-400'
    },
  ];

  const services = [
    { id: 0, title: 'Boarding', desc: 'Your pet stays overnight in a loving sitter\'s home', icon: Home },
    { id: 1, title: 'House Sitting', desc: 'A trusted sitter stays at your home with your pet', icon: Calendar },
    { id: 2, title: 'Drop-In Visits', desc: '30-60 minute check-ins for feeding and playtime', icon: Clock },
    { id: 3, title: 'Doggy Day Care', desc: 'Daytime care and socialization at sitter\'s home', icon: PawPrint },
    { id: 4, title: 'Dog Walking', desc: 'Regular walks and exercise in your neighborhood', icon: PawPrint },
  ];

  const safetyFeatures = [
    { icon: CheckCircle, title: 'Verified Sitters', desc: 'Every sitter passes identity verification and background checks' },
    { icon: Shield, title: 'Pet Insurance', desc: 'Every booking includes comprehensive pet insurance coverage' },
    { icon: Headphones, title: '24/7 Support', desc: 'Our dedicated team is always here when you need us' },
    { icon: Lock, title: 'Secure Payments', desc: 'Your payments are protected with bank-level security' },
  ];

  const featureBar = [
    { icon: Camera, label: 'Photo & video updates' },
    { icon: MapPin, label: 'GPS tracking on walks' },
    { icon: Stethoscope, label: 'Vet care coordination' },
    { icon: CreditCard, label: 'Easy online payments' },
    { icon: Star, label: 'Honest reviews' },
    { icon: Clock, label: 'Flexible scheduling' },
  ];

  return (
    <div className="flex-1 w-full overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

      {/* Hero Section with Search */}
      <section className="relative min-h-[95vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />

          {/* Floating Animated Paws */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[15%] text-primary/10 text-[120px] pointer-events-none"
          >
            🐾
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-32 left-[10%] text-primary/10 text-[80px] pointer-events-none"
          >
            🐾
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-[8%] text-amber-500/10 text-[60px] pointer-events-none"
          >
            🐕
          </motion.div>
          <motion.div
            animate={{
              y: [0, 12, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-40 right-[25%] text-rose-400/10 text-[50px] pointer-events-none"
          >
            🐈
          </motion.div>

        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-12">
          <div className="max-w-5xl mx-auto">
            {/* Header Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 shadow-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                  Trusted Pet Care, Made Simple
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight text-gray-900 dark:text-white"
              >
                Find Your Pet's<br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
                    Perfect Sitter
                  </span>
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 300 12"
                  >
                    <motion.path
                      d="M2 10 Q 150 -5 298 10"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Connect with <strong className="text-gray-900 dark:text-white">verified pet sitters</strong> in your area.
                Every booking is <strong className="text-primary">fully insured</strong>.
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
                    <span className="text-lg">🎯</span> What service does your pet need?
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
                    <MapPin className="w-4 h-4 text-primary" /> Where do you need pet care?
                  </p>

                  <div className="flex flex-col md:flex-row gap-3 relative">
                    {/* Beautiful Location Input */}
                    <div className="flex-1 relative">
                      <div className={`relative flex items-center rounded-full transition-all duration-300 ${showLocationSuggestions
                        ? 'ring-2 ring-primary/50 ring-offset-2 bg-white dark:bg-gray-700 shadow-lg shadow-primary/10'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-white shadow-sm hover:shadow-md'
                        }`}>
                        {/* Location Icon */}
                        <div className={`flex items-center justify-center w-14 h-14 rounded-l-full transition-colors ${
                          showLocationSuggestions ? 'text-primary' : 'text-gray-400'
                        }`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            showLocationSuggestions ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-600'
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
                          <span className="hidden sm:inline">Near Me</span>
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
                        <span>Search Sitters</span>
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
                              {location.length > 0 ? 'Suggestions' : 'Popular locations'}
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
                                  <p className="text-xs text-gray-500">{loc.count}</p>
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

            {/* Trust Badges Below Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-8"
            >
              {[
                { icon: CheckCircle, text: 'Background Checked', color: 'text-green-500' },
                { icon: Shield, text: 'Pet Insurance Included', color: 'text-blue-500' },
                { icon: Headphones, text: '24/7 Support', color: 'text-purple-500' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <span className="text-sm font-semibold text-primary">✨ Simple & Easy</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Double Paws</span> Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Finding trusted pet care has never been easier. Three simple steps to peace of mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-1 bg-gradient-to-r from-blue-500 via-primary to-rose-400 rounded-full" />

            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg relative z-10`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-md z-20">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate('/booking')}
              size="lg"
              className="shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
                  </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              Services for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Pet Need</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From overnight stays to daily walks, our sitters offer personalized care for your furry family members.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveService(service.id)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${activeService === service.id
                  ? 'bg-white dark:bg-gray-800 shadow-xl border-2 border-primary/20 -translate-y-1'
                  : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg border-2 border-transparent'
                  }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${activeService === service.id
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary'
                  }`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${activeService === service.id ? 'text-primary' : 'text-gray-900 dark:text-white'
                  }`}>
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Your Peace of Mind</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                We Take <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Safety</span> Seriously
                </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Your pet's safety is our top priority. Every sitter on our platform goes through a rigorous verification process.
              </p>

              <div className="space-y-6">
                {safetyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Dogs playing"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-primary fill-primary/30" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Trusted Care</p>
                          <p className="text-xs text-gray-500">Verified & Insured Sitters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Cat relaxing"
                      className="w-full h-64 object-cover"
                  />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Bar */}
      <section className="py-4 bg-primary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {featureBar.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <feature.icon className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">{feature.label}</span>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Happiness Guarantee */}
      <section className="py-24 bg-gradient-to-b from-green-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-3 text-gray-900 dark:text-white">
                    Our <span className="text-green-500">Happiness Guarantee</span>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    If you're not completely satisfied with your pet's care, we'll make it right. That's our promise to you and your furry family member.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Full Refund Policy</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">No Questions Asked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMnYtMmgzNHptMC0zMHYySDJ2LTJoMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="absolute top-10 left-10 text-white/10 text-8xl">🐾</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-8xl rotate-45">🐾</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <span className="text-sm font-semibold">✨ Start Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Your Pet's Perfect Sitter is Waiting
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of pet parents who trust Double Paws for safe, loving pet care. Book your first stay today!
            </p>

              <Button
                onClick={() => navigate('/booking')}
                size="lg"
              className="text-lg px-12 h-14 bg-white text-primary hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all group"
              >
              Find Sitters Near Me
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

            <p className="mt-8 text-white/70 text-sm">
              Free to search • No booking fees • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

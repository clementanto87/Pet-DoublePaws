import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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

} from 'lucide-react';
import FindSitterSearchBox from '../components/search/FindSitterSearchBox';


const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const [activeService, setActiveService] = useState(1);
  const trustFeatures = [
    { icon: CheckCircle, label: t('landing.trustFeatures.verifiedSitters') },
    { icon: Shield, label: t('landing.trustFeatures.petInsurance') },
    { icon: Headphones, label: t('landing.trustFeatures.support24') },
    { icon: Lock, label: t('landing.trustFeatures.securePayments') },
  ];

  const howItWorks = [
    {
      step: 1,
      title: t('landing.howItWorks.step1.title'),
      desc: t('landing.howItWorks.step1.desc'),
      icon: Search,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: t('landing.howItWorks.step2.title'),
      desc: t('landing.howItWorks.step2.desc'),
      icon: MessageCircle,
      color: 'bg-primary'
    },
    {
      step: 3,
      title: t('landing.howItWorks.step3.title'),
      desc: t('landing.howItWorks.step3.desc'),
      icon: Heart,
      color: 'bg-rose-400'
    },
  ];

  const services = [
    { id: 0, title: t('landing.services.boarding.label'), desc: t('landing.services.boarding.desc'), icon: Home },
    { id: 1, title: t('landing.services.houseSitting.label'), desc: t('landing.services.houseSitting.desc'), icon: Calendar },
    { id: 2, title: t('landing.services.dropInVisits.label'), desc: t('landing.services.dropInVisits.desc'), icon: Clock },
    { id: 3, title: t('landing.services.dayCare.label'), desc: t('landing.services.dayCare.desc'), icon: PawPrint },
    { id: 4, title: t('landing.services.walking.label'), desc: t('landing.services.walking.desc'), icon: PawPrint },
  ];

  const safetyFeatures = [
    { icon: CheckCircle, title: t('landing.safetyFeatures.verifiedSitters.title'), desc: t('landing.safetyFeatures.verifiedSitters.desc') },
    { icon: Shield, title: t('landing.safetyFeatures.petInsurance.title'), desc: t('landing.safetyFeatures.petInsurance.desc') },
    { icon: Headphones, title: t('landing.safetyFeatures.support24.title'), desc: t('landing.safetyFeatures.support24.desc') },
    { icon: Lock, title: t('landing.safetyFeatures.securePayments.title'), desc: t('landing.safetyFeatures.securePayments.desc') },
  ];

  const featureBar = [
    { icon: Camera, label: t('landing.features.photoUpdates') },
    { icon: MapPin, label: t('landing.features.gpsTracking') },
    { icon: Stethoscope, label: t('landing.features.vetCare') },
    { icon: CreditCard, label: t('landing.features.onlinePayments') },
    { icon: Star, label: t('landing.features.reviews') },
    { icon: Clock, label: t('landing.features.flexibleScheduling') },
  ];

  return (
    <div className="flex-1 w-full overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

      {/* Hero Section with Search */}
      <section className="relative min-h-[70vh] md:min-h-[95vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />

          {/* Floating Animated Paws - Hidden on mobile for better performance */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block absolute top-20 right-[15%] text-primary/10 text-[120px] pointer-events-none"
          >
            🐾
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="hidden md:block absolute bottom-32 left-[10%] text-primary/10 text-[80px] pointer-events-none"
          >
            🐾
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="hidden md:block absolute top-1/3 right-[8%] text-amber-500/10 text-[60px] pointer-events-none"
          >
            🐕
          </motion.div>
          <motion.div
            animate={{
              y: [0, 12, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="hidden md:block absolute bottom-40 right-[25%] text-rose-400/10 text-[50px] pointer-events-none"
          >
            🐈
          </motion.div>

        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 pt-6 sm:pt-8 md:pt-16 pb-6 sm:pb-8 md:pb-12 overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Header Content - Reduced spacing on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 sm:mb-6 md:mb-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 shadow-sm mb-3 sm:mb-4 md:mb-8"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent whitespace-nowrap">
                  {t('landing.tagline')}
                </span>
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-3 sm:mb-4 md:mb-6 leading-[1.1] tracking-tight text-gray-900 dark:text-white px-1"
              >
                {t('landing.heroTitle')}<br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
                    {t('landing.heroTitleHighlight')}
                  </span>
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 w-full h-3 hidden md:block"
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
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-4"
              >
                {t('landing.heroSubtitle')}
              </motion.p>
            </motion.div>

            {/* ✨ STUNNING SEARCH BOX ✨ */}
            <FindSitterSearchBox />

            {/* Trust Badges Below Search - Compact on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 mt-3 sm:mt-4 md:mt-8 px-2"
            >
              {[
                { icon: CheckCircle, text: 'Background Checked', color: 'text-green-500' },
                { icon: Shield, text: 'Pet Insurance Included', color: 'text-blue-500' },
                { icon: Headphones, text: '24/7 Support', color: 'text-purple-500' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item.color}`} />
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2"
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
      <section className="py-4 sm:py-5 md:py-6 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16">
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/30 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 mb-4 sm:mb-5 md:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-primary">✨ Simple & Easy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-5 md:mb-6 text-gray-900 dark:text-white px-2">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Double Paws</span> Works
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
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
      <section className="py-12 sm:py-16 md:py-24 bg-white dark:bg-gray-900 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4 md:mb-6 text-gray-900 dark:text-white px-2">
              Services for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Pet Need</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
              From overnight stays to daily walks, our sitters offer personalized care for your furry family members.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto px-2">
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/30 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-16">
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
      <section className="py-3 sm:py-4 bg-primary overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 flex-wrap">
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-green-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-orange-500 to-amber-500 relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMnYtMmgzNHptMC0zMHYySDJ2LTJoMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="absolute top-10 left-10 text-white/10 text-6xl sm:text-8xl hidden sm:block">🐾</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-6xl sm:text-8xl rotate-45 hidden sm:block">🐾</div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4 sm:mb-5 md:mb-6">
              <span className="text-xs sm:text-sm font-semibold">✨ Start Today</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold mb-4 sm:mb-5 md:mb-6 px-2">
              Your Pet's Perfect Sitter is Waiting
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
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

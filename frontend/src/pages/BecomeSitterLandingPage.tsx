import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Clock,
  Heart,
  Shield,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  BadgeCheck,
  Wallet,
  Home,
  Zap,
  Gift,
  ChevronDown,
  Sun,
  Footprints
} from 'lucide-react';
import { PawPrints } from '../components/ui/PawPrints';

const BecomeSitterLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedEarning, setSelectedEarning] = useState<'partTime' | 'fullTime'>('partTime');

  const earnings = {
    partTime: {
      boarding: { rate: 35, bookings: 8, total: 280 },
      walking: { rate: 20, bookings: 12, total: 240 },
      daycare: { rate: 25, bookings: 6, total: 150 },
      monthly: 670
    },
    fullTime: {
      boarding: { rate: 35, bookings: 20, total: 700 },
      walking: { rate: 20, bookings: 30, total: 600 },
      daycare: { rate: 25, bookings: 15, total: 375 },
      monthly: 1675
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Great Income',
      description: 'Set your own rates and earn up to $1,500+ per month caring for pets you love.',
      highlight: '$1,500+/mo',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Work when you want. You control your availability—part-time or full-time.',
      highlight: 'Your Hours',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Do What You Love',
      description: 'Spend your days with adorable pets. Turn your passion into a rewarding career.',
      highlight: 'Dream Job',
      color: 'from-pink-400 to-rose-500'
    },
    {
      icon: Home,
      title: 'Work From Home',
      description: 'Provide boarding and daycare from the comfort of your own home.',
      highlight: 'Home-Based',
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Share your experience, set your services, and showcase what makes you special.',
      icon: Users
    },
    {
      step: 2,
      title: 'Get Verified',
      description: 'Complete our quick verification to build trust with pet parents.',
      icon: BadgeCheck
    },
    {
      step: 3,
      title: 'Accept Bookings',
      description: 'Receive booking requests and choose the ones that fit your schedule.',
      icon: Calendar
    },
    {
      step: 4,
      title: 'Get Paid',
      description: 'Earn money doing what you love. Get paid securely after each booking.',
      icon: Wallet
    }
  ];



  const faqs = [
    {
      question: 'How much can I earn as a pet sitter?',
      answer: 'Earnings vary based on your location, services, and availability. Part-time sitters typically earn $500-800/month, while full-time sitters can earn $1,500-3,000+ per month. You set your own rates!'
    },
    {
      question: 'What are the requirements to become a sitter?',
      answer: 'You must be 18+, have a genuine love for animals, provide a safe environment, pass our background check, and maintain good communication with pet parents.'
    },
    {
      question: 'Is there a fee to join?',
      answer: 'Joining Double Paws is completely free! We only take a small service fee from completed bookings to cover payment processing and platform maintenance.'
    },
    {
      question: 'Am I covered by insurance?',
      answer: "Yes! Every booking includes comprehensive insurance coverage for both you and the pets in your care. You're protected against accidents, injuries, and property damage."
    },
    {
      question: 'How do I get paid?',
      answer: "Payments are processed securely through our platform. You'll receive your earnings via direct deposit within 2 business days after completing a booking."
    }
  ];



  return (
    <div className="flex-1 w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-20" />

        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-primary/25 to-orange-400/15 blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-green-400/15 to-emerald-400/10 blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-yellow-300/15 blur-[100px]"
          />
        </div>

        <PawPrints variant="floating" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-primary/20 shadow-lg mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Join 10,000+ Pet Sitters</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.05] tracking-tight"
              >
                Turn Your Love <br className="hidden sm:block" />
                for Pets Into{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
                    Income
                  </span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute -bottom-1 left-0 right-0 h-3 bg-green-400/20 -z-10 rounded"
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Become a Double Paws sitter and earn money doing what you love—caring for adorable pets in your neighborhood.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
              >
                <Button
                  onClick={() => navigate('/become-a-sitter/register')}
                  size="lg"
                  className="text-lg px-10 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 group"
                >
                  Start Earning Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="text-lg px-10 h-14 bg-white/70 backdrop-blur-sm hover:bg-white group"
                >
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Calculate Earnings
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground"
              >
                {[
                  { icon: Gift, text: 'Free to Join' },
                  { icon: Shield, text: 'Insurance Included' },
                  { icon: Zap, text: 'Quick Approval' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Image & Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 relative mt-8 lg:mt-0"
            >
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Happy pet sitter with dog"
                    className="rounded-3xl shadow-2xl w-full max-w-lg mx-auto"
                  />
                </motion.div>

                {/* Earnings Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-white dark:bg-card p-5 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 hidden sm:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">$1,500+</p>
                      <p className="text-sm text-muted-foreground">Monthly Potential</p>
                    </div>
                  </div>
                </motion.div>

                {/* Rating Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-white dark:bg-card p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[5, 6, 7].map((i) => (
                        <img
                          key={i}
                          src={`https://i.pravatar.cc/60?img=${i + 20}`}
                          alt="Pet owner"
                          className="w-10 h-10 rounded-full border-2 border-white dark:border-card object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Trusted by 10K+ Parents</p>
                    </div>
                  </div>
                </motion.div>

                {/* Booking Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-8 right-8 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-full shadow-lg hidden sm:flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">5 Bookings Today</span>
                </motion.div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-br from-green-400/15 via-primary/10 to-transparent rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>



      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Why Join Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Why Become a{' '}
              <span className="text-gradient">Double Paws</span> Sitter?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community of passionate pet lovers and enjoy amazing benefits
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-gray-100 dark:border-gray-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-bl-xl">
                    <span className="text-xs font-bold text-primary">{benefit.highlight}</span>
                  </div>
                  <CardContent className="p-6 pt-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Services You Can <span className="text-gradient">Offer</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose which services to offer based on your availability and preferences. You're in control.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                title: 'Pet Boarding',
                description: 'Overnight care at your home',
                price: '$25-50/night',
                icon: Home,
                color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
              },
              {
                title: 'Doggy Day Care',
                description: 'Daytime care and play',
                price: '$20-40/day',
                icon: Sun,
                color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              },
              {
                title: 'Dog Walking',
                description: 'Exercise and adventure',
                price: '$15-30/walk',
                icon: Footprints,
                color: 'text-green-500 bg-green-50 dark:bg-green-900/20'
              },
              {
                title: 'Drop-in Visits',
                description: 'Quick check-ins',
                price: '$15-25/visit',
                icon: MapPin,
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
              },
              {
                title: 'House Sitting',
                description: "Stay at client's home",
                price: '$40-75/night',
                icon: Home,
                color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-gray-800">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${service.color}`}>
                        <service.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{service.title}</h3>
                        <p className="text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {service.price}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Earnings Calculator */}
      <section id="calculator" className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Earnings Calculator</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              See Your Earning <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Potential</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden shadow-2xl border-0">
              <CardContent className="p-0">
                {/* Toggle */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  {(['partTime', 'fullTime'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedEarning(type)}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${selectedEarning === type
                        ? 'bg-green-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {type === 'partTime' ? '🕐 Part-Time' : '💼 Full-Time'}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: 'Boarding', emoji: '🏠', ...earnings[selectedEarning].boarding },
                      { label: 'Dog Walking', emoji: '🦮', ...earnings[selectedEarning].walking },
                      { label: 'Day Care', emoji: '☀️', ...earnings[selectedEarning].daycare },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="font-semibold">{item.label}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>${item.rate}/booking</span>
                          <span>×{item.bookings} bookings</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">${item.total}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
                    <p className="text-sm opacity-80 mb-1">Estimated Monthly Earnings</p>
                    <p className="text-5xl font-bold mb-2">${earnings[selectedEarning].monthly}</p>
                    <p className="text-sm opacity-80">Based on average sitter activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              How to Get <span className="text-gradient">Started</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start your pet sitting journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-[70px] left-[12%] right-[12%] h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />

            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100 dark:border-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg relative z-10">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
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
              onClick={() => navigate('/become-a-sitter/register')}
              size="lg"
              className="text-lg px-12 h-14 shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all group"
            >
              Start Your Application
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-gray-100 dark:border-gray-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mkgydi0yaDM0em0wLTMwdjJIMnYtMmgzNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of pet lovers earning extra income doing what they love. Your perfect pet-sitting career awaits!
            </p>
            <Button
              onClick={() => navigate('/become-a-sitter/register')}
              size="lg"
              className="text-lg px-12 h-14 bg-white text-green-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all group"
            >
              Apply Now — It's Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-8 text-white/70 text-sm">
              ✓ Takes less than 15 minutes · ✓ No credit card required · ✓ Start earning this week
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BecomeSitterLandingPage;

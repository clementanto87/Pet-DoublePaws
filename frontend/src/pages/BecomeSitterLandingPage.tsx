import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
  DollarSign,
  Clock,
  Heart,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Briefcase,
  PawPrint,
  BadgeCheck,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { PawPrints } from '../components/ui/PawPrints';

const BecomeSitterLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Great Income',
      description: 'Set your own rates and earn up to $1,000+ per month doing what you love—caring for pets.',
      highlight: '$1,000+/mo'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Work when you want. You control your availability, whether part-time or full-time.',
      highlight: 'Your Hours'
    },
    {
      icon: Heart,
      title: 'Love What You Do',
      description: 'Spend your days with adorable pets. Turn your passion for animals into a rewarding career.',
      highlight: 'Dream Job'
    },
    {
      icon: MapPin,
      title: 'Work From Home',
      description: 'Provide boarding and daycare from the comfort of your own home. No commute needed.',
      highlight: 'Home-Based'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Tell us about yourself, your experience with pets, and the services you want to offer.',
      icon: Users
    },
    {
      step: 2,
      title: 'Set Your Services',
      description: 'Choose from boarding, daycare, walking, drop-in visits, and more. Set your own rates.',
      icon: Briefcase
    },
    {
      step: 3,
      title: 'Get Verified',
      description: 'Complete our verification process to build trust with pet parents in your area.',
      icon: BadgeCheck
    },
    {
      step: 4,
      title: 'Start Earning',
      description: 'Accept bookings, care for pets, and get paid securely through our platform.',
      icon: Wallet
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Sitters', icon: Users },
    { value: '$50M+', label: 'Paid to Sitters', icon: TrendingUp },
    { value: '4.9★', label: 'Average Rating', icon: Star },
    { value: '100K+', label: 'Pets Cared For', icon: PawPrint }
  ];

  const testimonials = [
    {
      name: 'Jessica M.',
      role: 'Dog Sitter since 2022',
      image: 'https://i.pravatar.cc/100?img=23',
      quote: 'I left my office job to become a full-time sitter. Best decision ever! I now earn more while doing what I love.',
      earnings: '$2,400/month'
    },
    {
      name: 'Michael T.',
      role: 'Cat & Dog Sitter',
      image: 'https://i.pravatar.cc/100?img=12',
      quote: 'The flexibility is amazing. I can study and still earn great money taking care of pets on weekends.',
      earnings: '$800/month'
    },
    {
      name: 'Emily R.',
      role: 'Premium Sitter',
      image: 'https://i.pravatar.cc/100?img=45',
      quote: 'Double Paws gave me the platform to turn my home into a pet paradise. The support team is incredible!',
      earnings: '$3,200/month'
    }
  ];

  const requirements = [
    'Must be 18 years or older',
    'Love for animals and genuine passion for pet care',
    'Safe, pet-friendly environment',
    'Reliable and responsible',
    'Good communication skills',
    'Pass background verification'
  ];

  return (
    <div className="flex-1 w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background-alt-dark dark:via-background-alt-dark dark:to-background-alt-dark -z-20"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-yellow-400/10 blur-[80px] animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Paw Animations */}
        <PawPrints variant="floating" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-white/10 border border-primary/30 shadow-lg mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Join 10,000+ Pet Sitters</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight">
                Turn Your Love for Pets Into <br />
                <span className="text-gradient">Extra Income</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Become a Double Paws sitter and earn money doing what you love—caring for adorable pets in your neighborhood.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button
                  onClick={() => navigate('/become-a-sitter/register')}
                  size="lg"
                  className="text-lg px-10 py-6 h-auto shadow-glow hover:scale-105 transition-all duration-300 group"
                >
                  Start Your Application
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  className="text-lg px-10 py-6 h-auto bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">No Fees to Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Insurance Included</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative animate-scale-in mt-8 lg:mt-0">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Happy pet sitter with dog"
                  className="rounded-3xl shadow-2xl w-full max-w-lg mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />

                {/* Earnings Card */}
                <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white dark:bg-card p-5 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-white/10" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">$1,000+</p>
                      <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                    </div>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white dark:bg-card p-5 rounded-2xl shadow-xl animate-float hidden sm:block border border-gray-100 dark:border-white/10" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[5, 6, 7].map((i) => (
                        <img 
                          key={i} 
                          src={`https://i.pravatar.cc/80?img=${i + 20}`} 
                          alt="Pet owner" 
                          className="w-10 h-10 rounded-full border-3 border-white dark:border-card object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Trusted by Pet Parents</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-br from-primary/25 to-yellow-400/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-white/80 dark:bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Why Become a <span className="text-gradient">Double Paws</span> Sitter?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our community of passionate pet lovers and enjoy amazing benefits while doing what you love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-glow border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {benefit.highlight}
                </div>
                <CardContent className="p-8 pt-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-background-alt dark:bg-background-alt-dark relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              How to Get <span className="text-gradient">Started</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Four simple steps to start earning as a pet sitter. The whole process takes less than 15 minutes!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full"></div>
            
            {howItWorks.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mb-6 text-xl font-bold shadow-glow mx-auto lg:mx-0">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3 text-center lg:text-left">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-center lg:text-left text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => navigate('/become-a-sitter/register')}
              size="lg"
              className="text-lg px-12 py-6 h-auto shadow-glow hover:scale-105 transition-all duration-300 group"
            >
              Begin Registration
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Hear From Our <span className="text-gradient">Sitters</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from real pet sitters who turned their passion into income.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-glow border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {testimonial.earnings}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-24 bg-background-alt dark:bg-background-alt-dark relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-white/5">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    What You <span className="text-gradient">Need</span>
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    We're looking for reliable, caring individuals who love animals. Here's what you need to get started:
                  </p>
                  
                  <div className="space-y-4">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10">
                    <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">You're Protected</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Every booking includes insurance coverage and 24/7 support for peace of mind.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Insurance
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        24/7 Support
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of pet lovers earning extra income while doing what they love. Your perfect pet-sitting career awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/become-a-sitter/register')}
                variant="secondary"
                size="lg"
                className="text-lg px-12 py-6 h-auto bg-white text-primary hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                Apply Now — It's Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="mt-8 text-white/70 text-sm">
              Takes less than 15 minutes • No credit card required • Start earning this week
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeSitterLandingPage;


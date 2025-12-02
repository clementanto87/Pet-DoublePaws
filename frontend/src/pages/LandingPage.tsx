import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
  Shield,
  Heart,
  Trophy,
  Stethoscope,
  Calendar,
  Camera,
  Clock,
  Award,
  History,
  CheckCircle,
  Star,
  PawPrint
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-background-alt dark:bg-background-alt-dark -z-20"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] animate-float"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-primary/20 shadow-sm mb-8 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                <span className="text-sm font-medium text-primary">#1 Rated Pet Care Service</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight">
                Give Your Pets <br />
                <span className="text-gradient">Double the Love</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Premium pet daycare services where your furry friends get the attention they deserve. Safe, fun, and loving environment for your peace of mind.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => navigate('/booking')}
                  size="lg"
                  className="shadow-glow hover:scale-105 transition-transform"
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pet-profile')}
                  size="lg"
                  className="bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  Create Pet Profile
                </Button>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Insured & Bonded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative animate-scale-in mt-12 lg:mt-0">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Happy dog"
                  className="rounded-3xl shadow-2xl w-full max-w-md mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500"
                />

                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-white dark:bg-card p-4 rounded-2xl shadow-glass animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Verified Sitter</p>
                      <p className="text-xs text-muted-foreground">Background Checked</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-white dark:bg-card p-4 rounded-2xl shadow-glass animate-float hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-card flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-sm">500+ Happy Pets</p>
                      <div className="flex text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-white/50 dark:bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Happy Pets', value: '500+', icon: PawPrint },
              { label: 'Expert Staff', value: '50+', icon: Award },
              { label: 'Years Experience', value: '10+', icon: History },
              { label: 'Care Available', value: '24/7', icon: Clock },
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-display font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Why Choose <span className="text-gradient">Double Paws</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              We provide exceptional care for your pets with a focus on safety, fun, and comfort. Every detail is designed for your pet's happiness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Safe & Secure', icon: Shield, desc: 'State-of-the-art facilities with 24/7 monitoring and trained professionals ensuring your pet\'s safety.' },
              { title: 'Loving Care', icon: Heart, desc: 'Our passionate team treats every pet like family, providing personalized attention and care.' },
              { title: 'Fun Activities', icon: Trophy, desc: 'Engaging playtime, exercise, and socialization activities tailored to your pet\'s needs.' },
              { title: 'Health Monitoring', icon: Stethoscope, desc: 'Regular health checks and immediate access to veterinary care when needed.' },
              { title: 'Flexible Scheduling', icon: Calendar, desc: 'Book daily, weekly, or monthly care with easy online scheduling and management.' },
              { title: 'Photo Updates', icon: Camera, desc: 'Receive regular photos and updates so you can see your pet having fun while you\'re away.' },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-glow border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/Image Section */}
      <section className="py-24 bg-background-alt dark:bg-background-alt-dark relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-white text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                  "The best decision I ever made for my dog!"
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Double Paws has completely transformed our daily routine. My dog is happier, healthier, and loves going to daycare every morning. The staff is incredible!
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <img src="https://i.pravatar.cc/100?img=32" alt="Reviewer" className="w-12 h-12 rounded-full border-2 border-white" />
                  <div className="text-left">
                    <p className="font-bold">Sarah Jenkins</p>
                    <p className="text-sm text-white/80">Owner of Max, Golden Retriever</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Dogs playing"
                    className="rounded-2xl shadow-lg transform translate-y-8"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Dog sleeping"
                    className="rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Join the <span className="text-gradient">Family</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join hundreds of happy pet parents who trust Double Paws with their furry family members. First day is on us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/booking')}
                size="lg"
                className="text-lg px-12 py-6 h-auto shadow-glow hover:scale-105 transition-transform"
              >
                Book Your Spot
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/pet-profile')}
                size="lg"
                className="text-lg px-12 py-6 h-auto"
              >
                Create Profile
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

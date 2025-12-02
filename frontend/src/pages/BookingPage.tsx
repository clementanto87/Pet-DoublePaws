import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Calendar as CalendarIcon,
  Dog,
  Cat,
  Briefcase,
  Home,
  Sun,
  Moon,
  Footprints,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

const BookingPage: React.FC = () => {
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [selectedService, setSelectedService] = useState('boarding');
  const [selectedSize, setSelectedSize] = useState('medium');

  const services = [
    { id: 'boarding', label: 'Boarding', icon: Moon, description: 'Overnight in your sitter\'s home', category: 'away' },
    { id: 'house-sitting', label: 'House Sitting', icon: Home, description: 'Overnight in your home', category: 'away' },
    { id: 'drop-in', label: 'Drop-In Visits', icon: Briefcase, description: 'Visits in your home', category: 'away' },
    { id: 'day-care', label: 'Doggy Day Care', icon: Sun, description: 'Daytime care in your sitter\'s home', category: 'work' },
    { id: 'walking', label: 'Dog Walking', icon: Footprints, description: 'Walks in your neighborhood', category: 'work' },
  ];

  const sizes = [
    { id: 'small', label: 'Small', weight: '0-15 lbs' },
    { id: 'medium', label: 'Medium', weight: '16-40 lbs' },
    { id: 'large', label: 'Large', weight: '41-100 lbs' },
    { id: 'giant', label: 'Giant', weight: '101+ lbs' },
  ];

  return (
    <div className="min-h-screen bg-background-alt dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Find the Perfect <span className="text-gradient">Care</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book trusted local pet sitters and walkers who will treat your pets like family.
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-card/90 overflow-hidden animate-slide-up">
          <CardContent className="p-8">
            {/* Pet Type Selection */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-8 border-b border-border/50">
              <span className="text-lg font-bold text-foreground">I'm looking for service for my:</span>
              <div className="flex gap-4">
                <button
                  onClick={() => setPetType('dog')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200",
                    petType === 'dog'
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Dog className="w-5 h-5" />
                  <span className="font-bold">Dog</span>
                </button>
                <button
                  onClick={() => setPetType('cat')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200",
                    petType === 'cat'
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Cat className="w-5 h-5" />
                  <span className="font-bold">Cat</span>
                </button>
              </div>
            </div>

            {/* Service Selection */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">For When You're Away</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {services.filter(s => s.category === 'away').map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 gap-3 text-center",
                          selectedService === service.id
                            ? "border-primary bg-primary text-white shadow-glow transform scale-105"
                            : "border-border bg-white dark:bg-white/5 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        <service.icon className={cn("w-8 h-8", selectedService === service.id ? "text-white" : "text-primary")} />
                        <span className="text-sm font-bold leading-tight">{service.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">For When You're At Work</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.filter(s => s.category === 'work').map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 gap-3 text-center",
                          selectedService === service.id
                            ? "border-primary bg-primary text-white shadow-glow transform scale-105"
                            : "border-border bg-white dark:bg-white/5 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        <service.icon className={cn("w-8 h-8", selectedService === service.id ? "text-white" : "text-primary")} />
                        <span className="text-sm font-bold leading-tight">{service.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Location */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <Label className="text-base">Address or Zip Code</Label>
                <Input placeholder="e.g. 123 Main St, New York, NY" className="h-14 text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">For these days</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input type="date" className="h-14 pl-10" />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground font-medium">→</span>
                  <div className="relative flex-1">
                    <Input type="date" className="h-14 pl-10" />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pet Size (Only if Dog) */}
            {petType === 'dog' && (
              <div className="mb-10">
                <Label className="text-base mb-4 block">My Dog Size</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                        selectedSize === size.id
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                          : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="text-lg font-bold">{size.label}</span>
                      <span className="text-sm opacity-80">{size.weight}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Button */}
            <Button size="lg" className="w-full h-16 text-xl font-bold shadow-glow hover:scale-[1.02] transition-transform">
              <Search className="w-6 h-6 mr-2" />
              Search for Sitters
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

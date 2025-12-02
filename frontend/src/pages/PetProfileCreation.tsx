import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { Upload, PawPrint, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';

const PetProfileCreation: React.FC = () => {
  const [formData, setFormData] = useState({
    petName: '',
    petType: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: '',
    ageMonths: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background-alt dark:bg-background-alt-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 shadow-glow">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Create Your <span className="text-gradient">Pet's Profile</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's get to know your furry friend. This information helps us provide the best personalized care.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Basic Info</span>
            <span>Step 1 of 3</span>
          </div>
          <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/3 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Photo Upload Section */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-card/80">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Upload a cute photo of your pet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl p-10 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-card/80">
            <CardHeader>
              <CardTitle>Pet Details</CardTitle>
              <CardDescription>Tell us the basics about your pet</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="petName">Pet's Name</Label>
                  <div className="relative">
                    <Input
                      id="petName"
                      placeholder="e.g. Buddy"
                      value={formData.petName}
                      onChange={handleChange}
                      className="pl-10"
                    />
                    <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petType">Pet Type</Label>
                  <Select
                    id="petType"
                    value={formData.petType}
                    onChange={handleChange}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    placeholder="e.g. Golden Retriever"
                    value={formData.breed}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <div className="relative">
                    <Select
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="pl-10"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Age</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      id="ageYears"
                      type="number"
                      placeholder="Years"
                      value={formData.ageYears}
                      onChange={handleChange}
                      min="0"
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="relative">
                    <Input
                      id="ageMonths"
                      type="number"
                      placeholder="Months"
                      value={formData.ageMonths}
                      onChange={handleChange}
                      min="0"
                      max="11"
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button variant="ghost" type="button" className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button variant="secondary" type="button" className="w-full sm:w-auto">
                Save for Later
              </Button>
              <Button type="submit" size="lg" className="w-full sm:w-auto shadow-glow">
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetProfileCreation;

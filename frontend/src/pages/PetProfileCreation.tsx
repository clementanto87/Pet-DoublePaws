import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { Upload, PawPrint, Calendar, User, ArrowRight, ArrowLeft, Weight, Heart } from 'lucide-react';
import { petService } from '../services/pet.service';

const PetProfileCreation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    petName: '',
    petType: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: '',
    ageMonths: '',
    weight: '',
    specialNeeds: '',
    imageUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 400 * 4) {
        // Optional: Add size validation logic here
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const age = parseFloat(formData.ageYears) || 0;

      await petService.createPet({
        name: formData.petName,
        species: formData.petType,
        breed: formData.breed,
        age: age,
        weight: parseFloat(formData.weight) || 0,
        specialNeeds: formData.specialNeeds,
        imageUrl: formData.imageUrl
      });

      const returnUrl = (location.state as any)?.returnUrl || '/dashboard';
      navigate(returnUrl);
    } catch (err) {
      console.error('Failed to create pet profile:', err);
      setError('Failed to create pet profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            {t('petProfile.title')} <span className="text-gradient">{t('petProfile.titleAccent')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('petProfile.subtitle')}
          </p>
        </div>

        {/* Progress Bar Removed */}
        <div className="mb-8 animate-slide-up">
          <p className="text-center text-muted-foreground">
            {t('petProfile.fillDetails')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-card/80">
            <CardHeader>
              <CardTitle>{t('petProfile.profilePhoto')}</CardTitle>
              <CardDescription>{t('petProfile.uploadPhoto')}</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                onClick={handleUploadClick}
                className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl p-10 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
              >
                {previewUrl ? (
                  <div className="relative w-32 h-32 mb-4">
                    <img src={previewUrl} alt="Pet preview" className="w-full h-full object-cover rounded-full shadow-md" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                )}
                <p className="text-lg font-bold text-foreground mb-2">
                  {previewUrl ? t('petProfile.changePhoto') : t('petProfile.clickUpload')}
                </p>
                <p className="text-sm text-muted-foreground">{t('petProfile.fileTypes')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-card/80">
            <CardHeader>
              <CardTitle>{t('petProfile.petDetails')}</CardTitle>
              <CardDescription>{t('petProfile.petBasics')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="petName">{t('petProfile.petName')}</Label>
                  <div className="relative">
                    <Input
                      id="petName"
                      placeholder={t('petProfile.petNamePlaceholder')}
                      value={formData.petName}
                      onChange={handleChange}
                      required
                      className="pl-10"
                    />
                    <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petType">{t('petProfile.petType')}</Label>
                  <Select
                    id="petType"
                    value={formData.petType}
                    onChange={handleChange}
                  >
                    <option value="Dog">{t('petProfile.dog')}</option>
                    <option value="Cat">{t('petProfile.cat')}</option>
                    <option value="Bird">{t('petProfile.bird')}</option>
                    <option value="Other">{t('petProfile.other')}</option>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breed">{t('petProfile.breed')}</Label>
                  <Input
                    id="breed"
                    placeholder={t('petProfile.breedPlaceholder')}
                    value={formData.breed}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t('petProfile.gender')}</Label>
                  <div className="relative">
                    <Select
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="pl-10"
                    >
                      <option value="Male">{t('petProfile.male')}</option>
                      <option value="Female">{t('petProfile.female')}</option>
                    </Select>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        id="ageYears"
                        type="number"
                        placeholder={t('petProfile.ageYears')}
                        value={formData.ageYears}
                        onChange={handleChange}
                        min="0"
                        required
                        className="pl-10"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Input
                        id="ageMonths"
                        type="number"
                        placeholder={t('petProfile.ageMonths')}
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

                <div className="space-y-2">
                  <Label htmlFor="weight">{t('petProfile.weight')}</Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g. 12.5"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                      className="pl-10"
                    />
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds">{t('petProfile.specialNeeds')}</Label>
                <div className="relative">
                  <Input
                    id="specialNeeds"
                    placeholder={t('petProfile.specialNeedsPlaceholder')}
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button variant="ghost" type="button" className="w-full sm:w-auto text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('petProfile.back')}
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button variant="secondary" type="button" size="lg" className="w-full sm:w-auto">
                {t('petProfile.saveForLater')}
              </Button>
              <Button type="submit" size="lg" className="w-full sm:w-auto shadow-glow" disabled={isLoading}>
                {isLoading ? t('petProfile.creating') : t('petProfile.createProfile')}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetProfileCreation;

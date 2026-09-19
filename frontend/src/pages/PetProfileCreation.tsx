import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PawPrint,
  Upload,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Weight,
  Heart,
  Camera,
  Trash2,
  ShieldCheck,
  Check,
  Sparkles,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useToast } from '../components/ui/Toast';
import { petService } from '../services/pet.service';
import { cn } from '../lib/utils';

interface PetTypeOption {
  id: string;
  nameKey: string;
  emoji: string;
}

const PET_TYPES: PetTypeOption[] = [
  { id: 'Dog', nameKey: 'petProfile.dog', emoji: '🐶' },
  { id: 'Cat', nameKey: 'petProfile.cat', emoji: '🐱' },
  { id: 'Bird', nameKey: 'petProfile.bird', emoji: '🦜' },
  { id: 'Other', nameKey: 'petProfile.other', emoji: '🐾' }
];

const GENDER_OPTIONS = [
  { id: 'Male', labelKey: 'petProfile.male', symbol: '♂' },
  { id: 'Female', labelKey: 'petProfile.female', symbol: '♀' }
];

const QUICK_TAGS = [
  { id: 'friendlyDogs', key: 'petProfile.tags.friendlyDogs' },
  { id: 'friendlyCats', key: 'petProfile.tags.friendlyCats' },
  { id: 'friendlyKids', key: 'petProfile.tags.friendlyKids' },
  { id: 'vaccinated', key: 'petProfile.tags.vaccinated' },
  { id: 'neutered', key: 'petProfile.tags.neutered' },
  { id: 'microchipped', key: 'petProfile.tags.microchipped' },
  { id: 'houseTrained', key: 'petProfile.tags.houseTrained' },
  { id: 'specialDiet', key: 'petProfile.tags.specialDiet' }
];

const PetProfileCreation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When arriving from "Edit" on the dashboard, the pet is passed via router state.
  const editingPet = (location.state as any)?.pet;
  const isEditing = Boolean(editingPet?.id);

  // Calculate years and months from existing age if editing
  const initialYears = editingPet?.age != null ? String(Math.floor(editingPet.age)) : '';
  const initialMonths =
    editingPet?.age != null && editingPet.age % 1 !== 0
      ? String(Math.round((editingPet.age - Math.floor(editingPet.age)) * 12))
      : '';

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    ((location.state as any)?.pet?.imageUrl) ?? null
  );

  const [formData, setFormData] = useState({
    petName: editingPet?.name ?? '',
    petType: editingPet?.species ?? 'Dog',
    breed: editingPet?.breed ?? '',
    gender: editingPet?.gender ?? 'Male',
    ageYears: initialYears,
    ageMonths: initialMonths,
    weight: editingPet?.weight != null ? String(editingPet.weight) : '',
    specialNeeds: editingPet?.specialNeeds ?? '',
    imageUrl: editingPet?.imageUrl ?? ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePetTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, petType: type }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setFormData(prev => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleTag = (tagText: string) => {
    const currentNeeds = formData.specialNeeds.trim();
    if (!currentNeeds) {
      setFormData(prev => ({ ...prev, specialNeeds: tagText }));
      return;
    }

    const items = currentNeeds.split(/,\s*/);
    const index = items.indexOf(tagText);

    if (index > -1) {
      items.splice(index, 1);
      setFormData(prev => ({ ...prev, specialNeeds: items.join(', ') }));
    } else {
      setFormData(prev => ({ ...prev, specialNeeds: `${currentNeeds}, ${tagText}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const years = parseFloat(formData.ageYears) || 0;
      const months = parseFloat(formData.ageMonths) || 0;
      const age = months > 0 ? parseFloat((years + months / 12).toFixed(1)) : years;

      const payload = {
        name: formData.petName.trim(),
        species: formData.petType,
        breed: formData.breed.trim(),
        age: age,
        weight: parseFloat(formData.weight) || 0,
        specialNeeds: formData.specialNeeds.trim(),
        imageUrl: formData.imageUrl
      };

      if (isEditing) {
        await petService.updatePet(editingPet.id, payload);
        showToast(t('petProfile.updatedSuccess', 'Pet profile updated successfully!'), 'success');
      } else {
        await petService.createPet(payload);
        showToast(t('petProfile.createdSuccess', 'Pet profile created successfully!'), 'success');
      }

      const returnUrl = (location.state as any)?.returnUrl || '/dashboard';
      navigate(returnUrl);
    } catch (err) {
      console.error('Failed to save pet profile:', err);
      setError('Failed to save pet profile. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-orange-300 blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-sky-300 blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
            {t('petProfile.back')}
          </button>

          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              {isEditing ? t('petProfile.editBadge') : t('petProfile.createBadge')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? t('petProfile.editTitle') : t('petProfile.title')}{' '}
              <span className="text-gradient">{t('petProfile.titleAccent')}</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
              {t('petProfile.subtitle')}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">{t('common.error', 'An error occurred')}</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md overflow-hidden p-6 sm:p-8">
            {/* 1. Photo & Species Selection */}
            <div className="space-y-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
              {/* Photo Uploader */}
              <div>
                <Label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('petProfile.profilePhoto')}
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer group',
                    isDragging
                      ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-400 hover:bg-orange-50/30 dark:hover:bg-slate-800/80'
                  )}
                >
                  {/* Photo Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-md bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Pet profile"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Photo Action Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {previewUrl ? t('petProfile.changePhoto') : t('petProfile.clickUpload')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('petProfile.photoHint', 'PNG, JPG, WebP up to 5MB')}
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold px-3 pointer-events-none rounded-lg"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {previewUrl ? t('petProfile.changePhoto') : t('petProfile.uploadPhoto')}
                      </Button>

                      {previewUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="h-8 px-2.5 inline-flex items-center text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {t('petProfile.removePhoto', 'Remove')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Species / Pet Type Selection */}
              <div>
                <Label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('petProfile.petType')} <span className="text-orange-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PET_TYPES.map(type => {
                    const isSelected = formData.petType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handlePetTypeSelect(type.id)}
                        className={cn(
                          'relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all text-center',
                          isSelected
                            ? 'border-primary bg-orange-50/80 dark:bg-orange-950/30 text-primary shadow-sm shadow-orange-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <span className="text-2xl mb-1">{type.emoji}</span>
                        <span className="text-sm font-semibold">{t(type.nameKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Core Pet Details */}
            <div className="space-y-5 py-8 border-b border-slate-100 dark:border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pet Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="petName" className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('petProfile.petName')} <span className="text-orange-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="petName"
                      placeholder={t('petProfile.petNamePlaceholder')}
                      value={formData.petName}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <PawPrint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Breed */}
                <div className="space-y-1.5">
                  <Label htmlFor="breed" className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('petProfile.breed')} <span className="text-orange-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="breed"
                      placeholder={t('petProfile.breedPlaceholder')}
                      value={formData.breed}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Gender Segmented Control */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('petProfile.gender')}
                  </Label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 h-12 items-center">
                    {GENDER_OPTIONS.map(gender => {
                      const isSelected = formData.gender === gender.id;
                      return (
                        <button
                          key={gender.id}
                          type="button"
                          onClick={() => handleGenderSelect(gender.id)}
                          className={cn(
                            'h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                            isSelected
                              ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          )}
                        >
                          <span>{gender.symbol}</span>
                          <span>{t(gender.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Age (Years & Months) */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('petProfile.age')} <span className="text-orange-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Input
                        id="ageYears"
                        type="number"
                        placeholder={t('petProfile.ageYears')}
                        value={formData.ageYears}
                        onChange={handleChange}
                        min="0"
                        max="35"
                        required
                        className="pl-8 pr-2 h-12 text-sm rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-center"
                      />
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
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
                        className="pl-8 pr-2 h-12 text-sm rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-center"
                      />
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Weight (kg) */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="weight" className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('petProfile.weight')} <span className="text-orange-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="12.5"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      required
                      className="pl-10 pr-12 h-12 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      kg
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Special Needs & Health Notes */}
            <div className="space-y-4 pt-8">
              <div>
                <Label htmlFor="specialNeeds" className="block text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                  {t('petProfile.specialNeeds')}
                </Label>
                <div className="relative">
                  <textarea
                    id="specialNeeds"
                    rows={3}
                    placeholder={t('petProfile.specialNeedsPlaceholder')}
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-y min-h-[90px]"
                  />
                </div>
              </div>

              {/* Quick Tags for Convenience */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {t('petProfile.quickTags')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map(tag => {
                    const tagLabel = t(tag.key);
                    const isAdded = formData.specialNeeds.includes(tagLabel);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tagLabel)}
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          isAdded
                            ? 'bg-orange-100 dark:bg-orange-950/60 text-primary border border-orange-300 dark:border-orange-800'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                        )}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 text-primary stroke-[3]" />
                        ) : (
                          <Heart className="w-3 h-3 opacity-60" />
                        )}
                        <span>{tagLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Bar (Save for Later removed) */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                type="button"
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('petProfile.back')}
              </Button>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditing ? t('petProfile.saving') : t('petProfile.creating')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isEditing ? t('petProfile.saveChanges') : t('petProfile.createProfile')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* Security Trust Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('petProfile.securityNote')}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetProfileCreation;

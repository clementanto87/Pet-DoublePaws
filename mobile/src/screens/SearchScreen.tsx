import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../components/ui';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const serviceOptions = [
  { id: 'boarding', icon: '🏠', label: 'Boarding' },
  { id: 'daycare', icon: '☀️', label: 'Day Care' },
  { id: 'walking', icon: '🦮', label: 'Walking' },
  { id: 'visits', icon: '👋', label: 'Drop-in' },
];

const petTypeOptions = [
  { id: 'dog', icon: '🐕', label: 'Dog' },
  { id: 'cat', icon: '🐈', label: 'Cat' },
  { id: 'other', icon: '🐾', label: 'Other' },
];

const mockSitters = [
  {
    id: '1',
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    rating: 4.9,
    reviews: 127,
    distance: '0.8 km',
    price: 45,
    verified: true,
    services: ['boarding', 'daycare', 'walking'],
    bio: 'Certified pet care specialist with 5+ years experience',
  },
  {
    id: '2',
    name: 'Mike Chen',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    reviews: 89,
    distance: '1.2 km',
    price: 40,
    verified: true,
    services: ['boarding', 'walking'],
    bio: 'Dog trainer and pet enthusiast',
  },
  {
    id: '3',
    name: 'Emily Davis',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    rating: 5.0,
    reviews: 156,
    distance: '2.1 km',
    price: 55,
    verified: true,
    services: ['boarding', 'daycare', 'visits'],
    bio: 'Professional pet sitter with cozy home',
  },
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [location, setLocation] = useState('');
  const [selectedService, setSelectedService] = useState(route.params?.service || 'boarding');
  const [selectedPetType, setSelectedPetType] = useState('dog');
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating');

  const handleSearch = () => setShowResults(true);

  const sortedSitters = [...mockSitters].sort((a, b) => {
    switch (sortBy) {
      case 'price': return a.price - b.price;
      case 'distance': return parseFloat(a.distance) - parseFloat(b.distance);
      default: return b.rating - a.rating;
    }
  });

  const renderSitterCard = ({ item, index }: { item: typeof mockSitters[0]; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
      <Pressable
        style={[styles.sitterCard]}
        onPress={() => navigation.navigate('SitterProfile', { sitter: item })}
      >
        <View style={styles.sitterImageContainer}>
          <Image source={{ uri: item.image }} style={styles.sitterImage} contentFit="cover" />
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary[500]} />
            </View>
          )}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>${item.price}</Text>
            <Text style={styles.priceUnit}>/night</Text>
          </View>
        </View>
        <View style={styles.sitterInfo}>
          <View style={styles.sitterHeader}>
            <Text style={styles.sitterName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviews})</Text>
            </View>
          </View>
          <Text style={styles.sitterBio} numberOfLines={2}>{item.bio}</Text>
          <View style={styles.sitterMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={theme.colors.gray[400]} />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
            <View style={styles.servicesRow}>
              {item.services.slice(0, 3).map((s, i) => (
                <View key={i} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{serviceOptions.find(opt => opt.id === s)?.icon}</Text>
                </View>
              ))}
            </View>
          </View>
          <Button
            title="View Profile"
            size="sm"
            onPress={() => navigation.navigate('SitterProfile', { sitter: item })}
            fullWidth
          />
        </View>
      </Pressable>
    </Animated.View>
  );

  if (showResults) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resultsHeader}>
          <Pressable onPress={() => setShowResults(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.gray[700]} />
          </Pressable>
          <View>
            <Text style={styles.resultsTitle}>{mockSitters.length} Sitters Found</Text>
            <Text style={styles.resultsSubtitle}>Near your location</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          {(['rating', 'price', 'distance'] as const).map((option) => (
            <Pressable
              key={option}
              style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
                {option === 'rating' ? '⭐ Top Rated' : option === 'price' ? '💰 Lowest Price' : '📍 Nearest'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <FlatList
          data={sortedSitters}
          renderItem={renderSitterCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.sitterList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.searchContent}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🔍</Text>
          <Text style={styles.headerTitle}>Find Your Perfect Pet Sitter</Text>
          <Text style={styles.headerSubtitle}>Enter your details to discover trusted sitters nearby</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📍 Location</Text>
            <View style={styles.locationInput}>
              <Ionicons name="location" size={20} color={theme.colors.primary[500]} />
              <TextInput
                style={styles.input}
                placeholder="Enter your city or address"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🎯 What service do you need?</Text>
            <View style={styles.optionsGrid}>
              {serviceOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={[styles.optionCard, selectedService === option.id && styles.optionCardSelected]}
                  onPress={() => setSelectedService(option.id)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[styles.optionLabel, selectedService === option.id && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  {selectedService === option.id && (
                    <View style={styles.checkIcon}><Ionicons name="checkmark" size={12} color="#fff" /></View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🐾 What type of pet?</Text>
            <View style={styles.petTypeRow}>
              {petTypeOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={[styles.petTypeCard, selectedPetType === option.id && styles.petTypeCardSelected]}
                  onPress={() => setSelectedPetType(option.id)}
                >
                  <Text style={styles.petTypeIcon}>{option.icon}</Text>
                  <Text style={[styles.petTypeLabel, selectedPetType === option.id && styles.petTypeLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Button title="Search Sitters" onPress={handleSearch} icon={<Ionicons name="search" size={18} color="#fff" />} fullWidth size="lg" style={{ marginTop: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  searchContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, backgroundColor: theme.colors.primary[50] },
  headerEmoji: { fontSize: 48, marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.gray[900], textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: theme.colors.gray[500], textAlign: 'center' },
  formContainer: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.gray[800], marginBottom: 12 },
  locationInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 16, borderWidth: 2, borderColor: theme.colors.gray[200], paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 16, color: theme.colors.gray[800], marginLeft: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: { width: (width - 52) / 2, backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[500] },
  optionIcon: { fontSize: 32, marginBottom: 8 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[600] },
  optionLabelSelected: { color: theme.colors.primary[700] },
  checkIcon: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  petTypeRow: { flexDirection: 'row', gap: 12 },
  petTypeCard: { flex: 1, backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  petTypeCardSelected: { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[500] },
  petTypeIcon: { fontSize: 28, marginBottom: 8 },
  petTypeLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[600] },
  petTypeLabelSelected: { color: theme.colors.primary[700] },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100] },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  resultsTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.gray[900] },
  resultsSubtitle: { fontSize: 13, color: theme.colors.gray[500], marginTop: 2 },
  sortContainer: { borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100], paddingHorizontal: 16, paddingVertical: 12 },
  sortButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.gray[100], marginRight: 8 },
  sortButtonActive: { backgroundColor: theme.colors.primary[500] },
  sortButtonText: { fontSize: 13, fontWeight: '600', color: theme.colors.gray[600] },
  sortButtonTextActive: { color: '#fff' },
  sitterList: { padding: 16 },
  sitterCard: { backgroundColor: theme.colors.white, borderRadius: 20, overflow: 'hidden', marginBottom: 16, ...theme.shadows.md },
  sitterImageContainer: { height: 180, position: 'relative' },
  sitterImage: { width: '100%', height: '100%' },
  verifiedBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: theme.colors.white, padding: 4, borderRadius: 12, ...theme.shadows.sm },
  priceTag: { position: 'absolute', top: 12, right: 12, backgroundColor: theme.colors.primary[500], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'baseline' },
  priceText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  priceUnit: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 2 },
  sitterInfo: { padding: 16 },
  sitterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sitterName: { fontSize: 18, fontWeight: '700', color: theme.colors.gray[900] },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '700', color: theme.colors.gray[800], marginLeft: 4 },
  reviewCount: { fontSize: 13, color: theme.colors.gray[500], marginLeft: 2 },
  sitterBio: { fontSize: 14, color: theme.colors.gray[600], lineHeight: 20, marginBottom: 12 },
  sitterMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: theme.colors.gray[500], marginLeft: 4 },
  servicesRow: { flexDirection: 'row', gap: 4 },
  serviceTag: { backgroundColor: theme.colors.gray[100], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  serviceTagText: { fontSize: 14 },
});

export default SearchScreen;


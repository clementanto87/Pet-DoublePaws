import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Badge } from '../components/ui';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const services = [
  { id: 'boarding', icon: '🏠', name: 'Pet Boarding', price: 45, desc: 'Overnight care at sitter home' },
  { id: 'daycare', icon: '☀️', name: 'Doggy Day Care', price: 35, desc: 'Daytime supervision' },
  { id: 'walking', icon: '🦮', name: 'Dog Walking', price: 25, desc: '30-60 min walks' },
  { id: 'visits', icon: '👋', name: 'Drop-in Visits', price: 20, desc: 'Check-ins at your home' },
];

const reviews = [
  { id: '1', name: 'Amanda K.', rating: 5, date: '2 weeks ago', text: 'Sarah was amazing with my golden retriever! He came back so happy.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
  { id: '2', name: 'David M.', rating: 5, date: '1 month ago', text: 'Very professional and caring. My cat was well taken care of.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: '3', name: 'Jessica L.', rating: 5, date: '1 month ago', text: 'Excellent communication throughout. Highly recommend!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

export const SitterProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const sitter = route.params?.sitter || {
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    rating: 4.9,
    reviews: 127,
    distance: '0.8 km',
    price: 45,
    verified: true,
    bio: 'Certified pet care specialist with 5+ years experience',
  };

  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: sitter.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          
          {/* Top buttons */}
          <SafeAreaView style={styles.topButtons}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.topRightButtons}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? theme.colors.error[500] : '#fff'}
                />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Profile info overlay */}
          <View style={styles.profileOverlay}>
            <Text style={styles.profileName}>{sitter.name}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                <Text style={styles.ratingText}>{sitter.rating}</Text>
                <Text style={styles.reviewsText}>({sitter.reviews} reviews)</Text>
              </View>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.locationText}>{sitter.distance}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Badges */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.badgesRow}>
            {sitter.verified && (
              <Badge
                text="Verified"
                variant="success"
                icon={<Ionicons name="checkmark-circle" size={14} color={theme.colors.success[700]} />}
              />
            )}
            <Badge text="Responds quickly" variant="secondary" icon={<Ionicons name="flash" size={14} color={theme.colors.secondary[700]} />} />
            <Badge text="Repeat clients" variant="primary" icon={<Ionicons name="heart" size={14} color={theme.colors.primary[700]} />} />
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.aboutText}>
              Hi there! I'm {sitter.name}, a passionate animal lover with over 5 years of professional pet care experience. 
              I treat every pet like family and ensure they receive the love and attention they deserve.
              {'\n\n'}
              My home features a spacious fenced backyard, perfect for dogs to play and explore. I have experience with all breeds and temperaments.
            </Text>
          </Animated.View>

          {/* Services */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Services & Rates</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <Pressable key={service.id} style={styles.serviceCard}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDesc}>{service.desc}</Text>
                  </View>
                  <View style={styles.servicePrice}>
                    <Text style={styles.priceAmount}>${service.price}</Text>
                    <Text style={styles.priceUnit}>/night</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Home Details */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Home & Environment</Text>
            <View style={styles.detailsGrid}>
              {[
                { icon: 'home', label: 'House with yard' },
                { icon: 'paw', label: 'Has own pets' },
                { icon: 'people', label: 'No children' },
                { icon: 'car', label: 'Has transport' },
                { icon: 'medkit', label: 'Pet first aid certified' },
                { icon: 'shield-checkmark', label: 'Background checked' },
              ].map((item, i) => (
                <View key={i} style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name={item.icon as any} size={18} color={theme.colors.primary[500]} />
                  </View>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Reviews */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Pressable>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>
            
            {reviews.map((review, i) => (
              <View key={review.id} style={[styles.reviewCard, i < reviews.length - 1 && styles.reviewCardBorder]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(review.rating)].map((_, j) => (
                        <Ionicons key={j} name="star" size={12} color={theme.colors.warning[500]} />
                      ))}
                      <Text style={styles.reviewDate}> · {review.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </Animated.View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.bottomCTA}>
        <View style={styles.priceInfo}>
          <Text style={styles.ctaPrice}>From ${sitter.price}</Text>
          <Text style={styles.ctaPriceUnit}>per night</Text>
        </View>
        <Button
          title="Book Now"
          onPress={() => navigation.navigate('Booking', { sitter })}
          icon={<Ionicons name="calendar" size={18} color="#fff" />}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  headerImage: { height: 320, position: 'relative' },
  imageGradient: { ...StyleSheet.absoluteFillObject },
  topButtons: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  topRightButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  profileOverlay: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  profileName: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 4 },
  reviewsText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginLeft: 4 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  locationText: { fontSize: 13, color: '#fff', marginLeft: 4 },
  content: { padding: 20, marginTop: -20, backgroundColor: theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 12 },
  seeAllText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary[500] },
  aboutText: { fontSize: 15, color: theme.colors.gray[600], lineHeight: 24 },
  servicesGrid: { gap: 12 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16 },
  serviceIcon: { fontSize: 28, marginRight: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: theme.colors.gray[800], marginBottom: 2 },
  serviceDesc: { fontSize: 13, color: theme.colors.gray[500] },
  servicePrice: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 18, fontWeight: '700', color: theme.colors.primary[600] },
  priceUnit: { fontSize: 12, color: theme.colors.gray[500] },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: (width - 52) / 2, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 12, padding: 12 },
  detailIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  detailLabel: { fontSize: 13, fontWeight: '500', color: theme.colors.gray[700], flex: 1 },
  reviewCard: { paddingVertical: 16 },
  reviewCardBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100] },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[800] },
  reviewRating: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  reviewDate: { fontSize: 12, color: theme.colors.gray[500] },
  reviewText: { fontSize: 14, color: theme.colors.gray[600], lineHeight: 20 },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: theme.colors.gray[100], ...theme.shadows.lg },
  priceInfo: {},
  ctaPrice: { fontSize: 20, fontWeight: '800', color: theme.colors.gray[900] },
  ctaPriceUnit: { fontSize: 13, color: theme.colors.gray[500] },
});

export default SitterProfileScreen;


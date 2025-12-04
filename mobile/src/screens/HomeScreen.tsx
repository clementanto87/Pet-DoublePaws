import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Badge } from '../components/ui';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const services = [
  { id: 'boarding', icon: '🏠', title: 'Pet Boarding', desc: 'Overnight stays' },
  { id: 'daycare', icon: '☀️', title: 'Day Care', desc: 'Daytime care' },
  { id: 'walking', icon: '🦮', title: 'Dog Walking', desc: 'Exercise walks' },
  { id: 'visits', icon: '👋', title: 'Drop-in Visits', desc: 'Quick check-ins' },
];

const trustFeatures = [
  { icon: 'checkmark-circle', label: 'Verified Sitters', color: theme.colors.success[500] },
  { icon: 'shield-checkmark', label: 'Pet Insurance', color: theme.colors.primary[500] },
  { icon: 'headset', label: '24/7 Support', color: theme.colors.secondary[500] },
  { icon: 'lock-closed', label: 'Secure Payments', color: theme.colors.warning[500] },
];

const howItWorks = [
  { step: 1, title: 'Search & Compare', desc: 'Find trusted sitters near you', icon: 'search', color: '#3B82F6' },
  { step: 2, title: 'Connect & Book', desc: 'Message and book securely', icon: 'chatbubbles', color: '#F97316' },
  { step: 3, title: 'Relax & Enjoy', desc: 'Get updates while away', icon: 'heart', color: '#EC4899' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FFF7ED', '#FFFBEB', '#FFFFFF']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Decorative paws */}
          <Text style={[styles.decorativePaw, { top: 20, right: 20 }]}>🐾</Text>
          <Text style={[styles.decorativePaw, { top: 100, left: 10, transform: [{ rotate: '45deg' }] }]}>🐾</Text>
          
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Badge
              text="Trusted & Insured Pet Care"
              variant="outline"
              icon={<Ionicons name="shield-checkmark" size={14} color={theme.colors.primary[500]} />}
              style={styles.heroBadge}
            />
          </Animated.View>

          <Animated.Text 
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.heroTitle}
          >
            Your Pet Deserves{'\n'}
            <Text style={styles.heroTitleGradient}>The Best Care</Text>
          </Animated.Text>

          <Animated.Text 
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.heroSubtitle}
          >
            Connect with verified, loving pet sitters in your neighborhood.{' '}
            <Text style={styles.boldText}>Book with confidence</Text> — every stay is insured.
          </Animated.Text>

          <Animated.View 
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.heroButtons}
          >
            <Button
              title="Find Pet Sitters"
              onPress={() => navigation.navigate('Search')}
              icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              fullWidth
            />
            <Button
              title="Become a Sitter"
              variant="outline"
              onPress={() => navigation.navigate('BecomeSitter')}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </Animated.View>

          {/* Trust indicators */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.trustIndicators}
          >
            {['Background Checked', 'Insurance Included', '24/7 Support'].map((item, i) => (
              <View key={i} style={styles.trustItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={styles.trustItemText}>{item}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Hero Image */}
          <Animated.View 
            entering={FadeInRight.delay(400).duration(800)}
            style={styles.heroImageContainer}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800' }}
              style={styles.heroImage}
              contentFit="cover"
            />
            
            {/* Floating cards */}
            <Animated.View 
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.floatingCardTop}
            >
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary[500]} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.floatingCardTitle}>Pet Insurance</Text>
                <Text style={styles.floatingCardSubtitle}>Every booking covered</Text>
              </View>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(900).duration(500)}
              style={styles.floatingCardBottom}
            >
              <View style={styles.verifiedIcon}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.floatingCardTitle}>100% Verified</Text>
                <Text style={styles.floatingCardSubtitle}>All sitters checked</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Trust Bar */}
        <View style={styles.trustBar}>
          {trustFeatures.map((feature, index) => (
            <View key={index} style={styles.trustFeature}>
              <Ionicons name={feature.icon as any} size={18} color={feature.color} />
              <Text style={styles.trustFeatureText}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Badge text="✨ Simple & Easy" style={styles.sectionBadge} />
          <Text style={styles.sectionTitle}>
            How <Text style={styles.gradientText}>Double Paws</Text> Works
          </Text>
          <Text style={styles.sectionSubtitle}>
            Finding trusted pet care has never been easier.
          </Text>

          <View style={styles.stepsContainer}>
            {howItWorks.map((step, index) => (
              <Animated.View 
                key={step.step}
                entering={FadeInDown.delay(200 + index * 100).duration(500)}
                style={styles.stepCard}
              >
                <View style={[styles.stepIcon, { backgroundColor: step.color }]}>
                  <Ionicons name={step.icon as any} size={24} color="#fff" />
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </View>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </Animated.View>
            ))}
          </View>

          <Button
            title="Get Started Now"
            onPress={() => navigation.navigate('Search')}
            icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            style={{ marginTop: 24, alignSelf: 'center' }}
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Services for Every{' '}
            <Text style={styles.gradientText}>Pet Need</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            From overnight stays to daily walks, we've got you covered.
          </Text>

          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.serviceCardPressed,
                ]}
                onPress={() => navigation.navigate('Search', { service: service.id })}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[theme.colors.primary[500], theme.colors.primary[600]]}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaBadge}>✨ Start Today</Text>
          <Text style={styles.ctaTitle}>
            Your Pet's Perfect{'\n'}Sitter is Waiting
          </Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of pet parents who trust Double Paws for safe, loving pet care.
          </Text>
          <Button
            title="Find Sitters Near Me"
            variant="secondary"
            onPress={() => navigation.navigate('Search')}
            icon={<Ionicons name="arrow-forward" size={18} color={theme.colors.primary[500]} />}
            style={styles.ctaButton}
          />
          <Text style={styles.ctaNote}>
            Free to search • No booking fees • Cancel anytime
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
  },
  decorativePaw: {
    position: 'absolute',
    fontSize: 40,
    opacity: 0.1,
  },
  heroBadge: {
    marginBottom: 16,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray[200],
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.gray[900],
    lineHeight: 42,
    marginBottom: 16,
  },
  heroTitleGradient: {
    color: theme.colors.primary[500],
  },
  heroSubtitle: {
    fontSize: 16,
    color: theme.colors.gray[600],
    lineHeight: 24,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.gray[900],
  },
  heroButtons: {
    marginBottom: 20,
  },
  trustIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustItemText: {
    fontSize: 13,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 24,
    overflow: 'visible',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  floatingCardTop: {
    position: 'absolute',
    top: 16,
    right: -10,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  floatingCardBottom: {
    position: 'absolute',
    bottom: 16,
    left: -10,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  floatingCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.gray[900],
  },
  floatingCardSubtitle: {
    fontSize: 11,
    color: theme.colors.gray[500],
  },
  verifiedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  trustFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustFeatureText: {
    fontSize: 13,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
  section: {
    padding: 24,
  },
  sectionBadge: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  gradientText: {
    color: theme.colors.primary[500],
  },
  sectionSubtitle: {
    fontSize: 15,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: (width - 60) / 2,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardPressed: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: theme.colors.gray[500],
  },
  ctaSection: {
    margin: 20,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  ctaBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    overflow: 'hidden',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#fff',
  },
  ctaNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
});

export default HomeScreen;


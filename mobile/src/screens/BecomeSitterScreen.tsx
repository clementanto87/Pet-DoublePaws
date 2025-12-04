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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, Badge } from '../components/ui';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const benefits = [
  { icon: '💰', title: 'Earn Extra Income', desc: 'Make up to $1,500/month doing what you love' },
  { icon: '🕐', title: 'Flexible Schedule', desc: 'Set your own hours and availability' },
  { icon: '🏠', title: 'Work From Home', desc: 'Care for pets in your own space' },
  { icon: '🛡️', title: 'Full Insurance', desc: 'Every booking is covered by insurance' },
];

const steps = [
  { step: 1, title: 'Create Profile', desc: 'Tell us about yourself', icon: 'person', color: theme.colors.secondary[500] },
  { step: 2, title: 'Get Verified', desc: 'Quick background check', icon: 'shield-checkmark', color: theme.colors.success[500] },
  { step: 3, title: 'Set Services', desc: 'Choose what you offer', icon: 'list', color: theme.colors.warning[500] },
  { step: 4, title: 'Start Earning', desc: 'Accept your first booking', icon: 'cash', color: theme.colors.primary[500] },
];

const requirements = [
  '18 years or older',
  'Love animals and have experience',
  'Pass background check',
  'Reliable and responsible',
];

export const BecomeSitterScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <LinearGradient colors={[theme.colors.primary[50], '#FFFBEB', theme.colors.white]} style={styles.heroSection}>
          {/* Decorative paws */}
          <Text style={[styles.decorativePaw, { top: 20, right: 30 }]}>🐾</Text>
          <Text style={[styles.decorativePaw, { top: 80, left: 20, transform: [{ rotate: '-30deg' }] }]}>🐾</Text>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Badge
              text="Join 10,000+ Sitters"
              variant="primary"
              icon={<Ionicons name="people" size={14} color={theme.colors.primary[700]} />}
              style={styles.heroBadge}
            />
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.heroTitle}>
            Turn Your Love for{'\n'}Pets Into{' '}
            <Text style={styles.heroTitleHighlight}>Extra Income</Text>
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.heroSubtitle}>
            Join the #1 pet care platform and start earning while doing what you love.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <Button
              title="Start Your Application"
              onPress={() => navigation.navigate('SitterRegistration')}
              icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              size="lg"
            />
          </Animated.View>

          {/* Hero Image with floating cards */}
          <Animated.View entering={FadeInRight.delay(400).duration(600)} style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800' }}
              style={styles.heroImage}
              contentFit="cover"
            />
            {/* Floating earnings card */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.floatingCard}>
              <Text style={styles.floatingEmoji}>💰</Text>
              <View>
                <Text style={styles.floatingTitle}>$1,250</Text>
                <Text style={styles.floatingSubtitle}>earned this month</Text>
              </View>
            </Animated.View>
            {/* Rating card */}
            <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.floatingCardRight}>
              <Ionicons name="star" size={20} color={theme.colors.warning[500]} />
              <View>
                <Text style={styles.floatingTitle}>5.0 Rating</Text>
                <Text style={styles.floatingSubtitle}>150+ reviews</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[
            { value: '$2M+', label: 'Paid to sitters' },
            { value: '50K+', label: 'Pets cared for' },
            { value: '4.9', label: 'Avg rating' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Why Become a <Text style={styles.highlight}>Double Paws</Text> Sitter?
          </Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(200 + i * 100).duration(500)}
                style={styles.benefitCard}
              >
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={[styles.section, { backgroundColor: theme.colors.gray[50] }]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.sectionSubtitle}>Get started in 4 simple steps</Text>
          
          <View style={styles.stepsContainer}>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepIcon, { backgroundColor: step.color }]}>
                  <Ionicons name={step.icon as any} size={24} color="#fff" />
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{step.step}</Text>
                  </View>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
                {i < steps.length - 1 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsList}>
            {requirements.map((req, i) => (
              <View key={i} style={styles.requirementItem}>
                <View style={styles.requirementCheck}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={[theme.colors.primary[500], theme.colors.primary[600]]}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaEmoji}>🎉</Text>
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of pet lovers earning extra income on Double Paws.
          </Text>
          <Button
            title="Apply Now - It's Free"
            variant="secondary"
            size="lg"
            onPress={() => navigation.navigate('SitterRegistration')}
            icon={<Ionicons name="arrow-forward" size={18} color={theme.colors.primary[500]} />}
          />
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  scrollContent: { paddingBottom: 100 },
  heroSection: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, position: 'relative' },
  decorativePaw: { position: 'absolute', fontSize: 36, opacity: 0.15 },
  heroBadge: { alignSelf: 'flex-start', marginBottom: 16 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: theme.colors.gray[900], lineHeight: 40, marginBottom: 12 },
  heroTitleHighlight: { color: theme.colors.primary[500] },
  heroSubtitle: { fontSize: 16, color: theme.colors.gray[600], lineHeight: 24, marginBottom: 24 },
  heroImageContainer: { marginTop: 24, position: 'relative' },
  heroImage: { width: '100%', aspectRatio: 1.3, borderRadius: 24 },
  floatingCard: { position: 'absolute', top: 16, left: -8, backgroundColor: theme.colors.white, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', ...theme.shadows.lg },
  floatingCardRight: { position: 'absolute', bottom: 24, right: -8, backgroundColor: theme.colors.white, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', ...theme.shadows.lg },
  floatingEmoji: { fontSize: 24, marginRight: 10 },
  floatingTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.gray[900] },
  floatingSubtitle: { fontSize: 11, color: theme.colors.gray[500] },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24, backgroundColor: theme.colors.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.gray[100] },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: theme.colors.primary[500] },
  statLabel: { fontSize: 12, color: theme.colors.gray[500], marginTop: 2 },
  section: { padding: 24 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.gray[900], textAlign: 'center', marginBottom: 8 },
  sectionSubtitle: { fontSize: 15, color: theme.colors.gray[500], textAlign: 'center', marginBottom: 24 },
  highlight: { color: theme.colors.primary[500] },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitCard: { width: (width - 60) / 2, backgroundColor: theme.colors.gray[50], borderRadius: 20, padding: 20 },
  benefitIcon: { fontSize: 32, marginBottom: 12 },
  benefitTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 6 },
  benefitDesc: { fontSize: 13, color: theme.colors.gray[500], lineHeight: 18 },
  stepsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stepItem: { width: '48%', alignItems: 'center', marginBottom: 24, position: 'relative' },
  stepIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  stepBadge: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 4 },
  stepDesc: { fontSize: 13, color: theme.colors.gray[500], textAlign: 'center' },
  stepConnector: {},
  requirementsList: { gap: 12 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], padding: 16, borderRadius: 14 },
  requirementCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.success[500], alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  requirementText: { fontSize: 15, color: theme.colors.gray[700], fontWeight: '500' },
  ctaSection: { margin: 24, borderRadius: 24, padding: 32, alignItems: 'center' },
  ctaEmoji: { fontSize: 48, marginBottom: 12 },
  ctaTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  ctaSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
});

export default BecomeSitterScreen;


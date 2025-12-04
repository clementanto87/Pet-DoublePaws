import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    emoji: '🐕',
    title: 'Find Trusted\nPet Sitters',
    description: 'Connect with verified, loving pet sitters in your neighborhood who treat your pets like family.',
    color: theme.colors.primary[500],
    bgEmojis: ['🐾', '🏠', '💕'],
  },
  {
    id: '2',
    emoji: '📅',
    title: 'Easy Booking\nProcess',
    description: 'Browse profiles, read reviews, and book your perfect sitter in just a few taps.',
    color: theme.colors.secondary[500],
    bgEmojis: ['📱', '✨', '📆'],
  },
  {
    id: '3',
    emoji: '🛡️',
    title: 'Safe & Insured\nCare',
    description: 'Every booking includes pet insurance and 24/7 support for your peace of mind.',
    color: theme.colors.success[500],
    bgEmojis: ['💚', '🔒', '✓'],
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== undefined) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const renderItem = ({ item, index }: { item: typeof onboardingData[0]; index: number }) => {
    return (
      <View style={styles.slide}>
        {/* Background emojis */}
        {item.bgEmojis.map((emoji, i) => (
          <Text
            key={i}
            style={[
              styles.bgEmoji,
              {
                top: `${20 + i * 25}%`,
                left: i % 2 === 0 ? '10%' : '75%',
                transform: [{ rotate: `${i * 20 - 10}deg` }],
              },
            ]}
          >
            {emoji}
          </Text>
        ))}

        <View style={styles.slideContent}>
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.emojiContainer, { backgroundColor: `${item.color}20` }]}
          >
            <Text style={styles.mainEmoji}>{item.emoji}</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.slideTitle}
          >
            {item.title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.slideDescription}
          >
            {item.description}
          </Animated.Text>
        </View>
      </View>
    );
  };

  const Pagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.bottomContainer}>
        <Pagination />

        <Button
          title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          fullWidth
          style={{ marginTop: 24 }}
        />

        {currentIndex === onboardingData.length - 1 && (
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              Sign In
            </Text>
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray[500],
  },
  slide: {
    width,
    flex: 1,
    position: 'relative',
  },
  bgEmoji: {
    position: 'absolute',
    fontSize: 48,
    opacity: 0.1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  mainEmoji: {
    fontSize: 80,
  },
  slideTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.gray[900],
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: theme.colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray[200],
  },
  paginationDotActive: {
    width: 32,
    backgroundColor: theme.colors.primary[500],
  },
  loginText: {
    fontSize: 14,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginTop: 16,
  },
  loginLink: {
    fontWeight: '700',
    color: theme.colors.primary[500],
  },
});

export default OnboardingScreen;


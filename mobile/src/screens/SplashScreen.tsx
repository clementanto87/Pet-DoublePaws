import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);

  useEffect(() => {
    // Animate logo
    logoScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    
    logoRotation.value = withSequence(
      withTiming(10, { duration: 150 }),
      withSpring(0, { damping: 8 })
    );

    // Animate text
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));

    // Navigate after animation
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={[theme.colors.primary[500], theme.colors.primary[600], theme.colors.primary[700]]}
      style={styles.container}
    >
      {/* Decorative paws */}
      {[...Array(6)].map((_, i) => (
        <Text
          key={i}
          style={[
            styles.decorativePaw,
            {
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? '5%' : '80%',
              transform: [{ rotate: `${i * 30}deg` }],
            },
          ]}
        >
          🐾
        </Text>
      ))}

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
        </Animated.View>

        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.brandName}>Double Paws</Text>
          <Text style={styles.tagline}>Premium Pet Care</Text>
        </Animated.View>
      </View>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorativePaw: {
    position: 'absolute',
    fontSize: 48,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: {
    fontSize: 56,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 2,
  },
  versionText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default SplashScreen;


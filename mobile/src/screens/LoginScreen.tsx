import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../components/ui';
import { theme } from '../theme';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('MainTabs');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[theme.colors.primary[500], theme.colors.primary[600]]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoEmoji}>🐾</Text>
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>Double Paws</Text>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue caring for your pets</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            <Input
              label="Email Address"
              placeholder="yourname@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.gray[400]} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray[400]} />}
            />

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Login */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={22} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </Pressable>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signUpLink}> Sign Up</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  logoContainer: { marginBottom: 16 },
  logoGradient: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', ...theme.shadows.glow },
  logoEmoji: { fontSize: 40 },
  brandName: { fontSize: 28, fontWeight: '800', color: theme.colors.gray[900], marginBottom: 8 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.colors.gray[500], textAlign: 'center' },
  form: { marginBottom: 24 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 8 },
  forgotPasswordText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary[500] },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.gray[200] },
  dividerText: { fontSize: 13, color: theme.colors.gray[500], marginHorizontal: 16 },
  socialButtons: { flexDirection: 'row', gap: 12 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: theme.colors.gray[200] },
  socialButtonText: { fontSize: 15, fontWeight: '600', color: theme.colors.gray[700], marginLeft: 8 },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  signUpText: { fontSize: 15, color: theme.colors.gray[500] },
  signUpLink: { fontSize: 15, fontWeight: '700', color: theme.colors.primary[500] },
});

export default LoginScreen;


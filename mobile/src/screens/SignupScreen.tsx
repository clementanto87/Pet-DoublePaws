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

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('MainTabs');
    }, 1500);
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, label: '', color: theme.colors.gray[200] };
    if (p.length < 6) return { level: 1, label: 'Weak', color: theme.colors.error[500] };
    if (p.length < 8) return { level: 2, label: 'Fair', color: theme.colors.warning[500] };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)) return { level: 4, label: 'Strong', color: theme.colors.success[500] };
    return { level: 3, label: 'Good', color: theme.colors.success[400] };
  };

  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={[theme.colors.primary[500], theme.colors.primary[600]]} style={styles.logoGradient}>
                <Text style={styles.logoEmoji}>🐾</Text>
              </LinearGradient>
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of pet parents on Double Paws</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChangeText={(v) => updateField('fullName', v)}
              error={errors.fullName}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.gray[400]} />}
            />

            <Input
              label="Email Address"
              placeholder="yourname@email.com"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.gray[400]} />}
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChangeText={(v) => updateField('password', v)}
              isPassword
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray[400]} />}
            />

            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength.level ? strength.color : theme.colors.gray[200] }]} />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              isPassword
              error={errors.confirmPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray[400]} />}
            />

            {/* Terms */}
            <Pressable style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </Pressable>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <Button title="Create Account" onPress={handleSignup} loading={isLoading} fullWidth size="lg" style={{ marginTop: 16 }} />
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account?</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.signInLink}> Sign In</Text>
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
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  logoContainer: { marginBottom: 16 },
  logoGradient: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...theme.shadows.glow },
  logoEmoji: { fontSize: 36 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: theme.colors.gray[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.colors.gray[500], textAlign: 'center' },
  form: { marginBottom: 24 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 16 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', marginLeft: 12 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.gray[300], alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  checkboxChecked: { backgroundColor: theme.colors.primary[500], borderColor: theme.colors.primary[500] },
  termsText: { flex: 1, fontSize: 14, color: theme.colors.gray[600], lineHeight: 20 },
  link: { color: theme.colors.primary[500], fontWeight: '600' },
  errorText: { fontSize: 12, color: theme.colors.error[500], marginTop: 4 },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signInText: { fontSize: 15, color: theme.colors.gray[500] },
  signInLink: { fontSize: 15, fontWeight: '700', color: theme.colors.primary[500] },
});

export default SignupScreen;


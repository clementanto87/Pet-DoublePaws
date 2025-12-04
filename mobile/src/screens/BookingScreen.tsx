import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Badge, Card } from '../components/ui';
import { theme } from '../theme';

const services = [
  { id: 'boarding', icon: '🏠', name: 'Pet Boarding', price: 45 },
  { id: 'daycare', icon: '☀️', name: 'Doggy Day Care', price: 35 },
  { id: 'walking', icon: '🦮', name: 'Dog Walking', price: 25 },
  { id: 'visits', icon: '👋', name: 'Drop-in Visits', price: 20 },
];

export const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const sitter = route.params?.sitter;

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('boarding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [petCount, setPetCount] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const nights = 3; // Mock calculation
  const subtotal = (selectedServiceData?.price || 0) * nights * petCount;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        '🎉 Booking Request Sent!',
        `Your booking request has been sent to ${sitter?.name}. They usually respond within 24 hours.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }, 1500);
  };

  const quickMessages = [
    "Hi! I'm interested in booking with you.",
    "Looking for someone reliable for my pet.",
    "Can you accommodate special dietary needs?",
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray[700]} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Book Your Stay</Text>
          <Text style={styles.headerSubtitle}>Step {step} of 3</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.progressItem}>
            <LinearGradient
              colors={step >= s ? [theme.colors.primary[500], theme.colors.primary[600]] : [theme.colors.gray[200], theme.colors.gray[200]]}
              style={[styles.progressDot, step >= s && styles.progressDotActive]}
            >
              {step > s ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={[styles.progressNumber, step >= s && styles.progressNumberActive]}>{s}</Text>
              )}
            </LinearGradient>
            {s < 3 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.sitterCard}>
              <Image source={{ uri: sitter?.image }} style={styles.sitterImage} />
              <View style={styles.sitterInfo}>
                <Text style={styles.sitterName}>{sitter?.name}</Text>
                <View style={styles.sitterMeta}>
                  <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                  <Text style={styles.sitterRating}>{sitter?.rating}</Text>
                  {sitter?.verified && <Badge text="Verified" size="sm" variant="success" style={{ marginLeft: 8 }} />}
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Select Service</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <Pressable
                  key={service.id}
                  style={[styles.serviceOption, selectedService === service.id && styles.serviceOptionSelected]}
                  onPress={() => setSelectedService(service.id)}
                >
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                  <Text style={[styles.serviceName, selectedService === service.id && styles.serviceNameSelected]}>{service.name}</Text>
                  <Text style={[styles.servicePrice, selectedService === service.id && styles.servicePriceSelected]}>${service.price}/night</Text>
                  {selectedService === service.id && (
                    <View style={styles.serviceCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>How many pets?</Text>
            <View style={styles.petCounter}>
              <Pressable style={styles.counterButton} onPress={() => setPetCount(Math.max(1, petCount - 1))}>
                <Ionicons name="remove" size={24} color={theme.colors.gray[600]} />
              </Pressable>
              <View style={styles.counterValue}>
                <Text style={styles.counterNumber}>{petCount}</Text>
                <Text style={styles.counterLabel}>pet{petCount > 1 ? 's' : ''}</Text>
              </View>
              <Pressable style={styles.counterButton} onPress={() => setPetCount(petCount + 1)}>
                <Ionicons name="add" size={24} color={theme.colors.primary[500]} />
              </Pressable>
            </View>

            <Button title="Continue" onPress={() => setStep(2)} icon={<Ionicons name="arrow-forward" size={18} color="#fff" />} fullWidth size="lg" style={{ marginTop: 24 }} />
          </Animated.View>
        )}

        {/* Step 2: Dates & Message */}
        {step === 2 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionTitle}>📅 Select Dates</Text>
            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Pressable style={styles.datePicker}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.dateValue}>{startDate || 'Select date'}</Text>
                </Pressable>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.gray[300]} />
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Pressable style={styles.datePicker}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.dateValue}>{endDate || 'Select date'}</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.sectionTitle}>💬 Message to Sitter</Text>
            <Text style={styles.inputHelper}>Quick messages:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickMessages}>
              {quickMessages.map((msg, i) => (
                <Pressable key={i} style={styles.quickMessageChip} onPress={() => setMessage(msg)}>
                  <Text style={styles.quickMessageText}>{msg}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              style={styles.messageInput}
              placeholder="Introduce yourself and your pet..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholderTextColor={theme.colors.gray[400]}
            />

            <Button title="Review Booking" onPress={() => setStep(3)} icon={<Ionicons name="arrow-forward" size={18} color="#fff" />} fullWidth size="lg" style={{ marginTop: 24 }} />
          </Animated.View>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Image source={{ uri: sitter?.image }} style={styles.summaryImage} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName}>{sitter?.name}</Text>
                  <Text style={styles.summaryService}>{selectedServiceData?.icon} {selectedServiceData?.name}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Dates</Text>
                <Text style={styles.summaryValue}>Dec 15 - Dec 18, 2024</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{nights} nights</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pets</Text>
                <Text style={styles.summaryValue}>{petCount} pet{petCount > 1 ? 's' : ''}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>${selectedServiceData?.price} × {nights} nights × {petCount}</Text>
                <Text style={styles.summaryValue}>${subtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service fee</Text>
                <Text style={styles.summaryValue}>${serviceFee}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total}</Text>
              </View>
            </Card>

            <View style={styles.guaranteeCard}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success[500]} />
              <View style={styles.guaranteeInfo}>
                <Text style={styles.guaranteeTitle}>Happiness Guarantee</Text>
                <Text style={styles.guaranteeText}>If you're not satisfied, we'll help you find another sitter or refund your booking.</Text>
              </View>
            </View>

            <Button
              title={isSubmitting ? "Sending Request..." : "Confirm Booking"}
              onPress={handleSubmit}
              loading={isSubmitting}
              icon={!isSubmitting ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : undefined}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />

            <Text style={styles.noteText}>You won't be charged until the sitter accepts your booking.</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100] },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: theme.colors.gray[500], marginTop: 2 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  progressDotActive: {},
  progressNumber: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[400] },
  progressNumberActive: { color: '#fff' },
  progressLine: { width: 40, height: 3, backgroundColor: theme.colors.gray[200], marginHorizontal: 4 },
  progressLineActive: { backgroundColor: theme.colors.primary[500] },
  content: { padding: 20, paddingBottom: 100 },
  sitterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16, marginBottom: 24 },
  sitterImage: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  sitterInfo: { flex: 1 },
  sitterName: { fontSize: 16, fontWeight: '700', color: theme.colors.gray[900] },
  sitterMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sitterRating: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[700], marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 16 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  serviceOption: { width: '48%', backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  serviceOptionSelected: { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[500] },
  serviceIcon: { fontSize: 28, marginBottom: 8 },
  serviceName: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[700], textAlign: 'center', marginBottom: 4 },
  serviceNameSelected: { color: theme.colors.primary[700] },
  servicePrice: { fontSize: 13, color: theme.colors.gray[500] },
  servicePriceSelected: { color: theme.colors.primary[600] },
  serviceCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  petCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16 },
  counterButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center', ...theme.shadows.sm },
  counterValue: { alignItems: 'center', marginHorizontal: 32 },
  counterNumber: { fontSize: 32, fontWeight: '800', color: theme.colors.gray[900] },
  counterLabel: { fontSize: 14, color: theme.colors.gray[500] },
  dateInputs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  dateInput: { flex: 1 },
  dateLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.gray[600], marginBottom: 8 },
  datePicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.gray[50], borderRadius: 12, padding: 14, borderWidth: 2, borderColor: theme.colors.gray[200] },
  dateValue: { fontSize: 14, color: theme.colors.gray[600], marginLeft: 8 },
  inputHelper: { fontSize: 13, color: theme.colors.gray[500], marginBottom: 8 },
  quickMessages: { marginBottom: 12 },
  quickMessageChip: { backgroundColor: theme.colors.gray[100], paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  quickMessageText: { fontSize: 13, color: theme.colors.gray[600] },
  messageInput: { backgroundColor: theme.colors.gray[50], borderRadius: 16, padding: 16, fontSize: 15, color: theme.colors.gray[800], height: 120, textAlignVertical: 'top', borderWidth: 2, borderColor: theme.colors.gray[200] },
  summaryCard: { marginBottom: 16 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryImage: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '700', color: theme.colors.gray[900] },
  summaryService: { fontSize: 14, color: theme.colors.gray[600], marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: theme.colors.gray[100], marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: theme.colors.gray[600] },
  summaryValue: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[800] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: theme.colors.gray[900] },
  totalValue: { fontSize: 20, fontWeight: '800', color: theme.colors.primary[600] },
  guaranteeCard: { flexDirection: 'row', backgroundColor: theme.colors.success[50], borderRadius: 16, padding: 16 },
  guaranteeInfo: { flex: 1, marginLeft: 12 },
  guaranteeTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.success[700], marginBottom: 4 },
  guaranteeText: { fontSize: 13, color: theme.colors.success[600], lineHeight: 18 },
  noteText: { fontSize: 12, color: theme.colors.gray[500], textAlign: 'center', marginTop: 16 },
});

export default BookingScreen;


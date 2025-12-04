import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, Badge, Card, Avatar } from '../components/ui';
import { theme } from '../theme';

const menuItems = [
  { id: 'pets', icon: 'paw', label: 'My Pets', count: 2, color: theme.colors.primary[500] },
  { id: 'bookings', icon: 'calendar', label: 'My Bookings', count: 3, color: theme.colors.secondary[500] },
  { id: 'favorites', icon: 'heart', label: 'Favorites', count: 5, color: theme.colors.error[500] },
  { id: 'messages', icon: 'chatbubbles', label: 'Messages', count: 2, badge: true, color: theme.colors.success[500] },
];

const settingsItems = [
  { id: 'account', icon: 'person-circle', label: 'Account Settings' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'payment', icon: 'card', label: 'Payment Methods' },
  { id: 'help', icon: 'help-circle', label: 'Help & Support' },
  { id: 'about', icon: 'information-circle', label: 'About' },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const user = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    memberSince: 'Jan 2023',
    bookings: 12,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary[500], theme.colors.primary[600]]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Avatar
              source={user.image}
              name={user.name}
              size="xl"
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user.bookings}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user.memberSince}</Text>
                <Text style={styles.statLabel}>Member Since</Text>
              </View>
            </View>
          </View>
          
          <Pressable style={styles.editButton}>
            <Ionicons name="pencil" size={18} color={theme.colors.primary[500]} />
          </Pressable>
        </LinearGradient>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <Pressable key={item.id} style={styles.menuCard}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.count}</Text>
                  </View>
                ) : (
                  <Text style={styles.menuCount}>{item.count}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Become a Sitter CTA */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Card style={styles.sitterCard}>
            <View style={styles.sitterCardContent}>
              <View style={styles.sitterCardIcon}>
                <Text style={styles.sitterEmoji}>🐾</Text>
              </View>
              <View style={styles.sitterCardInfo}>
                <Text style={styles.sitterCardTitle}>Become a Pet Sitter</Text>
                <Text style={styles.sitterCardDesc}>Earn extra income caring for pets</Text>
              </View>
            </View>
            <Button
              title="Learn More"
              size="sm"
              onPress={() => navigation.navigate('BecomeSitter')}
              icon={<Ionicons name="arrow-forward" size={16} color="#fff" />}
            />
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Card padding="none" style={styles.settingsCard}>
            {settingsItems.map((item, i) => (
              <Pressable
                key={item.id}
                style={[
                  styles.settingsItem,
                  i < settingsItems.length - 1 && styles.settingsItemBorder,
                ]}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={styles.settingsIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={theme.colors.gray[500]} />
                  </View>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
              </Pressable>
            ))}
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Pressable style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error[500]} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.secondary },
  content: { paddingBottom: 100 },
  header: { paddingTop: 24, paddingBottom: 32, paddingHorizontal: 24, position: 'relative' },
  headerContent: { alignItems: 'center' },
  avatar: { marginBottom: 16, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  userName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 24 },
  editButton: { position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...theme.shadows.md },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.gray[900], marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuCard: { width: '48%', backgroundColor: theme.colors.white, borderRadius: 16, padding: 16, ...theme.shadows.sm },
  menuIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.gray[800], marginBottom: 4 },
  menuCount: { fontSize: 13, color: theme.colors.gray[500] },
  menuBadge: { backgroundColor: theme.colors.error[500], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, position: 'absolute', top: 12, right: 12 },
  menuBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  sitterCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sitterCardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sitterCardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: theme.colors.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sitterEmoji: { fontSize: 24 },
  sitterCardInfo: { flex: 1 },
  sitterCardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.gray[900] },
  sitterCardDesc: { fontSize: 13, color: theme.colors.gray[500] },
  settingsCard: { overflow: 'hidden' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingsItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100] },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingsLabel: { fontSize: 15, color: theme.colors.gray[700] },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: theme.colors.error[50], borderRadius: 14 },
  logoutText: { fontSize: 15, fontWeight: '600', color: theme.colors.error[500], marginLeft: 8 },
  versionText: { fontSize: 12, color: theme.colors.gray[400], textAlign: 'center', marginTop: 24, marginBottom: 20 },
});

export default ProfileScreen;


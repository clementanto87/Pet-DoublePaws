import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../theme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  verified,
  style,
}) => {
  const getSizeValue = (): number => {
    switch (size) {
      case 'xs': return 32;
      case 'sm': return 40;
      case 'lg': return 64;
      case 'xl': return 80;
      default: return 48;
    }
  };

  const sizeValue = getSizeValue();
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: sizeValue * 0.35 },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
      
      {verified && (
        <View style={[styles.verifiedBadge, { right: -2, bottom: -2 }]}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: theme.colors.gray[200],
  },
  placeholder: {
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.primary[600],
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  verifiedIcon: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});


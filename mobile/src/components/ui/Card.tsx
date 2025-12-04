import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  padding = 'md',
}) => {
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: 12 };
      case 'lg':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...theme.shadows.lg,
          backgroundColor: theme.colors.white,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.white,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
      default:
        return {
          ...theme.shadows.md,
          backgroundColor: theme.colors.white,
        };
    }
  };

  const cardStyle = [styles.card, getVariantStyle(), getPaddingStyle(), style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
});


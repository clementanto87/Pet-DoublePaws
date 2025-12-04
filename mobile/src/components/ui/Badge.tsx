import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: theme.colors.secondary[100] },
          text: { color: theme.colors.secondary[700] },
        };
      case 'success':
        return {
          container: { backgroundColor: theme.colors.success[100] },
          text: { color: theme.colors.success[700] },
        };
      case 'warning':
        return {
          container: { backgroundColor: theme.colors.warning[100] },
          text: { color: theme.colors.warning[700] },
        };
      case 'error':
        return {
          container: { backgroundColor: theme.colors.error[100] },
          text: { color: theme.colors.error[700] },
        };
      case 'outline':
        return {
          container: { 
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.gray[300],
          },
          text: { color: theme.colors.gray[600] },
        };
      default:
        return {
          container: { backgroundColor: theme.colors.primary[100] },
          text: { color: theme.colors.primary[700] },
        };
    }
  };

  const variantStyles = getVariantStyle();

  return (
    <View
      style={[
        styles.container,
        size === 'sm' && styles.containerSm,
        variantStyles.container,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, size === 'sm' && styles.textSm, variantStyles.text]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
});


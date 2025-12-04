import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  style,
}) => {
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { height: 40, paddingHorizontal: 16, borderRadius: 12 },
          text: { fontSize: 14 },
        };
      case 'lg':
        return {
          container: { height: 56, paddingHorizontal: 28, borderRadius: 16 },
          text: { fontSize: 18 },
        };
      default:
        return {
          container: { height: 48, paddingHorizontal: 20, borderRadius: 14 },
          text: { fontSize: 16 },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[500] : '#fff'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variant === 'outline' && styles.outlineText,
              variant === 'ghost' && styles.ghostText,
              isDisabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [theme.colors.gray[300], theme.colors.gray[400]]
              : [theme.colors.primary[500], theme.colors.primary[600]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            sizeStyles.container,
            theme.shadows.glow,
            isDisabled && styles.disabledContainer,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        sizeStyles.container,
        variant === 'secondary' && styles.secondaryContainer,
        variant === 'outline' && styles.outlineContainer,
        variant === 'ghost' && styles.ghostContainer,
        isDisabled && styles.disabledContainer,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
  secondaryContainer: {
    backgroundColor: theme.colors.gray[100],
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: theme.colors.gray[700],
  },
  ghostText: {
    color: theme.colors.primary[500],
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});


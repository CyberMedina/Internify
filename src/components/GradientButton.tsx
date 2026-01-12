import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradientColors?: string[];
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  gradientColors,
}) => {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[styles.container, style, disabled && styles.disabledContainer]}
    >
      <LinearGradient
        colors={disabled ? [colors.border, colors.border] : (gradientColors || [colors.primary, '#4338ca'])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, { fontSize: typography.sizes.md }, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && <View style={styles.iconContainerRight}>{icon}</View>}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 52,
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.7,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  iconContainerRight: {
    marginLeft: 8,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default GradientButton;

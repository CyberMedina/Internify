import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';

interface OnboardingHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  iconLibrary?: any; // Default is FontAwesome5
  iconSize?: number;
  optional?: boolean;
}

export default function OnboardingHeader({ 
  icon, 
  title, 
  subtitle, 
  iconLibrary: IconLib = FontAwesome5,
  iconSize = 40,
  optional = false
}: OnboardingHeaderProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(100).duration(600)}
        style={styles.iconWrapper}
      >
        <LinearGradient
          colors={[colors.primary, colors.primary900]}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconLib name={icon} size={iconSize} color="#FFF" />
        </LinearGradient>

        {optional && (
          <View style={[styles.optionalTag, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.optionalText, { color: colors.primary }]}>OPCIONAL</Text>
          </View>
        )}

        {/* Decorative ring */}
        <View style={[styles.ring, { borderColor: colors.primary + '20' }]} />
        <View style={[styles.ringOuter, { borderColor: colors.primary + '10' }]} />
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(300).duration(600)}
        style={styles.textContainer}
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold, fontSize: typography.sizes.xl }]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  ringOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  optionalTag: {
    position: 'absolute',
    bottom: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

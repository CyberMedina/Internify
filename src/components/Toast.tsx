import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Animated, { SlideInUp, SlideOutUp, SlideInDown, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  onDismiss?: () => void;
  duration?: number;
}

export default function Toast({ visible, message, title, type = 'info', onDismiss, duration = 4000 }: ToastProps) {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const config = {
    success: { 
        primary: '#25D366', // WhatsApp Green
        icon: 'check', 
        title: 'Completado' 
    },
    error: { 
        primary: '#FF3B30', // System Red 
        icon: 'slash', 
        title: 'Error' 
    },
    warning: { 
        primary: '#FFCC00', // System Yellow
        icon: 'alert-triangle', 
        title: 'Atención' 
    },
    info: { 
        primary: '#007AFF', // System Blue
        icon: 'info', 
        title: 'Aviso' 
    },
  }[type] as { primary: string; icon: string; title: string };

  return (
    <Animated.View 
      entering={SlideInUp.springify().damping(20).mass(0.6).stiffness(150)}
      exiting={SlideOutUp.springify().damping(20).mass(0.6).stiffness(150)}
      style={[
        styles.container, 
        { 
          top: insets.top + spacing(1),
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', // System background colors
          shadowColor: '#000',
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={onDismiss}
        style={styles.innerContainer}
      >
          {/* Avatar / Icon Container */}
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
             <View style={[styles.statusIndicator, { backgroundColor: config.primary }]} />
             <Feather name={config.icon as any} size={20} color={isDark ? '#FFF' : '#000'} style={{ opacity: 0.7 }} />
          </View>

          {/* Content */}
          <View style={styles.textWrapper}>
             <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {title || config.title}
                </Text>
             </View>
             
             <Text 
                numberOfLines={2} 
                style={[styles.message, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}
             >
               {message}
             </Text>
          </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 18,
    zIndex: 10000,
    // Modern iOS Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 14,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF', // Should match background, difficult without context, assuming distinct
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  message: {
    lineHeight: 18,
    fontWeight: '400',
  },
});

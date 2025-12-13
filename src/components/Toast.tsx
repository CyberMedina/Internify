import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss?: () => void;
  duration?: number;
}

export default function Toast({ visible, message, type = 'info', onDismiss, duration = 4000 }: ToastProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const config = {
    success: { bg: '#ECFDF5', border: '#A7F3D0', icon: 'check-circle', color: '#059669', title: '¡Éxito!' },
    error: { bg: '#FEF2F2', border: '#FECACA', icon: 'alert-circle', color: '#DC2626', title: 'Algo salió mal' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', icon: 'alert-triangle', color: '#D97706', title: 'Atención' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', icon: 'info', color: '#2563EB', title: 'Información' },
  }[type];

  // Check for dark mode based on colors (heuristic)
  const isDark = colors.card === '#1E1E1E' || colors.text === '#FFFFFF';
  
  const backgroundColor = isDark ? colors.surface : config.bg;
  const borderColor = isDark ? colors.border : config.border;
  const titleColor = isDark ? colors.text : '#111827';
  const messageColor = isDark ? colors.textSecondary : '#4B5563';

  return (
    <Animated.View 
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container, 
        { 
          top: insets.top + spacing(1),
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          shadowColor: colors.shadow || '#000',
        }
      ]}
    >
      <Feather name={config.icon as any} size={24} color={config.color} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: titleColor }]}>
          {config.title}
        </Text>
        <Text style={[styles.message, { color: messageColor }]}>
          {message}
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Feather name="x" size={18} color={messageColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    zIndex: 9999,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    marginTop: 2,
    padding: 4,
  },
});

import React from 'react';
import { Animated, View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type WidthType = number | `${number}%` | 'auto';

export default function Skeleton({ width = '100%' as WidthType, height = 16, borderRadius = 8, style, shimmer = false, active = true }: { width?: WidthType; height?: number; borderRadius?: number; style?: ViewStyle; shimmer?: boolean; active?: boolean }) {
  const { colors, isDark } = useTheme();
  const opacity = React.useRef(new Animated.Value(0.7)).current;
  const slide = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!active) {
      opacity.setValue(1); // Estático sin opacidad reducida
      return;
    }

    const loops: Animated.CompositeAnimation[] = [];
    // Pulso base
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
      ])
    );
    loops.push(pulse);
    pulse.start();

    if (shimmer) {
      const shimmerLoop = Animated.loop(
        Animated.timing(slide, { toValue: 1, duration: 1200, useNativeDriver: true })
      );
      slide.setValue(0);
      shimmerLoop.start();
      loops.push(shimmerLoop);
    }
    return () => loops.forEach(l => l.stop());
  }, [opacity, shimmer, slide, active]);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [-60, 200] });

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: colors.skeletonBase }, style]}>
      <Animated.View style={{ ...(StyleSheet.absoluteFillObject as any), backgroundColor: colors.skeletonHighlight, opacity: active ? opacity : 1 }} />
      {shimmer && active ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 80,
            backgroundColor: colors.skeletonHighlight,
            opacity: isDark ? 0.35 : 0.6,
            transform: [{ translateX }],
          }}
        />
      ) : null}
    </View>
  );
}

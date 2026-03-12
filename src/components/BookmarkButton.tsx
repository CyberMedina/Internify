import React, { useState, useCallback } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface BookmarkButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
  activeColor?: string;
  isLoading?: boolean;
}

export default function BookmarkButton({ 
  isSaved, 
  onToggle, 
  size = 24, 
  style,
  color,
  activeColor,
  isLoading = false
}: BookmarkButtonProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    if (isLoading) return;
    onToggle();
  }, [isLoading, onToggle]);

  const iconColor = isSaved 
    ? (activeColor || colors.primary) 
    : (color || colors.textSecondary);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      disabled={isLoading}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={style}
    >
        {isLoading ? (
             <ActivityIndicator size={size} color={colors.primary} />
        ) : (
            <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={size} 
            color={iconColor} 
            />
        )}
    </TouchableOpacity>
  );
}

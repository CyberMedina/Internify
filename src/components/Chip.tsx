import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'subtle' | 'primary';
  size?: 'xs' | 'sm' | 'md';
};

export default function Chip({ label, active, onPress, style, variant = 'subtle', size = 'sm' }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const padH = size === 'xs' ? spacing(1) : size === 'md' ? spacing(2) : spacing(1.5);
  const padV = size === 'xs' ? spacing(0.5) : size === 'md' ? spacing(1) : spacing(0.75);
  const minH = size === 'xs' ? 26 : size === 'md' ? 38 : 34;
  const fontSize = size === 'xs' ? typography.sizes.xs : size === 'md' ? typography.sizes.md : typography.sizes.sm;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          paddingHorizontal: padH,
          paddingVertical: padV,
          backgroundColor: active || variant === 'primary' ? colors.primary : colors.chipBg,
          borderWidth: variant === 'subtle' && !active ? 1 : 0,
          borderColor: colors.border,
          borderRadius: 999,
          marginRight: spacing(1),
          marginBottom: spacing(1),
          minHeight: minH,
          alignSelf: 'flex-start',
          maxWidth: '100%',
          flexShrink: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          color: active || variant === 'primary' ? '#fff' : colors.text,
          fontSize,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

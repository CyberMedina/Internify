import React from 'react';
import { View } from 'react-native';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  shimmer?: boolean;
  active?: boolean;
}

export default function SkeletonJobCardSmall({ shimmer = true, active = true }: Props) {
  const { spacing, colors, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={12} shimmer={shimmer} active={active} />
          <View style={{ marginLeft: spacing(1) }}>
            <Skeleton width={160} height={14} shimmer={shimmer} active={active} />
            <View style={{ height: spacing(0.5) }} />
            <Skeleton width={120} height={12} shimmer={shimmer} active={active} />
          </View>
        </View>
  <Skeleton width={18} height={18} borderRadius={9} shimmer={shimmer} active={active} />
      </View>
      <View style={{ height: spacing(1) }} />
      <View style={{ flexDirection: 'row' }}>
  <Skeleton width={80} height={24} borderRadius={12} shimmer={shimmer} active={active} />
        <View style={{ width: spacing(1) }} />
  <Skeleton width={80} height={24} borderRadius={12} shimmer={shimmer} active={active} />
        <View style={{ width: spacing(1) }} />
  <Skeleton width={40} height={24} borderRadius={12} shimmer={shimmer} active={active} />
      </View>
      <View style={{ height: spacing(1) }} />
      <Skeleton width={'50%'} height={12} shimmer={shimmer} active={active} />
    </View>
  );
}

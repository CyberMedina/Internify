import React from 'react';
import { View } from 'react-native';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/ThemeContext';

export default function SkeletonJobCardSmall() {
  const { spacing, colors, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={12} shimmer />
          <View style={{ marginLeft: spacing(1) }}>
            <Skeleton width={160} height={14} shimmer />
            <View style={{ height: spacing(0.5) }} />
            <Skeleton width={120} height={12} shimmer />
          </View>
        </View>
  <Skeleton width={18} height={18} borderRadius={9} shimmer />
      </View>
      <View style={{ height: spacing(1) }} />
      <View style={{ flexDirection: 'row' }}>
  <Skeleton width={80} height={24} borderRadius={12} shimmer />
        <View style={{ width: spacing(1) }} />
  <Skeleton width={80} height={24} borderRadius={12} shimmer />
        <View style={{ width: spacing(1) }} />
  <Skeleton width={40} height={24} borderRadius={12} shimmer />
      </View>
      <View style={{ height: spacing(1) }} />
      <Skeleton width={'50%'} height={12} shimmer />
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from '../components/Skeleton';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';

export default function SavedSkeleton() {
  const { spacing } = useTheme();
  return (
    <View>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing(2), paddingTop: spacing(2), flexDirection: 'row', alignItems: 'center' }}>
  <Skeleton width={40} height={40} borderRadius={20} shimmer />
        <View style={{ width: spacing(1) }} />
  <Skeleton width={'40%'} height={20} borderRadius={8} shimmer />
      </View>
      {/* List */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
        <SkeletonJobCardSmall />
        <SkeletonJobCardSmall />
        <SkeletonJobCardSmall />
      </View>
    </View>
  );
}

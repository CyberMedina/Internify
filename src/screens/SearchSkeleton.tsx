import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from '../components/Skeleton';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';

export default function SearchSkeleton() {
  const { spacing } = useTheme();
  return (
    <View style={{ paddingTop: spacing(2) }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing(2), flexDirection: 'row', alignItems: 'center' }}>
  <Skeleton width={40} height={40} borderRadius={20} shimmer />
        <View style={{ flex: 1, marginHorizontal: spacing(1) }}>
          <Skeleton width={'100%'} height={40} borderRadius={20} shimmer />
        </View>
      </View>
      {/* Recent Searches */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
  <Skeleton width={'50%'} height={18} shimmer />
        <View style={{ marginTop: spacing(1) }}>
          <Skeleton width={'70%'} height={14} style={{ marginBottom: spacing(1) }} shimmer />
          <Skeleton width={'60%'} height={14} style={{ marginBottom: spacing(1) }} shimmer />
          <Skeleton width={'50%'} height={14} shimmer />
        </View>
      </View>
      {/* Recently Viewed */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
  <Skeleton width={'60%'} height={18} shimmer />
        <View style={{ marginTop: spacing(1) }}>
          <SkeletonJobCardSmall />
          <SkeletonJobCardSmall />
        </View>
      </View>
    </View>
  );
}

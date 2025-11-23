import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from '../components/Skeleton';
import SkeletonChip from '../components/skeletons/SkeletonChip';
import SkeletonJobCardLarge from '../components/skeletons/SkeletonJobCardLarge';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';

export default function HomeSkeleton() {
  const { colors, spacing } = useTheme();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing(3) }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.primary, paddingTop: spacing(5), paddingHorizontal: spacing(2), paddingBottom: spacing(2), borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Skeleton width={40} height={40} borderRadius={20} shimmer />
            <View style={{ marginLeft: spacing(1), flex: 1 }}>
              <Skeleton width={'60%'} height={12} borderRadius={6} shimmer />
              <View style={{ height: spacing(0.5) }} />
              <Skeleton width={'40%'} height={18} borderRadius={8} shimmer />
            </View>
          </View>
          <Skeleton width={36} height={36} borderRadius={18} shimmer />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) }}>
          <Skeleton width={'82%'} height={44} borderRadius={16} shimmer />
          <View style={{ width: spacing(1) }} />
          <Skeleton width={44} height={44} borderRadius={12} shimmer />
        </View>
      </View>

      {/* Suggested */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
  <Skeleton width={'50%'} height={18} shimmer />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingRight: spacing(2) }}>
          <SkeletonJobCardLarge />
          <SkeletonJobCardLarge />
        </ScrollView>
      </View>

      {/* Recent */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
  <Skeleton width={'50%'} height={18} shimmer />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing(0.5) }}>
          <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
          <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
          <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
          <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
          <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
        </ScrollView>
        <View style={{ marginTop: spacing(1.5) }}>
          <SkeletonJobCardSmall />
          <SkeletonJobCardSmall />
          <SkeletonJobCardSmall />
        </View>
      </View>
    </ScrollView>
  );
}

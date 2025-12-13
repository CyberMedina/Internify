import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from '../components/Skeleton';
import ScreenContainer from '../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JobDetailSkeleton() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Top actions (safe area) */}
      <View style={{ paddingHorizontal: spacing(2), paddingTop: insets.top + spacing(1), paddingBottom: spacing(1), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={40} height={40} borderRadius={20} shimmer />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={20} shimmer />
          <View style={{ width: spacing(1) }} />
          <Skeleton width={40} height={40} borderRadius={20} shimmer />
        </View>
      </View>

      <ScreenContainer scroll contentContainerStyle={{ paddingTop: spacing(2), paddingBottom: spacing(10) }}>
        {/* Header card-like */}
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing(2), paddingTop: spacing(4), paddingBottom: spacing(2) }}>
          <View style={{ alignItems: 'center' }}>
            <Skeleton width={72} height={72} borderRadius={36} shimmer />
            <View style={{ height: spacing(1) }} />
            <Skeleton width={200} height={28} borderRadius={8} shimmer />
            <View style={{ height: 4 }} />
            <Skeleton width={150} height={16} borderRadius={6} shimmer />
            <View style={{ height: spacing(1) }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Skeleton width={14} height={14} borderRadius={7} shimmer />
              <View style={{ width: 6 }} />
              <Skeleton width={100} height={14} borderRadius={6} shimmer />
            </View>
          </View>

          {/* Info tiles grid */}
          <View style={{ marginTop: spacing(2), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Skeleton width={28} height={28} borderRadius={14} shimmer />
                  <View style={{ width: spacing(1) }} />
                  <Skeleton width={60} height={12} borderRadius={6} shimmer />
                </View>
                <Skeleton width={'80%'} height={16} borderRadius={6} shimmer />
              </View>
            ))}
          </View>
        </View>

        {/* Tabs mock */}
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: spacing(2), paddingBottom: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing(2), borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: spacing(1) }}>
            <Skeleton width={80} height={20} borderRadius={4} shimmer />
            <Skeleton width={80} height={20} borderRadius={4} shimmer />
            <Skeleton width={80} height={20} borderRadius={4} shimmer />
          </View>

          <View style={{ marginTop: spacing(2) }}>
            <Skeleton width={120} height={20} borderRadius={6} shimmer />
            <View style={{ height: spacing(1) }} />
            <Skeleton width={'100%'} height={14} borderRadius={4} shimmer />
            <View style={{ height: 6 }} />
            <Skeleton width={'90%'} height={14} borderRadius={4} shimmer />
            <View style={{ height: 6 }} />
            <Skeleton width={'95%'} height={14} borderRadius={4} shimmer />
            
            <View style={{ height: spacing(2) }} />
            
            <Skeleton width={150} height={20} borderRadius={6} shimmer />
            <View style={{ height: spacing(1) }} />
            <Skeleton width={'100%'} height={14} borderRadius={4} shimmer />
            <View style={{ height: 6 }} />
            <Skeleton width={'100%'} height={14} borderRadius={4} shimmer />
            <View style={{ height: 6 }} />
            <Skeleton width={'80%'} height={14} borderRadius={4} shimmer />
          </View>
        </View>
      </ScreenContainer>

      {/* Fixed bottom CTA */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(1.5), paddingTop: spacing(1), backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }}>
        <Skeleton width={'100%'} height={56} borderRadius={28} shimmer />
      </View>
    </View>
  );
}

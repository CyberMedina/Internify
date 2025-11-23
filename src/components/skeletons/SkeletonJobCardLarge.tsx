import React from 'react';
import { View } from 'react-native';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/ThemeContext';

export default function SkeletonJobCardLarge() {
  const { spacing, colors } = useTheme();
  return (
    <View
      style={{
        width: 300,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing(2),
        marginRight: spacing(2),
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
      }}
    >
      {/* Header: logo + title + bookmark */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius={12} shimmer />
        <View style={{ marginLeft: spacing(1), flex: 1 }}>
          <Skeleton width={'80%'} height={14} shimmer />
          <View style={{ height: spacing(0.5) }} />
          <Skeleton width={'50%'} height={12} shimmer />
        </View>
        <View style={{ marginLeft: 'auto' }}>
          <Skeleton width={24} height={24} borderRadius={12} shimmer />
        </View>
      </View>
      {/* Chips */}
      <View style={{ flexDirection: 'row', marginTop: spacing(1) }}>
        <Skeleton width={80} height={24} borderRadius={12} shimmer />
        <View style={{ width: spacing(1) }} />
        <Skeleton width={80} height={24} borderRadius={12} shimmer />
        <View style={{ width: spacing(1) }} />
        <Skeleton width={80} height={24} borderRadius={12} shimmer />
      </View>
      {/* Salary + applicants */}
      <View style={{ marginTop: spacing(1) }}>
        <Skeleton width={'60%'} height={14} shimmer />
        <View style={{ height: spacing(0.5) }} />
        <Skeleton width={'40%'} height={12} shimmer />
      </View>
    </View>
  );
}

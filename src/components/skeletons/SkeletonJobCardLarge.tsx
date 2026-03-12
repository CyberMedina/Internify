import React from 'react';
import { View, Dimensions } from 'react-native';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');
// 85% is commonly used in HomeScreen for carousel items
const DEFAULT_WIDTH = width * 0.85;

interface Props {
  style?: any;
}

export default function SkeletonJobCardLarge({ style }: Props) {
  const { spacing, colors, isDark } = useTheme();
  
  return (
    <View
      style={[{
        width: DEFAULT_WIDTH,
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: spacing(2),
        marginRight: spacing(2),
        ...(isDark ? {
          borderWidth: 1,
          borderColor: colors.border,
        } : {}),
      }, style]}
    >
      {/* Header: logo + title + match badge */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Logo Left */}
        <Skeleton width={48} height={48} borderRadius={12} shimmer />
        
        <View style={{ marginLeft: spacing(1.5), flex: 1 }}>
          {/* Title */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <View style={{ flex: 1, paddingRight: spacing(1) }}>
                <Skeleton width={'90%'} height={16} borderRadius={4} shimmer />
                <View style={{ height: 6 }} />
                <Skeleton width={'60%'} height={12} borderRadius={4} shimmer />
             </View>
             {/* Match Badge Placeholder */}
             <Skeleton width={60} height={24} borderRadius={100} shimmer />
          </View>
        </View>
      </View>

      {/* Location Line */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1.5) }}>
         <Skeleton width={16} height={16} borderRadius={8} shimmer />
         <View style={{ width: 8 }} />
         <Skeleton width={140} height={12} borderRadius={4} shimmer />
      </View>

      {/* Chips */}
      <View style={{ flexDirection: 'row', marginTop: spacing(2) }}>
        <Skeleton width={80} height={28} borderRadius={8} shimmer />
        <View style={{ width: spacing(1) }} />
        <Skeleton width={100} height={28} borderRadius={8} shimmer />
      </View>

      {/* Divider */}
      <View style={{ height: 1.5, backgroundColor: colors.border, marginVertical: spacing(2), opacity: 0.5 }} />

      {/* Footer: Applicants + Salary/Time */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
         {/* Applicants */}
         <View>
            <Skeleton width={80} height={12} borderRadius={4} shimmer />
         </View>

         {/* Salary & Time */}
         <View style={{ alignItems: 'flex-end' }}>
            <Skeleton width={90} height={16} borderRadius={4} shimmer />
            <View style={{ height: 6 }} />
            <Skeleton width={70} height={12} borderRadius={4} shimmer />
         </View>
      </View>
    </View>
  );
}

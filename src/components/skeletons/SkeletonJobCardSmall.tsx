import React from 'react';
import { View } from 'react-native';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  shimmer?: boolean;
  active?: boolean;
  style?: any;
}

export default function SkeletonJobCardSmall({ shimmer = true, active = true, style }: Props) {
  const { spacing, colors, radius } = useTheme();
  
  return (
    <View style={[{ 
      backgroundColor: colors.surface, 
      padding: spacing(2), 
      borderRadius: 16, // Matches cards 
      marginBottom: spacing(1.5),
      borderWidth: 1,
      borderColor: colors.border,
      // Subtle shadow
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2
    }, style]}>
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Logo */}
        <Skeleton width={48} height={48} borderRadius={12} shimmer={shimmer} active={active} />
        
        <View style={{ marginLeft: spacing(1.5), flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <View style={{ flex: 1 }}>
                <Skeleton width={'80%'} height={16} borderRadius={4} shimmer={shimmer} active={active} />
                <View style={{ height: 6 }} />
                <Skeleton width={'50%'} height={14} borderRadius={4} shimmer={shimmer} active={active} />
             </View>
             {/* Bookmark Icon */}
             <Skeleton width={20} height={20} borderRadius={10} shimmer={shimmer} active={active} />
          </View>
        </View>
      </View>
      
      {/* Location */}
       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1.5) }}>
         <Skeleton width={14} height={14} borderRadius={7} shimmer={shimmer} active={active} />
         <View style={{ width: 8 }} />
         <Skeleton width={120} height={12} borderRadius={4} shimmer={shimmer} active={active} />
      </View>

      {/* Chips */}
      <View style={{ flexDirection: 'row', marginTop: spacing(2) }}>
        <Skeleton width={70} height={26} borderRadius={8} shimmer={shimmer} active={active} />
        <View style={{ width: spacing(1) }} />
        <Skeleton width={90} height={26} borderRadius={8} shimmer={shimmer} active={active} />
      </View>
      
      {/* Spacer for potential divider visual equivalent */}
      <View style={{ height: spacing(2) }} />

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
         <Skeleton width={70} height={12} shimmer={shimmer} active={active} />
         
         <View style={{ alignItems: 'flex-end' }}>
             <Skeleton width={80} height={16} borderRadius={4} shimmer={shimmer} active={active} />
             <View style={{ height: 6 }} />
             <Skeleton width={60} height={12} borderRadius={4} shimmer={shimmer} active={active} />
         </View>
      </View>
    </View>
  );
}

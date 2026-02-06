import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from '../components/Skeleton';
import SkeletonChip from '../components/skeletons/SkeletonChip';
import SkeletonJobCardLarge from '../components/skeletons/SkeletonJobCardLarge';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';

const { width } = Dimensions.get('window');

export default function HomeSkeleton() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Match CONTENT_PADDING_TOP from HomeScreen: Insets + 206
  const CONTENT_PADDING_TOP = insets.top + 206;

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      
      {/* Header Absoluto Simulado */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        {/* Parte Azul / Header Principal */}
        <View style={{ 
          backgroundColor: colors.primary, 
          paddingTop: insets.top + spacing(2), 
          paddingBottom: spacing(2),
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}>
          {/* Fila Avatar + Saludo */}
          <View style={{ paddingHorizontal: spacing(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Avatar Circle */}
              <Skeleton width={48} height={48} borderRadius={24} shimmer color="rgba(255,255,255,0.2)" />
              <View style={{ marginLeft: spacing(1.5), flex: 1 }}>
                {/* "Hola, Usuario" */}
                <Skeleton width={100} height={14} borderRadius={4} shimmer color="rgba(255,255,255,0.2)" />
                <View style={{ height: 6 }} />
                {/* Saludo Grande */}
                <Skeleton width={140} height={24} borderRadius={4} shimmer color="rgba(255,255,255,0.2)" />
              </View>
            </View>
            {/* Bell Icon */}
            <Skeleton width={36} height={36} borderRadius={18} shimmer color="rgba(255,255,255,0.2)" />
          </View>

          {/* Fila de Búsqueda */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
            <View style={{ flex: 1 }}>
               <Skeleton width={'100%'} height={44} borderRadius={16} shimmer color="rgba(255,255,255,0.2)" />
            </View>
            <View style={{ marginLeft: spacing(1) }}>
               <Skeleton width={44} height={44} borderRadius={12} shimmer color="rgba(255,255,255,0.2)" />
            </View>
          </View>
        </View>

        {/* Chips Sticky (Debajo del Header Azul) */}
        <View style={{ backgroundColor: colors.card, paddingBottom: spacing(1.5), paddingTop: spacing(2.5) }}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing(2) }}>
              <View style={{ marginRight: spacing(1) }}><SkeletonChip width={80} /></View>
              <View style={{ marginRight: spacing(1) }}><SkeletonChip width={60} /></View>
              <View style={{ marginRight: spacing(1) }}><SkeletonChip width={90} /></View>
              <View style={{ marginRight: spacing(1) }}><SkeletonChip width={70} /></View>
              <View style={{ marginRight: spacing(1) }}><SkeletonChip width={75} /></View>
           </ScrollView>
        </View>
      </View>

      {/* Contenido Scrolleable */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: CONTENT_PADDING_TOP, paddingBottom: spacing(3) }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} 
      >
        
        {/* Suggested Section */}
        <View style={{ marginBottom: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing(2), marginBottom: spacing(1.5) }}>
             <Skeleton width={120} height={24} borderRadius={4} shimmer />
             <Skeleton width={60} height={18} borderRadius={4} shimmer />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing(2) }}>
             <View style={{ marginRight: spacing(2) }}>
               <SkeletonJobCardLarge />
             </View>
             {/* Optional second card partially visible if we want strict fidelity, 
                 but skeleton usually shows one or two fully. 
             */}
          </ScrollView>
        </View>
        
        {/* Recent Section */}
        <View style={{ paddingHorizontal: spacing(2) }}>
          <View style={{ marginBottom: spacing(1.5) }}>
             <Skeleton width={100} height={24} borderRadius={4} shimmer />
          </View>
          
          <View style={{ gap: spacing(2) }}>
             <SkeletonJobCardSmall />
             <SkeletonJobCardSmall />
             <SkeletonJobCardSmall />
             <SkeletonJobCardSmall />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

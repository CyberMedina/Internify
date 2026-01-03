import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useSaved } from '../context/SavedContext';
import { useNavigation } from '@react-navigation/native';
import type { Job } from '../components/JobCardLarge';
import ScreenContainer from '../components/ScreenContainer';

const SAVED: Job[] = [
  {
    id: 's-1',
    title: 'Desarrollador React',
    company: 'AmplifyAvenue',
    location: 'New York, USA',
    tags: ['Tiempo completo', 'Remoto', 'Semi-Senior'],
    applicants: 52,
  salary: '$62k - $82k /mes',
    avatars: [],
  },
  {
    id: 's-2',
  title: 'Contador',
    company: 'QubitLink Software',
    location: 'New York, USA',
    tags: ['Contrato', 'Presencial', 'Asociado'],
    applicants: 231,
  salary: '$42 /h',
    avatars: [],
  },
  {
    id: 's-3',
  title: 'Desarrollador React Native',
    company: 'YellowByte Innovations',
    location: 'New York, USA',
    tags: ['Contrato', 'Presencial', 'Asociado'],
    applicants: 65,
  salary: '$70 /h',
    avatars: [],
  },
];

export default function SavedScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const savedCtx = useSaved();
  const saved = savedCtx?.list ?? []; // Default to empty array if no context or mock data needed

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>Guardados</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(2), flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
        renderItem={({ item }) => (
          <JobCardSmall job={item} applicantsLabel="Postulantes" />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4) }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) }}>
              <Feather name="bookmark" size={40} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700', marginBottom: spacing(1), textAlign: 'center' }}>
              No tienes trabajos guardados
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md, textAlign: 'center' }}>
              Los trabajos que guardes aparecerán aquí para que puedas acceder a ellos fácilmente.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

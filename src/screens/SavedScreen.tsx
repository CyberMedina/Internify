import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useSaved } from '../context/SavedContext';
import { useNavigation } from '@react-navigation/native';
import type { Job } from '../components/JobCardLarge';
import SavedSkeleton from './SavedSkeleton';

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
  const saved = savedCtx?.list ?? SAVED; // fallback al mock si aún no hay contexto
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SavedSkeleton />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + spacing(1), paddingHorizontal: spacing(2), paddingBottom: spacing(1), flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.getParent()?.navigate('Inicio');
          }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: spacing(2), color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>Guardados</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(2) }}
        ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
        renderItem={({ item }) => (
          <JobCardSmall job={item} applicantsLabel="Postulantes" />
        )}
      />
    </View>
  );
}

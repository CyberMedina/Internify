import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useI18n } from '../i18n/i18n';
import { useNavigation } from '@react-navigation/native';

// Reutilizamos el tipo Job desde JobCardSmall vía JobCardLarge
import type { Job } from '../components/JobCardLarge';
import SearchSkeleton from './SearchSkeleton';

const recentSearchesInit = ['Diseñador UI', 'Diseñador Gráfico', 'Desarrollador React Native'];

const recentViewsMock: Job[] = [
  {
    id: 'nv-1',
    title: 'Desarrollador Node.js',
    company: 'FlexiCraft Solutions',
    location: 'Ciudad de México, MX',
    tags: ['Medio tiempo', 'Remoto', 'Semi-Senior'],
    applicants: 325,
    salary: '$75k - $85k /mes',
    avatars: [],
  },
  {
    id: 'nv-2',
    title: 'Editor de Video',
    company: 'CloudCraze Labs',
    location: 'Bogotá, CO',
    tags: ['Contrato', 'Presencial', 'Asociado'],
    applicants: 231,
  salary: '$32 /h',
    avatars: [],
  },
  {
    id: 'nv-3',
    title: 'Diseñador UX',
    company: 'TitanTech Labs',
    location: 'Lima, PE',
    tags: ['Tiempo completo', 'Remoto', 'Junior'],
    applicants: 152,
  salary: '$48k - $55k /año',
    avatars: [],
  },
];

export default function SearchScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const [query, setQuery] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState(recentSearchesInit);
  const [loading, setLoading] = React.useState(true);

  const removeSearch = (text: string) => {
    setRecentSearches((s) => s.filter((t) => t !== text));
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SearchSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header con back, input y filtro */}
      <View style={{ paddingTop: insets.top + spacing(1), paddingHorizontal: spacing(2), paddingBottom: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.getParent()?.navigate(t('tabs.home'));
            }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: spacing(1) }}>
            <View style={{ height: 40, borderRadius: 20, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(1.5), borderWidth: 1, borderColor: colors.border }}>
              <Feather name="search" size={16} color={colors.textSecondary} />
              <TextInput
                placeholder={t('common.searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, marginLeft: 8, color: colors.text }}
              />
              <TouchableOpacity>
                <Feather name="sliders" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing(3) }}>
        {/* Búsquedas recientes */}
        <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('search.recentSearches')}</Text>
          <View style={{ marginTop: spacing(1) }}>
            {recentSearches.map((t) => (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(1), borderBottomColor: colors.border, borderBottomWidth: 1 }}>
                <Text style={{ color: colors.textSecondary }}>{t}</Text>
                <TouchableOpacity onPress={() => removeSearch(t)}>
                  <Feather name="x" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Vistos recientemente */}
        <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('search.recentlyViewed')}</Text>
          <View style={{ marginTop: spacing(1) }}>
            {recentViewsMock.map((job) => (
              <JobCardSmall key={job.id} job={job} applicantsLabel="Postulantes" />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

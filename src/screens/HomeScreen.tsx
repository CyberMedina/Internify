import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import JobCardLarge from '../components/JobCardLarge';
import JobCardSmall from '../components/JobCardSmall';
import Chip from '../components/Chip';
import { recentJobs, suggestedJobs, categories } from '../mock/jobs';
import ScreenContainer from '../components/ScreenContainer';
import HomeSkeleton from './HomeSkeleton';
import { useI18n } from '../i18n/i18n';

export default function HomeScreen() {
  const { colors, spacing, typography, toggleScheme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeCat, setActiveCat] = React.useState('Todos');
  const userName = 'Jhonatan Medina';
  const hour = new Date().getHours();
  const saludo = hour < 12 ? t('home.goodMorning') : hour < 19 ? t('home.goodAfternoon') : t('home.goodEvening');
  const filteredRecent = React.useMemo(() => {
    if (activeCat === 'Todos') return recentJobs;
    const q = activeCat.toLowerCase();
    return recentJobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [activeCat]);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
  <ScreenContainer scroll refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header con saludo y acciones */}
      <View style={{ backgroundColor: colors.primary, paddingTop: spacing(5), paddingHorizontal: spacing(2), paddingBottom: spacing(2), borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Izquierda: avatar + textos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} activeOpacity={0.8}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={{ marginLeft: spacing(1) }}>
              <Text style={{ color: '#E0E7FF' }}>{t('home.hello', { name: userName })}</Text>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: typography.sizes.xl }}>{saludo}</Text>
            </View>
          </View>
          {/* Derecha: acción simple (mantengo bell como toggler de tema) */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={toggleScheme} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="bell" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(1.5), height: 44 }}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <TextInput placeholder={t('common.searchPlaceholder')} placeholderTextColor={colors.textSecondary} style={{ marginLeft: 8, flex: 1, color: colors.text }} />
          </View>
          <TouchableOpacity style={{ marginLeft: spacing(1), backgroundColor: '#FFD166', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="sliders" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggested */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{t('home.suggested')}</Text>
          <TouchableOpacity>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing(1.5), overflow: 'visible' }}
          contentContainerStyle={{ paddingRight: spacing(2), paddingLeft: spacing(0.5), paddingBottom: spacing(1.5) }}
        >
          {suggestedJobs.map((job, idx) => (
            <View key={job.id} style={{ marginLeft: idx === 0 ? 0 : 0 }}>
              <JobCardLarge job={job} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recent */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1.5) }}>
  <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing(1) }}>{t('home.recent')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ paddingVertical: spacing(0.5) }}>
          {categories.map((c) => (
            <Chip key={c} label={c} active={activeCat === c} onPress={() => setActiveCat(c)} />
          ))}
        </ScrollView>

        <View style={{ marginTop: spacing(1.5), paddingBottom: spacing(1) }}>
          {filteredRecent.length > 0 ? (
            filteredRecent.map((job) => <JobCardSmall key={job.id} job={job} />)
          ) : (
            <Text style={{ color: colors.textSecondary, paddingVertical: spacing(2) }}>{t('common.noJobsFor', { cat: activeCat })}</Text>
          )}
        </View>
      </View>
  </ScreenContainer>
  );
}

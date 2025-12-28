import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import JobCardLarge, { Job } from '../components/JobCardLarge';
import JobCardSmall from '../components/JobCardSmall';
import Chip from '../components/Chip';
import LevelAvatar from '../components/LevelAvatar';
import { internshipLevels } from '../mock/user';
import ScreenContainer from '../components/ScreenContainer';
import HomeSkeleton from './HomeSkeleton';
import SkeletonJobCardLarge from '../components/skeletons/SkeletonJobCardLarge';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';
import SkeletonChip from '../components/skeletons/SkeletonChip';
import { useI18n } from '../i18n/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getSuggestedVacancies, getCategories, getVacancies } from '../services/vacancyService';
import { Vacancy, Category } from '../types/vacancy';

const mapVacancyToJob = (v: Vacancy): Job => ({
  id: v.id.toString(),
  title: v.title,
  company: v.company.name,
  location: v.location || 'N/A',
  tags: v.tags && v.tags.length > 0 ? v.tags : (v.requirements && v.requirements.length > 0 ? v.requirements : (v.academic_programs || [])),
  applicants: v.applicants_count ?? 0,
  salary: v.salary_range ? `C$${v.salary_range}` : 'Anónimo',
  avatars: [],
  companyLogo: v.company.logo || v.company.photo,
  postedTime: v.dates?.posted_human
});

export default function HomeScreen() {
  const { colors, spacing, typography, toggleScheme } = useTheme();
  const { t } = useI18n();
  const { studentProfile, fetchStudentProfile, userToken } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [suggested, setSuggested] = useState<Job[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [recent, setRecent] = useState<Job[]>([]);
  
  // Filter & Pagination states
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRecent(1, searchText, activeCatId);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (!userToken) return;
    setLoading(true);
    
    try {
      const promises = [
        fetchStudentProfile(),
        fetchSuggested(),
        fetchCategories()
      ];
      
      if (searchText === '') {
        promises.push(fetchRecent(1, '', activeCatId));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggested = async () => {
    if (!userToken) return;
    try {
      const res = await getSuggestedVacancies(userToken);
      setSuggested(res.data.map(mapVacancyToJob));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    if (!userToken) return;
    try {
      const res = await getCategories(userToken);
      setCategoriesList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecent = async (pageNum: number, search: string, catId: number | null) => {
    if (!userToken) return;
    if (pageNum === 1) {
      setLoadingMore(false);
    }
    
    try {
      const res = await getVacancies(userToken, pageNum, 10, { search, categoryId: catId || undefined });
      
      // DEBUG LOGS
      if (res.data && res.data.length > 0) {
        console.log('API Response Sample (dates):', JSON.stringify(res.data[0].dates, null, 2));
      }

      const newJobs = res.data.map(mapVacancyToJob);

      if (newJobs.length > 0) {
        console.log('Mapped Job Sample (postedTime):', newJobs[0].postedTime);
      }
      
      if (pageNum === 1) {
        setRecent(newJobs);
      } else {
        setRecent(prev => [...prev, ...newJobs]);
      }
      
      setHasMore(!!res.links.next);
    } catch (error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Auto-select category based on career
  useEffect(() => {
    if (!autoSelected && studentProfile?.academic_info?.career && categoriesList.length > 0) {
      const careerName = studentProfile.academic_info.career;
      // Normalize removing accents and special characters
      const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      
      console.log('Auto-select Debug:');
      console.log('Student Career:', careerName);
      console.log('Categories:', categoriesList.map(c => `${c.name} (${c.pseudonym})`).join(', '));

      const matchedCategory = categoriesList.find(c => 
        normalize(c.name) === normalize(careerName) || 
        (c.pseudonym && normalize(c.pseudonym) === normalize(careerName))
      );

      if (matchedCategory) {
        console.log(`Auto-selecting category: ${matchedCategory.name}`);
        setActiveCatId(matchedCategory.id);
        setPage(1);
        fetchRecent(1, searchText, matchedCategory.id);
      } else {
        console.log('No matching category found for career:', careerName);
      }
      setAutoSelected(true);
    }
  }, [studentProfile, categoriesList, autoSelected]);

  const { careerCategory, otherCategories } = useMemo(() => {
    let careerCat: Category | undefined;
    let others: Category[] = [...categoriesList];

    if (studentProfile?.academic_info?.career) {
      const careerName = studentProfile.academic_info.career;
      const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      
      const matchIndex = others.findIndex(c => 
        normalize(c.name) === normalize(careerName) || 
        (c.pseudonym && normalize(c.pseudonym) === normalize(careerName))
      );

      if (matchIndex !== -1) {
        careerCat = others[matchIndex];
        others.splice(matchIndex, 1);
      }
    }

    others.sort((a, b) => {
        const nameA = a.pseudonym || a.name;
        const nameB = b.pseudonym || b.name;
        return nameA.localeCompare(nameB);
    });

    return { careerCategory: careerCat, otherCategories: others };
  }, [categoriesList, studentProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadInitialData();
    setRefreshing(false);
  }, [userToken, activeCatId, searchText]);

  const handleCategoryPress = (catId: number | null) => {
    if (activeCatId === catId) return;
    setActiveCatId(catId);
    setPage(1);
    fetchRecent(1, searchText, catId);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecent(nextPage, searchText, activeCatId);
  };

  const getInternshipStatus = (hours: number) => {
    const currentLevel = internshipLevels.find(l => hours >= l.minHours && hours < l.maxHours) 
      || internshipLevels[internshipLevels.length - 1];
    const range = currentLevel.maxHours - currentLevel.minHours;
    const progress = Math.min(Math.max((hours - currentLevel.minHours) / range, 0), 1);

    return {
      stage: currentLevel.name,
      color: currentLevel.color,
      progress: progress,
      badge: currentLevel.badge,
      nextGoal: currentLevel.maxHours
    };
  };

  const currentHours = 0; 
  const status = getInternshipStatus(currentHours);
  
  const displayName = studentProfile?.profile 
    ? `${studentProfile.profile.first_name.split(' ')[0]} ${studentProfile.profile.last_name.split(' ')[0]}`
    : 'Estudiante';

  const hour = new Date().getHours();
  const saludo = hour < 12 ? t('home.goodMorning') : hour < 19 ? t('home.goodAfternoon') : t('home.goodEvening');

  // Animation Constants & Logic
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Alturas estimadas para la animación
  // Avatar Row: ~48px height + margins. Vamos a animar un contenedor de ~70px a 0.
  const AVATAR_SECTION_HEIGHT = 70;
  
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, AVATAR_SECTION_HEIGHT], [AVATAR_SECTION_HEIGHT, 0], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, AVATAR_SECTION_HEIGHT * 0.6], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, AVATAR_SECTION_HEIGHT], [0, -20], Extrapolation.CLAMP);
    
    return {
      height,
      opacity,
      transform: [{ translateY }],
      overflow: 'hidden',
    };
  });

  const headerContainerAnimatedStyle = useAnimatedStyle(() => {
    // Mantenemos un radio mínimo de 25px incluso al colapsar, o podemos reducirlo ligeramente si se desea.
    // La instrucción pide "Aplica un borderRadius de 25px... para que no sea un corte recto".
    // Vamos a mantenerlo fijo en 25px o interpolarlo muy poco (ej. 25 -> 20).
    // Si el usuario quiere que NO sea recto, entonces no debemos llegar a 0.
    const borderRadius = interpolate(scrollY.value, [0, AVATAR_SECTION_HEIGHT], [30, 25], Extrapolation.CLAMP);
    return {
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    };
  });

  // Padding top para el contenido: Insets + Avatar (70) + Search (approx 80) + Chips (approx 50)
  // Search Row: marginTop(16) + height(44) + paddingBottom(16) = ~76px
  // Chips Row: ~50px + marginTop(10) = ~60px
  // Total Expanded: Insets + 70 + 76 + 60 = Insets + 206
  const CONTENT_PADDING_TOP = insets.top + 206;

  // Animated Linear Gradient
  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

  if (loading) {
    return <HomeSkeleton />;
  }

  const renderListHeader = () => (
    <View style={{ paddingTop: spacing(2) }}>
      {/* Widget de Progreso del Perfil */}
      {studentProfile && !studentProfile.has_cv && (
        <View style={{ 
          marginHorizontal: spacing(2), 
          marginBottom: spacing(2), 
          padding: spacing(2.5), 
          backgroundColor: colors.surface, 
          borderRadius: 20, 
          borderWidth: 1, 
          borderColor: colors.border, 
          shadowColor: colors.primary, 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 16, 
          elevation: 3 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing(2) }}>
            <View style={{ flex: 1, paddingRight: spacing(1) }}>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
                ¡Impulsa tu carrera! 🚀
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 20 }}>
                Sube tu CV para <Text style={{ fontWeight: '700', color: colors.primary }}>activar tu visibilidad</Text> ante las empresas.
              </Text>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="briefcase" size={22} color={colors.primary} />
            </View>
          </View>

          <View style={{ marginBottom: spacing(2.5) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>Perfil completado</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>60%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: '60%', height: '100%', backgroundColor: colors.primary, borderRadius: 4 }} />
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Onboarding', { screen: 'CVStart' })}
            activeOpacity={0.9}
            style={{ 
              backgroundColor: colors.primary, 
              paddingVertical: spacing(1.5), 
              borderRadius: 14, 
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              elevation: 4
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: typography.sizes.md }}>
              Finalizar mi perfil ahora
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Suggested */}
      {suggested.length > 0 && (
        <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(2) }}>
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
            {suggested.map((job, idx) => (
              <View key={job.id} style={{ marginLeft: idx === 0 ? 0 : 0 }}>
                <JobCardLarge job={job} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Header Title */}
      <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(1) }}>
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{t('home.recent')}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header Animado Absoluto */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        {/* Parte Azul (Avatar + Buscador) con Gradiente */}
        <AnimatedLinearGradient
          colors={[colors.primary, '#4338ca']} // Gradiente de primary a un tono índigo más oscuro
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { 
              paddingTop: insets.top + spacing(2), 
              paddingBottom: spacing(2),
              zIndex: 10,
              // Shadow sutil para profundidad
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            },
            headerContainerAnimatedStyle
          ]}
        >
          {/* Avatar y Saludo (Colapsable) */}
          <Animated.View style={[avatarAnimatedStyle, { paddingHorizontal: spacing(2) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(1) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} activeOpacity={0.8}>
                  <LevelAvatar 
                    progress={status.progress} 
                    size={48} 
                    color={status.color}
                    badgeContent={status.badge}
                    imageUri={studentProfile?.profile?.photo || undefined}
                  />
                </TouchableOpacity>
                <View style={{ marginLeft: spacing(1.5) }}>
                  <Text style={{ color: '#E0E7FF' }}>{t('home.hello', { name: displayName })}</Text>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: typography.sizes.xl }}>{saludo}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={toggleScheme} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="bell" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Barra de búsqueda (Siempre visible) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate(t('tabs.search'))}
              style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(1.5), height: 44 }}
            >
              <Feather name="search" size={18} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, flex: 1, color: colors.textSecondary }}>
                {t('common.searchPlaceholder')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: spacing(1), backgroundColor: '#FFD166', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="sliders" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </AnimatedLinearGradient>

        {/* Chips Sticky (Debajo del Header Azul) */}
        <View style={{ backgroundColor: colors.card, paddingBottom: spacing(1.5), paddingTop: spacing(2.5) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing(2) }}>
            {careerCategory && (
              <Chip 
                key={careerCategory.id} 
                label={careerCategory.pseudonym || careerCategory.name} 
                active={activeCatId === careerCategory.id} 
                onPress={() => handleCategoryPress(careerCategory.id)} 
              />
            )}
            <Chip 
              key="all" 
              label="Todos" 
              active={activeCatId === null} 
              onPress={() => handleCategoryPress(null)} 
            />
            {otherCategories.map((c) => (
              <Chip 
                key={c.id} 
                label={c.pseudonym || c.name} 
                active={activeCatId === c.id} 
                onPress={() => handleCategoryPress(c.id)} 
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Contenido Scrolleable */}
      <Animated.FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing(2) }}>
            <JobCardSmall job={item} />
          </View>
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          !loading && !refreshing && (
            <View style={{ padding: spacing(4), alignItems: 'center', justifyContent: 'center', marginTop: spacing(2) }}>
              <Feather name="inbox" size={48} color={colors.textSecondary} style={{ marginBottom: spacing(2), opacity: 0.5 }} />
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: typography.sizes.md }}>
                {t('common.noJobsAvailable')}
              </Text>
            </View>
          )
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: CONTENT_PADDING_TOP, paddingBottom: spacing(2) }}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ top: CONTENT_PADDING_TOP }}
        progressViewOffset={CONTENT_PADDING_TOP}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: 20, alignItems: 'center', width: '100%' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : <View style={{ height: 20 }} />}
      />
    </View>
  );
}

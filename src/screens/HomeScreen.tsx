import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform, LayoutAnimation, UIManager, DeviceEventEmitter, useWindowDimensions } from 'react-native';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler, 
  interpolate, 
  Extrapolation,
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  runOnJS
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';
import JobCardLarge, { Job } from '../components/JobCardLarge';
import JobCardSmall from '../components/JobCardSmall';
import Chip from '../components/Chip';
import GradientButton from '../components/GradientButton';
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
import { useSaved } from '../context/SavedContext';
import { useVacancyContext } from '../context/VacancyContext';
import { getSuggestedVacancies, getCategories, getVacancies } from '../services/vacancyService';
import { Vacancy, Category } from '../types/vacancy';
import { getBannerClosed, setBannerClosed } from '../utils/storage';
import { mapVacancyToJob } from '../utils/mapVacancyToJob';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function HomeScreen() {
  const { colors, spacing, typography, toggleScheme } = useTheme();
  const { t } = useI18n();
  const { studentProfile, fetchStudentProfile, userToken } = useAuth();
  const { isFeedOutdated, markFeedAsUpdated } = useVacancyContext();
  const savedCtx = useSaved();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.85; // 75% del ancho de la pantalla para ver la siguiente
  
  // Ref para Scroll To Top
  const listRef = useRef<FlashList<Job> | null>(null);
  useScrollToTop(listRef);

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
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [showBanner, setShowBanner] = useState(false); // Default hidden until check

  // Cache state
  type CacheEntry = {
    data: Job[];
    page: number;
    hasMore: boolean;
  };
  const [vacanciesCache, setVacanciesCache] = useState<Record<string, CacheEntry>>({});
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

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
    checkBannerStatus();
  }, []);

  const checkBannerStatus = async () => {
    const closed = await getBannerClosed();
    setShowBanner(!closed);
  };

  const loadInitialData = async () => {
    if (!userToken) return;
    setLoading(true);
    
    try {
      const promises = [
        fetchStudentProfile(),
        fetchSuggested(),
        fetchCategories()
      ];
      
      // Removed fetchRecent from here to avoid double fetching
      // It will be triggered by the useEffect once we determine the category
      
      await Promise.all(promises);
      setInitialSetupDone(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLoading(false); // Only stop loading on error, otherwise wait for fetchRecent
    }
  };

  const fetchSuggested = async () => {
    if (!userToken) return;
    try {
      const res = await getSuggestedVacancies(userToken);
      const jobs = res.data.map(mapVacancyToJob);
      setSuggested(jobs);
      savedCtx?.mergeSaved(jobs);
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
      
      const newJobs = res.data.map(mapVacancyToJob);
      savedCtx?.mergeSaved(newJobs);
      const hasNextPage = !!res.links.next;
      
      let updatedList: Job[] = [];

      if (pageNum === 1) {
        updatedList = newJobs;
        setRecent(newJobs);
      } else {
        setRecent(prev => {
          const existingIds = new Set(prev.map(job => job.id));
          const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
          updatedList = [...prev, ...uniqueNewJobs];
          return updatedList;
        });
      }
      
      setHasMore(hasNextPage);

      // Update cache if no search
      if (!search) {
        const cacheKey = catId === null ? 'all' : catId.toString();
        // We need to use the updated list for cache. 
        // If pageNum > 1, we need the previous state + new jobs.
        // Since setRecent is async, we can't rely on 'recent' state immediately here if we just set it.
        // However, inside the setRecent callback we have the correct list.
        // To simplify, we can just update the cache with what we know.
        
        // If pageNum === 1, updatedList is newJobs.
        // If pageNum > 1, we need to reconstruct the list or use a functional update for cache too?
        // Better approach: Use functional update for cache to ensure consistency
        
        setVacanciesCache(prevCache => {
          const currentCache = prevCache[cacheKey];
          let cachedList = pageNum === 1 ? [] : (currentCache?.data || []);
          
          if (pageNum > 1) {
             const existingIds = new Set(cachedList.map(job => job.id));
             const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
             cachedList = [...cachedList, ...uniqueNewJobs];
          } else {
             cachedList = newJobs;
          }

          return {
            ...prevCache,
            [cacheKey]: {
              data: cachedList,
              page: pageNum,
              hasMore: hasNextPage
            }
          };
        });
      }

    } catch (error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      setIsCategoryLoading(false);
    }
  };

  // Auto-select category based on career
  useEffect(() => {
    if (!initialSetupDone) return;
    if (autoSelected) return;

    const performInitialFetch = async () => {
      let targetCatId: number | null = null;

      if (studentProfile?.academic_info?.career && categoriesList.length > 0) {
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
          targetCatId = matchedCategory.id;
        } else {
          console.log('No matching category found for career:', careerName);
        }
      }

      setActiveCatId(targetCatId);
      // We don't need to setPage(1) as it's default
      await fetchRecent(1, searchText, targetCatId);
      setAutoSelected(true);
      setLoading(false);
    };

    performInitialFetch();
  }, [initialSetupDone, studentProfile, categoriesList, autoSelected]);

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
    // Si refrescamos manualmente, también limpiamos la notificación de "Nuevas Vacantes"
    markFeedAsUpdated();
    setRefreshing(true);
    setPage(1);
    
    try {
      const promises = [
        fetchStudentProfile(),
        fetchSuggested(),
        fetchCategories(),
        fetchRecent(1, searchText, activeCatId)
      ];
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userToken, activeCatId, searchText]);

  const handlePillPress = useCallback(() => {
    markFeedAsUpdated();
    
    // Scroll al inicio suavemente
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

    // Si tenemos una categoría de carrera detectada y no estamos en ella, vamos allá
    if (careerCategory && activeCatId !== careerCategory.id) {
        // Lógica manual de cambio de categoría para asegurar refresh fresco (sin caché)
        setActiveCatId(careerCategory.id);
        
        // Animaciones (valores hardcodeados 0 y 70 para evitar problemas de hoisting si las const están definidas abajo)
        scrollY.value = 0;
        expandY.value = 70; // AVATAR_SECTION_HEIGHT

        setPage(1);
        setRecent([]); // Limpiar para feedback visual de carga
        setIsCategoryLoading(true);
        
        // Fetch directo ignorando caché
        fetchRecent(1, searchText, careerCategory.id);
    } else {
        // Comportamiento normal si ya estamos en la categoría correcta o no hay carrera
        onRefresh();
    }
  }, [markFeedAsUpdated, onRefresh, careerCategory, activeCatId, searchText]);

  const handleCategoryPress = (catId: number | null) => {
    if (activeCatId === catId) return;
    
    // Reset header animation
    scrollY.value = 0;
    expandY.value = AVATAR_SECTION_HEIGHT;
    
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Eliminamos LayoutAnimation para usar Reanimated
    setActiveCatId(catId);

    const cacheKey = catId === null ? 'all' : catId.toString();
    const cachedData = vacanciesCache[cacheKey];

    // Optimistic update from cache
    if (!searchText && cachedData) {
      setRecent(cachedData.data);
      setPage(cachedData.page);
      setHasMore(cachedData.hasMore);
      setIsCategoryLoading(false);
    } else {
      setPage(1);
      setRecent([]);
      setIsCategoryLoading(true);
      fetchRecent(1, searchText, catId);
    }
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
  // Alturas estimadas para la animación
  // Avatar Row: ~48px height + margins. Vamos a animar un contenedor de ~70px a 0.
  const AVATAR_SECTION_HEIGHT = 70;
  
  const scrollY = useSharedValue(0);
  const expandY = useSharedValue(AVATAR_SECTION_HEIGHT);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event, ctx: { prevY?: number }) => {
      const currentY = event.contentOffset.y;
      const prevY = ctx.prevY ?? 0;
      const diff = currentY - prevY;

      if (currentY < 0) {
        expandY.value = AVATAR_SECTION_HEIGHT;
      } else {
        let newHeight = expandY.value - diff;
        if (newHeight < 0) newHeight = 0;
        if (newHeight > AVATAR_SECTION_HEIGHT) newHeight = AVATAR_SECTION_HEIGHT;
        expandY.value = newHeight;
      }
      
      scrollY.value = currentY;
      ctx.prevY = currentY;
    },
    onBeginDrag: (event, ctx: { prevY?: number }) => {
      ctx.prevY = event.contentOffset.y;
    }
  });
  
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const height = expandY.value;
    const opacity = interpolate(height, [AVATAR_SECTION_HEIGHT * 0.4, AVATAR_SECTION_HEIGHT], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(height, [0, AVATAR_SECTION_HEIGHT], [-20, 0], Extrapolation.CLAMP);
    
    return {
      height,
      opacity,
      transform: [{ translateY }],
      overflow: 'hidden',
    };
  });

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: expandY.value }],
    };
  });

  const headerContainerAnimatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(expandY.value, [0, AVATAR_SECTION_HEIGHT], [25, 30], Extrapolation.CLAMP);
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

  // Escuchar evento de tab press para refrescar y hacer scroll top
  const lastRefreshTimeRef = useRef<number>(0);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('event.homeTabPressed', () => {
      if (!navigation.isFocused()) return;

      // Siempre hacemos scroll al inicio
      listRef.current?.scrollToOffset({ offset: 0, animated: true });

      // Solo refrescamos si hay vacantes nuevas (pill activa)
      if (isFeedOutdated) {
        const now = Date.now();
        if (!refreshing && (now - lastRefreshTimeRef.current > 2000)) {
          lastRefreshTimeRef.current = now;
          onRefresh();
        }
      }
    });

    return () => subscription.remove();
  }, [navigation, onRefresh, refreshing, isFeedOutdated]); // Dependencias actualizadas



  const renderItem = useCallback(({ item, index }: { item: Job, index: number }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <JobCardSmall 
        job={item} 
        style={{ marginHorizontal: spacing(2) }} 
      />
    </Animated.View>
  ), [spacing]);

  const keyExtractor = useCallback((item: Job) => item.id, []);

  // Eliminamos getItemLayout porque las tarjetas tienen altura variable (texto dinámico)
  // y una altura fija incorrecta causa saltos visuales ("pop") y espacios en blanco.



  const ListHeader = useMemo(() => (
    <View style={{ paddingTop: spacing(2) }}>
      {/* Widget de Progreso del Perfil */}
      {studentProfile && !studentProfile.has_cv && showBanner && (
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
          elevation: 3,
          position: 'relative'
        }}>
          <TouchableOpacity 
            onPress={() => {
              setShowBanner(false);
              setBannerClosed(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute',
              top: spacing(1),
              right: spacing(1),
              zIndex: 10,
              padding: 4,
            }}
          >
            <Feather name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing(2) }}>
            <View style={{ flex: 1, paddingRight: spacing(1) }}>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
                ¡Impulsa tu carrera! 🚀
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 20 }}>
                Sube tu CV para <Text style={{ fontWeight: '700', color: colors.primary }}>activar tu visibilidad</Text> ante las empresas.
              </Text>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', marginTop: spacing(2) }}>
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

          <GradientButton 
            title="Finalizar mi perfil ahora"
            onPress={() => navigation.navigate('Onboarding', { screen: 'CVStart' })}
          />
        </View>
      )}

      {/* Suggested */}
      {suggested.length > 0 && careerCategory && activeCatId === careerCategory.id && (
        <View style={{ marginBottom: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing(2) }}>
            <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{t('home.suggested')}</Text>
            {suggested.length > 1 && (
            <TouchableOpacity onPress={() => navigation.navigate('SuggestedJobs', { jobs: suggested })}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
            )}
          </View>
          {suggested.length === 1 ? (
             <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1.5), paddingBottom: spacing(1.5) }}>
                <JobCardLarge job={suggested[0]} showBookmark={false} style={{ width: '100%' }} />
             </View>
          ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing(1.5), overflow: 'visible' }}
            contentContainerStyle={{ paddingLeft: spacing(2), paddingRight: spacing(2), paddingBottom: spacing(1.5) }}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + spacing(2)} // Ancho dinámico + margen
            snapToAlignment="start" // Alineamos al inicio
          >
            {suggested.slice(0, 4).map((job, idx) => (
              <View key={job.id} style={{ marginRight: spacing(2) }}>
                <JobCardLarge job={job} showBookmark={false} style={{ width: CARD_WIDTH }} />
              </View>
            ))}
          </ScrollView>
          )}
        </View>
      )}

      {/* Recent Header Title */}
      <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(1) }}>
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{t('home.recent')}</Text>
      </View>
    </View>
  ), [studentProfile, suggested, colors, spacing, typography, t, navigation, activeCatId, careerCategory, showBanner]);

  if (loading) {
    return <HomeSkeleton />;
  }

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
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="bell" size={18} color="#fff" />
                  {studentProfile?.unread_notifications_count && studentProfile.unread_notifications_count > 0 ? (
                    <View style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      minWidth: 18,
                      height: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: colors.primary
                    }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4 }}>
                        {studentProfile.unread_notifications_count > 99 ? '99+' : studentProfile.unread_notifications_count}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Barra de búsqueda (Siempre visible) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Search')}
              style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(1.5), height: 44 }}
            >
              <Feather name="search" size={18} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, flex: 1, color: colors.textSecondary }}>
                {t('common.searchPlaceholder')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Search', { openFilters: true })}
              style={{ marginLeft: spacing(1), backgroundColor: '#FFD166', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
            >
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
      <AnimatedFlashList
        ref={listRef}
        key={activeCatId ? activeCatId.toString() : 'all'}
        data={recent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={200}
        drawDistance={1000}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isCategoryLoading ? (
            <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
              {[1, 2, 3].map((i) => (
                <Animated.View key={i} entering={FadeIn.duration(300)} style={{ marginBottom: spacing(2) }}>
                  <SkeletonJobCardSmall shimmer={false} active={false} />
                </Animated.View>
              ))}
            </View>
          ) : (
            !loading && !refreshing && (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4), marginTop: spacing(4) }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) }}>
                  <Feather name="inbox" size={40} color={colors.textSecondary} />
                </View>
                <Text style={{ color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700', marginBottom: spacing(1), textAlign: 'center' }}>
                  No hay vacantes disponibles
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md, textAlign: 'center' }}>
                  Intenta ajustar tus filtros o vuelve más tarde para ver nuevas oportunidades.
                </Text>
              </View>
            )
          )
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: CONTENT_PADDING_TOP, paddingBottom: spacing(2) }}
        showsVerticalScrollIndicator={false}
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
      
      {/* Pastilla Notificación Nuevas Vacantes */}
      {isFeedOutdated && (
        <Animated.View 
          entering={FadeIn.duration(400).delay(200)}
          exiting={FadeOut.duration(300)}
          style={[
            {
              position: 'absolute',
              top: Platform.OS === 'ios' ? insets.top + 200 : 200, // Ajustado para estar debajo de los chips (Aprox Header + Chips)
              alignSelf: 'center',
              zIndex: 1000,
            },
            pillAnimatedStyle
          ]}
        >
          <TouchableOpacity
            onPress={handlePillPress}
            activeOpacity={0.8}
            style={{
               backgroundColor: colors.primary,
               paddingHorizontal: 16,
               paddingVertical: 10,
               borderRadius: 24,
               flexDirection: 'row',
               alignItems: 'center',
               shadowColor: "#000",
               shadowOffset: { width: 0, height: 4 },
               shadowOpacity: 0.3,
               shadowRadius: 4.65,
               elevation: 8,
            }}
          >
             <Feather name="arrow-up" size={16} color="#fff" style={{ marginRight: 8 }} />
             <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
               {t('home.newVacancies')}
             </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

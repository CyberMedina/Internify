import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, ActivityIndicator, Modal, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useI18n } from '../i18n/i18n';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getVacancies, getCategories } from '../services/vacancyService';
import { Vacancy, Category } from '../types/vacancy';
import type { Job } from '../components/JobCardLarge';
import Skeleton from '../components/Skeleton';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRecentSearches, addRecentSearch, removeRecentSearch, getRecentlyViewed, clearRecentlyViewed } from '../utils/storage';
import { useSaved } from '../context/SavedContext';
import Chip from '../components/Chip';
import GradientButton from '../components/GradientButton';
import RangeSlider from '../components/RangeSlider';

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
  postedTime: v.dates?.posted_human,
  isApplied: v.is_applied,
  isSaved: v.is_saved,
  match: v.match_percentage
});

export default function SearchScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { userToken } = useAuth();
  const savedCtx = useSaved();
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Job[]>([]);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'main' | 'location' | 'category'>('main');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    datePosted: '',
    modality: '',
    internshipTypeId: null as number | null,
    minSalary: 0,
    maxSalary: 50000,
    location: '',
    categoryId: null as number | null
  });
  
  const inputRef = useRef<TextInput>(null);

  // Check for openFilters param
  useEffect(() => {
    if ((route.params as any)?.openFilters) {
      setShowFilters(true);
      fetchCategories();
      // Clear param to avoid reopening on focus
      navigation.setParams({ openFilters: undefined });
    }
  }, [route.params]);

  const fetchCategories = async () => {
    if (!userToken || categories.length > 0) return;
    try {
      const res = await getCategories(userToken);
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };


  const handleRemoveSearch = async (text: string) => {
    const updated = await removeRecentSearch(text);
    setRecentSearches(updated);
  };

  // Focus input when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if ((route.params as any)?.openFilters || showFilters) return;
      
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Refresh recently viewed when screen gains focus
      loadStorageData();
      
      return () => clearTimeout(timer);
    }, [route.params, showFilters])
  );

  const loadStorageData = async () => {
    const searches = await getRecentSearches();
    setRecentSearches(searches);
    const viewed = await getRecentlyViewed();
    setRecentlyViewed(viewed);
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      await loadStorageData();
      setInitialLoading(false);
    };
    init();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanText = query.trim();
      const hasFilters = 
        filters.datePosted !== '' ||
        filters.modality !== '' ||
        filters.internshipTypeId !== null ||
        filters.location !== '' ||
        filters.categoryId !== null ||
        filters.minSalary > 0 ||
        filters.maxSalary < 50000;

      if (cleanText || hasFilters) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Save search history with longer delay (quality check)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanText = query.trim().replace(/\s+/g, ' ');
      if (cleanText.length > 2) {
         await addRecentSearch(cleanText);
         const searches = await getRecentSearches();
         setRecentSearches(searches);
      }
    }, 3000); // 3 seconds delay to ensure it's a "quality" search

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchText: string, filtersOverride?: typeof filters) => {
    if (!userToken) return;
    
    const targetFilters = filtersOverride || filters;

    // Limpiar espacios al inicio, final y múltiples espacios intermedios
    const cleanText = searchText.trim().replace(/\s+/g, ' ');
    
    // Strict Active Filters check
    const hasActiveFiltersStrict = 
      targetFilters.datePosted !== '' ||
      targetFilters.modality !== '' ||
      targetFilters.internshipTypeId !== null ||
      targetFilters.location !== '' ||
      targetFilters.categoryId !== null ||
      targetFilters.minSalary > 0 ||
      targetFilters.maxSalary < 50000;
    
    if (!cleanText && !hasActiveFiltersStrict) {
      setLoading(false);
      setResults([]); // Clear results if no query and no filters
      return;
    }

    setLoading(true);
    
    try {
      const res = await getVacancies(userToken, 1, 20, { 
        search: cleanText,
        categoryId: targetFilters.categoryId || undefined,
        internshipTypeId: targetFilters.internshipTypeId || undefined,
        modality: targetFilters.modality || undefined,
        location: targetFilters.location || undefined,
        minSalary: targetFilters.minSalary > 0 ? targetFilters.minSalary : undefined,
        maxSalary: targetFilters.maxSalary < 50000 ? targetFilters.maxSalary : undefined,
        datePosted: targetFilters.datePosted || undefined
      });
      const searchResults = res.data.map(mapVacancyToJob);
      setResults(searchResults);
      savedCtx?.mergeSaved(searchResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    performSearch(query);
  };

  const clearFilters = () => {
    setFilters({
      datePosted: '',
      modality: '',
      internshipTypeId: null,
      minSalary: 0,
      maxSalary: 50000,
      location: '',
      categoryId: null
    });
  };

  const handleRemoveFilter = (updates: Partial<typeof filters>) => {
    setFilters(prev => {
        const next = { ...prev, ...updates };
        performSearch(query, next);
        return next;
    });
  };

  const hasActiveFilters = 
    filters.datePosted !== '' ||
    filters.modality !== '' ||
    filters.internshipTypeId !== null ||
    filters.location !== '' ||
    filters.categoryId !== null ||
    filters.minSalary > 0 ||
    filters.maxSalary < 50000;

  // Helper to render filter sections
  const FilterSection = ({ title, children, valueLabel }: { title: string, children: React.ReactNode, valueLabel?: string }) => (
    <View style={{ marginBottom: spacing(3) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1.5) }}>
        <Text style={{ fontSize: typography.sizes.md, fontWeight: '700', color: colors.text }}>
          {title}
        </Text>
        {valueLabel && (
          <Text style={{ fontSize: typography.sizes.sm, color: colors.primary, fontWeight: '600' }}>
            {valueLabel}
          </Text>
        )}
      </View>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header con Gradiente similar al Home */}
      <LinearGradient
        colors={[colors.primary, '#4338ca']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          paddingTop: insets.top + spacing(1), 
          paddingBottom: spacing(2), 
          paddingHorizontal: spacing(2),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.getParent()?.navigate('HomeTab');
            }}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: spacing(1)
            }}>
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing(1.5), height: 44 }}>
            <Feather name="search" size={18} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              placeholder={t('common.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              style={{ flex: 1, marginLeft: 8, color: colors.text }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="always"
              onSubmitEditing={() => {
                 const cleanText = query.trim().replace(/\s+/g, ' ');
                 if (cleanText.length > 2) {
                    addRecentSearch(cleanText).then(searches => setRecentSearches(searches));
                 }
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                accessibilityLabel="Limpiar búsqueda"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
              >
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Header Filter Button & Count Logic */}
          <TouchableOpacity 
             onPress={() => {
                setShowFilters(true);
                fetchCategories();
             }}
             style={{ 
               marginLeft: spacing(1), 
               backgroundColor: Object.values(filters).some(v => v !== '' && v !== null && v !== 0 && !(v === 50000 && filters.minSalary === 0)) ? colors.primary : '#FFD166', 
               width: 44, 
               height: 44, 
               borderRadius: 12, 
               alignItems: 'center', 
               justifyContent: 'center',
               position: 'relative'
             }}>
            <Feather name="sliders" size={18} color={Object.values(filters).some(v => v !== '' && v !== null && v !== 0 && !(v === 50000 && filters.minSalary === 0)) ? 'white' : colors.text} />
            {/* Filter Badge */}
            {(() => {
                const count = [
                  filters.datePosted !== '',
                  filters.modality !== '',
                  filters.internshipTypeId !== null,
                  filters.location !== '',
                  filters.categoryId !== null,
                  (filters.minSalary > 0 || filters.maxSalary < 50000)
                ].filter(Boolean).length;

                if (count > 0) {
                  return (
                    <View style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.card
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '700', paddingHorizontal: 4 }}>
                        {count}
                      </Text>
                    </View>
                  );
                }
                return null;
            })()}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        entering={FadeInDown.duration(400).springify()}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + spacing(3) }}
        keyboardShouldPersistTaps="handled"
      >
        {initialLoading ? (
          <View style={{ paddingTop: spacing(2) }}>
            {/* Recent Searches Skeleton */}
            <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
              <Skeleton width={'50%'} height={18} shimmer />
              <View style={{ marginTop: spacing(1) }}>
                <Skeleton width={'70%'} height={14} style={{ marginBottom: spacing(1) }} shimmer />
                <Skeleton width={'60%'} height={14} style={{ marginBottom: spacing(1) }} shimmer />
                <Skeleton width={'50%'} height={14} shimmer />
              </View>
            </View>
            {/* Recently Viewed Skeleton */}
            <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
              <Skeleton width={'60%'} height={18} shimmer />
              <View style={{ marginTop: spacing(1) }}>
                <SkeletonJobCardSmall />
                <SkeletonJobCardSmall />
              </View>
            </View>
          </View>
        ) : query.trim() === '' && !hasActiveFilters ? (
          <>
            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && (
              <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{t('search.recentSearches')}</Text>
                <View style={{ marginTop: spacing(1) }}>
                  {recentSearches.map((t) => (
                    <TouchableOpacity 
                      key={t} 
                      onPress={() => setQuery(t)}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(1), borderBottomColor: colors.border, borderBottomWidth: 1 }}
                    >
                      <Text style={{ color: colors.textSecondary }}>{t}</Text>
                      <TouchableOpacity onPress={() => handleRemoveSearch(t)}>
                        <Feather name="x" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Vistos recientemente */}
            {recentlyViewed.length > 0 && (
              <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{t('search.recentlyViewed')}</Text>
                  <TouchableOpacity onPress={async () => {
                    await clearRecentlyViewed();
                    setRecentlyViewed([]);
                  }}>
                    <Text style={{ color: colors.primary, fontSize: 12 }}>Borrar historial</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ marginTop: spacing(1) }}>
                  {recentlyViewed.map((job) => (
                    <JobCardSmall key={job.id} job={job} applicantsLabel="Postulantes" />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={{ flex: 1, marginTop: spacing(1) }}>
            {hasActiveFilters && (
               <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing(2), paddingBottom: spacing(1), gap: 8 }}>
                  {filters.location !== '' && (
                    <TouchableOpacity onPress={() => handleRemoveFilter({ location: '' })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>{filters.location}</Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                  {filters.categoryId !== null && (
                    <TouchableOpacity onPress={() => handleRemoveFilter({ categoryId: null })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>{categories.find(c => c.id === filters.categoryId)?.pseudonym || categories.find(c => c.id === filters.categoryId)?.name || 'Categoría'}</Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                  {filters.modality !== '' && (
                    <TouchableOpacity onPress={() => handleRemoveFilter({ modality: '' })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>{filters.modality === 'R' ? 'Remoto' : filters.modality === 'P' ? 'Presencial' : 'Híbrido'}</Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                  {filters.internshipTypeId !== null && (
                     <TouchableOpacity onPress={() => handleRemoveFilter({ internshipTypeId: null })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>{filters.internshipTypeId === 1 ? 'Familiarización' : filters.internshipTypeId === 2 ? 'Especialización' : 'Profesionalización'}</Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                  {filters.datePosted !== '' && (
                     <TouchableOpacity onPress={() => handleRemoveFilter({ datePosted: '' })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>
                          {filters.datePosted === 'today' ? 'Últimas 24h' : filters.datePosted === '3d' ? 'Últimos 3 días' : filters.datePosted === 'week' ? 'Esta semana' : 'Este mes'}
                       </Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                  {(filters.minSalary > 0 || filters.maxSalary < 50000) && (
                     <TouchableOpacity onPress={() => handleRemoveFilter({ minSalary: 0, maxSalary: 50000 })} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                       <Text style={{ color: 'white', marginRight: 4, fontWeight: '600', fontSize: 13 }}>{`C$${filters.minSalary} - C$${filters.maxSalary}`}</Text>
                       <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  )}
               </View>
            )}
            <View style={{ flex: 1, paddingHorizontal: spacing(2) }}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : results.length > 0 ? (
                <>
                  <Text style={{ color: colors.textSecondary, marginBottom: spacing(1) }}>
                    {results.length} resultados encontrados
                  </Text>
                  {results.map((job) => (
                    <JobCardSmall key={job.id} job={job} applicantsLabel="Postulantes" />
                  ))}
                </>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4), paddingBottom: spacing(10) }}>
                  <View style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    backgroundColor: colors.border, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: spacing(2),
                    opacity: 0.5
                  }}>
                    <Feather name="search" size={40} color={colors.textSecondary} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing(1) }}>
                    No encontramos nada
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                    Intenta ajustar los filtros o buscar con otras palabras clave que sean más generales.
                  </Text>
                  
                  {hasActiveFilters && (
                    <TouchableOpacity 
                      onPress={clearFilters}
                      style={{ marginTop: spacing(3) }}
                    >
                      <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>
                        Limpiar filtros
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
          </View>
         </View>
        )}
      </Animated.ScrollView>

      <Modal
          animationType="slide"
          transparent={true}
          visible={showFilters}
          onRequestClose={() => {
             if (selectionMode !== 'main') setSelectionMode('main');
             else setShowFilters(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ 
              backgroundColor: colors.card, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              height: '92%',
              paddingTop: spacing(2)
            }}>
              {/* Modal Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingHorizontal: spacing(2),
                borderBottomWidth: 1, 
                borderBottomColor: colors.border,
                position: 'relative',
                height: 56
              }}>
                <View style={{ zIndex: 10 }}>
                  {selectionMode !== 'main' ? (
                    <TouchableOpacity onPress={() => setSelectionMode('main')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Feather name="x" size={24} color={colors.text} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Centered Title */}
                <View style={{ 
                  position: 'absolute', 
                  top: 0, 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  pointerEvents: 'none' 
                }}>
                  <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>
                    {selectionMode === 'location' ? 'Seleccionar Ubicación' : 
                      selectionMode === 'category' ? 'Seleccionar Área' : 'Filtros'}
                  </Text>
                </View>

                <View style={{ marginLeft: 'auto', zIndex: 10 }}>
                  {selectionMode === 'main' ? (
                    <TouchableOpacity 
                      onPress={clearFilters}
                      disabled={Object.values(filters).every(v => v === '' || v === null || v === 0 || (v === 50000 && filters.minSalary === 0))} 
                    >
                      <Text style={{ 
                        color: Object.values(filters).every(v => v === '' || v === null || v === 0 || (v === 50000 && filters.minSalary === 0)) ? colors.textSecondary : colors.primary, 
                        fontSize: typography.sizes.md,
                        fontWeight: '600',
                        opacity: Object.values(filters).every(v => v === '' || v === null || v === 0 || (v === 50000 && filters.minSalary === 0)) ? 0.5 : 1
                      }}>
                        Borrar todo
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 24 }} />
                  )}
                </View>
              </View>

              {selectionMode === 'location' ? (
                /* Location Selection View */
                <View style={{ flex: 1 }}>
                   <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
                      <TouchableOpacity 
                        style={{ 
                          paddingVertical: spacing(2), 
                          borderBottomWidth: 1, 
                          borderBottomColor: colors.border,
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}
                        onPress={() => {
                          setFilters(prev => ({ ...prev, location: '' }));
                          setSelectionMode('main');
                        }}
                      >
                         <Text style={{ fontSize: 16, color: colors.text, fontWeight: filters.location === '' ? '700' : '400' }}>Todo el país</Text>
                         {filters.location === '' && <Feather name="check" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                      {[
                        "Managua", "León", "Masaya", "Granada", "Carazo", "Estelí", "Matagalpa", 
                        "Chinandega", "Rivas", "Jinotega", "Madriz", "Nueva Segovia", "Boaco", 
                        "Chontales", "Río San Juan", "RACCN", "RACCS"
                      ].map(dept => (
                        <TouchableOpacity 
                          key={dept}
                          style={{ 
                            paddingVertical: spacing(2), 
                            borderBottomWidth: 1, 
                            borderBottomColor: colors.border,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                          }}
                          onPress={() => {
                            setFilters(prev => ({ ...prev, location: dept }));
                            setSelectionMode('main');
                          }}
                        >
                           <Text style={{ fontSize: 16, color: colors.text, fontWeight: filters.location === dept ? '700' : '400' }}>{dept}</Text>
                           {filters.location === dept && <Feather name="check" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                      ))}
                   </ScrollView>
                </View>
              ) : selectionMode === 'category' ? (
                /* Category Selection View */
                <View style={{ flex: 1 }}>
                   <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
                      <TouchableOpacity 
                        style={{ 
                          paddingVertical: spacing(2), 
                          borderBottomWidth: 1, 
                          borderBottomColor: colors.border,
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}
                        onPress={() => {
                          setFilters(prev => ({ ...prev, categoryId: null }));
                          setSelectionMode('main');
                        }}
                      >
                         <Text style={{ fontSize: 16, color: colors.text, fontWeight: filters.categoryId === null ? '700' : '400' }}>Todas</Text>
                         {filters.categoryId === null && <Feather name="check" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                      {categories.map(cat => (
                        <TouchableOpacity 
                          key={cat.id}
                          style={{ 
                            paddingVertical: spacing(2), 
                            borderBottomWidth: 1, 
                            borderBottomColor: colors.border,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                          }}
                          onPress={() => {
                            setFilters(prev => ({ ...prev, categoryId: cat.id }));
                            setSelectionMode('main');
                          }}
                        >
                           <Text style={{ fontSize: 16, color: colors.text, fontWeight: filters.categoryId === cat.id ? '700' : '400' }}>
                             {cat.pseudonym || cat.name}
                           </Text>
                           {filters.categoryId === cat.id && <Feather name="check" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                      ))}
                   </ScrollView>
                </View>
              ) : (
                /* Main Filters View */
                <ScrollView contentContainerStyle={{ padding: spacing(2), paddingBottom: 100 }}>
                  
                  {/* Ubicación (New Style) */}
                  <FilterSection title="Ubicación">
                    <TouchableOpacity 
                      onPress={() => setSelectionMode('location')}
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: 12,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Feather name="map-pin" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                         <Text style={{ color: filters.location ? colors.text : colors.textSecondary, fontSize: 16 }}>
                            {filters.location || "Todo el país"}
                         </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </FilterSection>

                  {/* Categoría (Select Style) */}
                  <FilterSection title="Área de interés">
                    <TouchableOpacity 
                      onPress={() => setSelectionMode('category')}
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: 12,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Feather name="briefcase" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                         <Text style={{ color: filters.categoryId ? colors.text : colors.textSecondary, fontSize: 16 }}>
                            {categories.find(c => c.id === filters.categoryId)?.pseudonym || categories.find(c => c.id === filters.categoryId)?.name || "Todas"}
                         </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </FilterSection>

                  {/* Modalidad (Segmented Control) */}
                  <FilterSection title="Modalidad">
                    <View style={{ 
                      flexDirection: 'row', 
                      backgroundColor: colors.border, 
                      borderRadius: 12, 
                      padding: 4 
                    }}>
                      {[ 
                        { label: 'Todas', value: '' }, // Added explicit "Todas" as segment per design suggestion
                        { label: 'Presencial', value: 'P' },
                         { label: 'Híbrido', value: 'H' },
                        { label: 'Remoto', value: 'R' },
                      ].map((opt) => {
                         const isActive = filters.modality === opt.value;
                         return (
                          <TouchableOpacity 
                             key={opt.label}
                             onPress={() => setFilters(prev => ({ ...prev, modality: opt.value }))}
                             style={{ 
                               flex: 1, 
                               paddingVertical: 10, 
                               alignItems: 'center', 
                               borderRadius: 8,
                               backgroundColor: isActive ? colors.card : 'transparent',
                               shadowColor: isActive ? '#000' : 'transparent',
                               shadowOffset: { width: 0, height: 1 },
                               shadowOpacity: isActive ? 0.1 : 0,
                               shadowRadius: 1,
                               elevation: isActive ? 2 : 0
                             }}
                          >
                             <Text style={{ 
                               fontWeight: isActive ? '700' : '500', 
                               color: isActive ? colors.primary : colors.textSecondary 
                             }}>
                               {opt.label}
                             </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </FilterSection>

                  {/* Rango Salarial (Enhanced) */}
                  <FilterSection 
                     title="Expectativa salarial (mensual)" 
                     valueLabel={`C$ ${filters.minSalary.toLocaleString()} - C$ ${filters.maxSalary.toLocaleString()}${filters.maxSalary >= 50000 ? '+' : ''}`}
                  >
                    <View style={{ paddingHorizontal: spacing(1), marginTop: 10 }}>
                      <RangeSlider 
                        min={0} 
                        max={50000} 
                        step={1000}
                        initialMin={filters.minSalary}
                        initialMax={filters.maxSalary}
                        onValuesChange={(min, max) => {
                          setFilters(prev => ({ ...prev, minSalary: min, maxSalary: max }));
                        }}
                      />
                    </View>
                  </FilterSection>

                </ScrollView>
              )}

              <View style={{ 
                padding: spacing(2), 
                borderTopWidth: 1, 
                borderTopColor: colors.border,
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + spacing(2)
              }}>
                <GradientButton title="Aplicar Filtros" onPress={applyFilters} />
              </View>
            </View>
          </View>
      </Modal>

    </View>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useI18n } from '../i18n/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getVacancies } from '../services/vacancyService';
import { Vacancy } from '../types/vacancy';
import type { Job } from '../components/JobCardLarge';
import Skeleton from '../components/Skeleton';
import SkeletonJobCardSmall from '../components/skeletons/SkeletonJobCardSmall';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRecentSearches, addRecentSearch, removeRecentSearch, getRecentlyViewed, clearRecentlyViewed } from '../utils/storage';

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

export default function SearchScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const { userToken } = useAuth();
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Job[]>([]);
  
  const inputRef = useRef<TextInput>(null);

  const handleRemoveSearch = async (text: string) => {
    const updated = await removeRecentSearch(text);
    setRecentSearches(updated);
  };

  // Focus input when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Refresh recently viewed when screen gains focus
      loadStorageData();
      
      return () => clearTimeout(timer);
    }, [])
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
      if (query.trim()) {
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

  const performSearch = async (searchText: string) => {
    if (!userToken) return;
    
    // Limpiar espacios al inicio, final y múltiples espacios intermedios
    const cleanText = searchText.trim().replace(/\s+/g, ' ');
    
    if (!cleanText) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const res = await getVacancies(userToken, 1, 20, { search: cleanText });
      setResults(res.data.map(mapVacancyToJob));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              else navigation.getParent()?.navigate(t('tabs.home'));
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
            <Feather name="arrow-left" size={20} color="#FFF" />
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

          <TouchableOpacity style={{ marginLeft: spacing(1), backgroundColor: '#FFD166', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="sliders" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        entering={FadeInDown.duration(400).springify()}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing(3) }}
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
        ) : query.trim() === '' ? (
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
          <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(1) }}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <>
                <Text style={{ color: colors.textSecondary, marginBottom: spacing(1) }}>
                  {results.length} resultados encontrados
                </Text>
                {results.map((job) => (
                  <JobCardSmall key={job.id} job={job} applicantsLabel="Postulantes" />
                ))}
              </>
            )}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

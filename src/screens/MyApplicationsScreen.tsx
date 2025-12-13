import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import { Application, ApplicationStatus } from '../types/vacancy';
import { getMyApplications } from '../services/vacancyService';
import { useAuth } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import { formatDate } from '../utils/stringUtils';

export default function MyApplicationsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { userToken } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      if (userToken) {
        const data = await getMyApplications(userToken);
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return { bg: '#E7F7EF', text: '#1E8E5A', label: 'Aceptada' };
      case 'rejected':
        return { bg: '#FDEBED', text: '#E23E57', label: 'Rechazada' };
      case 'reviewed':
        return { bg: '#E8EDFF', text: '#3C5BFF', label: 'CV Visto' };
      case 'pending':
      default:
        return { bg: '#FFF6E5', text: '#D99000', label: 'Pendiente' };
    }
  };

  const renderItem = ({ item }: { item: Application }) => {
    const s = getStatusConfig(item.status);
    const logoLetter = item.vacancy.company.name.charAt(0).toUpperCase();
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ApplicationStatus', { application: item })}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(1.5),
          marginHorizontal: spacing(2),
          marginBottom: spacing(1.5),
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: logo + title/company */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: spacing(1) }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: colors.primary, // Using primary color for now, or could be random
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing(1),
                overflow: 'hidden',
              }}
            >
               {item.vacancy.company.logo ? (
                <Image 
                  source={{ uri: item.vacancy.company.logo }} 
                  style={{ width: '100%', height: '100%' }} 
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 20 }}>{logoLetter}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{item.vacancy.title}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{item.vacancy.company.name}</Text>
            </View>
          </View>
          {/* Status badge */}
          <View style={{ paddingHorizontal: 10, height: 26, borderRadius: 14, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: s.text, fontWeight: '700', fontSize: typography.sizes.xs }}>{s.label}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
          <Feather name="map-pin" size={14} color={colors.primary} />
          <Text style={{ marginLeft: 6, color: colors.textSecondary }}>{item.vacancy.location}</Text>
        </View>
        
        {/* Date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Feather name="calendar" size={14} color={colors.textSecondary} />
          <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>
            Aplicado el {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <TouchableOpacity 
          onPress={() => (navigation as any).goBack()} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.surface, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          {t('applications.title')}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: colors.textSecondary }}>No tienes postulaciones aún.</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

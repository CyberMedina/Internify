import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../components/ScreenContainer';
import { useTheme } from '../theme/ThemeContext';
import { Application, TimelineEvent, ApplicationStatus, ApplicationHistory } from '../types/vacancy';
import { getApplicationDetail } from '../services/vacancyService';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/stringUtils';
import { extractDominantColor } from '../utils/colorUtils';
import { getInitials } from '../utils/stringUtils';

type ParamList = {
  ApplicationStatus: {
    application: Application;
    from?: 'JobDetail' | 'MyApplications';
  };
};

const ApplicationStatusScreen = () => {
  const { colors, typography, spacing, radius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ApplicationStatus'>>();
  const { application: initialApplication, from } = route.params;
  const insets = useSafeAreaInsets();
  const { userToken } = useAuth();

  const [application, setApplication] = useState<Application>(initialApplication);
  const [loading, setLoading] = useState(!initialApplication.history);
  const [bannerColor, setBannerColor] = useState<string>(colors.primary);

  useEffect(() => {
     const fetchColor = async () => {
        // Priority: company_photo on vacancy level (full URL) -> company logo/photo
        let logo = (application.vacancy as any).company_photo || 
                     application.vacancy.company.logo || 
                     application.vacancy.company.photo || 
                     application.vacancy.company.user_detail?.pf_photo;
        
        const color = await extractDominantColor(logo, colors.primary);
        setBannerColor(color);
     };
     fetchColor();
  }, [application.vacancy]);

  useEffect(() => {
    const sortHistory = (history: ApplicationHistory[]) => {
      // Sort desc by date
      return [...history].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    };

    const fetchDetail = async () => {
      if (!userToken) return;
      try {
        const detail = await getApplicationDetail(userToken, initialApplication.id);
        const detailAny = detail as any;
        if (detailAny.history) {
            setApplication({ ...detail, history: sortHistory(detailAny.history) });
        } else {
            setApplication(detail);
        }
      } catch (error) {
        console.error('Failed to fetch application detail', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialApplication.history) {
      fetchDetail();
    } else {
        setApplication(prev => ({
            ...prev,
            history: sortHistory(prev.history || [])
        }));
        setLoading(false);
    }
  }, [initialApplication.id, userToken]);


  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'reviewed':
        return '#2196F3'; // Blue
      case 'pending':
      default:
        return '#FF9800'; // Orange
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'reviewed':
        return 'eye';
      case 'pending':
      default:
        return 'time';
    }
  };

  const getStatusTitle = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'Aceptado';
      case 'rejected':
        return 'Rechazado';
      case 'reviewed':
        return 'CV Visto';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  const handleBack = () => {
      navigation.goBack();
  };

  const renderHistoryItem = (item: ApplicationHistory, index: number, total: number) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    
    let iconName: any = 'radio-button-off';
    let iconSize = 12;
    let iconColor = colors.textSecondary;
    let dotColor = colors.surface;
    let borderColor = colors.border;

    if (isFirst) {
        iconName = getStatusIcon(application.status);
        iconSize = 18;
        iconColor = '#FFF';
        dotColor = getStatusColor(application.status);
        borderColor = getStatusColor(application.status);
    }

    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          {/* Upper Line */}
          <View style={[
            styles.timelineLineSegment, 
            { backgroundColor: index === 0 ? 'transparent' : colors.border, flex: 1, minHeight: 16 } 
          ]} />
          
          {/* Dot/Icon */}
          <View style={[
            styles.timelineDotContainer,
            { 
               backgroundColor: dotColor,
               borderColor: borderColor,
               width: isFirst ? 32 : 16,
               height: isFirst ? 32 : 16,
               borderRadius: isFirst ? 16 : 8,
               borderWidth: isFirst ? 0 : 2
            }
          ]}>
            {isFirst && (
                <Ionicons 
                name={iconName} 
                size={iconSize} 
                color={iconColor} 
                />
            )}
          </View>
          
          {/* Lower Line */}
          <View style={[
            styles.timelineLineSegment, 
            { backgroundColor: isLast ? 'transparent' : colors.border, flex: 1 }
          ]} />
        </View>

        <View style={[
          styles.timelineContent,
          { paddingBottom: isLast ? 0 : 32, paddingTop: isFirst ? 4 : 0 }
        ]}>
            <Text style={[typography.subtitle2, { color: colors.text, marginBottom: 4, fontWeight: isFirst ? '700' : '600', fontSize: isFirst ? 16 : 14 }]}>
                {item.title}
            </Text>
            <Text style={[typography.body2, { color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }]}>
                {item.description}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="clock" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {formatDateTime(item.created_at)}
                </Text>
            </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[
          typography.h6, 
          { 
            color: colors.text, 
            flex: 1, 
            textAlign: 'center', 
            marginRight: 40,
            fontSize: 18, 
            fontWeight: '700',
          }
        ]}>
          Estado del proceso
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Status Card */}
        <View style={styles.mainCardContainer}>
            {/* Banner Section */}
            <View style={[styles.cardBanner, { backgroundColor: bannerColor }]}>
                <View style={styles.companyInfoRow}>
                    <View style={styles.logoContainer}>
                        {(application.vacancy as any).company_photo || application.vacancy.company.logo || application.vacancy.company.photo || application.vacancy.company.user_detail?.pf_photo ? (
                            <Image 
                                source={{ uri: (application.vacancy as any).company_photo || application.vacancy.company.logo || application.vacancy.company.photo || application.vacancy.company.user_detail?.pf_photo }} 
                                style={styles.logoImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.logoText}>
                                {getInitials(application.vacancy.company.name)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.companyTexts}>
                        <Text style={styles.vacancyTitle} numberOfLines={2}>
                            {application.vacancy.title}
                        </Text>
                        <Text style={styles.companyName} numberOfLines={1}>
                            {application.vacancy.company.name}
                        </Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={[typography.h6, { marginBottom: spacing.lg, color: colors.text, paddingLeft: 8 }]}>
            Historial
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            application.history?.length ? (
               application.history.map((item, index) => 
                  renderHistoryItem(item, index, application.history!.length)
                )
            ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>No hay historial disponible.</Text>
                </View>
            )
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardBanner: {
    padding: 24,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  logoText: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  companyTexts: {
    flex: 1,
  },
  vacancyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  timelineContainer: {
    paddingHorizontal: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  timelineLineSegment: {
      width: 2,
  },
  timelineDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    marginBottom: 4,
  },
});

export default ApplicationStatusScreen;

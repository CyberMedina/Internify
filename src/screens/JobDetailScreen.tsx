import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, Image, Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import SocialShare from 'react-native-share';
import { getColors } from 'react-native-image-colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Chip from '../components/Chip';
import type { Job } from '../components/JobCardLarge';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/i18n';
import { currentUser } from '../mock/user';
import { Alert } from 'react-native';
import { getVacancyDetail, applyToVacancy, getMyApplications } from '../services/vacancyService';
import { Vacancy, Application, ApplicationStatus } from '../types/vacancy';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { useApplications } from '../context/ApplicationsContext';
import JobDetailSkeleton from './JobDetailSkeleton';
import { getInitials } from '../utils/stringUtils';
import * as LocalAuthentication from 'expo-local-authentication';
import { addRecentlyViewed } from '../utils/storage';
import GradientButton from '../components/GradientButton';
import BookmarkButton from '../components/BookmarkButton';

export default function JobDetailScreen() {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute() as any;
  const job: Job = route.params?.job;
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { userToken, studentProfile } = useAuth();
  const savedCtx = useSaved();
  const applicationsCtx = useApplications();
  const isSaved = savedCtx?.isSaved(job?.id || '') ?? false;
  const isSaveProcessing = savedCtx?.isProcessing(job?.id || '') ?? false;
  const [tab, setTab] = React.useState<'about' | 'company'>('about');

  const [submitting, setSubmitting] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(false);
  const [showCVModal, setShowCVModal] = React.useState(false);

  const [vacancy, setVacancy] = React.useState<Vacancy | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sharing, setSharing] = React.useState(false);
  const isSharing = React.useRef(false);
  const [dominantColor, setDominantColor] = React.useState<string>(colors.primary);

  React.useEffect(() => {
    if (job) {
      addRecentlyViewed(job);
    }
  }, [job]);

  React.useEffect(() => {
    const fetchDetail = async () => {
      if (!job?.id || !userToken) return;
      try {
        setLoading(true);
        const id = parseInt(job.id, 10);
        if (!isNaN(id)) {
          const res = await getVacancyDetail(userToken, id);
          setVacancy(res.data);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo cargar el detalle');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [job?.id, userToken]);

  const companyLogo = vacancy?.company?.logo ?? vacancy?.company?.photo ?? job?.companyLogo;

  React.useEffect(() => {
    const fetchColors = async () => {
      if (companyLogo) {
        try {
          const result = await getColors(companyLogo, {
            fallback: '#E6232C',
            cache: true,
            key: companyLogo,
          });
          
          if (Platform.OS === 'android') {
            // @ts-ignore
            setDominantColor(result.dominant || result.vibrant || '#E6232C');
          } else {
            // @ts-ignore
            setDominantColor(result.primary || '#E6232C');
          }
        } catch (e) {
          console.log('Error extracting colors', e);
          setDominantColor(colors.primary);
        }
      } else {
        setDominantColor(colors.primary);
      }
    };
    
    fetchColors();
  }, [companyLogo, colors.primary]);

  if (loading && !vacancy) {
    return <JobDetailSkeleton />;
  }

  const data = {
    title: vacancy?.title ?? job?.title ?? 'Cargando...',
    company: vacancy?.company?.name ?? job?.company ?? '',
    location: vacancy?.location ?? job?.location ?? '',
    salary: vacancy?.salary_range ? `C$${vacancy.salary_range}` : (job?.salary ?? ''),
    modality: vacancy?.modality?.label ?? job?.tags?.[1] ?? 'N/A',
    category: vacancy?.category?.name ?? vacancy?.categories?.[0] ?? job?.tags?.[0] ?? 'General',
    level: vacancy?.areas?.[0] ?? job?.tags?.[2] ?? 'Pasantía',
    description: vacancy?.description,
    requirements: vacancy?.requirements ?? [],
    applicants: vacancy?.applicants_count ?? job?.applicants ?? 0,
    companyLogo: vacancy?.company?.logo ?? vacancy?.company?.photo ?? job?.companyLogo,
    companyDescription: vacancy?.company?.description,
    hasApplied: vacancy?.application?.has_applied ?? false,
    applicationStatus: vacancy?.application?.status,
    canApply: vacancy?.application?.can_apply ?? true,
    rejectionReason: vacancy?.application?.rejection_reason,
    postedHuman: vacancy?.dates?.posted_human
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#F59E0B'; // Amber
      case 'accepted': return '#10B981'; // Green
      case 'rejected': return '#EF4444'; // Red
      case 'reviewed': return '#3B82F6'; // Blue
      default: return colors.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'reviewed': return 'CV Visto';
      default: return status || 'Postulado';
    }
  };

  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;
    setSharing(true);
    
    const message = `¡Mira esta vacante de ${data.title} en ${data.company}! \n\nUbicación: ${data.location}\nSalario: ${data.salary}\n\nDescarga la app para aplicar.`;

    try {
      const vacancyId = vacancy?.id || job?.id;

      if (vacancyId) {
        // Endpoint para obtener la imagen generada
        const imageUrl = `https://overfoul-domingo-unharmable.ngrok-free.dev/api/vacancies/${vacancyId}/og-image`;
        // Usar cacheDirectory con timestamp para evitar colisiones y problemas de caché
        const filename = `vacancy-${vacancyId}-${Date.now()}.png`;
        const fileUri = FileSystem.cacheDirectory + filename;

        console.log('Downloading image from:', imageUrl);
        // Descargar la imagen al sistema de archivos local
        const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);
        
        if (downloadRes.status !== 200) {
          console.warn('Failed to download image, status:', downloadRes.status);
          throw new Error('Failed to download image');
        }

        const { uri } = downloadRes;
        console.log('Image downloaded to:', uri);

        // Compartir la imagen descargada usando react-native-share
        // Esto permite compartir imagen + texto en ambas plataformas (especialmente útil para WhatsApp en Android)
        try {
          await SocialShare.open({
            title: `Compartir vacante: ${data.title}`,
            message: message,
            url: uri,
            type: 'image/png',
            failOnCancel: false, // No lanzar error si el usuario cancela
          });
        } catch (shareError) {
          console.log('SocialShare error or cancelled:', shareError);
          // Si falla react-native-share, intentamos con los métodos nativos/expo como fallback
          if (Platform.OS === 'ios') {
            await Share.share({
              url: uri,
              message
            });
          } else if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'image/png',
              dialogTitle: `Compartir vacante: ${data.title}`,
              UTI: 'public.png'
            });
          }
        }
        return;
      }

      // Fallback: compartir solo texto si no se pudo descargar la imagen o no hay ID
      await Share.share({
        message,
        title: `Vacante: ${data.title}`
      });
    } catch (error: any) {
      console.error('Error sharing:', error);
      
      // Si el error es que ya hay un share en proceso, no hacemos nada (el usuario ya está compartiendo)
      if (error?.message && error.message.includes('Another share request is being processed')) {
        return;
      }

      // Fallback en caso de otros errores
      try {
        await Share.share({
          message,
          title: `Vacante: ${data.title}`
        });
      } catch (e) {
        console.error('Error in fallback share:', e);
      }
    } finally {
      isSharing.current = false;
      setSharing(false);
    }
  };

  const bottomPadding = (!data.canApply && !data.hasApplied) ? spacing(26) : spacing(16);

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <LinearGradient
        colors={isDark 
          ? [`${dominantColor}40`, colors.card] 
          : [`${dominantColor}26`, `${dominantColor}00`]
        }
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '35%',
        }}
      />
      {/* Top actions (safe area) */}
      <View style={{ paddingHorizontal: spacing(2), paddingTop: insets.top + spacing(1), paddingBottom: spacing(1), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <BookmarkButton
              isSaved={isSaved}
              isLoading={isSaveProcessing}
              onToggle={() => {
                if (job && savedCtx) {
                  savedCtx.toggle(job);
                }
              }}
              size={18}
              color={dominantColor}
              activeColor={dominantColor}
            />
          </View>
          {data.canApply && (
            <TouchableOpacity 
              onPress={handleShare}
              disabled={sharing}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginLeft: spacing(1), opacity: sharing ? 0.5 : 1 }}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Feather name="share-2" size={18} color={colors.text} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

  <ScreenContainer scroll contentContainerStyle={{ paddingTop: spacing(1), paddingBottom: bottomPadding }}>
        {/* Header Section */}
        <View style={{ paddingHorizontal: spacing(2), paddingTop: spacing(2), paddingBottom: spacing(2) }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ 
              width: 80, height: 80, borderRadius: 40, 
              backgroundColor: colors.surface, 
              alignItems: 'center', justifyContent: 'center', 
              shadowColor: dominantColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              marginBottom: spacing(2)
            }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                {data.companyLogo ? (
                  <Image source={{ uri: data.companyLogo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: dominantColor, fontWeight: '800', fontSize: 32 }}>{getInitials(data.company)}</Text>
                )}
              </View>
            </View>
            
            <Text style={{ 
              marginTop: spacing(1), 
              color: isDark ? '#FFFFFF' : '#1A1A1A', 
              fontWeight: '800', 
              fontSize: typography.sizes.xxl,
              textAlign: 'center'
            }}>{data.title}</Text>
            
            <Text style={{ marginTop: 4, color: colors.textSecondary, fontSize: typography.sizes.md, fontWeight: '600' }}>{data.company}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
              <Feather name="map-pin" size={14} color={dominantColor} />
              <Text style={{ marginLeft: 6, color: colors.textSecondary }}>{data.location}</Text>
            </View>
            {data.postedHuman && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Feather name="clock" size={14} color={colors.textSecondary} fontSize={12} />
                <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>{data.postedHuman}</Text>
              </View>
            )}
          </View>

          {/* Info tiles grid */}
          <View style={{ marginTop: spacing(3), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Salary */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1.5), marginBottom: spacing(1.5), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="dollar-sign" size={14} color={dominantColor} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.salaryMonthly')}</Text>
              </View>
              <Text style={{ marginTop: 6 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{data.salary}</Text>
              </Text>
            </View>

            {/* Tipo de puesto */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1.5), marginBottom: spacing(1.5), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="briefcase" size={14} color={dominantColor} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.jobType')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.category} size="xs" />
              </View>
            </View>

            {/* Modalidad */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1.5), marginBottom: spacing(1.5), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="globe" size={14} color={dominantColor} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.workingModel')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.modality} size="xs" />
              </View>
            </View>

            {/* Nivel */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1.5), marginBottom: spacing(1.5), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="trending-up" size={14} color={dominantColor} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.level')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.level} size="xs" />
              </View>
            </View>
          </View>
        </View>

        {/* Tabs mock */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing(2), borderRadius: 16, paddingHorizontal: spacing(2), paddingBottom: spacing(2), marginTop: spacing(1) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing(2), borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            {(
              [
                { key: 'about', label: 'Acerca de' },
                { key: 'company', label: 'Compañía' },
              ] as const
            ).map(({ key, label }) => (
              <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ paddingVertical: spacing(1) }}>
                <Text style={{ color: tab === key ? colors.text : colors.textSecondary, fontWeight: tab === key ? '700' as any : '600' }}>{label}</Text>
                {tab === key ? (
                  <View style={{ height: 2, backgroundColor: dominantColor, marginTop: 6, borderRadius: 2 }} />
                ) : (
                  <View style={{ height: 2, backgroundColor: 'transparent', marginTop: 6 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'about' && (
            <View style={{ marginTop: spacing(2) }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.aboutThisJob')}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                {data.description || 'Sin descripción disponible.'}
              </Text>
              <View style={{ marginTop: spacing(2) }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Requisitos</Text>
                {data.requirements.length > 0 ? (
                  data.requirements.map((req, index) => (
                    <Text key={index} style={{ color: colors.textSecondary, marginTop: 6 }}>• {req}</Text>
                  ))
                ) : (
                  <Text style={{ color: colors.textSecondary, marginTop: 6 }}>No especificado</Text>
                )}
              </View>
            </View>
          )}

          {tab === 'company' && (
            <View style={{ marginTop: spacing(2) }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.company')}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                {data.companyDescription || 'Sin información de la compañía.'}
              </Text>
            </View>
          )}

          <View style={{ height: spacing(2) }} />
        </View>
      </ScreenContainer>

      {/* Fixed bottom CTA */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(1.5), paddingTop: spacing(1), backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }}>
        {data.hasApplied ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={async () => {
              if (checkingStatus) return;
              
              const navigateToStatus = (app: any) => {
                 (navigation as any).navigate('ApplicationStatus', { application: app });
              };

              if (vacancy?.application?.id) {
                const app = {
                  id: vacancy.application.id,
                  status: vacancy.application.status,
                  vacancy: vacancy
                };
                navigateToStatus(app);
              } else {
                try {
                  setCheckingStatus(true);
                  const response = await getMyApplications(userToken);
                  const apps = response.data || [];
                  const match = apps.find(a => a.vacancy_id === vacancy?.id);
                  
                  if (match) {
                    if (!match.vacancy) match.vacancy = vacancy as any;
                    navigateToStatus(match);
                  } else {
                    (navigation as any).navigate('MainTabs', { screen: 'ApplicationsStack', params: { screen: 'MyApplications' } });
                  }
                } catch (e) {
                  console.error(e);
                  (navigation as any).navigate('MainTabs', { screen: 'ApplicationsStack', params: { screen: 'MyApplications' } });
                } finally {
                  setCheckingStatus(false);
                }
              }
            }}
            style={{ 
              backgroundColor: colors.surface, 
              borderRadius: 28, 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 56, 
              borderWidth: 2,
              borderColor: getStatusColor(data.applicationStatus || 'pending')
            }}
          >
            {checkingStatus ? (
              <ActivityIndicator color={getStatusColor(data.applicationStatus || 'pending')} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="check-circle" size={20} color={getStatusColor(data.applicationStatus || 'pending')} style={{ marginRight: 8 }} />
                <Text style={{ color: getStatusColor(data.applicationStatus || 'pending'), fontWeight: '700', fontSize: 16 }}>
                  {getStatusLabel(data.applicationStatus || 'pending')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : !data.canApply ? (
          <View>
            <View style={{ backgroundColor: colors.primary + '15', padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5), flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="info" size={18} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={{ color: colors.primary, fontSize: 13, flex: 1, fontWeight: '500' }}>
                {data.rejectionReason || 'Tu perfil académico no coincide con los requisitos de esta vacante.'}
              </Text>
            </View>
            <GradientButton
              onPress={handleShare}
              title={sharing ? 'Compartiendo...' : 'Compartir con un amigo'}
              loading={sharing}
              disabled={sharing}
              icon={<Feather name="share-2" size={20} color="#fff" />}
              gradientColors={[dominantColor, dominantColor]}
            />
          </View>
        ) : (
          <GradientButton
            onPress={async () => {
              if (!studentProfile?.has_cv) {
                setShowCVModal(true);
                return;
              }

              if (submitting) return;

              try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                if (hasHardware && isEnrolled) {
                  const auth = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Confirma tu identidad para aplicar',
                    fallbackLabel: 'Usar código',
                  });

                  if (!auth.success) {
                    Alert.alert('Error', 'Autenticación fallida');
                    return;
                  }
                }

                setSubmitting(true);
                if (userToken && vacancy?.id) {
                  await applyToVacancy(userToken, vacancy.id);
                  await applicationsCtx.refreshApplications(); // Refresh context
                  (navigation as any).navigate('ApplicationSuccess');
                }
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo aplicar a la vacante');
              } finally {
                setSubmitting(false);
              }
            }}
            title={submitting ? t('common.sending') : t('common.apply')}
            loading={submitting}
            style={{ height: 56 }}
            gradientColors={[dominantColor, dominantColor]}
          />
        )}
      </View>

      {/* Modal de Validación de CV */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showCVModal}
        onRequestClose={() => setShowCVModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: colors.card, padding: spacing(3), justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 120, height: 120, backgroundColor: colors.chipBg, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(3) }}>
            <FontAwesome5 name="user-astronaut" size={50} color={colors.primary} />
          </View>
          
          <Text style={{ fontSize: typography.sizes.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: spacing(2) }}>
            ¡Estás a un paso! 🚀
          </Text>
          
          <Text style={{ fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing(4), lineHeight: 24, paddingHorizontal: spacing(2) }}>
            Para postularte a <Text style={{ fontWeight: 'bold', color: colors.text }}>{data.company}</Text> y desbloquear todas las vacantes, necesitamos generar tu CV profesional.
          </Text>

          <GradientButton
            onPress={() => {
              setShowCVModal(false);
              (navigation as any).navigate('Onboarding', { screen: 'CVStart' });
            }}
            title="Completar mi CV ahora"
            style={{ marginBottom: spacing(2) }}
          />

          <TouchableOpacity
            style={{ paddingVertical: 16 }}
            onPress={() => setShowCVModal(false)}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 15 }}>Volver a la oferta</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

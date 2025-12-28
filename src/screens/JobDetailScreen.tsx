import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, Image, Share } from 'react-native';
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
import JobDetailSkeleton from './JobDetailSkeleton';
import { getInitials } from '../utils/stringUtils';
import * as LocalAuthentication from 'expo-local-authentication';

export default function JobDetailScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute() as any;
  const job: Job = route.params?.job;
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { userToken, studentProfile } = useAuth();
  const [tab, setTab] = React.useState<'about' | 'company'>('about');
  const [submitting, setSubmitting] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(false);
  const [showCVModal, setShowCVModal] = React.useState(false);

  const [vacancy, setVacancy] = React.useState<Vacancy | null>(null);
  const [loading, setLoading] = React.useState(true);

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
      case 'reviewed': return 'Revisado';
      default: return status || 'Postulado';
    }
  };

  const handleShare = async () => {
    try {
      // TODO: Implementar endpoint de generación de imagen para compartir
      const message = `¡Mira esta vacante de ${data.title} en ${data.company}! \n\nUbicación: ${data.location}\nSalario: ${data.salary}\n\nDescarga la app para aplicar.`;
      await Share.share({
        message,
        title: `Vacante: ${data.title}`
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Top actions (safe area) */}
      <View style={{ paddingHorizontal: spacing(2), paddingTop: insets.top + spacing(1), paddingBottom: spacing(1), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="bookmark" size={18} color={colors.primary} />
          </TouchableOpacity>
          {data.canApply && (
            <TouchableOpacity 
              onPress={handleShare}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginLeft: spacing(1) }}
            >
              <Feather name="share-2" size={18} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

  <ScreenContainer scroll contentContainerStyle={{ paddingTop: spacing(2), paddingBottom: spacing(20) }}>
        {/* Header card-like */}
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing(2), paddingTop: spacing(4), paddingBottom: spacing(2) }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {data.companyLogo ? (
                <Image source={{ uri: data.companyLogo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 28 }}>{getInitials(data.company)}</Text>
              )}
            </View>
            <Text style={{ marginTop: spacing(1), color: colors.text, fontWeight: '700', fontSize: typography.sizes.xl }}>{data.title}</Text>
            <Text style={{ marginTop: 4, color: colors.textSecondary }}>{data.company}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={{ marginLeft: 6, color: colors.textSecondary }}>{data.location}</Text>
            </View>
            {data.postedHuman && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Feather name="clock" size={14} color={colors.textSecondary} />
                <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>{data.postedHuman}</Text>
              </View>
            )}
          </View>

          {/* Info tiles grid */}
          <View style={{ marginTop: spacing(2), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Salary */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="dollar-sign" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.salaryMonthly')}</Text>
              </View>
              <Text style={{ marginTop: 6 }}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{data.salary}</Text>
              </Text>
            </View>

            {/* Tipo de puesto */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="briefcase" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.jobType')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.category} size="xs" />
              </View>
            </View>

            {/* Modalidad */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="globe" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.workingModel')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.modality} size="xs" />
              </View>
            </View>

            {/* Nivel */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="trending-up" size={14} color={colors.primary} />
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
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: spacing(2), paddingBottom: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing(2), borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            {(
              [
                { key: 'about', label: 'Acerca de' },
                { key: 'company', label: 'Compañía' },
              ] as const
            ).map(({ key, label }) => (
              <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ paddingVertical: spacing(1) }}>
                <Text style={{ color: tab === key ? colors.primary : colors.textSecondary, fontWeight: tab === key ? '700' as any : '600' }}>{label}</Text>
                {tab === key ? (
                  <View style={{ height: 2, backgroundColor: colors.primary, marginTop: 6, borderRadius: 2 }} />
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
              
              if (vacancy?.application?.id) {
                const app = {
                  id: vacancy.application.id,
                  status: vacancy.application.status,
                  vacancy: vacancy
                } as any;
                (navigation as any).navigate('ApplicationStatus', { application: app });
              } else {
                try {
                  setCheckingStatus(true);
                  const apps = await getMyApplications(userToken);
                  const match = apps.find(a => a.vacancy_id === vacancy?.id);
                  
                  if (match) {
                    if (!match.vacancy) match.vacancy = vacancy as any;
                    (navigation as any).navigate('ApplicationStatus', { application: match });
                  } else {
                    (navigation as any).navigate('MyApplications');
                  }
                } catch (e) {
                  console.error(e);
                  (navigation as any).navigate('MyApplications');
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
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', height: 56, flexDirection: 'row' }}
              onPress={handleShare}
            >
              <Feather name="share-2" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '700' }}>Compartir con un amigo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
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
                  (navigation as any).navigate('ApplicationSuccess');
                }
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo aplicar a la vacante');
              } finally {
                setSubmitting(false);
              }
            }}
            style={{ backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', height: 56, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.sending')}</Text>
              </View>
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.apply')}</Text>
            )}
          </TouchableOpacity>
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

          <TouchableOpacity
            style={{ backgroundColor: colors.primary, width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: spacing(2), shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
            onPress={() => {
              setShowCVModal(false);
              (navigation as any).navigate('Onboarding', { screen: 'CVStart' });
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Completar mi CV ahora</Text>
          </TouchableOpacity>

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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import OnboardingHeader from '../../components/OnboardingHeader';
import { api } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { currentUser } from '../../mock/user';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CVPreview'>;

export default function OnboardingCVPreviewScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { cvProfile } = currentUser;
  const { userToken, studentProfile, fetchStudentProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch profile if not already loaded in context
  useEffect(() => {
    if (!studentProfile && userToken) {
      setIsLoadingProfile(true);
      fetchStudentProfile().finally(() => setIsLoadingProfile(false));
    }
  }, []);

  // Use studentProfile from AuthContext (already fetched from /student/profile)
  const displayNames = studentProfile?.profile?.first_name ?? '';
  const displayLastnames = studentProfile?.profile?.last_name ?? '';
  const displayCareer = studentProfile?.academic_info?.career ?? '';
  const displayEmail = studentProfile?.email ?? '';
  const displayPhone = studentProfile?.profile?.phone ?? '';
  const displayFaculty = studentProfile?.academic_info?.department ?? '';
  const displayPhoto = studentProfile?.profile?.photo ?? null;

  const handleFinish = async () => {
    setIsSubmitting(true);
    // Preparar datos para el backend
    const dataToSend = {
      summary: cvProfile?.summary,
      education: [
        {
          institution: cvProfile?.secondaryEducation?.school,
          title: cvProfile?.secondaryEducation?.title,
          start_month: cvProfile?.secondaryEducation?.startMonth,
          start_year: cvProfile?.secondaryEducation?.startYear,
          end_month: cvProfile?.secondaryEducation?.endMonth,
          end_year: cvProfile?.secondaryEducation?.endYear,
        }
      ],
      experiences: cvProfile?.experience?.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        start_month: exp.startMonth,
        start_year: exp.startYear,
        end_month: exp.endMonth,
        end_year: exp.endYear,
        is_current: exp.isCurrent,
        description: exp.description
      })),
      certifications: cvProfile?.certifications?.map((cert: any) => ({
        title: cert.name,
        institution: cert.organization,
        start_month: cert.startMonth,
        start_year: cert.startYear,
        end_month: cert.endMonth,
        end_year: cert.endYear,
        credential_url: cert.url
      })),
      skills: cvProfile?.skills?.map((skill: string) => ({
        skill_name: skill
      })),
      languages: cvProfile?.languages?.map((lang: any) => ({
        language: lang.language,
        level: lang.level
      }))
    };

    console.log('--------------------------------------------------');
    console.log('🚀 ENVIANDO DATOS AL BACKEND...');
    console.log(JSON.stringify(dataToSend, null, 2));
    console.log('--------------------------------------------------');

    try {
      // Usar el token del contexto o el token de prueba si no hay uno en el contexto (para desarrollo)
      const tokenToUse = userToken || '11|J5usnuuejmXjybZnaCIyKwDI6lL9xkyI5PTGYrvnbc98614d';

      const responseData = await api.post<any>('/student/cv', dataToSend, { token: tokenToUse });

      console.log('📡 RESPUESTA DEL SERVIDOR:', JSON.stringify(responseData, null, 2));

      // Si llegamos aquí, la petición fue exitosa (status 200-299)
      // Verificamos si el backend devuelve un flag de éxito lógico
      if (responseData && responseData.success === false) {
        throw new Error(responseData.message || 'Error al guardar el perfil');
      }

      // Actualizar estado del mock para simular completado
      (currentUser as any).isProfileComplete = true;
      (currentUser as any).profileProgress = 100;

      navigation.navigate('CVSuccess');

    } catch (error: any) {
      console.error('❌ ERROR AL GUARDAR CV:', error);
      Alert.alert("Error", "No se pudo guardar tu perfil. Por favor intenta nuevamente.\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (month: string, year: string) => {
    if (!month && !year) return '';
    if (!month) return year;
    
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || month;
    
    return `${monthName} ${year}`;
  };

  const formatExperienceDuration = (exp: any) => {
    if (exp.startYear) {
      const start = formatDate(exp.startMonth, exp.startYear);
      const end = exp.isCurrent ? 'Presente' : formatDate(exp.endMonth, exp.endYear);
      return `${start} - ${end}`;
    }
    return exp.dates;
  };

  const formatDuration = (startMonth: string, startYear: string, endMonth: string, endYear: string) => {
    const start = formatDate(startMonth, startYear);
    const end = formatDate(endMonth, endYear);
    if (!start && !end) return '';
    if (start && !end) return start;
    return `${start} - ${end}`;
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      {/* Top bar with back button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <OnboardingHeader 
        icon="eye" 
        title="Vista Previa" 
        subtitle="¡Se ve excelente! Así es como las empresas verán tu perfil."
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {isLoadingProfile ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 16 }} />
          ) : (
            <View style={styles.profileHeader}>
              {displayPhoto ? (
                <Image 
                  source={{ uri: displayPhoto }} 
                  style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]} 
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>
                    {displayNames.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{`${displayNames} ${displayLastnames}`}</Text>
                <Text style={[styles.career, { color: colors.textSecondary }]}>{displayCareer}</Text>
                <Text style={[styles.contact, { color: colors.textSecondary }]}>{displayEmail} • {displayPhone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PERFIL PROFESIONAL</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{cvProfile?.summary || 'Sin descripción'}</Text>
        </View>

        {/* Education */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>EDUCACIÓN</Text>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{displayCareer}</Text>
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{displayFaculty}</Text>
          
          {cvProfile?.secondaryEducation?.school && (
            <>
              <View style={{ height: 12 }} />
              
              <Text style={[styles.itemTitle, { color: colors.text }]}>{cvProfile?.secondaryEducation.title}</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                {cvProfile?.secondaryEducation.school} • {formatDuration(
                  cvProfile?.secondaryEducation.startMonth, 
                  cvProfile?.secondaryEducation.startYear, 
                  cvProfile?.secondaryEducation.endMonth, 
                  cvProfile?.secondaryEducation.endYear
                )}
              </Text>
            </>
          )}
        </View>

        {/* Experience */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>EXPERIENCIA</Text>
          {cvProfile?.experience.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Sin experiencia registrada</Text>
          ) : (
            cvProfile?.experience.map((exp: any, i: number) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{exp.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{exp.company} • {formatExperienceDuration(exp)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Languages */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>IDIOMAS</Text>
          {(!cvProfile?.languages || cvProfile?.languages.length === 0) ? (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Sin idiomas registrados</Text>
          ) : (
            cvProfile?.languages.map((lang: any, i: number) => (
              <View key={i} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{lang.language}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{lang.level}</Text>
              </View>
            ))
          )}
        </View>

        {/* Certifications */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>CERTIFICACIONES</Text>
          {(!cvProfile?.certifications || cvProfile?.certifications.length === 0) ? (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Sin certificaciones registradas</Text>
          ) : (
            cvProfile?.certifications.map((cert: any, i: number) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{cert.name}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                  {cert.organization} • {formatDuration(cert.startMonth, cert.startYear, cert.endMonth, cert.endYear)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Skills */}
        <View style={[styles.section, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>HABILIDADES</Text>
          <View style={styles.skillsContainer}>
            {cvProfile?.skills.map((skill: string, i: number) => (
              <View key={i} style={[styles.skillChip, { backgroundColor: colors.chipBg }]}>
                <Text style={{ color: colors.text, fontSize: 12 }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <GradientButton
          onPress={handleFinish}
          title="Finalizar"
          loading={isSubmitting}
          icon={<FontAwesome5 name="check" size={16} color="#FFF" />}
          iconPosition="right"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden', // Ensure image respects border radius
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  career: {
    fontSize: 14,
    marginBottom: 4,
  },
  contact: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    paddingLeft: 16,
    borderLeftWidth: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.8,
  },
  sectionText: {
    lineHeight: 20,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

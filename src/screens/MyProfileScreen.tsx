import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Dimensions, Image, Platform, Animated, Alert } from 'react-native';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { currentUser, internshipLevels } from '../mock/user';
import { StudentProfile } from '../types/auth'; 
import LevelAvatar from '../components/LevelAvatar'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import ExperienceModal, { Experience as ModalExperience } from '../components/profile/modals/ExperienceModal';
import CertificationModal, { Certification as ModalCertification } from '../components/profile/modals/CertificationModal';
import EducationModal, { Education as ModalEducation } from '../components/profile/modals/EducationModal';
import { SkillsEditModal } from '../components/profile/modals/SkillsEditModal';
import LanguageModal, { Language as ModalLanguage } from '../components/profile/modals/LanguageModal';
import SummaryModal from '../components/profile/modals/SummaryModal';

interface Certification {
  id: number;
  title: string;
  institution: string;
  start_year: string | null;
  end_year: string | null;
  credential_url: string | null;
}

interface Skill {
  id: number;
  skill_name: string;
}

interface Language {
  id: number;
  language: string;
  level: string;
}

interface Experience {
  id: number;
  position: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  start_month?: string;
  start_year?: string;
  end_month?: string;
  end_year?: string;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  start_year: string;
  end_year: string | null;
}

interface CVData {
  id: number;
  summary: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  education: Education[];
  experiences: Experience[];
  certifications: Certification[];
  skills: Skill[];
  languages: Language[];
}

const { width } = Dimensions.get('window');

// Removed AnimatedIcon as it causes setNativeProps issues

export default function MyProfileScreen() {
  const { colors, spacing } = useTheme();
  const { userToken } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Removed activeTab state as we are merging sections
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Edit Modals State
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ModalExperience | null>(null);

  // Cert Modal State
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [selectedCert, setSelectedCert] = useState<ModalCertification | null>(null);

  // Education Modal State
  const [eduModalVisible, setEduModalVisible] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<ModalEducation | null>(null);

  // Skills Modal State
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);

  // Language Modal State
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<ModalLanguage | null>(null);

  // Summary Modal State
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);

  // Skills Handlers
  const handleOpenSkillsModal = () => {
    setSkillsModalVisible(true);
  };

  const handleSaveSkills = async (newSkills: string[]) => {
      if (!cvData) return;
      setLoading(true);
      try {
          const dataToSend = {
              summary: cvData.summary,
              education: cvData.education.map(edu => ({
                institution: edu.institution,
                title: edu.degree,
                start_year: edu.start_year,
                end_year: edu.end_year
              })),
              experiences: cvData.experiences.map(exp => ({
                  title: exp.position,
                  company: exp.company_name,
                  start_month: exp.start_month,
                  start_year: exp.start_year,
                  end_month: exp.end_month,
                  end_year: exp.end_year,
                  is_current: !exp.end_year && !exp.end_month,
                  description: exp.description
              })),
              certifications: cvData.certifications.map(cert => ({
                  title: cert.title,
                  institution: cert.institution,
                  start_year: cert.start_year,
                  end_year: cert.end_year,
                  credential_url: cert.credential_url
              })),
              skills: newSkills.map(s => ({ skill_name: s })),
              languages: cvData.languages.map(l => ({ language: l.language, level: l.level }))
          };

          await api.post('/student/cv', dataToSend, { token: userToken || undefined });
          await fetchCV();
          setSkillsModalVisible(false);
      } catch (error) {
          console.error("Error saving skills", error);
      } finally {
          setLoading(false);
      }
  };

  // Language Handlers
  const handleOpenLangModal = (lang?: Language) => {
      if (lang) {
          setSelectedLang({
              id: lang.id,
              language: lang.language,
              level: lang.level
          });
      } else {
          setSelectedLang(null);
      }
      setLangModalVisible(true);
  };

  const handleSaveLanguage = async (modalLang: ModalLanguage) => {
      if (!cvData) return;
      setLoading(true);
      try {
          let updatedLangs = [...cvData.languages];
          if (modalLang.id) {
               updatedLangs = updatedLangs.map(l => l.id === modalLang.id ? {
                   ...l,
                   language: modalLang.language,
                   level: modalLang.level
               } : l);
          } else {
               updatedLangs.push({
                   id: Date.now(),
                   language: modalLang.language,
                   level: modalLang.level
               });
          }

          const dataToSend = {
              summary: cvData.summary,
              education: cvData.education.map(edu => ({
                institution: edu.institution,
                title: edu.degree,
                start_year: edu.start_year,
                end_year: edu.end_year
              })),
              experiences: cvData.experiences.map(exp => ({
                  title: exp.position,
                  company: exp.company_name,
                  start_month: exp.start_month,
                  start_year: exp.start_year,
                  end_month: exp.end_month,
                  end_year: exp.end_year,
                  is_current: !exp.end_year && !exp.end_month,
                  description: exp.description
              })),
              certifications: cvData.certifications.map(cert => ({
                  title: cert.title,
                  institution: cert.institution,
                  start_year: cert.start_year,
                  end_year: cert.end_year,
                  credential_url: cert.credential_url
              })),
              skills: cvData.skills.map(s => ({ skill_name: s.skill_name })),
              languages: updatedLangs.map(l => ({ language: l.language, level: l.level }))
          };

          await api.post('/student/cv', dataToSend, { token: userToken || undefined });
          await fetchCV();
          setLangModalVisible(false);
      } catch (error) {
          console.error("Error saving language", error);
      } finally {
          setLoading(false);
      }
  };

  // Summary Handler
  const handleSaveSummary = async (newSummary: string) => {
      if (!cvData) return;
      setLoading(true);
      try {
          const dataToSend = {
              summary: newSummary,
              education: cvData.education.map(edu => ({
                institution: edu.institution,
                title: edu.degree,
                start_year: edu.start_year,
                end_year: edu.end_year
              })),
              experiences: cvData.experiences.map(exp => ({
                  title: exp.position,
                  company: exp.company_name,
                  start_month: exp.start_month,
                  start_year: exp.start_year,
                  end_month: exp.end_month,
                  end_year: exp.end_year,
                  is_current: !exp.end_year && !exp.end_month,
                  description: exp.description
              })),
              certifications: cvData.certifications.map(cert => ({
                  title: cert.title,
                  institution: cert.institution,
                  start_year: cert.start_year,
                  end_year: cert.end_year,
                  credential_url: cert.credential_url
              })),
              skills: cvData.skills.map(s => ({ skill_name: s.skill_name })),
              languages: cvData.languages.map(l => ({ language: l.language, level: l.level }))
          };

          await api.post('/student/cv', dataToSend, { token: userToken || undefined });
          await fetchCV();
          setSummaryModalVisible(false);
      } catch (error) {
          console.error("Error saving summary", error);
      } finally {
          setLoading(false);
      }
  };

  // Experience Handlers
  const handleOpenExperienceModal = (exp?: Experience) => {
    if (exp) {
      setSelectedExperience({
        id: exp.id,
        title: exp.position,
        company: exp.company_name,
        startMonth: exp.start_month || '',
        startYear: exp.start_year || '',
        endMonth: exp.end_month,
        endYear: exp.end_year,
        isCurrent: !exp.end_year && !exp.end_month, 
        description: exp.description || ''
      });
    } else {
      setSelectedExperience(null);
    }
    setExperienceModalVisible(true);
  };

  const handleSaveExperience = async (modalExp: ModalExperience) => {
    if (!cvData) return;

    // Optimistic update or waiting? Waiting is safer for syncing.
    // We'll reuse 'loading' or add a specific saving state?
    // Using loading will trigger the full screen loader which might be too much.
    // But for now it ensures safety.
    setLoading(true); 
    
    try {
      let updatedExperiences = [...cvData.experiences];
      
      if (modalExp.id) {
         // Edit
         updatedExperiences = updatedExperiences.map(e => e.id === modalExp.id ? {
            ...e,
            position: modalExp.title,
            company_name: modalExp.company,
            start_month: modalExp.startMonth,
            start_year: modalExp.startYear,
            end_month: modalExp.endMonth,
            end_year: modalExp.endYear,
            description: modalExp.description
         } : e);
      } else {
         updatedExperiences.push({
            id: Date.now(), 
            position: modalExp.title,
            company_name: modalExp.company,
            start_month: modalExp.startMonth,
            start_year: modalExp.startYear,
            end_month: modalExp.endMonth,
            end_year: modalExp.endYear,
            description: modalExp.description,
            start_date: null,
            end_date: null
         });
      }

      const dataToSend = {
        summary: cvData.summary,
        education: cvData.education.map(edu => ({
            institution: edu.institution,
            title: edu.degree,
            start_year: edu.start_year,
            end_year: edu.end_year
        })),
        experiences: updatedExperiences.map(exp => ({
            title: exp.position,
            company: exp.company_name,
            start_month: exp.start_month,
            start_year: exp.start_year,
            end_month: exp.end_month,
            end_year: exp.end_year,
            is_current: !exp.end_year && !exp.end_month,
            description: exp.description
        })),
        certifications: cvData.certifications.map(cert => ({
            title: cert.title,
            institution: cert.institution,
            start_year: cert.start_year,
            end_year: cert.end_year,
            credential_url: cert.credential_url
        })),
        skills: cvData.skills.map(s => ({ skill_name: s.skill_name })),
        languages: cvData.languages.map(l => ({ language: l.language, level: l.level }))
      };

      await api.post('/student/cv', dataToSend, { token: userToken || undefined });
      await fetchCV();
      setExperienceModalVisible(false);

    } catch (error) {
       console.error("Error saving experience", error);
       // Alert.alert("Error", "No se pudo guardar."); // Assuming Alert is imported, if not I should import it 
    } finally {
       setLoading(false);
    }
  };

  // Certification Handlers
  const handleOpenCertModal = (cert?: Certification) => {
    if (cert) {
      setSelectedCert({
        id: cert.id,
        name: cert.title,
        organization: cert.institution,
        startMonth: '', // Backend doesn't send month separately in this interface, might need parsing or just empty
        startYear: cert.start_year || '',
        endMonth: '', 
        endYear: cert.end_year || '',
        credentialUrl: cert.credential_url || ''
      });
    } else {
      setSelectedCert(null);
    }
    setCertModalVisible(true);
  };

  const handleSaveCert = async (modalCert: ModalCertification) => {
    if (!cvData) return;
    setLoading(true);
    try {
        let updatedCerts = [...cvData.certifications];
        if (modalCert.id) {
             updatedCerts = updatedCerts.map(c => c.id === modalCert.id ? {
                 ...c,
                 title: modalCert.name,
                 institution: modalCert.organization,
                 start_year: modalCert.startYear,
                 end_year: modalCert.endYear,
                 credential_url: modalCert.credentialUrl || null
             } : c);
        } else {
            updatedCerts.push({
                id: Date.now(),
                title: modalCert.name,
                institution: modalCert.organization,
                start_year: modalCert.startYear,
                end_year: modalCert.endYear,
                credential_url: modalCert.credentialUrl || null
            });
        }

        const dataToSend = {
            summary: cvData.summary,
            education: cvData.education,
            experiences: cvData.experiences.map(exp => ({
                title: exp.position,
                company: exp.company_name,
                start_month: exp.start_month,
                start_year: exp.start_year,
                end_month: exp.end_month,
                end_year: exp.end_year,
                is_current: !exp.end_year && !exp.end_month,
                description: exp.description
            })),
            certifications: updatedCerts.map(cert => ({
                title: cert.title,
                institution: cert.institution,
                start_year: cert.start_year,
                end_year: cert.end_year,
                credential_url: cert.credential_url
            })),
            skills: cvData.skills.map(s => ({ skill_name: s.skill_name })),
            languages: cvData.languages // TODO: Add logic for languages
        };

        await api.post('/student/cv', dataToSend, { token: userToken || undefined });
        await fetchCV();
        setCertModalVisible(false);
    } catch (error) {
        console.error("Error saving certification", error);
    } finally {
        setLoading(false);
    }
  };

  // Education Handlers
  const handleOpenEduModal = (edu?: Education) => {
    if (edu) {
      setSelectedEdu({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        startMonth: '', 
        startYear: edu.start_year,
        endMonth: '', 
        endYear: edu.end_year || '',
        isCurrent: !edu.end_year
      });
    } else {
      setSelectedEdu(null);
    }
    setEduModalVisible(true);
  };

  const handleSaveEdu = async (modalEdu: ModalEducation) => {
    if (!cvData) return;
    setLoading(true);
    try {
        let updatedEdu = [...cvData.education];
        if (modalEdu.id) {
             updatedEdu = updatedEdu.map(e => e.id === modalEdu.id ? {
                 ...e,
                 institution: modalEdu.institution,
                 degree: modalEdu.degree,
                 start_year: modalEdu.startYear,
                 end_year: modalEdu.endYear || null
             } : e);
        } else {
            updatedEdu.push({
                id: Date.now(),
                institution: modalEdu.institution,
                degree: modalEdu.degree,
                start_year: modalEdu.startYear,
                end_year: modalEdu.endYear || null
            });
        }

        const dataToSend = {
            summary: cvData.summary,
            education: updatedEdu.map(e => ({
                institution: e.institution,
                title: e.degree,
                start_year: e.start_year,
                end_year: e.end_year
            })),
            experiences: cvData.experiences.map(exp => ({
                title: exp.position,
                company: exp.company_name,
                start_month: exp.start_month,
                start_year: exp.start_year,
                end_month: exp.end_month,
                end_year: exp.end_year,
                is_current: !exp.end_year && !exp.end_month,
                description: exp.description
            })),
            certifications: cvData.certifications.map(cert => ({
                title: cert.title,
                institution: cert.institution,
                start_year: cert.start_year,
                end_year: cert.end_year,
                credential_url: cert.credential_url
            })),
            skills: cvData.skills.map(s => ({ skill_name: s.skill_name })),
            languages: cvData.languages
        };

        await api.post('/student/cv', dataToSend, { token: userToken || undefined });
        await fetchCV();
        setEduModalVisible(false);
    } catch (error) {
        console.error("Error saving education", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchCV = async () => {
    try {
      const [cvResponse, profileResponse] = await Promise.all([
        api.get<any>('/student/cv', { token: userToken || undefined }).catch(e => null), 
        api.get<any>('/student/profile', { token: userToken || undefined }).catch(e => null)
      ]);

      if (cvResponse) {
        const cvData = cvResponse.data || cvResponse;
        setCvData(cvData);
      }
      
      if (profileResponse) {
        const profile = profileResponse.data || profileResponse;
        setStudentProfile(profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCV();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCV();
  };

  const openLink = (url: string | null) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const getInternshipStatus = (hours: number) => {
    const currentLevel = internshipLevels.find(l => hours >= l.minHours && hours < l.maxHours) 
      || internshipLevels[internshipLevels.length - 1];
    
    const range = currentLevel.maxHours - currentLevel.minHours;
    const progress = Math.min(Math.max((hours - currentLevel.minHours) / range, 0), 1);

    return {
      stage: currentLevel.name,
      color: currentLevel.color,
      badge: currentLevel.badge,
      nextGoal: currentLevel.maxHours,
      progress: progress
    };
  };

  const currentHours = currentUser.hours; 
  const status = getInternshipStatus(currentHours);

  const displayName = studentProfile?.profile 
    ? `${studentProfile.profile.first_name} ${studentProfile.profile.last_name}`
    : `${currentUser.names} ${currentUser.lastnames}`;

  const displayCareer = studentProfile?.academic_info?.career || currentUser.career;
  const displayPhoto = studentProfile?.profile?.photo;

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderTimelineItem = (title: string, subtitle: string, date: string, description?: string | null, isLast?: boolean, iconName: string = 'circle') => (
    <View style={styles.timelineItem}>
      {/* Timeline Visuals */}
      <View style={styles.timelineVisual}>
        <View style={[styles.timelineDot, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
        )}
      </View>
      
      {/* Content */}
      <View style={[styles.timelineContent, { paddingBottom: isLast ? 0 : 24 }]}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.timelineSubtitle, { color: colors.primary }]}>
          {subtitle}
        </Text>
        <View style={styles.timelineDateContainer}>
           <Feather name="calendar" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
           <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
            {date}
           </Text>
        </View>
        {description && (
          <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    
    // Función auxiliar para formatear fechas de experiencia
    const formatExpDate = (exp: Experience) => {
        const monthNames = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
    
        const getMonthName = (monthStr: string) => {
          const monthIndex = parseInt(monthStr, 10) - 1;
          return monthNames[monthIndex] || monthStr;
        };
    
        if (exp.start_month && exp.start_year) {
          const startName = `${getMonthName(exp.start_month)} ${exp.start_year}`;
          let endName = 'Actualidad';
          
          let startDate = new Date(parseInt(exp.start_year, 10), parseInt(exp.start_month, 10) - 1);
          let endDate = new Date(); // Fecha actual por defecto
    
          if (exp.end_month && exp.end_year) {
             endName = `${getMonthName(exp.end_month)} ${exp.end_year}`;
             endDate = new Date(parseInt(exp.end_year, 10), parseInt(exp.end_month, 10) - 1);
          }
    
          // Calculo de diferencia en meses
          let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
          months -= startDate.getMonth();
          months += endDate.getMonth();
          
          // Ajuste para evitar negativos si la fecha de inicio es futura (error de datos)
          if (months < 0) months = 0;
          
          const years = Math.floor(months / 12);
          const remainingMonths = months % 12;
    
          let duration = '';
          if (years > 0) duration += `${years} año${years > 1 ? 's' : ''}`;
          if (remainingMonths > 0) {
            if (duration) duration += ' y '; // Conector visual
            duration += `${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
          }
          if (!duration) duration = '1 mes'; // Mínimo 1 mes si es el mismo mes

          return `${startName} - ${endName} · ${duration}`;
        }

        if (exp.start_date) {
             return `${exp.start_date} - ${exp.end_date || 'Actualidad'}`;
        }
        return 'Fecha no disponible';
    };

    return (
    <View style={styles.tabContent}>
       {/* About / Summary */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                   <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Feather name="user" size={18} color={colors.primary} />
                   </View>
                   <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Sobre mí</Text>
                </View>
                <TouchableOpacity onPress={() => setSummaryModalVisible(true)} style={{ padding: 4 }}>
                   <Feather name="edit-2" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
          <Text style={[styles.bodyText, { color: cvData?.summary ? colors.textSecondary : colors.textSecondary + '80', marginTop: 8, fontStyle: cvData?.summary ? 'normal' : 'italic' }]}>
            {cvData?.summary || "No hay descripción profesional registrada"}
          </Text>
        </View>

       {/* Skills */}
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                   <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Feather name="zap" size={18} color={colors.primary} />
                   </View>
                   <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Habilidades</Text>
                </View>
                <TouchableOpacity onPress={handleOpenSkillsModal} style={{ padding: 4 }}>
                   <Feather name="edit-2" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
            
            {cvData?.skills && cvData.skills.length > 0 ? (
                <View style={[styles.skillsContainer, { marginTop: 16 }]}>
                {cvData.skills.map((skill) => (
                    <View 
                    key={skill.id} 
                    style={[styles.skillChip, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}
                    >
                    <Text style={[styles.skillText, { color: colors.primary }]}>{skill.skill_name}</Text>
                    </View>
                ))}
                </View>
            ) : (
                <Text style={{ color: colors.textSecondary + '80', marginTop: 8, fontStyle: 'italic' }}>No hay habilidades registradas</Text>
            )}
          </View>

      {/* Languages */}
         <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                   <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Feather name="globe" size={18} color={colors.primary} />
                   </View>
                   <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Idiomas</Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenLangModal()} style={{ padding: 4 }}>
                   <Feather name="plus-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
           
           {cvData?.languages && cvData.languages.length > 0 ? (
               <View style={{ marginTop: 8 }}>
                {cvData.languages.map((lang, index) => (
                    <TouchableOpacity key={lang.id} onPress={() => handleOpenLangModal(lang)} activeOpacity={0.7} style={[styles.languageItem, { borderBottomColor: colors.border, borderBottomWidth: index === cvData.languages.length - 1 ? 0 : 1 }]}>
                        <View style={styles.languageInfo}>
                            <View style={[styles.languageDot, { backgroundColor: colors.text }]} />
                            <Text style={[styles.languageName, { color: colors.text }]}>{lang.language}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[styles.languageLevelBadge, { backgroundColor: colors.success + '15' }]}>
                                <Text style={[styles.languageLevelText, { color: colors.success }]}>{lang.level}</Text>
                            </View>
                            <Feather name="edit-2" size={14} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}
               </View>
           ) : (
                <Text style={{ color: colors.textSecondary + '80', marginTop: 8, fontStyle: 'italic' }}>No hay idiomas registrados</Text>
           )}
         </View>

       {/* Experience */}
         <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Feather name="briefcase" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Experiencia</Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenExperienceModal()} style={{ padding: 4 }}>
                    <Feather name="plus-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
            
            {cvData?.experiences && cvData.experiences.length > 0 ? (
                <View style={{ marginTop: 4, marginLeft: 8 }}>
                {cvData.experiences.map((exp, index) => (
                    <TouchableOpacity key={exp.id} onPress={() => handleOpenExperienceModal(exp)} activeOpacity={0.7}>
                        {renderTimelineItem(
                            exp.position, 
                            exp.company_name, 
                            formatExpDate(exp),
                            exp.description,
                            index === cvData.experiences.length - 1 && (!cvData.education || cvData.education.length === 0),
                            'briefcase' // Optional icon override if renderTimelineItem supports it
                        )}
                        <View style={{ position: 'absolute', right: 0, top: 0 }}>
                             <Feather name="edit-2" size={14} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}
                </View>
            ) : (
                <Text style={{ color: colors.textSecondary + '80', marginTop: 8, fontStyle: 'italic' }}>No hay experiencia laboral registrada</Text>
            )}
         </View>

       {/* Education */}
       <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                   <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Feather name="book" size={18} color={colors.primary} />
                   </View>
                   <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Educación</Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenEduModal()} style={{ padding: 4 }}>
                   <Feather name="plus-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
          </View>

          <View style={{ marginTop: 16, marginLeft: 8 }}>
             {/* Universidad Actual (Front-end) */}
             {renderTimelineItem(
                studentProfile?.academic_info?.career || currentUser.career, 
                "Universidad Nacional de Ingeniería",
                "Actualidad",
                studentProfile?.academic_info?.department || currentUser.faculty,
                (!cvData?.education || cvData.education.length === 0)
             )}

            {cvData?.education?.map((edu, index) => (
               <TouchableOpacity key={edu.id} onPress={() => handleOpenEduModal(edu)} activeOpacity={0.7}>
                   <View style={{ position: 'relative' }}>
                      {renderTimelineItem(
                        edu.degree,
                        edu.institution,
                        `${edu.start_year} - ${edu.end_year || 'Actualidad'}`,
                        null,
                        index === cvData.education.length - 1
                      )}
                      <View style={{ position: 'absolute', right: 0, top: 0 }}>
                           <Feather name="edit-2" size={14} color={colors.textSecondary} />
                      </View>
                   </View>
               </TouchableOpacity>
            ))}
          </View>
       </View>

       {/* Certifications (Added dynamically) */}
       <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={[styles.sectionHeaderIcon, { marginBottom: 0 }]}>
                   <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <MaterialCommunityIcons name="certificate" size={20} color={colors.primary} />
                   </View>
                   <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Certificaciones</Text>
              </View>
              <TouchableOpacity onPress={() => handleOpenCertModal()} style={{ padding: 4 }}>
                  <Feather name="plus-circle" size={20} color={colors.primary} />
              </TouchableOpacity>
          </View>
          
          {cvData?.certifications && cvData.certifications.length > 0 ? (
             <View style={{ marginTop: 8, marginLeft: 8 }}>
                {cvData.certifications.map((cert, index) => (
                   <TouchableOpacity key={cert.id} onPress={() => handleOpenCertModal(cert)} activeOpacity={0.7} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 }}>{cert.title}</Text>
                              <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 4 }}>{cert.institution}</Text>
                              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{cert.start_year} - {cert.end_year}</Text>
                          </View>
                          <Feather name="edit-2" size={14} color={colors.textSecondary} style={{ marginTop: 4 }} />
                      </View>
                      {index < cvData.certifications.length - 1 && <View style={{ height: 1, backgroundColor: colors.border, marginTop: 12 }} />}
                   </TouchableOpacity>
                ))}
             </View>
          ) : (
             <Text style={{ color: colors.textSecondary + '80', marginTop: 8, fontStyle: 'italic' }}>No hay certificaciones registradas</Text>
          )}
       </View>
    </View>
  );
  };

  const headerBg = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(255,255,255,0)', colors.surface],
    extrapolate: 'clamp',
  });

  const headerContentColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['#FFF', colors.text],
    extrapolate: 'clamp',
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0.1],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  const backButtonBg = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(255,255,255,0.2)', 'rgba(0,0,0,0)'],
    extrapolate: 'clamp',
  });

  const iconOpacityLight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const iconOpacityDark = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Fixed Navbar (Transitioning) */}
      <Animated.View style={[
        styles.navbar, 
        { 
          paddingTop: insets.top,
          backgroundColor: headerBg,
          shadowOpacity: headerShadowOpacity,
          elevation: headerElevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        }
      ]}>
           <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.backButton, { backgroundColor: backButtonBg }]}>
               <Animated.View style={{ position: 'absolute', opacity: iconOpacityLight }}>
                  <Feather name="arrow-left" size={24} color="#FFF" />
               </Animated.View>
               <Animated.View style={{ opacity: iconOpacityDark }}>
                  <Feather name="arrow-left" size={24} color={colors.text} />
               </Animated.View>
            </Animated.View>
          </TouchableOpacity>
          <Animated.Text style={[styles.navbarTitle, { color: headerContentColor }]}>Mi Perfil</Animated.Text>
          <View style={{ width: 40 }} /> 
      </Animated.View>

      <Animated.ScrollView 
          contentContainerStyle={{ paddingBottom: spacing(4) }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary}/>}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
      >
        {/* Header Background & Profile Info Wrapper */}
        <View style={{ position: 'relative' }}>
            {/* Background behind avatar */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={[colors.primary, colors.primary900]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.circleDecoration, { borderColor: 'rgba(255,255,255,0.1)', width: width * 1.2, height: width * 1.2, top: -width * 0.6, left: -width * 0.3 }]} />
                <View style={[styles.circleDecoration, { borderColor: 'rgba(255,255,255,0.05)', width: width * 0.8, height: width * 0.8, top: width * 0.1, right: -width * 0.4 }]} />
            </View>

            {/* Profile Info Content */}
            <View style={[styles.profileHeader, { paddingTop: 60 + insets.top + 20 }]}>
                <View style={styles.avatarContainer}>
                    <LevelAvatar 
                        progress={status.progress} 
                        size={110} 
                        color={status.color} 
                        badgeContent={status.badge}
                        imageUri={displayPhoto}
                    />
                </View>
                
                <Text style={styles.nameText}>
                    {displayName}
                </Text>
                
                <Text style={styles.careerText}>
                    {displayCareer}
                </Text>

                {/* Progress & Stats Row */}
                <View style={styles.progressStatsContainer}>
                    <View style={styles.progressItem}>
                         <Text style={[styles.progressPercentage, { color: status.color }]}>
                            {Math.round(status.progress * 100)}%
                         </Text>
                         <Text style={styles.progressLabel}>Progreso</Text>
                    </View>
                    
                    <View style={styles.verticalDividerStats} />

                    <View style={styles.progressItem}>
                         <Text style={styles.statsValue}>
                            {currentHours} <Text style={styles.statsTotal}>/ {status.nextGoal}h</Text>
                         </Text>
                         <Text style={styles.progressLabel}>{status.stage}</Text>
                    </View>
                </View>

                {/* Social Buttons */}
                {(cvData?.linkedin_url || cvData?.github_url || cvData?.portfolio_url) && (
                    <View style={styles.socialRow}>
                        {cvData?.linkedin_url && (
                            <TouchableOpacity onPress={() => openLink(cvData.linkedin_url)} style={styles.socialIcon}>
                            <Feather name="linkedin" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        {cvData?.github_url && (
                            <TouchableOpacity onPress={() => openLink(cvData.github_url)} style={styles.socialIcon}>
                            <Feather name="github" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        {cvData?.portfolio_url && (
                            <TouchableOpacity onPress={() => openLink(cvData.portfolio_url)} style={styles.socialIcon}>
                                <Feather name="globe" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>

        {/* Content Sheet */}
        <View style={[styles.contentSheet]}>
              {/* Merged Content */}
              <View style={{ minHeight: 400 }}>
                 {renderContent()}
              </View>
        </View>
      </Animated.ScrollView>

      <ExperienceModal
        visible={experienceModalVisible}
        onClose={() => setExperienceModalVisible(false)}
        onSave={handleSaveExperience}
        initialData={selectedExperience}
      />
      <CertificationModal
        visible={certModalVisible}
        onClose={() => setCertModalVisible(false)}
        onSave={handleSaveCert}
        initialData={selectedCert}
      />
      <EducationModal
        visible={eduModalVisible}
        onClose={() => setEduModalVisible(false)}
        onSave={handleSaveEdu}
        initialData={selectedEdu}
      />
      <SkillsEditModal
        visible={skillsModalVisible}
        onClose={() => setSkillsModalVisible(false)}
        onSave={handleSaveSkills}
        initialSkills={cvData?.skills ? cvData.skills.map(s => s.skill_name) : []}
      />
      <LanguageModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        onSave={handleSaveLanguage}
        initialData={selectedLang}
      />
      <SummaryModal
        visible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        onSave={handleSaveSummary}
        initialSummary={cvData?.summary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  circleDecoration: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1,
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 100, // Safe area + navbar height
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbarTitle: {
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700', 
    flex: 1, 
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  nameText: {
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFF', 
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  careerText: {
    fontSize: 16, 
    color: 'rgba(255,255,255,0.9)', 
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  progressStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDividerStats: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 24,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  statsTotal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    opacity: 0.9,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },
  contentSheet: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    borderWidth: 1,
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 14,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  languageName: {
    fontWeight: '600',
    fontSize: 16,
  },
  languageLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageLevelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineVisual: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  timelineDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 13,
  },
  timelineDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
});
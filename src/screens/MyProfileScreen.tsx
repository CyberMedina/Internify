import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { currentUser } from '../mock/user'; // Fallback for basic user info like name/avatar

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
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
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

export default function MyProfileScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { userToken } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCV = async () => {
    try {
      setError(null);
      const response = await fetch('https://overfoul-domingo-unharmable.ngrok-free.dev/api/student/cv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching CV: ${response.status}`);
      }

      const data = await response.json();
      setCvData(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información del perfil.');
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !cvData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <Feather name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={fetchCV}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + spacing(1),
          paddingBottom: spacing(1),
          paddingHorizontal: spacing(2),
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: spacing(2), color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          Mi Perfil Profesional
        </Text>
      </View>

      <ScreenContainer 
        scroll 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: spacing(4), paddingHorizontal: spacing(2) }}
      >
        {/* Profile Header Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.lg, marginTop: spacing(2) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(2) }}>
            <View style={{ 
              width: 64, 
              height: 64, 
              borderRadius: 32, 
              backgroundColor: colors.primary + '20', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: spacing(2)
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                {currentUser.names.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>
                {currentUser.names} {currentUser.lastnames}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
                {currentUser.career}
              </Text>
            </View>
          </View>

          {/* Social Links */}
          <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(1) }}>
            {cvData?.linkedin_url && (
              <TouchableOpacity onPress={() => openLink(cvData.linkedin_url)}>
                <Feather name="linkedin" size={20} color="#0077B5" />
              </TouchableOpacity>
            )}
            {cvData?.github_url && (
              <TouchableOpacity onPress={() => openLink(cvData.github_url)}>
                <Feather name="github" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            {cvData?.portfolio_url && (
              <TouchableOpacity onPress={() => openLink(cvData.portfolio_url)}>
                <Feather name="globe" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary */}
        {cvData?.summary && (
          <View style={[styles.section, { marginTop: spacing(3) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
              <Feather name="user" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>RESUMEN PROFESIONAL</Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              {cvData.summary}
            </Text>
          </View>
        )}

        {/* Education */}
        <View style={[styles.section, { marginTop: spacing(3) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
            <Feather name="book" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>EDUCACIÓN</Text>
          </View>
          
          {/* Always show current university info from mock if API list is empty, or combine them */}
          <View style={{ marginBottom: spacing(2) }}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{currentUser.career}</Text>
            <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{currentUser.faculty}</Text>
          </View>

          {cvData?.education?.map((edu, index) => (
            <View key={edu.id} style={{ marginBottom: spacing(2) }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{edu.degree}</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                {edu.institution} • {edu.start_year} - {edu.end_year || 'Presente'}
              </Text>
            </View>
          ))}
        </View>

        {/* Experience */}
        {cvData?.experiences && cvData.experiences.length > 0 && (
          <View style={[styles.section, { marginTop: spacing(3) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
              <Feather name="briefcase" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>EXPERIENCIA</Text>
            </View>
            {cvData.experiences.map((exp) => (
              <View key={exp.id} style={{ marginBottom: spacing(2) }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{exp.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                  {exp.company} • {exp.start_date} - {exp.end_date || 'Presente'}
                </Text>
                {exp.description && (
                  <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: 4 }]}>
                    {exp.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {cvData?.certifications && cvData.certifications.length > 0 && (
          <View style={[styles.section, { marginTop: spacing(3) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
              <Feather name="award" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>CERTIFICACIONES</Text>
            </View>
            {cvData.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: spacing(2) }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{cert.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                  {cert.institution} • {cert.start_year} {cert.end_year ? `- ${cert.end_year}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {cvData?.skills && cvData.skills.length > 0 && (
          <View style={[styles.section, { marginTop: spacing(3) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
              <Feather name="cpu" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>HABILIDADES</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {cvData.skills.map((skill) => (
                <View 
                  key={skill.id} 
                  style={{ 
                    backgroundColor: colors.chipBg, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 16 
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 13 }}>{skill.skill_name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {cvData?.languages && cvData.languages.length > 0 && (
          <View style={[styles.section, { marginTop: spacing(3) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
              <Feather name="globe" size={18} color={colors.primary} style={{ marginRight: spacing(1) }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>IDIOMAS</Text>
            </View>
            {cvData.languages.map((lang) => (
              <View key={lang.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '500' }}>{lang.language}</Text>
                <Text style={{ color: colors.textSecondary }}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}

      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  card: {
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

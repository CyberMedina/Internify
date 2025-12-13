import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, Switch, Alert } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { currentUser } from '../../mock/user';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CVWizard'>;

const STEPS = 7;

export default function OnboardingCVWizardScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { colors, typography, spacing } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [summary, setSummary] = useState('');
  const [secondarySchool, setSecondarySchool] = useState('');
  const [secondaryTitle, setSecondaryTitle] = useState('');
  const [secondaryStartMonth, setSecondaryStartMonth] = useState('');
  const [secondaryStartYear, setSecondaryStartYear] = useState('');
  const [secondaryEndMonth, setSecondaryEndMonth] = useState('');
  const [secondaryEndYear, setSecondaryEndYear] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<{ language: string, level: string }[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [languageLevel, setLanguageLevel] = useState('Básico');
  const [references, setReferences] = useState([{ name: '', contact: '' }, { name: '', contact: '' }, { name: '', contact: '' }]);

  // Experience Modal State
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    description: ''
  });
  const [experienceErrors, setExperienceErrors] = useState<any>({});

  // Certification Modal State
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', organization: '', startMonth: '', startYear: '', endMonth: '', endYear: '' });
  const [certErrors, setCertErrors] = useState<any>({});

  // JSON Debug Modal State
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [finalJson, setFinalJson] = useState('');

  // AI Pre-fill
  useEffect(() => {
    if (mode === 'ai' && route.params?.cvData) {
      const { cv_profile, missing_sections } = route.params.cvData;
      
      // Pre-fill data
      if (cv_profile.summary) setSummary(cv_profile.summary);
      
      if (cv_profile.secondary_education) {
        setSecondarySchool(cv_profile.secondary_education.school || '');
        setSecondaryTitle(cv_profile.secondary_education.title || '');
        setSecondaryStartMonth(cv_profile.secondary_education.start_date?.month || '');
        setSecondaryStartYear(cv_profile.secondary_education.start_date?.year || '');
        setSecondaryEndMonth(cv_profile.secondary_education.end_date?.month || '');
        setSecondaryEndYear(cv_profile.secondary_education.end_date?.year || '');
      }

      if (cv_profile.experience) {
        const mappedExperience = cv_profile.experience.map((exp: any, index: number) => ({
          id: index,
          title: exp.title,
          company: exp.company,
          dates: `${exp.start_date.month}/${exp.start_date.year} - ${exp.is_current ? 'Presente' : `${exp.end_date?.month}/${exp.end_date?.year}`}`,
          startMonth: exp.start_date.month,
          startYear: exp.start_date.year,
          endMonth: exp.end_date?.month,
          endYear: exp.end_date?.year,
          isCurrent: exp.is_current,
          description: exp.description
        }));
        setExperiences(mappedExperience);
      }

      if (cv_profile.certifications) {
        const mappedCerts = cv_profile.certifications.map((cert: any, index: number) => ({
          id: index,
          name: cert.name,
          organization: cert.organization,
          startMonth: cert.start_date?.month,
          startYear: cert.start_date?.year,
          endMonth: cert.end_date?.month,
          endYear: cert.end_date?.year
        }));
        setCertifications(mappedCerts);
      }

      if (cv_profile.languages) {
        setLanguages(cv_profile.languages);
      }

      if (cv_profile.skills) {
        setSkills(cv_profile.skills);
      }

      if (cv_profile.references && cv_profile.references.length > 0) {
        // Pad with empty objects if less than 3
        const refs = [...cv_profile.references];
        while (refs.length < 3) {
          refs.push({ name: '', contact: '' });
        }
        setReferences(refs.slice(0, 3));
      }

      // Determine start step based on missing sections
      if (missing_sections.summary) {
        setCurrentStep(1);
      } else if (missing_sections.secondary_education) {
        setCurrentStep(2);
      } else if (missing_sections.experience) {
        setCurrentStep(3);
      } else if (missing_sections.certifications) {
        setCurrentStep(4);
      } else if (missing_sections.languages) {
        setCurrentStep(5);
      } else if (missing_sections.skills) {
        setCurrentStep(6);
      } else if (missing_sections.references) {
        setCurrentStep(7);
      } else {
        setCurrentStep(1);
      }
    } else if (mode === 'ai') {
      // Fallback mock data if needed
      setSummary('Estudiante proactivo de Ingeniería en Computación con pasión por el desarrollo backend y la inteligencia artificial. Busco oportunidades para aplicar mis conocimientos en C# y React Native en proyectos del mundo real.');
      setSecondarySchool('Instituto Nacional de Secundaria');
      setSecondaryTitle('Bachiller en Ciencias y Letras');
      setSecondaryStartMonth('02');
      setSecondaryStartYear('2015');
      setSecondaryEndMonth('11');
      setSecondaryEndYear('2020');
      setExperiences([
        { 
          id: 1, 
          title: 'Desarrollador Junior', 
          company: 'TechSolutions', 
          dates: '01/2023 - Presente', 
          startMonth: '01',
          startYear: '2023',
          isCurrent: true,
          description: 'Desarrollo de APIs RESTful.' 
        }
      ]);
      setSkills(['JavaScript', 'React', 'Node.js', 'Git']);
      setLanguages([{ language: 'Español', level: 'Nativo' }, { language: 'Inglés', level: 'Intermedio' }]);
      setCertifications([
        { id: 1, name: 'Curso de React Native', organization: 'Udemy', startMonth: '01', startYear: '2023', endMonth: '03', endYear: '2023' }
      ]);
      setReferences([
        { name: 'Ing. Juan Pérez', contact: '8888-8888' },
        { name: '', contact: '' },
        { name: '', contact: '' }
      ]);
    }
  }, [mode, route.params]);

  const handleNext = () => {
    if (currentStep < STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Construct the final data object
      const cvData = {
        summary,
        secondaryEducation: { 
          school: secondarySchool, 
          title: secondaryTitle, 
          startMonth: secondaryStartMonth,
          startYear: secondaryStartYear,
          endMonth: secondaryEndMonth,
          endYear: secondaryEndYear,
          // ISO Dates for Education
          startDateISO: (secondaryStartMonth && secondaryStartYear) ? new Date(parseInt(secondaryStartYear), parseInt(secondaryStartMonth) - 1, 1).toISOString() : null,
          endDateISO: (secondaryEndMonth && secondaryEndYear) ? new Date(parseInt(secondaryEndYear), parseInt(secondaryEndMonth) - 1, 1).toISOString() : null
        },
        experience: experiences,
        certifications,
        skills,
        languages,
        references
      };

      // Save data to mock user
      currentUser.cvProfile = cvData;

      // Show JSON for debugging/backend implementation
      setFinalJson(JSON.stringify(cvData, null, 2));
      setJsonModalVisible(true);
    }
  };

  const handleFinalize = () => {
    setJsonModalVisible(false);
    navigation.navigate('CVPreview');
  };

  const handleCopyJson = async () => {
    await Clipboard.setStringAsync(finalJson);
    Alert.alert('Copiado', 'El JSON ha sido copiado al portapapeles.');
  };

  const handleSaveExperience = () => {
    const errors: any = {};
    if (!newExperience.title.trim()) errors.title = 'El cargo es requerido';
    if (!newExperience.company.trim()) errors.company = 'La empresa es requerida';
    
    if (!newExperience.startMonth || !newExperience.startYear) {
      errors.startDate = 'Fecha de inicio incompleta';
    }
    
    if (!newExperience.isCurrent && (!newExperience.endMonth || !newExperience.endYear)) {
      errors.endDate = 'Fecha de fin incompleta';
    }

    if (Object.keys(errors).length > 0) {
      setExperienceErrors(errors);
      return;
    }

    const startDate = `${newExperience.startMonth}/${newExperience.startYear}`;
    const endDate = newExperience.isCurrent ? 'Presente' : `${newExperience.endMonth}/${newExperience.endYear}`;

    // Generate ISO dates for backend
    const startMonthInt = parseInt(newExperience.startMonth, 10);
    const startYearInt = parseInt(newExperience.startYear, 10);
    const startDateISO = new Date(startYearInt, startMonthInt - 1, 1).toISOString();
    
    let endDateISO = null;
    if (!newExperience.isCurrent && newExperience.endMonth && newExperience.endYear) {
        const endMonthInt = parseInt(newExperience.endMonth, 10);
        const endYearInt = parseInt(newExperience.endYear, 10);
        endDateISO = new Date(endYearInt, endMonthInt - 1, 1).toISOString();
    }

    setExperiences([...experiences, { 
      ...newExperience, 
      dates: `${startDate} - ${endDate}`,
      startDateISO,
      endDateISO,
      id: Date.now() 
    }]);
    
    setNewExperience({
      title: '',
      company: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isCurrent: false,
      description: ''
    });
    setExperienceErrors({});
    setExperienceModalVisible(false);
  };

  const handleSaveCertification = () => {
    const errors: any = {};
    if (!newCert.name.trim()) errors.name = 'El nombre es requerido';
    if (!newCert.organization.trim()) errors.organization = 'La institución es requerida';
    
    if (!newCert.startMonth || !newCert.startYear) {
      errors.startDate = 'Fecha de inicio incompleta';
    }
    if (!newCert.endMonth || !newCert.endYear) {
      errors.endDate = 'Fecha de fin incompleta';
    }

    if (Object.keys(errors).length > 0) {
      setCertErrors(errors);
      return;
    }

    // Generate ISO dates for backend
    const startMonthInt = parseInt(newCert.startMonth, 10);
    const startYearInt = parseInt(newCert.startYear, 10);
    const startDateISO = new Date(startYearInt, startMonthInt - 1, 1).toISOString();
    
    const endMonthInt = parseInt(newCert.endMonth, 10);
    const endYearInt = parseInt(newCert.endYear, 10);
    const endDateISO = new Date(endYearInt, endMonthInt - 1, 1).toISOString();

    setCertifications([...certifications, { 
      ...newCert, 
      startDateISO,
      endDateISO,
      id: Date.now() 
    }]);
    setNewCert({ name: '', organization: '', startMonth: '', startYear: '', endMonth: '', endYear: '' });
    setCertErrors({});
    setCertModalVisible(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, { language: languageInput.trim(), level: languageLevel }]);
      setLanguageInput('');
      setLanguageLevel('Básico');
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        ¿Quién eres como profesional?
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Escribe un breve resumen. Menciona tu nivel, fortalezas e intereses.
      </Text>
      
      <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.textArea, { color: colors.text }]}
          multiline
          numberOfLines={6}
          placeholder="Soy un estudiante apasionado por..."
          placeholderTextColor={colors.textSecondary}
          value={summary}
          onChangeText={setSummary}
        />
      </View>
      
      <TouchableOpacity style={[styles.aiButton, { backgroundColor: colors.chipBg }]}>
        <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
        <Text style={[styles.aiButtonText, { color: colors.primary }]}>Ayúdame a redactar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Antecedentes Académicos
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Un par de datos sobre tu educación secundaria.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>CENTRO DE ESTUDIOS</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondarySchool}
          onChangeText={setSecondarySchool}
          placeholder="Ej. Instituto Nacional..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>TÍTULO OBTENIDO</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryTitle}
          onChangeText={setSecondaryTitle}
          placeholder="Ej. Bachiller en Ciencias..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>FECHA DE INICIO</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryStartMonth}
          onChangeText={setSecondaryStartMonth}
          placeholder="Mes (MM)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryStartYear}
          onChangeText={setSecondaryStartYear}
          placeholder="Año (YYYY)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>FECHA DE FIN</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryEndMonth}
          onChangeText={setSecondaryEndMonth}
          placeholder="Mes (MM)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryEndYear}
          onChangeText={setSecondaryEndYear}
          placeholder="Año (YYYY)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Experiencia Relevante
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Incluye trabajos anteriores, pasantías previas o proyectos académicos importantes.
      </Text>

      {experiences.map((exp, index) => (
        <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{exp.title}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{exp.company} • {exp.dates}</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={[styles.addButton, { borderColor: colors.primary, borderStyle: 'dashed' }]}
        onPress={() => {
          setNewExperience({
            title: '',
            company: '',
            startMonth: '',
            startYear: '',
            endMonth: '',
            endYear: '',
            isCurrent: false,
            description: ''
          });
          setExperienceErrors({});
          setExperienceModalVisible(true);
        }}
      >
        <FontAwesome5 name="plus" size={14} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>Agregar Experiencia</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Certificaciones y Cursos
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Agrega cursos, talleres o certificaciones que sumen valor a tu perfil.
      </Text>

      {certifications.map((cert, index) => (
        <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{cert.name}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {cert.organization} • {cert.startMonth}/{cert.startYear} - {cert.endMonth}/{cert.endYear}
          </Text>
        </View>
      ))}

      <TouchableOpacity 
        style={[styles.addButton, { borderColor: colors.primary, borderStyle: 'dashed' }]}
        onPress={() => {
          setNewCert({ name: '', organization: '', year: '' });
          setCertErrors({});
          setCertModalVisible(true);
        }}
      >
        <FontAwesome5 name="plus" size={14} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>Agregar Certificación</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Idiomas
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        ¿Qué idiomas hablas y cuál es tu nivel de dominio?
      </Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={languageInput}
          onChangeText={setLanguageInput}
          placeholder="Ej. Inglés, Francés..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 12 }]}>NIVEL</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {['Básico', 'Intermedio', 'Avanzado', 'Nativo'].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => setLanguageLevel(level)}
            style={[
              styles.levelChip,
              { 
                borderColor: languageLevel === level ? colors.primary : colors.border,
                backgroundColor: languageLevel === level ? colors.primary + '20' : 'transparent'
              }
            ]}
          >
            <Text style={{ 
              color: languageLevel === level ? colors.primary : colors.textSecondary,
              fontWeight: languageLevel === level ? 'bold' : 'normal'
            }}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        onPress={handleAddLanguage} 
        style={[
          styles.button, 
          { 
            backgroundColor: 'transparent', 
            borderWidth: 1, 
            borderColor: colors.primary, 
            height: 48, 
            marginBottom: 24,
            elevation: 0,
            shadowOpacity: 0
          }
        ]}
      >
        <FontAwesome5 name="plus" size={14} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Agregar Idioma</Text>
      </TouchableOpacity>

      <View style={styles.languagesList}>
        {languages.map((lang, index) => (
          <View key={index} style={[styles.languageItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.languageInfo}>
              <Text style={[styles.languageName, { color: colors.text }]}>{lang.language}</Text>
              <View style={[styles.languageLevelBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{lang.level}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setLanguages(languages.filter((_, i) => i !== index))}
              style={styles.deleteButton}
            >
              <FontAwesome5 name="trash-alt" size={18} color={colors.error || '#FF4444'} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Tus Armas Secretas
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        ¿Qué herramientas dominas? (Software, Soft Skills, Tecnologías)
      </Text>

      <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center' }]}>
        <TextInput
          style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={skillInput}
          onChangeText={setSkillInput}
          placeholder="Ej. Excel, Python..."
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={handleAddSkill}
        />
        <TouchableOpacity onPress={handleAddSkill} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
          <FontAwesome5 name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipsContainer}>
        {skills.map((skill, index) => (
          <View key={index} style={[styles.chip, { backgroundColor: colors.chipBg }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>{skill}</Text>
            <TouchableOpacity onPress={() => setSkills(skills.filter((_, i) => i !== index))}>
              <FontAwesome5 name="times" size={12} color={colors.textSecondary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary, marginTop: 24 }]}>SUGERENCIAS</Text>
      <View style={styles.chipsContainer}>
        {['Liderazgo', 'Trabajo en Equipo', 'AutoCAD', 'Scrum'].map((s) => (
          <TouchableOpacity key={s} onPress={() => setSkills([...skills, s])} style={[styles.suggestionChip, { borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep7 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
        Referencias
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Necesitamos 3 personas que den fe de tu capacidad.
      </Text>

      {references.map((ref, index) => (
        <View key={index} style={[styles.referenceBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.refNumber, { backgroundColor: colors.chipBg }]}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.refInput, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textSecondary}
              value={ref.name}
              onChangeText={(text) => {
                const newRefs = [...references];
                newRefs[index].name = text;
                setReferences(newRefs);
              }}
            />
            <TextInput
              style={[styles.refInput, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Teléfono o Correo"
              placeholderTextColor={colors.textSecondary}
              value={ref.contact}
              onChangeText={(text) => {
                const newRefs = [...references];
                newRefs[index].contact = text;
                setReferences(newRefs);
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderExperienceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={experienceModalVisible}
      onRequestClose={() => setExperienceModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Experiencia</Text>
          
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: experienceErrors.title ? 'red' : colors.border }]}
              placeholder="Cargo / Título"
              placeholderTextColor={colors.textSecondary}
              value={newExperience.title}
              onChangeText={(text) => setNewExperience({...newExperience, title: text})}
            />
            {experienceErrors.title && <Text style={styles.errorText}>{experienceErrors.title}</Text>}
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: experienceErrors.company ? 'red' : colors.border }]}
              placeholder="Empresa / Organización"
              placeholderTextColor={colors.textSecondary}
              value={newExperience.company}
              onChangeText={(text) => setNewExperience({...newExperience, company: text})}
            />
            {experienceErrors.company && <Text style={styles.errorText}>{experienceErrors.company}</Text>}
          </View>
          
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>FECHA DE INICIO</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: experienceErrors.startDate ? 'red' : colors.border }]}
              placeholder="Mes (MM)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={2}
              value={newExperience.startMonth}
              onChangeText={(text) => setNewExperience({...newExperience, startMonth: text})}
            />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: experienceErrors.startDate ? 'red' : colors.border }]}
              placeholder="Año (YYYY)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              value={newExperience.startYear}
              onChangeText={(text) => setNewExperience({...newExperience, startYear: text})}
            />
          </View>
          {experienceErrors.startDate && <Text style={[styles.errorText, { marginTop: -8, marginBottom: 8 }]}>{experienceErrors.startDate}</Text>}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: colors.text }}>¿Trabajo actual?</Text>
            <Switch
              value={newExperience.isCurrent}
              onValueChange={(val) => setNewExperience({...newExperience, isCurrent: val})}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {!newExperience.isCurrent && (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>FECHA DE FIN</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <TextInput
                  style={[styles.input, { flex: 1, color: colors.text, borderColor: experienceErrors.endDate ? 'red' : colors.border }]}
                  placeholder="Mes (MM)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                  value={newExperience.endMonth}
                  onChangeText={(text) => setNewExperience({...newExperience, endMonth: text})}
                />
                <TextInput
                  style={[styles.input, { flex: 1, color: colors.text, borderColor: experienceErrors.endDate ? 'red' : colors.border }]}
                  placeholder="Año (YYYY)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={4}
                  value={newExperience.endYear}
                  onChangeText={(text) => setNewExperience({...newExperience, endYear: text})}
                />
              </View>
              {experienceErrors.endDate && <Text style={[styles.errorText, { marginTop: -8, marginBottom: 8 }]}>{experienceErrors.endDate}</Text>}
            </>
          )}
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, marginBottom: 24, height: 100, textAlignVertical: 'top' }]}
            placeholder="Descripción de responsabilidades..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={newExperience.description}
            onChangeText={(text) => setNewExperience({...newExperience, description: text})}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.border }]} 
              onPress={() => {
                setExperienceErrors({});
                setExperienceModalVisible(false);
              }}
            >
              <Text style={{ color: colors.text }}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]} 
              onPress={handleSaveExperience}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCertModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={certModalVisible}
      onRequestClose={() => setCertModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Certificación</Text>
          
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: certErrors.name ? 'red' : colors.border }]}
              placeholder="Nombre del Curso / Certificación"
              placeholderTextColor={colors.textSecondary}
              value={newCert.name}
              onChangeText={(text) => setNewCert({...newCert, name: text})}
            />
            {certErrors.name && <Text style={styles.errorText}>{certErrors.name}</Text>}
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: certErrors.organization ? 'red' : colors.border }]}
              placeholder="Institución / Plataforma"
              placeholderTextColor={colors.textSecondary}
              value={newCert.organization}
              onChangeText={(text) => setNewCert({...newCert, organization: text})}
            />
            {certErrors.organization && <Text style={styles.errorText}>{certErrors.organization}</Text>}
          </View>
          
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>FECHA DE INICIO</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: certErrors.startDate ? 'red' : colors.border }]}
              placeholder="Mes (MM)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={2}
              value={newCert.startMonth}
              onChangeText={(text) => setNewCert({...newCert, startMonth: text})}
            />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: certErrors.startDate ? 'red' : colors.border }]}
              placeholder="Año (YYYY)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              value={newCert.startYear}
              onChangeText={(text) => setNewCert({...newCert, startYear: text})}
            />
          </View>
          {certErrors.startDate && <Text style={[styles.errorText, { marginTop: -8, marginBottom: 8 }]}>{certErrors.startDate}</Text>}

          <Text style={[styles.label, { color: colors.textSecondary }]}>FECHA DE FIN</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: certErrors.endDate ? 'red' : colors.border }]}
              placeholder="Mes (MM)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={2}
              value={newCert.endMonth}
              onChangeText={(text) => setNewCert({...newCert, endMonth: text})}
            />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.text, borderColor: certErrors.endDate ? 'red' : colors.border }]}
              placeholder="Año (YYYY)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              value={newCert.endYear}
              onChangeText={(text) => setNewCert({...newCert, endYear: text})}
            />
          </View>
          {certErrors.endDate && <Text style={[styles.errorText, { marginTop: -8, marginBottom: 8 }]}>{certErrors.endDate}</Text>}

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.border }]} 
              onPress={() => {
                setCertErrors({});
                setCertModalVisible(false);
              }}
            >
              <Text style={{ color: colors.text }}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]} 
              onPress={handleSaveCertification}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderJsonModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={jsonModalVisible}
      onRequestClose={handleFinalize}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, height: '80%' }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>JSON Generado</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
            Esta es la estructura de datos para tu backend:
          </Text>
          
          <ScrollView style={[styles.jsonContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontFamily: 'monospace', color: colors.text }}>{finalJson}</Text>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.border, flex: 1, marginTop: 16 }]} 
              onPress={handleCopyJson}
            >
              <FontAwesome5 name="copy" size={16} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { color: colors.text }]}>Copiar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, flex: 1, marginTop: 16 }]} 
              onPress={handleFinalize}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      {renderExperienceModal()}
      {renderCertModal()}
      {renderJsonModal()}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <Animated.View 
                layout={Layout.springify()} 
                style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(currentStep / STEPS) * 100}%` }]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Paso {currentStep} de {STEPS}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View 
            key={currentStep} 
            entering={FadeInRight} 
            exiting={FadeOutLeft}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
            {currentStep === 7 && renderStep7()}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={[styles.buttonText, { color: '#FFF' }]}>
              {currentStep === STEPS ? 'Finalizar' : 'Siguiente'}
            </Text>
            <FontAwesome5 name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  progressWrapper: {
    flex: 1,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 24,
    lineHeight: 20,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    textAlignVertical: 'top',
    fontSize: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiButtonText: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  referenceBlock: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  refNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  refInput: {
    borderBottomWidth: 1,
    paddingVertical: 4,
    marginBottom: 8,
    fontSize: 16,
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
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  languagesList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jsonContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
});

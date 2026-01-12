import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, Switch, Alert, BackHandler } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, Layout, FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import ScreenContainer from '../../components/ScreenContainer';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';
import MonthYearPicker from '../../components/MonthYearPicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { currentUser } from '../../mock/user';
import { useAuth } from '../../context/AuthContext';
import { skillService, Skill } from '../../services/skillService';
import SkeletonChip from '../../components/skeletons/SkeletonChip';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CVWizard'>;

const STEPS = 7;

const COMMON_LANGUAGES = [
  "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", 
  "Chino Mandarín", "Japonés", "Coreano", "Ruso", "Árabe", "Hindi", "Holandés"
];

export default function OnboardingCVWizardScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { userToken } = useAuth();
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
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);

  // Refs for Step 2
  const schoolRef = useRef<TextInput>(null);
  const titleRef = useRef<TextInput>(null);

  // Refs for Experience Modal
  const expCompanyRef = useRef<TextInput>(null);
  const expTitleRef = useRef<TextInput>(null);
  const expDescriptionRef = useRef<TextInput>(null);

  // Refs for Certification Modal
  const certNameRef = useRef<TextInput>(null);
  const certOrgRef = useRef<TextInput>(null);

  const [certifications, setCertifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [skillSearchResults, setSkillSearchResults] = useState<Skill[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);
  const [languages, setLanguages] = useState<{ id: number, language: string, level: string }[]>([
    { id: 1, language: 'Español', level: 'Nativo' }
  ]);
  
  // Language Modal State
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [newLanguage, setNewLanguage] = useState({ language: '', level: 'Básico' });
  const [languageErrors, setLanguageErrors] = useState<any>({});
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);

  const [references, setReferences] = useState([{ name: '', contact: '' }, { name: '', contact: '' }, { name: '', contact: '' }]);

  // Experience Modal State
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
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
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
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

  // Handle Android Back Button
  useEffect(() => {
    const backAction = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentStep]);

  const handleSkipStep2 = () => {
    // Clear all fields in step 2
    setSecondarySchool('');
    setSecondaryTitle('');
    setSecondaryStartMonth('');
    setSecondaryStartYear('');
    setSecondaryEndMonth('');
    setSecondaryEndYear('');
    
    // Close modal and proceed to next step
    setValidationModalVisible(false);
    setCurrentStep(currentStep + 1);
  };

  // Fetch Suggested Skills
  useEffect(() => {
    if (currentStep === 6 && userToken && suggestedSkills.length === 0) {
      loadSuggestedSkills();
    }
  }, [currentStep, userToken]);

  const loadSuggestedSkills = async () => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await skillService.getSuggestedSkills(userToken!);
      setSuggestedSkills(suggestions);
    } catch (error) {
      console.error('Error loading suggested skills:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Search Skills
  const handleSearchSkills = async (text: string) => {
    setSkillInput(text);
    if (text.length >= 2 && userToken) {
      setIsSearchingSkills(true);
      try {
        const results = await skillService.searchSkills(userToken, text);
        // Filter out already selected skills
        const filteredResults = results.filter(r => !skills.includes(r.name));
        setSkillSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching skills:', error);
      } finally {
        setIsSearchingSkills(false);
      }
    } else {
      setSkillSearchResults([]);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
        // Validation for Step 2 (Academic Background)
        const hasAnyData = secondarySchool || secondaryTitle || secondaryStartMonth || secondaryStartYear || secondaryEndMonth || secondaryEndYear;
        
        if (hasAnyData) {
            const isComplete = secondarySchool && secondaryTitle && secondaryStartMonth && secondaryStartYear && secondaryEndMonth && secondaryEndYear;
            if (!isComplete) {
                setValidationMessage('Parece que empezaste a llenar tu información académica pero faltan algunos datos.');
                setValidationModalVisible(true);
                return;
            }
        }
    }

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

    if (editingExperienceId !== null) {
        // Update existing experience
        setExperiences(experiences.map(exp => exp.id === editingExperienceId ? {
            ...exp,
            ...newExperience,
            dates: `${startDate} - ${endDate}`,
            startDateISO,
            endDateISO
        } : exp));
    } else {
        // Add new experience
        setExperiences([...experiences, { 
            ...newExperience, 
            dates: `${startDate} - ${endDate}`,
            startDateISO,
            endDateISO,
            id: Date.now() 
        }]);
    }
    
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
    setEditingExperienceId(null);
    setExperienceErrors({});
    setExperienceModalVisible(false);
  };

  const handleDeleteExperience = (id: number) => {
    Alert.alert(
        'Eliminar experiencia',
        '¿Estás seguro de que quieres eliminar esta experiencia?',
        [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Eliminar', 
                style: 'destructive', 
                onPress: () => setExperiences(experiences.filter(exp => exp.id !== id)) 
            }
        ]
    );
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

    if (editingCertId !== null) {
        // Update existing certification
        setCertifications(certifications.map(cert => cert.id === editingCertId ? {
            ...cert,
            ...newCert,
            startDateISO,
            endDateISO
        } : cert));
    } else {
        // Add new certification
        setCertifications([...certifications, { 
            ...newCert, 
            startDateISO,
            endDateISO,
            id: Date.now() 
        }]);
    }

    setNewCert({ name: '', organization: '', startMonth: '', startYear: '', endMonth: '', endYear: '' });
    setEditingCertId(null);
    setCertErrors({});
    setCertModalVisible(false);
  };

  const handleDeleteCertification = (id: number) => {
    Alert.alert(
        'Eliminar certificación',
        '¿Estás seguro de que quieres eliminar esta certificación?',
        [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Eliminar', 
                style: 'destructive', 
                onPress: () => setCertifications(certifications.filter(cert => cert.id !== id)) 
            }
        ]
    );
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
      setSkillSearchResults([]);
    }
  };

  const handleSaveLanguage = () => {
    const errors: any = {};
    if (!newLanguage.language.trim()) errors.language = 'El idioma es requerido';
    
    if (Object.keys(errors).length > 0) {
      setLanguageErrors(errors);
      return;
    }

    if (editingLanguageId !== null) {
        setLanguages(languages.map(lang => lang.id === editingLanguageId ? {
            ...lang,
            ...newLanguage
        } : lang));
    } else {
        setLanguages([...languages, { 
            ...newLanguage, 
            id: Date.now() 
        }]);
    }

    setNewLanguage({ language: '', level: 'Básico' });
    setEditingLanguageId(null);
    setLanguageErrors({});
    setLanguageModalVisible(false);
  };

  const handleDeleteLanguage = (id: number) => {
    Alert.alert(
        'Eliminar idioma',
        '¿Estás seguro de que quieres eliminar este idioma?',
        [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Eliminar', 
                style: 'destructive', 
                onPress: () => setLanguages(languages.filter(lang => lang.id !== id)) 
            }
        ]
    );
  };

  const handleLanguageChange = (text: string) => {
    setNewLanguage({ ...newLanguage, language: text });
    if (text.length > 0) {
      const filtered = COMMON_LANGUAGES.filter(lang => 
        lang.toLowerCase().includes(text.toLowerCase())
      );
      setLanguageSuggestions(filtered);
      setShowLanguageSuggestions(true);
    } else {
      setShowLanguageSuggestions(false);
    }
  };

  const selectLanguage = (lang: string) => {
    setNewLanguage({ ...newLanguage, language: lang });
    setShowLanguageSuggestions(false);
  };

  const renderStep1 = () => {
    const minLength = 20;
    const maxLength = 120;
    const currentLength = summary.length;
    const isValid = currentLength >= minLength && currentLength <= maxLength;
    const isError = currentLength > 0 && currentLength < minLength;
    
    return (
    <View>
      <OnboardingHeader 
        icon="user-tie" 
        title="¿Quién eres como profesional?" 
        subtitle="Escribe un breve resumen. Menciona tu nivel, fortalezas e intereses."
      />
      
      <View style={[styles.textAreaContainer, { 
        backgroundColor: colors.surface, 
        borderColor: isError ? colors.error : (isValid ? colors.primary : colors.border),
        borderWidth: isValid || isError ? 1.5 : 1,
        paddingBottom: 8
      }]}>
        <TextInput
          style={[styles.textArea, { color: colors.text }]}
          multiline
          numberOfLines={6}
          placeholder="Soy un estudiante apasionado por..."
          placeholderTextColor={colors.textSecondary}
          value={summary}
          onChangeText={setSummary}
          maxLength={maxLength}
        />
        <View style={{ alignSelf: 'flex-end', marginTop: 4 }}>
          <Text style={{ 
            color: isError ? colors.error : (isValid ? colors.primary : colors.textSecondary), 
            fontSize: 12,
            fontWeight: isValid ? '600' : '400'
          }}>
            {currentLength} / {maxLength}
          </Text>
        </View>
      </View>
      
      {isError && (
        <Animated.View entering={FadeInDown} exiting={FadeOut}>
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            ⚠️ El resumen es muy corto (mínimo {minLength} caracteres)
            </Text>
        </Animated.View>
      )}
    </View>
  )};

  const renderStep2 = () => (
    <View>
      <OnboardingHeader 
        icon="school" 
        title="Antecedentes Académicos" 
        subtitle="Un par de datos sobre tu educación secundaria."
        optional
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>CENTRO DE ESTUDIOS</Text>
        <TextInput
          ref={schoolRef}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondarySchool}
          onChangeText={setSecondarySchool}
          placeholder="Ej. Instituto Nacional..."
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          onSubmitEditing={() => setTitleModalVisible(true)}
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>TÍTULO OBTENIDO</Text>
        <TouchableOpacity
          onPress={() => setTitleModalVisible(true)}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center', paddingVertical: 16 }]}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: secondaryTitle ? colors.text : colors.textSecondary, fontSize: 16 }}>
                    {secondaryTitle || "Selecciona tu título..."}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
            </View>
        </TouchableOpacity>
      </View>

      <MonthYearPicker
        label="FECHA DE INICIO"
        selectedMonth={secondaryStartMonth}
        selectedYear={secondaryStartYear}
        onMonthChange={setSecondaryStartMonth}
        onYearChange={setSecondaryStartYear}
      />

      <MonthYearPicker
        label="FECHA DE FIN"
        selectedMonth={secondaryEndMonth}
        selectedYear={secondaryEndYear}
        onMonthChange={setSecondaryEndMonth}
        onYearChange={setSecondaryEndYear}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <OnboardingHeader 
        icon="briefcase" 
        title="Experiencia Relevante" 
        subtitle="Incluye trabajos anteriores, pasantías previas o proyectos académicos importantes."
        optional
      />

      {experiences.map((exp, index) => (
        <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            onPress={() => {
                setNewExperience({
                    title: exp.title,
                    company: exp.company,
                    startMonth: exp.startMonth,
                    startYear: exp.startYear,
                    endMonth: exp.endMonth,
                    endYear: exp.endYear,
                    isCurrent: exp.isCurrent,
                    description: exp.description || ''
                });
                setEditingExperienceId(exp.id);
                setExperienceErrors({});
                setExperienceModalVisible(true);
            }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{exp.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{exp.company} • {exp.dates}</Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => handleDeleteExperience(exp.id)}
          >
            <FontAwesome5 name="trash-alt" size={16} color={colors.error} />
          </TouchableOpacity>
        </TouchableOpacity>
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
          setEditingExperienceId(null);
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
      <OnboardingHeader 
        icon="certificate" 
        title="Certificaciones y Cursos"
        subtitle="Agrega cursos, talleres o certificaciones que sumen valor a tu perfil."
        optional
      />

      {certifications.map((cert, index) => (
        <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            onPress={() => {
                setNewCert({
                    name: cert.name,
                    organization: cert.organization,
                    startMonth: cert.startMonth,
                    startYear: cert.startYear,
                    endMonth: cert.endMonth,
                    endYear: cert.endYear
                });
                setEditingCertId(cert.id);
                setCertErrors({});
                setCertModalVisible(true);
            }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{cert.name}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {cert.organization} • {cert.startMonth}/{cert.startYear} - {cert.endMonth}/{cert.endYear}
            </Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => handleDeleteCertification(cert.id)}
          >
            <FontAwesome5 name="trash-alt" size={16} color={colors.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.addButton, { borderColor: colors.primary, borderStyle: 'dashed' }]}
        onPress={() => {
          setNewCert({ name: '', organization: '', startMonth: '', startYear: '', endMonth: '', endYear: '' });
          setEditingCertId(null);
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
      <OnboardingHeader 
        icon="language" 
        title="Idiomas" 
        subtitle="¿Qué idiomas hablas y cuál es tu nivel de dominio?"
      />

      {languages.map((lang, index) => (
        <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            onPress={() => {
                setNewLanguage({
                    language: lang.language,
                    level: lang.level
                });
                setEditingLanguageId(lang.id);
                setLanguageErrors({});
                setLanguageModalVisible(true);
            }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{lang.language}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{lang.level}</Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => handleDeleteLanguage(lang.id)}
          >
            <FontAwesome5 name="trash-alt" size={16} color={colors.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.addButton, { borderColor: colors.primary, borderStyle: 'dashed' }]}
        onPress={() => {
          setNewLanguage({ language: '', level: 'Básico' });
          setEditingLanguageId(null);
          setLanguageErrors({});
          setLanguageModalVisible(true);
        }}
      >
        <FontAwesome5 name="plus" size={14} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>Agregar Idioma</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={{ zIndex: 100 }}>
      <OnboardingHeader 
        icon="tools" 
        title="Tus Armas Secretas" 
        subtitle="¿Qué herramientas dominas? (Software, Soft Skills, Tecnologías)"
      />

      <View style={{ zIndex: 1000 }}>
        <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center' }]}>
          <TextInput
            style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={skillInput}
            onChangeText={handleSearchSkills}
            placeholder="Ej. Excel, Python..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleAddSkill}
          />
          <TouchableOpacity onPress={handleAddSkill} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="plus" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Results Dropdown */}
        {skillSearchResults.length > 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
              {skillSearchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    if (!skills.includes(item.name)) {
                      setSkills([...skills, item.name]);
                    }
                    setSkillInput('');
                    setSkillSearchResults([]);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={[styles.chipsContainer, { zIndex: 1 }]}>
        {skills.map((skill, index) => (
          <View key={index} style={[styles.chip, { backgroundColor: colors.chipBg }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>{skill}</Text>
            <TouchableOpacity onPress={() => setSkills(skills.filter((_, i) => i !== index))}>
              <FontAwesome5 name="times" size={12} color={colors.textSecondary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary, marginTop: 24, zIndex: 1 }]}>SUGERENCIAS</Text>
      <View style={[styles.chipsContainer, { zIndex: 1 }]}>
        {isLoadingSuggestions ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonChip key={i} width={80 + Math.random() * 40} />
          ))
        ) : (
          suggestedSkills.map((s) => (
            <TouchableOpacity 
              key={s.id} 
              onPress={() => {
                if (!skills.includes(s.name)) {
                  setSkills([...skills, s.name]);
                }
              }} 
              style={[
                styles.suggestionChip, 
                { borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
                skills.includes(s.name) && { opacity: 0.5 }
              ]}
              disabled={skills.includes(s.name)}
            >
              <Text style={{ color: colors.textSecondary }}>{s.name}</Text>
              {s.type === 'popular' && (
                <FontAwesome5 name="fire" size={10} color={colors.primary} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      {skills.length < 3 && (
        <Animated.View entering={FadeInDown} exiting={FadeOut} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.error, fontSize: 12 }}>
            ⚠️ Agrega al menos 3 habilidades para continuar ({skills.length}/3)
            </Text>
        </Animated.View>
      )}
    </View>
  );

  const renderStep7 = () => (
    <View>
      <OnboardingHeader 
        icon="users" 
        title="Referencias" 
        subtitle="Necesitamos 3 personas que den fe de tu capacidad."
      />

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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%' }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingExperienceId !== null ? 'Editar Experiencia' : 'Nueva Experiencia'}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={expCompanyRef}
                style={[styles.input, { color: colors.text, borderColor: experienceErrors.company ? 'red' : colors.border }]}
                placeholder="Empresa / Organización"
                placeholderTextColor={colors.textSecondary}
                value={newExperience.company}
                onChangeText={(text) => setNewExperience({...newExperience, company: text})}
                returnKeyType="next"
                onSubmitEditing={() => expTitleRef.current?.focus()}
                blurOnSubmit={false}
                />
                {experienceErrors.company && <Text style={styles.errorText}>{experienceErrors.company}</Text>}
            </View>

            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={expTitleRef}
                style={[styles.input, { color: colors.text, borderColor: experienceErrors.title ? 'red' : colors.border }]}
                placeholder="Cargo / Título"
                placeholderTextColor={colors.textSecondary}
                value={newExperience.title}
                onChangeText={(text) => setNewExperience({...newExperience, title: text})}
                returnKeyType="next"
                onSubmitEditing={() => expStartMonthRef.current?.focus()}
                blurOnSubmit={false}
                />
                {experienceErrors.title && <Text style={styles.errorText}>{experienceErrors.title}</Text>}
            </View>
            
            <MonthYearPicker
              label="FECHA DE INICIO"
              selectedMonth={newExperience.startMonth}
              selectedYear={newExperience.startYear}
              onMonthChange={(val) => setNewExperience({...newExperience, startMonth: val})}
              onYearChange={(val) => setNewExperience({...newExperience, startYear: val})}
              error={experienceErrors.startDate}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: colors.text }}>¿Trabajo actual?</Text>
                <Switch
                value={newExperience.isCurrent}
                onValueChange={(val) => setNewExperience({...newExperience, isCurrent: val})}
                trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>

            {!newExperience.isCurrent && (
                <MonthYearPicker
                  label="FECHA DE FIN"
                  selectedMonth={newExperience.endMonth}
                  selectedYear={newExperience.endYear}
                  onMonthChange={(val) => setNewExperience({...newExperience, endMonth: val})}
                  onYearChange={(val) => setNewExperience({...newExperience, endYear: val})}
                  error={experienceErrors.endDate}
                />
            )}
            
            <TextInput
                ref={expDescriptionRef}
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
                    setEditingExperienceId(null);
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderCertModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={certModalVisible}
      onRequestClose={() => setCertModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%' }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingCertId !== null ? 'Editar Certificación' : 'Nueva Certificación'}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={certNameRef}
                style={[styles.input, { color: colors.text, borderColor: certErrors.name ? 'red' : colors.border }]}
                placeholder="Nombre del Curso / Certificación"
                placeholderTextColor={colors.textSecondary}
                value={newCert.name}
                onChangeText={(text) => setNewCert({...newCert, name: text})}
                returnKeyType="next"
                onSubmitEditing={() => certOrgRef.current?.focus()}
                blurOnSubmit={false}
                />
                {certErrors.name && <Text style={styles.errorText}>{certErrors.name}</Text>}
            </View>
            
            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={certOrgRef}
                style={[styles.input, { color: colors.text, borderColor: certErrors.organization ? 'red' : colors.border }]}
                placeholder="Institución / Plataforma"
                placeholderTextColor={colors.textSecondary}
                value={newCert.organization}
                onChangeText={(text) => setNewCert({...newCert, organization: text})}
                returnKeyType="next"
                onSubmitEditing={() => certStartMonthRef.current?.focus()}
                blurOnSubmit={false}
                />
                {certErrors.organization && <Text style={styles.errorText}>{certErrors.organization}</Text>}
            </View>
            
            <MonthYearPicker
              label="FECHA DE INICIO"
              selectedMonth={newCert.startMonth}
              selectedYear={newCert.startYear}
              onMonthChange={(val) => setNewCert({...newCert, startMonth: val})}
              onYearChange={(val) => setNewCert({...newCert, startYear: val})}
              error={certErrors.startDate}
            />

            <MonthYearPicker
              label="FECHA DE FIN"
              selectedMonth={newCert.endMonth}
              selectedYear={newCert.endYear}
              onMonthChange={(val) => setNewCert({...newCert, endMonth: val})}
              onYearChange={(val) => setNewCert({...newCert, endYear: val})}
              error={certErrors.endDate}
            />

            <View style={styles.modalButtons}>
                <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]} 
                onPress={() => {
                    setCertErrors({});
                    setEditingCertId(null);
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={languageModalVisible}
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%' }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingLanguageId !== null ? 'Editar Idioma' : 'Nuevo Idioma'}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 12, zIndex: 10 }}>
                <TextInput
                style={[styles.input, { color: colors.text, borderColor: languageErrors.language ? 'red' : colors.border }]}
                placeholder="Idioma (Ej. Inglés)"
                placeholderTextColor={colors.textSecondary}
                value={newLanguage.language}
                onChangeText={handleLanguageChange}
                />
                {languageErrors.language && <Text style={styles.errorText}>{languageErrors.language}</Text>}
                
                {showLanguageSuggestions && languageSuggestions.length > 0 && (
                  <View style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    backgroundColor: colors.surface, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    borderRadius: 8,
                    maxHeight: 150,
                    zIndex: 1000,
                    elevation: 5
                  }}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {languageSuggestions.map((item, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={{ padding: 12, borderBottomWidth: index === languageSuggestions.length - 1 ? 0 : 1, borderBottomColor: colors.border }}
                          onPress={() => selectLanguage(item)}
                        >
                          <Text style={{ color: colors.text }}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
            </View>
            
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 12 }]}>NIVEL</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Básico', 'Intermedio', 'Avanzado', 'Nativo'].map((level) => (
                <TouchableOpacity
                    key={level}
                    onPress={() => setNewLanguage({...newLanguage, level})}
                    style={[
                    styles.levelChip,
                    { 
                        borderColor: newLanguage.level === level ? colors.primary : colors.border,
                        backgroundColor: newLanguage.level === level ? colors.primary + '20' : 'transparent'
                    }
                    ]}
                >
                    <Text style={{ 
                    color: newLanguage.level === level ? colors.primary : colors.textSecondary,
                    fontWeight: newLanguage.level === level ? 'bold' : 'normal'
                    }}>
                    {level}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            <View style={styles.modalButtons}>
                <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]} 
                onPress={() => {
                    setLanguageErrors({});
                    setEditingLanguageId(null);
                    setLanguageModalVisible(false);
                }}
                >
                <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]} 
                onPress={handleSaveLanguage}
                >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text>
                </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderTitleModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={titleModalVisible}
      onRequestClose={() => setTitleModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setTitleModalVisible(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Selecciona tu título</Text>
          {['Bachiller en Ciencias y Letras', 'Bachiller Técnico', 'Técnico Medio', 'Técnico Superior'].map((item) => (
            <TouchableOpacity
                key={item}
                style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => {
                    setSecondaryTitle(item);
                    setTitleModalVisible(false);
                }}
            >
                <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                {secondaryTitle === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          
          {secondaryTitle !== '' && (
            <TouchableOpacity
                style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => {
                    setSecondaryTitle('');
                    setTitleModalVisible(false);
                }}
            >
                <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600' }}>Borrar selección</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{ marginTop: 16, paddingVertical: 12, alignItems: 'center' }}
            onPress={() => setTitleModalVisible(false)}
          >
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderValidationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={validationModalVisible}
      onRequestClose={() => setValidationModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, alignItems: 'center', padding: 32 }]}>
          <View style={{ 
            width: 72, 
            height: 72, 
            borderRadius: 36, 
            backgroundColor: colors.primary + '15', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 20
          }}>
            <FontAwesome5 name="clipboard-list" size={32} color={colors.primary} />
          </View>
          
          <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center', fontSize: 20, marginBottom: 12 }]}>
            ¿Datos incompletos?
          </Text>
          
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 28, fontSize: 16, lineHeight: 24 }}>
            {validationMessage} {'\n\n'}
            Puedes completar la información ahora o saltar este paso si prefieres no incluirla.
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, width: '100%', height: 50, marginBottom: 12 }]} 
            onPress={() => setValidationModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#FFF' }]}>Completar información</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: 'transparent', width: '100%', height: 50, borderWidth: 1, borderColor: colors.border }]} 
            onPress={handleSkipStep2}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Omitir y continuar</Text>
          </TouchableOpacity>
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
      {renderLanguageModal()}
      {renderTitleModal()}
      {renderValidationModal()}
      {renderJsonModal()}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
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

        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: 120 }]} 
          keyboardShouldPersistTaps="handled"
        >
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
          <GradientButton
            onPress={handleNext}
            title={currentStep === STEPS ? 'Finalizar' : 'Siguiente'}
            icon={<FontAwesome5 name="arrow-right" size={16} color="#FFF" />}
            iconPosition="right"
            disabled={
              (currentStep === 1 && (summary.length < 20 || summary.length > 120)) ||
              (currentStep === 6 && skills.length < 3)
            }
          />
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
  searchResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 100,
    backgroundColor: 'white',
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
});

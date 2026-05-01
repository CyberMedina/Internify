import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MonthYearPicker from '../../MonthYearPicker';

export interface Education {
  id?: number | string;
  institution: string;
  degree: string;
  startMonth?: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent: boolean;
  description?: string;
}

interface EducationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (education: Education) => void;
  initialData?: Education | null;
}

export default function EducationModal({ visible, onClose, onSave, initialData }: EducationModalProps) {
  const { colors } = useTheme();
  
  const [education, setEducation] = useState<Education>({
    institution: '',
    degree: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    description: ''
  });
  
  const [errors, setErrors] = useState<any>({});

  // Refs
  const instRef = useRef<TextInput>(null);
  const degreeRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setEducation({
          ...initialData,
          id: initialData.id,
          institution: initialData.institution || '',
          degree: initialData.degree || '',
          startMonth: initialData.startMonth || '',
          startYear: initialData.startYear || '',
          endMonth: initialData.endMonth || '',
          endYear: initialData.endYear || '',
          isCurrent: initialData.isCurrent || (!initialData.endYear && !initialData.endMonth),
          description: initialData.description || ''
        });
      } else {
        // Reset
        setEducation({
          institution: '',
          degree: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          description: ''
        });
      }
      setErrors({});
    }
  }, [visible, initialData]);

  const handleSave = () => {
    const newErrors: any = {};
    if (!education.institution.trim()) newErrors.institution = 'La institución es requerida';
    if (!education.degree.trim()) newErrors.degree = 'El título es requerido';
    
    if (!education.startYear) {
      newErrors.startDate = 'Año de inicio incompleto';
    }
    
    if (!education.isCurrent && !education.endYear) {
      newErrors.endDate = 'Año de fin incompleto';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(education);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      width: '100%',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%', flexShrink: 1, width: '100%' }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {initialData ? 'Editar Educación' : 'Nueva Educación'}
          </Text>
          
          <ScrollView 
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={instRef}
                style={[styles.input, { color: colors.text, borderColor: errors.institution ? 'red' : colors.border, backgroundColor: colors.surface }]}
                placeholder="Institución Educativa"
                placeholderTextColor={colors.textSecondary}
                value={education.institution}
                onChangeText={(text) => setEducation({...education, institution: text})}
                returnKeyType="next"
                onSubmitEditing={() => degreeRef.current?.focus()}
                blurOnSubmit={false}
                />
                {errors.institution && <Text style={styles.errorText}>{errors.institution}</Text>}
            </View>

            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={degreeRef}
                style={[styles.input, { color: colors.text, borderColor: errors.degree ? 'red' : colors.border, backgroundColor: colors.surface }]}
                placeholder="Título / Carrera"
                placeholderTextColor={colors.textSecondary}
                value={education.degree}
                onChangeText={(text) => setEducation({...education, degree: text})}
                returnKeyType="next"
                blurOnSubmit={false}
                />
                {errors.degree && <Text style={styles.errorText}>{errors.degree}</Text>}
            </View>
            
            <MonthYearPicker
              label="FECHA DE INICIO"
              selectedMonth={education.startMonth || ''}
              selectedYear={education.startYear}
              onMonthChange={(val) => setEducation({...education, startMonth: val})}
              onYearChange={(val) => setEducation({...education, startYear: val})}
              error={errors.startDate}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: colors.text }}>¿Cursando actualmente?</Text>
                <Switch
                value={education.isCurrent}
                onValueChange={(val) => setEducation({...education, isCurrent: val})}
                trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>

            {!education.isCurrent && (
                <MonthYearPicker
                  label="FECHA DE FIN"
                  selectedMonth={education.endMonth || ''}
                  selectedYear={education.endYear || ''}
                  onMonthChange={(val) => setEducation({...education, endMonth: val})}
                  onYearChange={(val) => setEducation({...education, endYear: val})}
                  error={errors.endDate}
                />
            )}
            
            <View style={styles.modalButtons}>
                <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]} 
                onPress={onClose}
                >
                <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]} 
                onPress={handleSave}
                >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text>
                </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MonthYearPicker from '../../MonthYearPicker';

export interface Experience {
  id?: number | string;
  title: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent: boolean;
  description: string;
  dates?: string; // Optional for display
}

interface ExperienceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (experience: Experience) => void;
  initialData?: Experience | null;
}

export default function ExperienceModal({ visible, onClose, onSave, initialData }: ExperienceModalProps) {
  const { colors } = useTheme();
  
  const [experience, setExperience] = useState<Experience>({
    title: '',
    company: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    description: ''
  });
  
  const [errors, setErrors] = useState<any>({});

  // Refs
  const expCompanyRef = useRef<TextInput>(null);
  const expTitleRef = useRef<TextInput>(null);
  const expDescriptionRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setExperience({
          ...initialData,
          // Ensure fields exist
          id: initialData.id,
          title: initialData.title || '',
          company: initialData.company || '',
          startMonth: initialData.startMonth || '',
          startYear: initialData.startYear || '',
          endMonth: initialData.endMonth || '',
          endYear: initialData.endYear || '',
          isCurrent: initialData.isCurrent || false,
          description: initialData.description || ''
        });
      } else {
        // Reset
        setExperience({
          title: '',
          company: '',
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
    if (!experience.title.trim()) newErrors.title = 'El cargo es requerido';
    if (!experience.company.trim()) newErrors.company = 'La empresa es requerida';
    
    if (!experience.startMonth || !experience.startYear) {
      newErrors.startDate = 'Fecha de inicio incompleta';
    }
    
    if (!experience.isCurrent && (!experience.endMonth || !experience.endYear)) {
      newErrors.endDate = 'Fecha de fin incompleta';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(experience);
  };

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
            {initialData ? 'Editar Experiencia' : 'Nueva Experiencia'}
          </Text>
          
          <ScrollView 
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={expCompanyRef}
                style={[styles.input, { color: colors.text, borderColor: errors.company ? 'red' : colors.border, backgroundColor: colors.surface }]}
                placeholder="Empresa / Organización"
                placeholderTextColor={colors.textSecondary}
                value={experience.company}
                onChangeText={(text) => setExperience({...experience, company: text})}
                returnKeyType="next"
                onSubmitEditing={() => expTitleRef.current?.focus()}
                blurOnSubmit={false}
                />
                {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
            </View>

            <View style={{ marginBottom: 12 }}>
                <TextInput
                ref={expTitleRef}
                style={[styles.input, { color: colors.text, borderColor: errors.title ? 'red' : colors.border, backgroundColor: colors.surface }]}
                placeholder="Cargo / Título"
                placeholderTextColor={colors.textSecondary}
                value={experience.title}
                onChangeText={(text) => setExperience({...experience, title: text})}
                returnKeyType="next"
                blurOnSubmit={false}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>
            
            <MonthYearPicker
              label="FECHA DE INICIO"
              selectedMonth={experience.startMonth}
              selectedYear={experience.startYear}
              onMonthChange={(val) => setExperience({...experience, startMonth: val})}
              onYearChange={(val) => setExperience({...experience, startYear: val})}
              error={errors.startDate}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: colors.text }}>¿Trabajo actual?</Text>
                <Switch
                value={experience.isCurrent}
                onValueChange={(val) => setExperience({...experience, isCurrent: val})}
                trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>

            {!experience.isCurrent && (
                <MonthYearPicker
                  label="FECHA DE FIN"
                  selectedMonth={experience.endMonth || ''}
                  selectedYear={experience.endYear || ''}
                  onMonthChange={(val) => setExperience({...experience, endMonth: val})}
                  onYearChange={(val) => setExperience({...experience, endYear: val})}
                  error={errors.endDate}
                />
            )}
            
            <TextInput
                ref={expDescriptionRef}
                style={[styles.input, { color: colors.text, borderColor: colors.border, marginBottom: 24, height: 100, textAlignVertical: 'top', backgroundColor: colors.surface }]}
                placeholder="Descripción de responsabilidades..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={experience.description}
                onChangeText={(text) => setExperience({...experience, description: text})}
            />

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

const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
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
});

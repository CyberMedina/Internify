import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MonthYearPicker from '../../MonthYearPicker';

export interface Certification {
  id?: number | string;
  name: string;
  organization: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  credentialUrl?: string;
  startDateISO?: string;
  endDateISO?: string;
}

interface CertificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (certification: Certification) => void;
  initialData?: Certification | null;
}

export default function CertificationModal({ visible, onClose, onSave, initialData }: CertificationModalProps) {
  const { colors } = useTheme();
  
  const [certification, setCertification] = useState<Certification>({
    name: '',
    organization: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    credentialUrl: ''
  });
  
  const [errors, setErrors] = useState<any>({});

  // Refs
  const nameRef = useRef<TextInput>(null);
  const orgRef = useRef<TextInput>(null);
  const urlRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setCertification({
          ...initialData,
          name: initialData.name || '',
          organization: initialData.organization || '',
          startMonth: initialData.startMonth || '',
          startYear: initialData.startYear || '',
          endMonth: initialData.endMonth || '',
          endYear: initialData.endYear || '',
          credentialUrl: initialData.credentialUrl || ''
        });
      } else {
        // Reset form
        setCertification({
          name: '',
          organization: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          credentialUrl: ''
        });
      }
      setErrors({});
    }
  }, [visible, initialData]);

  const handleSave = () => {
    const newErrors: any = {};
    if (!certification.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!certification.organization.trim()) newErrors.organization = 'La institución es requerida';
    
    if (!certification.startMonth || !certification.startYear) {
      newErrors.startDate = 'Fecha de inicio incompleta';
    }
    if (!certification.endMonth || !certification.endYear) {
      newErrors.endDate = 'Fecha de fin incompleta';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(certification);
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
            {initialData ? 'Editar Certificación' : 'Nueva Certificación'}
          </Text>
          
          <ScrollView 
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ marginBottom: 12 }}>
                <TextInput
                  ref={nameRef}
                  style={[styles.input, { color: colors.text, borderColor: errors.name ? 'red' : colors.border }]}
                  placeholder="Nombre del Curso / Certificación"
                  placeholderTextColor={colors.textSecondary}
                  value={certification.name}
                  onChangeText={(text) => setCertification({...certification, name: text})}
                  returnKeyType="next"
                  onSubmitEditing={() => orgRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={{ marginBottom: 12 }}>
                <TextInput
                  ref={orgRef}
                  style={[styles.input, { color: colors.text, borderColor: errors.organization ? 'red' : colors.border }]}
                  placeholder="Institución / Plataforma"
                  placeholderTextColor={colors.textSecondary}
                  value={certification.organization}
                  onChangeText={(text) => setCertification({...certification, organization: text})}
                  returnKeyType="next"
                  onSubmitEditing={() => urlRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {errors.organization && <Text style={styles.errorText}>{errors.organization}</Text>}
            </View>

            <View style={{ marginBottom: 12 }}>
                <TextInput
                  ref={urlRef}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="URL de la credencial (Opcional)"
                  placeholderTextColor={colors.textSecondary}
                  value={certification.credentialUrl}
                  onChangeText={(text) => setCertification({...certification, credentialUrl: text})}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="done"
                />
            </View>
            
            <MonthYearPicker
              label="FECHA DE INICIO"
              selectedMonth={certification.startMonth}
              selectedYear={certification.startYear}
              onMonthChange={(val) => setCertification({...certification, startMonth: val})}
              onYearChange={(val) => setCertification({...certification, startYear: val})}
              error={errors.startDate}
            />

            <MonthYearPicker
              label="FECHA DE FIN"
              selectedMonth={certification.endMonth}
              selectedYear={certification.endYear}
              onMonthChange={(val) => setCertification({...certification, endMonth: val})}
              onYearChange={(val) => setCertification({...certification, endYear: val})}
              error={errors.endDate}
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
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Chip from '../../Chip';

export interface Language {
  id?: number | string;
  language: string;
  level: string;
}

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (language: Language) => void;
  initialData?: Language | null;
}

const LANGUAGE_LEVELS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

export default function LanguageModal({ visible, onClose, onSave, initialData }: LanguageModalProps) {
  const { colors, spacing } = useTheme();
  
  const [data, setData] = useState<Language>({
    language: '',
    level: 'Básico'
  });
  
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setData({
          ...initialData,
          id: initialData.id,
          language: initialData.language || '',
          level: initialData.level || 'Básico'
        });
      } else {
        // Reset
        setData({
          language: '',
          level: 'Básico'
        });
      }
      setErrors({});
    }
  }, [visible, initialData]);

  const handleSave = () => {
    const newErrors: any = {};
    if (!data.language.trim()) newErrors.language = 'El idioma es requerido';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(data);
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
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {initialData ? 'Editar Idioma' : 'Nuevo Idioma'}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 12 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Idioma</Text>
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            color: colors.text, 
                            borderColor: errors.language ? colors.error : colors.border, 
                            backgroundColor: colors.surface 
                        }
                    ]}
                    placeholder="Ej. Inglés, Francés..."
                    placeholderTextColor={colors.textSecondary}
                    value={data.language}
                    onChangeText={(text) => setData({...data, language: text})}
                />
                {errors.language && <Text style={[styles.errorText, { color: colors.error }]}>{errors.language}</Text>}
            </View>

            <View style={{ marginBottom: 24 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nivel</Text>
                <View style={styles.chipContainer}>
                    {LANGUAGE_LEVELS.map((lvl) => (
                        <Chip
                            key={lvl}
                            label={lvl}
                            active={data.level === lvl}
                            onPress={() => setData({...data, level: lvl})}
                            variant={data.level === lvl ? 'primary' : 'subtle'}
                            size="md"
                        />
                    ))}
                </View>
            </View>

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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

const MIN_LENGTH = 20;
const MAX_LENGTH = 120;

interface SummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (summary: string) => void;
  initialSummary?: string | null;
}

export default function SummaryModal({ visible, onClose, onSave, initialSummary }: SummaryModalProps) {
  const { colors } = useTheme();
  
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (visible) {
      setSummary(initialSummary || '');
    }
  }, [visible, initialSummary]);

  const currentLength = summary.length;
  const isValid = currentLength >= MIN_LENGTH && currentLength <= MAX_LENGTH;
  const isError = currentLength > 0 && currentLength < MIN_LENGTH;

  const handleSave = () => {
    if (!isValid) return;
    onSave(summary);
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
          <Text style={[styles.modalTitle, { color: colors.text }]}>Sobre mí</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
            Escribe una breve descripción profesional sobre ti.
          </Text>
          
          <ScrollView 
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ marginBottom: 8 }}>
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            color: colors.text, 
                            borderColor: isError ? colors.error : (isValid ? colors.primary : colors.border),
                            borderWidth: isValid || isError ? 1.5 : 1,
                            backgroundColor: colors.surface,
                            minHeight: 120,
                            textAlignVertical: 'top'
                        }
                    ]}
                    placeholder="Ej. Estudiante apasionado por el desarrollo móvil con experiencia en React Native..."
                    placeholderTextColor={colors.textSecondary}
                    value={summary}
                    onChangeText={setSummary}
                    multiline={true}
                    numberOfLines={6}
                    maxLength={MAX_LENGTH}
                />
                <View style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                    <Text style={{ 
                        color: isError ? colors.error : (isValid ? colors.primary : colors.textSecondary),
                        fontSize: 12,
                        fontWeight: isValid ? '600' : '400'
                    }}>
                        {currentLength} / {MAX_LENGTH}
                    </Text>
                </View>
            </View>

            {isError && (
                <Text style={{ color: colors.error, fontSize: 12, marginBottom: 16, marginLeft: 4 }}>
                    ⚠️ El resumen es muy corto (mínimo {MIN_LENGTH} caracteres)
                </Text>
            )}

            <View style={[styles.modalButtons, { marginTop: isError ? 4 : 16 }]}>
                <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: colors.border }]} 
                    onPress={onClose}
                >
                    <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: isValid ? colors.primary : colors.border }]} 
                    onPress={handleSave}
                    disabled={!isValid}
                >
                    <Text style={{ color: isValid ? '#FFF' : colors.textSecondary, fontWeight: 'bold' }}>Guardar</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
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

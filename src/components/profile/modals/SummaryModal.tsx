import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

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

  const handleSave = () => {
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
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Sobre mí</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
            Escribe una breve descripción profesional sobre ti.
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 24 }}>
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            color: colors.text, 
                            borderColor: colors.border, 
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
                />
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

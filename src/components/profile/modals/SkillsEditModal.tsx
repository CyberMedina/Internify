import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { skillService, Skill } from '../../../services/skillService';

interface SkillsEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (skills: string[]) => void;
  initialSkills: string[];
}

export const SkillsEditModal: React.FC<SkillsEditModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSkills,
}) => {
  const { colors, spacing, radius, typography } = useTheme();
  const { userToken } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const skillsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setSkills([...initialSkills]);
      setInputText('');
      setSearchResults([]);
      loadSuggestions();
    }
  }, [visible, initialSkills]);

  const loadSuggestions = async () => {
    if (!userToken) return;
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await skillService.getSuggestedSkills(userToken);
      setSuggestedSkills(suggestions);
    } catch (error) {
      console.error('Error cargando sugerencias de habilidades:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchSkills = async (text: string) => {
    setInputText(text);
    if (text.length >= 2 && userToken) {
      setIsSearching(true);
      try {
        const results = await skillService.searchSkills(userToken, text);
        setSearchResults(results.filter(r => !skills.includes(r.name)));
      } catch (error) {
        console.error('Error buscando habilidades:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddSkill = (name?: string) => {
    const skillName = (name ?? inputText).trim();
    if (skillName && !skills.includes(skillName)) {
      setSkills(prev => [...prev, skillName]);
      setInputText('');
      setSearchResults([]);
      // Scroll al final para mostrar la habilidad recién agregada
      setTimeout(() => skillsScrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = () => {
    onSave(skills);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </View>

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing(4),
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.text, fontSize: typography.sizes.xl },
            ]}
          >
            Editar habilidades
          </Text>

          {/* Skills List */}
          <View style={[styles.skillsScrollWrapper, { borderColor: colors.border }]}>
            <ScrollView
              ref={skillsScrollRef}
              style={styles.skillsScroll}
              contentContainerStyle={styles.skillsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              fadingEdgeLength={24}
            >
              {skills.map((skill, index) => (
                <View
                  key={`${skill}-${index}`}
                  style={[
                    styles.skillChip,
                    {
                      backgroundColor: colors.chipBg,
                      borderColor: colors.border,
                      borderRadius: 999,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.skillText,
                      { color: colors.text, fontSize: typography.sizes.sm },
                    ]}
                  >
                    {skill}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSkill(skill)}
                    style={styles.removeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
              {skills.length === 0 && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.sm,
                    fontStyle: 'italic',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: spacing(2),
                  }}
                >
                  No has agregado habilidades aún.
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Add Skill Input */}
          <View style={{ zIndex: 10 }}>
            <View style={[styles.inputContainer, { marginTop: spacing(3) }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing(3),
                    fontSize: typography.sizes.md,
                  },
                ]}
                placeholder="Agregar habilidad..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={handleSearchSkills}
                onSubmitEditing={() => handleAddSkill()}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => handleAddSkill()}
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary, marginLeft: spacing(2) },
                ]}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="plus" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {searchResults.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleAddSkill(item.name)}
                    >
                      <Text style={{ color: colors.text }}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Suggested Skills */}
          {suggestedSkills.length > 0 && (
            <View style={{ marginTop: spacing(3) }}>
              <Text
                style={[
                  styles.suggestionsLabel,
                  { color: colors.textSecondary, fontSize: typography.sizes.xs },
                ]}
              >
                SUGERENCIAS
              </Text>
              <View style={styles.suggestionsContainer}>
                {isLoadingSuggestions ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  suggestedSkills.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => handleAddSkill(s.name)}
                      disabled={skills.includes(s.name)}
                      style={[
                        styles.suggestionChip,
                        {
                          borderColor: colors.border,
                          borderRadius: 999,
                          backgroundColor: colors.card,
                        },
                        skills.includes(s.name) && { opacity: 0.4 },
                      ]}
                    >
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={[styles.modalButtons, { marginTop: spacing(4) }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, { backgroundColor: colors.border }]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  skillsScrollWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skillsScroll: {
    maxHeight: 160,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  skillText: {
    marginRight: 6,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    height: 48,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 140,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionsLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
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

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';

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
  const [skills, setSkills] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (visible) {
      setSkills([...initialSkills]);
      setInputText('');
    }
  }, [visible, initialSkills]);

  const handleAddSkill = () => {
    const trimmedInput = inputText.trim();
    if (trimmedInput && !skills.includes(trimmedInput)) {
      setSkills([...skills, trimmedInput]);
      setInputText('');
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
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </View>

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
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
            Edit Skills
          </Text>

          {/* Skills List */}
          <ScrollView
            style={styles.skillsScroll}
            contentContainerStyle={styles.skillsContainer}
            keyboardShouldPersistTaps="handled"
          >
            {skills.map((skill, index) => (
              <View
                key={`${skill}-${index}`}
                style={[
                  styles.skillChip,
                  {
                    backgroundColor: colors.chipBg,
                    borderColor: colors.border,
                    borderRadius: radius.full,
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
                No skills added yet.
              </Text>
            )}
          </ScrollView>

          {/* Add Skill Input */}
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
                  paddingVertical: spacing(2),
                  fontSize: typography.sizes.md,
                },
              ]}
              placeholder="Add a skill (e.g., React Native)"
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddSkill}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddSkill}
              style={[
                styles.addButton,
                {
                  backgroundColor: inputText.trim()
                    ? colors.primary
                    : colors.border,
                  borderRadius: radius.md,
                  marginLeft: spacing(2),
                  paddingHorizontal: spacing(3),
                },
              ]}
              disabled={!inputText.trim()}
            >
              <Feather
                name="plus"
                size={20}
                color={inputText.trim() ? '#fff' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { marginTop: spacing(4) }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.button,
                {
                  backgroundColor: 'transparent',
                  marginRight: spacing(2),
                },
              ]}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontWeight: '600',
                  fontSize: typography.sizes.md,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing(4),
                  paddingVertical: spacing(2),
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: typography.sizes.md,
                }}
              >
                Save
              </Text>
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
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  skillsScroll: {
    maxHeight: 200,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
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
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

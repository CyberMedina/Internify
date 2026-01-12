import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Layout } from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PersonalData'>;

export default function OnboardingPersonalDataScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const { userData } = useAuth();
  
  const [phone, setPhone] = useState(userData?.person?.detail?.phone || '');
  const [address, setAddress] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(25, { duration: 1000 });
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header & Progress */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
              Sobre ti
            </Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.primary }, progressStyle]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                25% completado
              </Text>
            </View>
            <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
              Estos son los datos que tenemos registrados en la UNI. ¿Están actualizados?
            </Text>
          </View>

          {/* Data Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.text }]}>
            
            {/* Header of Card */}
            <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <MaterialIcons name="verified-user" size={20} color={colors.success} style={{ marginRight: 8 }} />
                 <Text style={{ color: colors.text, fontWeight: '600', fontSize: typography.sizes.sm }}>IDENTIDAD DIGITAL UNI</Text>
               </View>
               <View style={[styles.badge, { backgroundColor: colors.chipBg }]}>
                 <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>VERIFICADO</Text>
               </View>
            </View>

            <View style={styles.cardBody}>
              {/* Static Fields */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>NOMBRE COMPLETO</Text>
                <Text style={[styles.staticValue, { color: colors.text, fontSize: typography.sizes.md }]}>{userData?.name || 'Usuario'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>FECHA DE NACIMIENTO</Text>
                <Text style={[styles.staticValue, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {userData?.person?.detail?.birth_date || 'No registrado'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>CORREO INSTITUCIONAL</Text>
                  <Feather name="lock" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </View>
                <Text style={[styles.staticValue, { color: colors.text, fontSize: typography.sizes.md }]}>{userData?.email || ''}</Text>
              </View>

              <View style={styles.divider} />

              {/* Editable Fields */}
              <Animated.View layout={Layout.springify()}>
                <TouchableOpacity 
                  style={styles.fieldGroup} 
                  onPress={() => setEditingPhone(true)}
                  activeOpacity={1}
                >
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>TELÉFONO</Text>
                    <Feather name="edit-2" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                  </View>
                  {editingPhone ? (
                    <TextInput
                      style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
                      value={phone}
                      onChangeText={setPhone}
                      autoFocus
                      onBlur={() => setEditingPhone(false)}
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={[styles.value, { color: colors.text, fontSize: typography.sizes.md }]}>{phone}</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.divider} />

              <Animated.View layout={Layout.springify()}>
                <TouchableOpacity 
                  style={styles.fieldGroup} 
                  onPress={() => setEditingAddress(true)}
                  activeOpacity={1}
                >
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>DIRECCIÓN</Text>
                    <Feather name="edit-2" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                  </View>
                  {editingAddress ? (
                    <TextInput
                      style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
                      value={address}
                      onChangeText={setAddress}
                      autoFocus
                      onBlur={() => setEditingAddress(false)}
                    />
                  ) : (
                    <Text style={[styles.value, { color: colors.text, fontSize: typography.sizes.md }]}>{address}</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          <TouchableOpacity style={styles.errorLink}>
            <Text style={[styles.errorLinkText, { color: colors.primary, fontSize: typography.sizes.sm }]}>
              ¿Hay un error en tu nombre? Contacta a Registro.
            </Text>
          </TouchableOpacity>

        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <GradientButton
            onPress={() => navigation.navigate('AcademicProfile')}
            title="Todo correcto, continuar"
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 4,
  },
  description: {
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardBody: {
    padding: 20,
  },
  fieldGroup: {
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  staticValue: {
    opacity: 0.7,
  },
  value: {
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB', // Light gray
    marginVertical: 8,
    opacity: 0.5,
  },
  errorLink: {
    alignItems: 'center',
    padding: 8,
  },
  errorLinkText: {
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
  },
});

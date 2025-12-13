import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown } from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AcademicProfile'>;

export default function OnboardingAcademicScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const { userData } = useAuth();

  const progressWidth = useSharedValue(25);

  useEffect(() => {
    progressWidth.value = withTiming(50, { duration: 1000 });
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleConfirm = () => {
    // Navegar a la pantalla de renovación
    navigation.navigate('Renewal');
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header & Progress */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
            Tu perfil académico
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.primary }, progressStyle]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
              50% completado
            </Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
            Para mostrarte las mejores ofertas, confirmemos qué estás estudiando.
          </Text>
        </View>

        {/* Faculty Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.chipBg }]}>
                <FontAwesome5 name="university" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                FACULTAD / RECINTO
              </Text>
            </View>
            <Text style={[styles.cardValue, { color: colors.text, fontSize: typography.sizes.lg, fontFamily: typography.medium }]}>
              {userData?.student?.department || 'No asignado'}
            </Text>
          </View>
        </Animated.View>

        {/* Career Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.chipBg }]}>
                <FontAwesome5 name="laptop-code" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                CARRERA
              </Text>
            </View>
            <Text style={[styles.cardValue, { color: colors.text, fontSize: typography.sizes.lg, fontFamily: typography.medium }]}>
              {userData?.student?.career || 'No asignado'}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
          activeOpacity={0.9}
        >
          <Text style={[styles.buttonText, { color: '#FFF', fontSize: typography.sizes.md, fontFamily: typography.medium }]}>
            Confirmar perfil académico
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardValue: {
    lineHeight: 24,
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

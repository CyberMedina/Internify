import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CVSuccess'>;

const { width } = Dimensions.get('window');

export default function OnboardingCVSuccessScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();

  // Floating animation for the icon
  const floatY = useSharedValue(0);
  // Pulse for the glow ring
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Gentle float
    floatY.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 2200 }),
        withTiming(0, { duration: 2200 })
      ),
      -1,
      true
    );

    // Pulsing glow ring
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1,
      true
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1800 }),
        withTiming(0.45, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handleGoHome = () => {
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {/* Glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              { backgroundColor: colors.primary },
              ringStyle,
            ]}
          />

          {/* Stars / confetti decorations */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={[styles.deco, { top: 10, right: 30 }]}
          >
            <FontAwesome5 name="star" size={22} color="#F59E0B" solid />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(800).duration(500)}
            style={[styles.deco, { top: 50, left: 20 }]}
          >
            <FontAwesome5 name="star" size={14} color="#F59E0B" solid />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(1000).duration(500)}
            style={[styles.deco, { bottom: 30, right: 20 }]}
          >
            <FontAwesome5 name="certificate" size={16} color={colors.primary} solid />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(700).duration(500)}
            style={[styles.deco, { bottom: 60, left: 30 }]}
          >
            <FontAwesome5 name="star" size={10} color="#F59E0B" solid />
          </Animated.View>

          {/* Main icon */}
          <Animated.View entering={ZoomIn.delay(200).springify()} style={floatStyle}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
              <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
                <FontAwesome5 name="check" size={44} color="#FFF" />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Copy */}
        <View style={styles.textContainer}>
          <Animated.Text
            entering={FadeInUp.delay(350).duration(600)}
            style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}
          >
            ¡Tu perfil está{'\n'}listo para brillar! ✨
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(500).duration(600)}
            style={[styles.body, { color: colors.textSecondary, fontFamily: typography.regular }]}
          >
            Las empresas ya pueden encontrarte.{'\n'}
            Ahora solo queda dar el siguiente paso —{'\n'}
            encontrar la pasantía que cambie tu historia.
          </Animated.Text>

          {/* Stats row */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            style={styles.statsRow}
          >
            {[
              { icon: 'building', label: 'Empresas\nconectadas', value: '200+' },
              { icon: 'bolt',     label: 'Match\ninstantáneo',   value: '100%' },
              { icon: 'shield-alt', label: 'Perfil\nasegurado',  value: '✓' },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <FontAwesome5 name={stat.icon} size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text, fontFamily: typography.bold }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(900).duration(600)} style={{ width: '100%' }}>
          <GradientButton
            onPress={handleGoHome}
            title="Explorar Vacantes"
            icon={<FontAwesome5 name="arrow-right" size={18} color="#FFF" />}
            iconPosition="right"
            style={{ height: 64, borderRadius: 20 }}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer: {
    height: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  deco: {
    position: 'absolute',
  },
  textContainer: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});

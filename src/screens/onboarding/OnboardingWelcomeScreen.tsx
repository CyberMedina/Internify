import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming, 
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function OnboardingWelcomeScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  const { userData } = useAuth();
  
  // Animation values
  const rocketY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Floating animation for rocket
    rocketY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rocketY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
           <Animated.View style={rocketStyle}>
             <Image 
               source={require('../../assets/images/uni-logo.png')} 
               style={{ width: 180, height: 180 }} 
               resizeMode="contain"
             />
           </Animated.View>
           {/* Decorative circles behind */}
           <View style={[styles.circle, { backgroundColor: colors.primary, opacity: 0.05, width: 280, height: 280 }]} />
           <View style={[styles.circle, { backgroundColor: colors.primary, opacity: 0.1, width: 200, height: 200 }]} />
        </View>

        <View style={styles.textContainer}>
          <Animated.Text 
            entering={FadeInUp.delay(300).duration(600)}
            style={[styles.title, { color: colors.text, fontSize: typography.sizes.xxl, fontFamily: typography.bold }]}
          >
            ¡Hola, {userData?.name?.split(' ')[0] || 'Estudiante'}! 👋
          </Animated.Text>
          <Animated.Text 
            entering={FadeInUp.delay(500).duration(600)}
            style={[styles.body, { color: colors.textSecondary, fontSize: typography.sizes.md, fontFamily: typography.regular }]}
          >
            Bienvenido a tu portal de pasantías. Estamos aquí para conectarte con tu primera gran oportunidad profesional.
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={{ width: '100%' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => navigation.navigate('PersonalData')}
          >
            <Animated.View style={[styles.button, { backgroundColor: colors.primary }, buttonAnimatedStyle]}>
              <Text style={[styles.buttonText, { color: '#FFF', fontSize: typography.sizes.md, fontFamily: typography.medium }]}>
                Comenzar
              </Text>
              <FontAwesome5 name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />
            </Animated.View>
          </TouchableOpacity>
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
  header: {
    marginTop: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: -1,
  },
  textContainer: {
    marginBottom: 48,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
  },
});

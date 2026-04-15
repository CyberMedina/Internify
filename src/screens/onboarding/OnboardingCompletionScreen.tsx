import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
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
import GradientButton from '../../components/GradientButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Completion'>;

const { width } = Dimensions.get('window');

export default function OnboardingCompletionScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();
  
  // Animation values
  const rocketY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Floating animation for rocket
    rocketY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
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

  const handleFinish = () => {
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.illustrationContainer}>
           <Animated.View style={rocketStyle}>
             <View style={styles.iconCircle}>
                <Image 
                  source={require('../../assets/images/InternifyV4.png')} 
                  style={{ width: 180, height: 180, borderRadius: 90 }} 
                  resizeMode="cover"
                />
             </View>
           </Animated.View>
           {/* Decorative elements */}
           <View style={[styles.star, { top: 0, right: 40, opacity: 0.6 }]}>
             <FontAwesome5 name="star" size={20} color="#F59E0B" solid />
           </View>
           <View style={[styles.star, { bottom: 20, left: 40, opacity: 0.4 }]}>
             <FontAwesome5 name="star" size={14} color="#F59E0B" solid />
           </View>
        </View>

        <View style={styles.textContainer}>
          <Animated.Text 
            entering={FadeInUp.delay(300).duration(600)}
            style={[styles.title, { color: colors.text, fontSize: 32, fontFamily: typography.bold }]}
          >
            Bienvenido a bordo 🚀
          </Animated.Text>
          <Animated.Text 
            entering={FadeInUp.delay(500).duration(600)}
            style={[styles.body, { color: colors.textSecondary, fontSize: 16, fontFamily: typography.regular }]}
          >
            Ya conoces las nuevas reglas del juego. Es hora de encontrar la pasantía perfecta para ti.
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={{ width: '100%' }}>
          <GradientButton
            onPress={handleFinish}
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
    height: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  star: {
    position: 'absolute',
  },
  textContainer: {
    marginBottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
  },
  buttonText: {
    fontWeight: '700',
  },
});

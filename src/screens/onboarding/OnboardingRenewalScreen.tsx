import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { FontAwesome5 } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Renewal'>;

const { width } = Dimensions.get('window');

export default function OnboardingRenewalScreen({ navigation }: Props) {
  const { colors, typography } = useTheme();

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.iconContainer}>
           <LinearGradient
              colors={[colors.primary, '#60A5FA']}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
           >
              <Image 
                source={require('../../assets/images/InternifyNoLogo.png')} 
                style={{ width: 70, height: 70, tintColor: '#FFF' }} 
                resizeMode="contain"
              />
           </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold, fontSize: typography.sizes.xxl }]}>
            En UNI nos <Text style={{ color: colors.primary }}>renovamos</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.medium, fontSize: typography.sizes.lg }]}>
            Para mejorar tu experiencia profesional
          </Text>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.buttonContainer}>
           <GradientButton
            onPress={() => navigation.navigate('Process')}
            title="Siguiente"
            icon={<FontAwesome5 name="arrow-right" size={16} color="#FFF" />}
            iconPosition="right"
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
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

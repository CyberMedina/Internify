import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import GradientButton from '../components/GradientButton';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ApplicationSuccessScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useI18n();

  // Animation values
  const badgeScale = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ringScale = useSharedValue(0.5);
  const ringOpacity = useSharedValue(1);
  const contentTranslate = useSharedValue(40);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Badge pop-in
    badgeOpacity.value = withTiming(1, { duration: 300 });
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 150 });

    // 2. Continuous radar/ripple effect for the ring behind the badge
    ringScale.value = withDelay(
      400,
      withRepeat(
        withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1, // Infinite
        false
      )
    );
    ringOpacity.value = withDelay(
      400,
      withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1, // Infinite
        false
      )
    );

    // 3. Pop the check icon
    checkScale.value = withDelay(250, withSpring(1, { damping: 10, stiffness: 180 }));

    // 4. Slide up and fade in the text content
    contentTranslate.value = withDelay(350, withSpring(0, { damping: 15, stiffness: 150 }));
    contentOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));

  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }]
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslate.value }],
    opacity: contentOpacity.value
  }));

  const bottomBarHeight = spacing(1) + 56 + insets.bottom + spacing(1.5);

  const handleGoHome = () => {
    // Usamos CommonActions.reset para limpiar el historial superpuesto y reubicar de raíz al home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'MainTabs',
            params: { screen: 'HomeTab' }
          }
        ],
      })
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      
      {/* Decorative background gradient blobs (Optional polish) */}
      <View style={{ position: 'absolute', top: -width*0.2, left: -width*0.2, width: width, height: width, borderRadius: width/2, backgroundColor: colors.primary, opacity: 0.05, transform: [{ scale: 1.5 }] }} />
      <View style={{ position: 'absolute', bottom: -width*0.1, right: -width*0.1, width: width, height: width, borderRadius: width/2, backgroundColor: colors.success || '#10B981', opacity: 0.05 }} />

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(3) }}>
          
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 160 }}>
            {/* Ripple Ring */}
            <Animated.View style={[
              {
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.primary,
              },
              ringAnimatedStyle
            ]} />
            
            {/* Main Badge */}
            <Animated.View style={[
              { 
                width: 100, 
                height: 100, 
                borderRadius: 50, 
                backgroundColor: colors.primary, 
                alignItems: 'center', 
                justifyContent: 'center', 
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 10,
              },
              badgeAnimatedStyle
            ]}>
              <Animated.View style={checkAnimatedStyle}>
                <Feather name="check" size={50} color="#fff" />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View style={[{ alignItems: 'center', marginTop: spacing(3) }, contentAnimatedStyle]}>
            <Text style={{ 
              color: colors.text, 
              fontWeight: '800', 
              fontSize: 28,
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: spacing(1)
            }}>
              {t('success.congrats')}
            </Text>
            <Text style={{ 
              color: colors.textSecondary, 
              textAlign: 'center', 
              fontSize: 16,
              lineHeight: 24,
              paddingHorizontal: spacing(2)
            }}>
              Tu postulación ha sido enviada con éxito. Los reclutadores pronto revisarán tu perfil y se pondrán en contacto contigo.
            </Text>
          </Animated.View>

        </View>
        <View style={{ height: bottomBarHeight }} />
      </View>

      {/* Bottom Actions Fixed */}
      <Animated.View style={[
        { 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          bottom: 0, 
          paddingHorizontal: spacing(3), 
          paddingBottom: insets.bottom + spacing(2), 
          paddingTop: spacing(2), 
          backgroundColor: 'transparent',
        },
        contentAnimatedStyle
      ]}>
        <GradientButton
          onPress={handleGoHome}
          title={t('common.goHome')}
          style={{ height: 56, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }}
          textStyle={{ fontSize: 17, fontWeight: '700' }}
        />
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
             marginTop: spacing(2),
             height: 50,
             alignItems: 'center',
             justifyContent: 'center',
             borderRadius: 25,
             backgroundColor: colors.surface,
             borderWidth: 1,
             borderColor: colors.border
          }}
        >
           <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Volver a la Vacante</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

import React from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { getNotificationConsent, getNotificationConsentGranted } from '../utils/storage';
import * as Notifications from 'expo-notifications';

export default function SplashScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { isLoading, userToken } = useAuth();

  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const textTranslate = React.useRef(new Animated.Value(8)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 350, delay: 50, useNativeDriver: true }),
        Animated.timing(textTranslate, { toValue: 0, duration: 350, delay: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, [opacity, scale, textOpacity, textTranslate]);

  React.useEffect(() => {
    if (!isLoading) {
      const checkConsentAndNavigate = async () => {
        if (userToken) {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else {
          const consentShown = await getNotificationConsent();
          
          let shouldShowConsent = !consentShown;

          // Si ya se mostró antes, verificamos si es una reinstalación (backup restaurado)
          if (consentShown) {
            const consentGranted = await getNotificationConsentGranted();
            if (consentGranted) {
              const { status } = await Notifications.getPermissionsAsync();
              // Si teníamos permiso guardado pero el sistema dice que no,
              // mostramos la pantalla de consentimiento de nuevo
              if (status !== 'granted') {
                shouldShowConsent = true;
              }
            }
          }

          if (!shouldShowConsent) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'NotificationConsent' }] });
          }
        }
      };

      const timer = setTimeout(() => {
        checkConsentAndNavigate();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userToken, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="light" />
      <Animated.View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center', transform: [{ scale }], opacity }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff33', alignItems: 'center', justifyContent: 'center' }}>
          <Image 
            source={require('../assets/images/InternificonMinimal.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
      <Animated.Text
        style={{
          marginTop: 16,
          color: '#fff',
          fontSize: typography.sizes.xl,
          fontWeight: '700',
          opacity: textOpacity,
          transform: [{ translateY: textTranslate }],
        }}
      >
        {t('splash.title')}
      </Animated.Text>
    </View>
  );
}

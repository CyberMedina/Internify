import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import GradientButton from '../components/GradientButton';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { setNotificationConsent, setNotificationConsentGranted } from '../utils/storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationConsent'>;

export default function NotificationConsentScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      await registerForPushNotificationsAsync();
      await setNotificationConsent(true);
      await setNotificationConsentGranted(true);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error requesting notifications:', error);
      // Aun si falla, marcamos como visto y avanzamos
      await setNotificationConsent(true);
      await setNotificationConsentGranted(false);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await setNotificationConsent(true);
    await setNotificationConsentGranted(false);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.circle, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="notifications" size={64} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, ...typography.h1 }]}>
          Mantente informado
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary, ...typography.body1 }]}>
          Activa las notificaciones para recibir actualizaciones sobre tus postulaciones, nuevas vacantes y mensajes importantes.
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="briefcase-outline" 
            text="Nuevas vacantes que coinciden con tu perfil" 
            colors={colors} 
            typography={typography}
          />
          <FeatureItem 
            icon="checkmark-circle-outline" 
            text="Actualizaciones de estado de tus aplicaciones" 
            colors={colors} 
            typography={typography}
          />
          <FeatureItem 
            icon="time-outline" 
            text="Recordatorios importantes" 
            colors={colors} 
            typography={typography}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton
          title="Activar notificaciones"
          onPress={handleAllow}
          loading={loading}
          style={styles.button}
        />
        
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} disabled={loading}>
          <Text style={[styles.skipText, { color: colors.textSecondary, ...typography.button }]}>
            Ahora no
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text, colors, typography }: any) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color={colors.primary} style={styles.featureIcon} />
    <Text style={[styles.featureText, { color: colors.text, ...typography.body2 }]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    padding: 24,
  },
  button: {
    marginBottom: 16,
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Switch, Alert, Linking, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { setNotificationConsentGranted, getNotificationConsentGranted } from '../utils/storage';
import * as Device from 'expo-device';
import { api } from '../services/api';

type ThemeOption = 'light' | 'dark' | 'system';

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ marginBottom: spacing(3) }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.sizes.sm,
          fontWeight: '600',
          marginLeft: spacing(2),
          marginBottom: spacing(1),
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
};

const SettingsItem = ({
  label,
  icon,
  value,
  onPress,
  showChevron = true,
  isLast = false,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing(1.5),
        paddingHorizontal: spacing(2),
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing(1.5),
        }}
      >
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: '500' }}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {value && (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm, marginRight: spacing(1) }}>
            {value}
          </Text>
        )}
        {showChevron && <Feather name="chevron-right" size={20} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
};

const SettingsSwitchItem = ({
  label,
  icon,
  value,
  onValueChange,
  isLast = false,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing(1.5),
        paddingHorizontal: spacing(2),
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing(1.5),
        }}
      >
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: '500' }}>
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={'#fff'}
      />
    </View>
  );
};

export default function SettingsScreen() {
  const { colors, spacing, typography, scheme, setScheme } = useTheme();
  const navigation = useNavigation();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { userToken } = useAuth();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const consentGranted = await getNotificationConsentGranted();
    setNotificationsEnabled(status === 'granted' && consentGranted);
  };

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token && userToken) {
             await api.post('/devices', {
              expo_push_token: token,
              expo_token: token,
              device_name: Device.modelName || Device.osName
            }, { token: userToken });
            setNotificationsEnabled(true);
            await setNotificationConsentGranted(true);
        } else {
            setNotificationsEnabled(false);
            Alert.alert("Permiso denegado", "No se pudieron activar las notificaciones. Por favor verifica los permisos en la configuración de tu dispositivo.");
        }
      } catch (error) {
        console.error(error);
        setNotificationsEnabled(false);
      }
    } else {
      Alert.alert(
        "Desactivar notificaciones",
        "Para desactivar completamente las notificaciones, debes ir a la configuración de tu dispositivo.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ir a Configuración", onPress: () => {
              if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
              } else {
                  Linking.openSettings();
              }
          }}
        ]
      );
      await setNotificationConsentGranted(false);
      setNotificationsEnabled(false);
    }
  };

  const getThemeLabel = (s: ThemeOption) => {
    switch (s) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'system': return 'Sistema';
      default: return 'Sistema';
    }
  };

  const handleThemeSelect = (newScheme: ThemeOption) => {
    setScheme(newScheme);
    setThemeModalVisible(false);
  };

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.surface, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          Configuración
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: spacing(3) }}>
        
        <SettingsSection title="Apariencia">
          <SettingsItem
            label="Tema"
            icon="moon"
            value={getThemeLabel(scheme)}
            onPress={() => setThemeModalVisible(true)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Notificaciones">
          <SettingsSwitchItem
            label="Notificaciones Push"
            icon="bell"
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            isLast
          />
        </SettingsSection>

        <View style={{ paddingHorizontal: spacing(2), alignItems: 'center', marginTop: spacing(2) }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
            Versión 1.0.0
          </Text>
        </View>

      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing(3),
          }}
          onPress={() => setThemeModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              width: '100%',
              maxWidth: 320,
              padding: spacing(2),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing(2), textAlign: 'center' }}>
              Seleccionar Tema
            </Text>
            
            {(['light', 'dark', 'system'] as ThemeOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleThemeSelect(option)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing(1.5),
                  paddingHorizontal: spacing(1),
                  borderBottomWidth: option !== 'system' ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: typography.sizes.md, color: colors.text }}>
                  {getThemeLabel(option)}
                </Text>
                {scheme === option && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

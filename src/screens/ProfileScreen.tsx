import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { useI18n } from '../i18n/i18n';
import { currentUser, internshipLevels } from '../mock/user';
import LevelAvatar from '../components/LevelAvatar';

const Row: React.FC<{ label: string; icon: keyof typeof Feather.glyphMap; onPress?: () => void }> = ({ label, icon, onPress }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing(1.5),
        paddingHorizontal: spacing(2),
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing(1.5),
          }}
        >
          <Feather name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: '600' }}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useI18n();

  const canNavigateBackRef = React.useRef<boolean | null>(null);

  // Calcular estado de pasantía (misma lógica que HomeScreen)
  const getInternshipStatus = (hours: number) => {
    const currentLevel = internshipLevels.find(l => hours >= l.minHours && hours < l.maxHours) 
      || internshipLevels[internshipLevels.length - 1];
    
    const range = currentLevel.maxHours - currentLevel.minHours;
    const progress = Math.min(Math.max((hours - currentLevel.minHours) / range, 0), 1);

    return {
      stage: currentLevel.name,
      color: currentLevel.color,
      progress: progress,
      badge: currentLevel.badge,
      nextGoal: currentLevel.maxHours
    };
  };

  const status = getInternshipStatus(currentUser.hours);

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header with back and title */}
      <View
        style={{
          paddingTop: insets.top + spacing(1),
          paddingBottom: spacing(1),
          paddingHorizontal: spacing(2),
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const nav: any = navigation;
            if (nav && nav.canGoBack && nav.canGoBack()) nav.goBack();
            else nav?.getParent()?.navigate('Inicio');
          }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
  <Text style={{ marginLeft: spacing(2), color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>{t('profile.title')}</Text>
      </View>

      <ScreenContainer scroll contentContainerStyle={{ paddingBottom: spacing(4) }}>
        {/* Top user card */}
        <View
          style={{
            marginHorizontal: spacing(2),
            backgroundColor: colors.primary,
            borderRadius: radius.lg,
            padding: spacing(2),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* Avatar con Nivel */}
          <View style={{ marginRight: spacing(1.5) }}>
            <LevelAvatar 
              progress={status.progress} 
              size={56} 
              color={status.color}
              badgeContent={status.badge}
              imageUri={currentUser.avatar || undefined}
            />
          </View>

          {/* Name + link */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: typography.sizes.lg }}>{currentUser.name}</Text>
            <Text style={{ color: '#E0E7FF', marginTop: 2, fontSize: typography.sizes.sm }}>{status.stage}</Text>
            <TouchableOpacity style={{ marginTop: 4 }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: typography.sizes.sm }}>{t('profile.viewProfile')} ›</Text>
            </TouchableOpacity>
          </View>

          {/* Porcentaje numérico */}
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: status.color, fontSize: typography.sizes.xl, fontWeight: '800' }}>
              {Math.round(status.progress * 100)}%
            </Text>
            <Text style={{ color: '#ffffffaa', fontSize: typography.sizes.xs }}>
              {currentUser.hours} / {status.nextGoal}h
            </Text>
          </View>
        </View>

        {/* Menu list (single continuous block) */}
        <View style={{ marginTop: spacing(2), backgroundColor: colors.surface }}>
          <Row label={t('profile.personalInfo')} icon="user" />
          <Row label={t('profile.analytics')} icon="bar-chart-2" />
          <Row label={t('profile.myApplications')} icon="file-text" onPress={() => (navigation as any).navigate('MyApplications')} />
          <Row label={t('profile.seekingStatus')} icon="target" />
          <Row label={t('profile.settings')} icon="settings" />
          <Row label={t('profile.language')} icon="globe" />
          <Row label={t('profile.helpCenter')} icon="help-circle" />
          <Row label={t('profile.privacyPolicy')} icon="shield" />
          <Row label={t('profile.inviteFriends')} icon="users" />
        </View>
      </ScreenContainer>
    </View>
  );
}

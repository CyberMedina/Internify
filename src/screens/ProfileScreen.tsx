import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { useI18n } from '../i18n/i18n';

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
          {/* Avatar */}
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff33', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>M</Text>
          </View>

          {/* Name + link */}
          <View style={{ marginLeft: spacing(1.5), flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Marion Torphy</Text>
            <Text style={{ color: '#ffffffcc', marginTop: 2 }}>{t('profile.viewProfile')}</Text>
          </View>

          {/* Progress ring mock */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#ffffff22',
              borderWidth: 3,
              borderColor: '#FFD84D',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: typography.sizes.xs, fontWeight: '700' }}>70%</Text>
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

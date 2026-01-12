import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import GradientButton from '../components/GradientButton';

export default function ApplicationSuccessScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useI18n();

  // Simple scale + fade animation for the check badge
  const scale = React.useRef(new Animated.Value(0.6)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  // Height of the fixed bottom action to visually center content between header and CTA
  const bottomBarHeight = spacing(1) + 52 + insets.bottom + spacing(1.5);

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Top actions (back) */}
      <View style={{ paddingTop: insets.top + spacing(1), paddingHorizontal: spacing(2) }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content centered between header and bottom CTA */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(3) }}>
          <Animated.View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ scale }], opacity }}>
            <Feather name="check" size={40} color="#fff" />
          </Animated.View>
          <Text style={{ marginTop: spacing(2), color: colors.text, fontWeight: '700', fontSize: typography.sizes.xl }}>{t('success.congrats')}</Text>
          <Text style={{ marginTop: 8, color: colors.textSecondary, textAlign: 'center' }}>{t('success.body')}</Text>
        </View>
        {/* Spacer to account for absolute bottom bar height so content is perfectly centered */}
        <View style={{ height: bottomBarHeight }} />
      </View>

      {/* Bottom actions fixed */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(1.5), paddingTop: spacing(1), backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }}>
        <GradientButton
          onPress={() => navigation.navigate('HomeMain')}
          title={t('common.goHome')}
        />
      </View>
    </View>
  );
}

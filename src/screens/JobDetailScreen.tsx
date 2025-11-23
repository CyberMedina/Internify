import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Chip from '../components/Chip';
import type { Job } from '../components/JobCardLarge';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/i18n';

export default function JobDetailScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute() as any;
  const job: Job = route.params?.job;
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [tab, setTab] = React.useState<'about' | 'company' | 'review'>('about');
  const [submitting, setSubmitting] = React.useState(false);

  // Fallback mock if route param missing
  const data: Job = job ?? {
    id: 'detail',
  title: 'Diseñador UI',
    company: 'BrioSoft Solutions',
  location: 'Nueva York, USA',
    tags: ['Full-Time', 'Remote', 'Internship'],
    applicants: 322,
  salary: '$42k - $48k /mes',
    avatars: [],
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Top actions (safe area) */}
      <View style={{ paddingHorizontal: spacing(2), paddingTop: insets.top + spacing(1), paddingBottom: spacing(1), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="bookmark" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginLeft: spacing(1) }}>
            <Feather name="share-2" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

  <ScreenContainer scroll contentContainerStyle={{ paddingTop: spacing(2), paddingBottom: spacing(10) }}>
        {/* Header card-like */}
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing(2), paddingTop: spacing(4), paddingBottom: spacing(2) }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 28 }}>B.</Text>
            </View>
            <Text style={{ marginTop: spacing(1), color: colors.text, fontWeight: '700', fontSize: typography.sizes.xl }}>{data.title}</Text>
            <Text style={{ marginTop: 4, color: colors.textSecondary }}>{data.company}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={{ marginLeft: 6, color: colors.textSecondary }}>{data.location}</Text>
            </View>
          </View>

          {/* Info tiles grid */}
          <View style={{ marginTop: spacing(2), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Salary */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="dollar-sign" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.salaryMonthly')}</Text>
              </View>
              <Text style={{ marginTop: 6 }}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{data.salary.split(' /')[0]}</Text>
                <Text style={{ color: colors.textSecondary }}> /mes</Text>
              </Text>
            </View>

            {/* Tipo de puesto */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="briefcase" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.jobType')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.tags[0] ?? 'Full-Time'} size="xs" />
              </View>
            </View>

            {/* Modalidad */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="globe" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.workingModel')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.tags[1] ?? 'Remote'} size="xs" />
              </View>
            </View>

            {/* Nivel */}
            <View style={{ width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing(1), marginBottom: spacing(1), shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="trending-up" size={14} color={colors.primary} />
                </View>
                <Text style={{ marginLeft: spacing(1), color: colors.textSecondary, fontSize: typography.sizes.xs }}>{t('detail.level')}</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Chip label={data.tags[2] ?? 'Internship'} size="xs" />
              </View>
            </View>
          </View>
        </View>

        {/* Tabs mock */}
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: spacing(2), paddingBottom: spacing(2) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing(2), borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            {(
              [
                { key: 'about', label: 'Acerca de' },
                { key: 'company', label: 'Compañía' },
                { key: 'review', label: 'Reseña' },
              ] as const
            ).map(({ key, label }) => (
              <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ paddingVertical: spacing(1) }}>
                <Text style={{ color: tab === key ? colors.primary : colors.textSecondary, fontWeight: tab === key ? '700' as any : '600' }}>{label}</Text>
                {tab === key ? (
                  <View style={{ height: 2, backgroundColor: colors.primary, marginTop: 6, borderRadius: 2 }} />
                ) : (
                  <View style={{ height: 2, backgroundColor: 'transparent', marginTop: 6 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'about' && (
            <View style={{ marginTop: spacing(2) }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.aboutThisJob')}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                <Text style={{ color: colors.primary }}>{t('detail.readMore')}</Text>
              </Text>
              <View style={{ marginTop: spacing(2) }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.jobDescription')}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 6 }}>• Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 6 }}>• Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 6 }}>• Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</Text>
              </View>
            </View>
          )}

          {tab === 'company' && (
            <View style={{ marginTop: spacing(2) }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.company')}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                BrioSoft Solutions es una compañía enfocada en diseño y producto. Información mock para demo.
              </Text>
            </View>
          )}

          {tab === 'review' && (
            <View style={{ marginTop: spacing(2) }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{t('detail.reviews')}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
                Aún no hay reseñas. Sé el primero en opinar.
              </Text>
            </View>
          )}

          <View style={{ height: spacing(2) }} />
        </View>
      </ScreenContainer>

      {/* Fixed bottom CTA */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(1.5), paddingTop: spacing(1), backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (submitting) return;
              setSubmitting(true);
              // Simula envío
              setTimeout(() => {
                setSubmitting(false);
                (navigation as any).navigate('ApplicationSuccess');
              }, 1200);
            }}
            style={{ backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', height: 56, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
        >
          {submitting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.sending')}</Text>
            </View>
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.apply')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

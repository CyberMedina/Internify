import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import AvatarGroup from './AvatarGroup';
import { Feather } from '@expo/vector-icons';
import { Job } from './JobCardLarge';
import { useNavigation } from '@react-navigation/native';
import { useSaved } from '../context/SavedContext';
import { useI18n } from '../i18n/i18n';

export default function JobCardSmall({ job, applicantsLabel, bookmarked, onToggleBookmark }: { job: Job; applicantsLabel?: string; bookmarked?: boolean; onToggleBookmark?: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation<any>();
  const savedCtx = useSaved();
  const { t } = useI18n();
  const isSaved = bookmarked ?? (savedCtx?.isSaved(job.id) ?? false);
  const toggle = onToggleBookmark ?? (savedCtx ? () => savedCtx.toggle(job) : undefined);
  const applicantsText = applicantsLabel ?? t('common.applicants');
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('JobDetail', { job })}
      activeOpacity={0.9}
      style={{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5) }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', marginRight: spacing(1) }}>
            <Text style={{ fontWeight: '800', color: colors.primary }}>A</Text>
          </View>
          <View>
            <Text style={{ fontWeight: '700', color: colors.text }}>{job.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{job.company}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={toggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: 4 }}
          disabled={!toggle}
        >
          <Feather name="bookmark" size={18} color={isSaved ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginTop: spacing(1), alignItems: 'center' }}>
        {job.tags.slice(0, 2).map((t) => (
          <Chip key={t} label={t} />
        ))}
        {job.tags.length > 2 ? (
          <Chip label={`+${job.tags.length - 2}`} variant="subtle" />
        ) : null}
      </View>

      <View style={{ marginTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AvatarGroup avatars={job.avatars} />
          <Text style={{ textAlign: 'right' }}>
            {
              (() => {
                const parts = job.salary.split(' /');
                if (parts.length > 1) {
                  const amount = parts[0];
                  const suffix = ' /' + parts.slice(1).join(' /');
                  return (
                    <>
                      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.sizes.md, letterSpacing: 0.2 }}>{amount}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{suffix}</Text>
                    </>
                  );
                }
                return <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.sizes.md }}>{job.salary}</Text>;
              })()
            }
          </Text>
        </View>
  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: spacing(0.5) }}>{job.applicants} {applicantsText}</Text>
      </View>
    </TouchableOpacity>
  );
}

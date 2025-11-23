import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import AvatarGroup from './AvatarGroup';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSaved } from '../context/SavedContext';
import { useI18n } from '../i18n/i18n';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  applicants: number;
  salary: string;
  avatars: string[];
};

type Props = { job: Job };

export default function JobCardLarge({ job }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation<any>();
  const savedCtx = useSaved();
  const isSaved = savedCtx?.isSaved(job.id) ?? false;
  const { t } = useI18n();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('JobDetail', { job })}
      style={{
        width: 300,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing(2),
        marginRight: spacing(2),
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
      }}
      activeOpacity={0.9}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: spacing(1) }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 18 }}>B</Text>
          </View>
          <View style={{ marginLeft: spacing(1), flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{job.title}</Text>
            <Text numberOfLines={1} style={{ color: colors.textSecondary, marginTop: 2 }}>{job.company}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={savedCtx ? () => savedCtx.toggle(job) : undefined} disabled={!savedCtx} style={{ padding: 6 }}>
          <Feather name="bookmark" size={20} color={isSaved ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
        <Feather name="map-pin" size={14} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: typography.sizes.sm }}>{job.location}</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: job.tags.length === 3 ? 'nowrap' : 'wrap',
          marginTop: spacing(1),
          justifyContent: job.tags.length === 3 ? 'space-between' : 'flex-start',
          columnGap: job.tags.length === 3 ? 8 : 0,
          rowGap: spacing(1),
        }}
      >
        {job.tags.map((t, idx) => (
          <Chip
            key={t}
            label={t}
            style={job.tags.length === 3 ? { flexShrink: 1, flexBasis: '32%', marginRight: 0 } : undefined}
          />
        ))}
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AvatarGroup avatars={job.avatars} />
          <Text style={{ textAlign: 'right' }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.sizes.md, letterSpacing: 0.2 }}>{job.salary.split(' /')[0]}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{' /mes'}</Text>
          </Text>
        </View>
  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: spacing(0.5) }}>{job.applicants} {t('common.applicants')}</Text>
      </View>
    </TouchableOpacity>
  );
}

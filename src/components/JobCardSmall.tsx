import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import AvatarGroup from './AvatarGroup';
import { Feather } from '@expo/vector-icons';
import { Job } from './JobCardLarge';
import { useNavigation } from '@react-navigation/native';
import { useSaved } from '../context/SavedContext';
import { useI18n } from '../i18n/i18n';
import { getInitials } from '../utils/stringUtils';

const JobCardSmall = memo(({ job, applicantsLabel, bookmarked, onToggleBookmark, style }: { job: Job; applicantsLabel?: string; bookmarked?: boolean; onToggleBookmark?: () => void; style?: any }) => {
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
      style={[{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5) }, style]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', flex: 1, paddingRight: spacing(1) }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', marginRight: spacing(1), overflow: 'hidden' }}>
            {job.companyLogo ? (
              <Image source={{ uri: job.companyLogo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontWeight: '800', color: colors.primary }}>{getInitials(job.company)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }} numberOfLines={2} ellipsizeMode="tail">{job.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }} numberOfLines={1} ellipsizeMode="tail">{job.company}</Text>
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

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(0.5) }}>
        <Feather name="map-pin" size={12} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: typography.sizes.xs }}>{job.location}</Text>
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
            {job.salary === 'Anónimo' ? (
              <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: typography.sizes.md }}>Anónimo</Text>
            ) : (
              <>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.sizes.md, letterSpacing: 0.2 }}>{job.salary.replace(' /mes', '')}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}> / mes</Text>
              </>
            )}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing(0.5) }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>{job.applicants} {applicantsText}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="clock" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
              {job.postedTime || 'Reciente'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default JobCardSmall;

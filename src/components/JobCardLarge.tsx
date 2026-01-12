import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import AvatarGroup from './AvatarGroup';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSaved } from '../context/SavedContext';
import { useApplications } from '../context/ApplicationsContext';
import { useI18n } from '../i18n/i18n';
import { getInitials } from '../utils/stringUtils';
import BookmarkButton from './BookmarkButton';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  applicants: number;
  salary: string;
  avatars: string[];
  companyLogo?: string;
  postedTime?: string;
  isApplied?: boolean;
  isSaved?: boolean;
};

type Props = { job: Job };

const JobCardLarge = memo(({ job }: Props) => {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const savedCtx = useSaved();
  const applicationsCtx = useApplications();
  const isSaved = savedCtx?.isSaved(job.id) ?? false;
  const isLoading = savedCtx?.isProcessing(job.id) ?? false;
  const isApplied = job.isApplied || applicationsCtx.hasApplied(job.id);
  const { t } = useI18n();

  // Debug log
  // console.log(`[JobCardLarge] id=${job.id} postedTime=${job.postedTime}`);

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
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {job.companyLogo ? (
              <Image source={{ uri: job.companyLogo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 18 }}>{getInitials(job.company)}</Text>
            )}
          </View>
          <View style={{ marginLeft: spacing(1), flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>{job.title}</Text>
            <Text numberOfLines={1} style={{ color: colors.textSecondary, marginTop: 2 }}>{job.company}</Text>
          </View>
        </View>
        <BookmarkButton 
          isSaved={isSaved} 
          isLoading={isLoading}
          onToggle={savedCtx ? () => savedCtx.toggle(job) : () => {}} 
          size={20} 
          style={{ padding: 6 }}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
        <Feather name="map-pin" size={14} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: typography.sizes.sm }}>{job.location}</Text>
        
        {isApplied && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Feather name="check-circle" size={12} color={isDark ? '#34D399' : '#059669'} />
                <Text style={{ fontSize: 11, color: isDark ? '#34D399' : '#059669', marginLeft: 4, fontWeight: '700' }}>Aplicado</Text>
            </View>
        )}
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
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>{job.applicants} {t('common.applicants')}</Text>
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

export default JobCardLarge;

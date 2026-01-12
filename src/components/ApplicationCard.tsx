import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import { getInitials, timeAgo } from '../utils/stringUtils';
import { Application, ApplicationStatus } from '../types/vacancy';

const ApplicationCard = memo(({ application, style }: { application: Application; style?: any }) => {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useI18n();

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return { bg: isDark ? 'rgba(5, 150, 105, 0.2)' : '#E7F7EF', text: isDark ? '#34D399' : '#1E8E5A', label: 'Aceptada' };
      case 'rejected':
        return { bg: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FDEBED', text: isDark ? '#F87171' : '#E23E57', label: 'Rechazada' };
      case 'reviewed':
        return { bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#E8EDFF', text: isDark ? '#60A5FA' : '#3C5BFF', label: 'CV Visto' };
      case 'pending':
      default:
        return { bg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFF6E5', text: isDark ? '#FBBF24' : '#D99000', label: 'Pendiente' };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const companyPhoto = application.vacancy.company_photo || 
                       application.vacancy.company.logo || 
                       (application.vacancy.company.user_detail?.pf_photo) ||
                       application.vacancy.company.photo;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ApplicationStatus', { application, from: 'MyApplications' })}
      activeOpacity={0.9}
      style={[{ backgroundColor: colors.surface, padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1.5) }, style]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', flex: 1, paddingRight: spacing(1) }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', marginRight: spacing(1.5), overflow: 'hidden' }}>
            {companyPhoto ? (
              <Image source={{ uri: companyPhoto }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 18 }}>{getInitials(application.vacancy.company.name)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text, fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{application.vacancy.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">{application.vacancy.company.name}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1.5) }}>
        <Feather name="map-pin" size={12} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: typography.sizes.xs }}>{application.vacancy.location}</Text>
      </View>

      <View style={{ marginTop: spacing(1.5), paddingTop: spacing(1.5), borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: statusConfig.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: statusConfig.text, fontWeight: '700', fontSize: 11 }}>{statusConfig.label}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="clock" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
              Aplicado {timeAgo(application.created_at)}
            </Text>
          </View>
      </View>
    </TouchableOpacity>
  );
});

export default ApplicationCard;

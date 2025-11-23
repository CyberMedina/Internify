import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chip from '../components/Chip';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';

type Status = 'Enviada' | 'Aceptada' | 'Rechazada' | 'Pendiente';

type Application = {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  status: Status;
  logoLetter: string;
  logoBg: string;
};

const DATA: Application[] = [
  { id: '1', title: 'Desarrollador React', company: 'AmplifyAvenue', location: 'Nueva York, USA', tags: ['Tiempo completo', 'Remoto', 'Pasantía'], status: 'Enviada', logoLetter: 'A', logoBg: '#FFE89A' },
  { id: '2', title: 'Diseñador Gráfico', company: 'PixelPulse Tech', location: 'Nueva York, USA', tags: ['Medio tiempo', 'Remoto', 'Nivel inicial'], status: 'Aceptada', logoLetter: 'P', logoBg: '#1C1C1C' },
  { id: '3', title: 'Diseñador UI', company: 'VelocityCraft', location: 'Nueva York, USA', tags: ['Medio tiempo', 'Remoto', 'Nivel inicial'], status: 'Rechazada', logoLetter: 'V', logoBg: '#FFE2A8' },
  { id: '4', title: 'Contador', company: 'QubitLink Software', location: 'Nueva York, USA', tags: ['Contrato', 'Presencial', 'Asociado'], status: 'Pendiente', logoLetter: 'Q', logoBg: '#111111' },
  { id: '5', title: 'Diseñador UX', company: 'TitanTech Labs', location: 'Nueva York, USA', tags: ['Tiempo completo', 'Remoto', 'Pasantía'], status: 'Aceptada', logoLetter: 'T', logoBg: '#2B50FF' },
];

function statusColors(status: Status) {
  switch (status) {
    case 'Aceptada':
      return { bg: '#E7F7EF', text: '#1E8E5A' };
    case 'Rechazada':
      return { bg: '#FDEBED', text: '#E23E57' };
    case 'Pendiente':
      return { bg: '#FFF6E5', text: '#D99000' };
    case 'Enviada':
    default:
      return { bg: '#E8EDFF', text: '#3C5BFF' };
  }
}

export default function MyApplicationsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useI18n();

  const renderItem = ({ item }: { item: Application }) => {
    const s = statusColors(item.status);
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(1.5),
          marginHorizontal: spacing(2),
          marginBottom: spacing(1.5),
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: logo + title/company */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: spacing(1) }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: item.logoBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing(1),
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 20 }}>{item.logoLetter}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{item.company}</Text>
            </View>
          </View>
          {/* Status badge */}
          <View style={{ paddingHorizontal: 10, height: 26, borderRadius: 14, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: s.text, fontWeight: '700', fontSize: typography.sizes.xs }}>{item.status}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(1) }}>
          <Feather name="map-pin" size={14} color={colors.primary} />
          <Text style={{ marginLeft: 6, color: colors.textSecondary }}>{item.location}</Text>
        </View>

        {/* Chips row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(1) }}>
          {item.tags.map((t, idx) => (
            <View key={idx} style={{ marginRight: spacing(1), marginBottom: spacing(0.5) }}>
              <Chip label={t} size="xs" />
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + spacing(1), paddingHorizontal: spacing(2), paddingBottom: spacing(1), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
  <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>{t('applications.title')}</Text>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="search" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: spacing(1), paddingBottom: insets.bottom + spacing(2) }}
      />
    </View>
  );
}

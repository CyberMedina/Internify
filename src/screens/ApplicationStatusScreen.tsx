import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../components/ScreenContainer';
import { useTheme } from '../theme/ThemeContext';
import { Application, TimelineEvent, ApplicationStatus } from '../types/vacancy';
import { getApplicationDetail } from '../services/vacancyService';
import { useAuth } from '../context/AuthContext';

type ParamList = {
  ApplicationStatus: {
    application: Application;
  };
};

const ApplicationStatusScreen = () => {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'ApplicationStatus'>>();
  const { application: initialApplication } = route.params;
  const insets = useSafeAreaInsets();
  const { userToken } = useAuth();

  const [application, setApplication] = useState<Application>(initialApplication);
  const [loading, setLoading] = useState(!initialApplication.timeline);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!userToken) return;
      try {
        const detail = await getApplicationDetail(userToken, initialApplication.id);
        setApplication(detail);
      } catch (error) {
        console.error('Failed to fetch application detail', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialApplication.timeline) {
      fetchDetail();
    }
  }, [initialApplication.id, userToken]);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'reviewed':
        return '#2196F3'; // Blue
      case 'pending':
      default:
        return '#FF9800'; // Orange
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'reviewed':
        return 'eye';
      case 'pending':
      default:
        return 'time';
    }
  };

  const getStatusTitle = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'Aceptado';
      case 'rejected':
        return 'Rechazado';
      case 'reviewed':
        return 'CV Visto';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  const renderTimelineItem = (item: TimelineEvent, index: number, total: number) => {
    const isLast = index === total - 1;
    const isActive = item.status === application.status;
    const isCompleted = item.completed;

    return (
      <View key={index} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[
            styles.timelineIconContainer,
            { backgroundColor: isCompleted || isActive ? colors.primary : colors.surfaceVariant }
          ]}>
            <Ionicons 
              name={isCompleted ? 'checkmark' : (isActive ? 'eye' : 'ellipse')} 
              size={16} 
              color={isCompleted || isActive ? '#FFF' : colors.textSecondary} 
            />
          </View>
          {!isLast && (
            <View style={[
              styles.timelineLine, 
              { backgroundColor: isCompleted ? colors.primary : colors.surfaceVariant }
            ]} />
          )}
        </View>
        <View style={[
          styles.timelineContent,
          isActive && { backgroundColor: colors.surfaceVariant, borderRadius: 8, padding: spacing.sm }
        ]}>
          <View style={styles.timelineHeader}>
            <Text style={[typography.subtitle2, { color: colors.text }]}>{item.title}</Text>
            {item.date ? (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.date}</Text>
            ) : (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Pendiente</Text>
            )}
          </View>
          <Text style={[typography.body2, { color: colors.textSecondary, marginTop: 4 }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h6, { color: colors.text, flex: 1, textAlign: 'center', marginRight: 40 }]}>
          Estado del proceso
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(application.status) }]}>
          <Ionicons name={getStatusIcon(application.status)} size={48} color="#FFF" />
          <View style={styles.statusCardContent}>
            <Text style={styles.statusCardTitle}>{getStatusTitle(application.status)}</Text>
            <Text style={styles.statusCardSubtitle}>
              {application.vacancy.title} - {application.vacancy.company.name}
            </Text>
            <Text style={styles.statusCardMessage}>
              {application.status === 'reviewed' && "Vas por buen camino"}
              {application.status === 'pending' && "Tu postulación ha sido enviada"}
              {application.status === 'accepted' && "¡Felicidades! Has sido seleccionado"}
              {application.status === 'rejected' && "Gracias por participar"}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={[typography.h6, { marginBottom: spacing.md, color: colors.text }]}>
            Historial
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            application.timeline?.map((item, index) => 
              renderTimelineItem(item, index, application.timeline!.length)
            )
          )}
          {!loading && !application.timeline && (
             <Text style={{ color: colors.textSecondary }}>No hay historial disponible.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statusCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  statusCardMessage: {
    fontSize: 14,
    color: '#FFF',
    fontStyle: 'italic',
  },
  timelineContainer: {
    paddingHorizontal: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ApplicationStatusScreen;

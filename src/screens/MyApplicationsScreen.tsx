import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../i18n/i18n';
import { Application, ApplicationStatus } from '../types/vacancy';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import ScreenContainer from '../components/ScreenContainer';
import ApplicationCard from '../components/ApplicationCard';

export default function MyApplicationsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { userToken } = useAuth();
  
  // Destructure all needed values from context
  const { 
    applications, 
    isLoading, 
    isRefreshing,
    refreshApplications, 
    isLoadingMore, 
    hasMore, 
    loadMoreApplications 
  } = useApplications();

  const renderItem = ({ item }: { item: Application }) => {
    return (
      <ApplicationCard 
        application={item} 
      />
    );
  };
   
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: spacing(2), alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          {t('applications.title')}
        </Text>
      </View>

      {isLoading && !isRefreshing && applications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(2), flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: spacing(1.5) }} />}
          refreshControl={
            <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={refreshApplications} 
                colors={[colors.primary]}
                tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4), paddingTop: spacing(8) }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) }}>
                <Feather name="briefcase" size={40} color={colors.textSecondary} />
              </View>
              <Text style={{ color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700', marginBottom: spacing(1), textAlign: 'center' }}>
                No tienes postulaciones
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md, textAlign: 'center', lineHeight: 22 }}>
                Aquí verás el estado de tus aplicaciones a las vacantes que te interesen.
              </Text>
            </View>
          }
          onEndReached={loadMoreApplications}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </ScreenContainer>
  );
}


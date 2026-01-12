import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCardSmall from '../components/JobCardSmall';
import { useSaved } from '../context/SavedContext';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';

export default function SavedScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const savedCtx = useSaved();
  const saved = savedCtx?.list ?? [];
  const isLoading = savedCtx?.isLoading ?? false;
  const loadingMore = savedCtx?.loadingMore ?? false;
  const refresh = savedCtx?.refresh;
  const loadMore = savedCtx?.loadMore;
  const hasMore = savedCtx?.hasMore ?? false;

  const handleRefresh = useCallback(async () => {
    if (refresh) {
      await refresh();
    }
  }, [refresh]);

  const handleEndReached = useCallback(() => {
    if (loadMore && hasMore && !loadingMore && !isLoading) {
      loadMore();
    }
  }, [loadMore, hasMore, loadingMore, isLoading]);

  return (
    <ScreenContainer safeTop>
      {/* Header */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>Guardados</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: insets.bottom + spacing(2), flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
        renderItem={({ item }) => (
          <JobCardSmall job={item} applicantsLabel="Solicitantes" />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: spacing(2), alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        refreshControl={
            <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[colors.primary]} // Android
                tintColor={colors.primary} // iOS
            />
        }
        ListEmptyComponent={
          !isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4), paddingTop: spacing(8) }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) }}>
              <Feather name="bookmark" size={40} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700', marginBottom: spacing(1), textAlign: 'center' }}>
              No tienes vacantes guardadas
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md, textAlign: 'center' }}>
              Las vacantes que guardes aparecerán aquí para que puedas acceder a ellas fácilmente.
            </Text>
          </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types/notification';

export default function NotificationsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation<any>();
  
  const {
    notifications,
    loading,
    refreshing,
    fetchNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    handleNotificationPress
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Estás seguro de que quieres marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: markAllAsRead }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Eliminar todas',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: deleteAllNotifications }
      ]
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={{
        backgroundColor: item.read_at ? colors.card : colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing(1.5),
        marginHorizontal: spacing(2),
        marginBottom: spacing(1.5),
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <View style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: colors.primary + '20', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: spacing(1.5)
      }}>
        <Feather name="bell" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.md }}>{item.data.title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 2 }}>{item.data.body}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {!item.read_at && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginBottom: 8 }} />
        )}
        <TouchableOpacity onPress={() => deleteNotification(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Feather name="trash-2" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer safeTop>
      {/* Header with Back Button */}
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.surface, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          Notificaciones
        </Text>
        
        <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleMarkAllRead} style={{ marginRight: 10 }}>
                <Feather name="check-square" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAll}>
                <Feather name="trash-2" size={20} color={colors.text} />
            </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing(8) }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: spacing(2), color: colors.textSecondary }}>Cargando notificaciones...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4) }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(2) }}>
                <Feather name="bell" size={40} color={colors.textSecondary} />
              </View>
              <Text style={{ color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700', marginBottom: spacing(1), textAlign: 'center' }}>
                No tienes notificaciones
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md, textAlign: 'center' }}>
                Te avisaremos cuando haya actualizaciones importantes sobre tus postulaciones.
              </Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

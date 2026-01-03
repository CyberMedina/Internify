import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationContent } from '../types/notification';

export const useNotifications = () => {
  const { userToken } = useAuth();
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = false) => {
    if (!userToken) return;
    
    if (shouldRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await notificationService.getNotifications(userToken, pageNum);
      
      if (shouldRefresh || pageNum === 1) {
        setNotifications(response.data);
      } else {
        setNotifications(prev => [...prev, ...response.data]);
      }
      
      if (response.current_page && response.last_page) {
        setHasMore(response.current_page < response.last_page);
      } else {
        setHasMore(false);
      }
      
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const refresh = useCallback(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userToken) return;
    try {
      await notificationService.markAsRead(userToken, id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userToken]);

  const markAllAsRead = useCallback(async () => {
    if (!userToken) return;
    try {
      await notificationService.markAllAsRead(userToken);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userToken]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!userToken) return;
    try {
      await notificationService.deleteNotification(userToken, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  }, [userToken]);

  const deleteAllNotifications = useCallback(async () => {
    if (!userToken) return;
    try {
      await notificationService.deleteAllNotifications(userToken);
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      Alert.alert('Error', 'No se pudieron eliminar las notificaciones');
    }
  }, [userToken]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    const { type, ...data } = notification.data;

    switch (type) {
      case 'vacancy_created':
      case 'vacancy_status':
        if (data.id) {
          navigation.navigate('JobDetail', { job: { id: data.id } });
        }
        break;
      case 'application_status':
        if (data.application_id) {
           navigation.navigate('MyApplications');
        }
        break;
      case 'test':
        Alert.alert('Notificación de prueba', notification.data.body);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }, [navigation, markAsRead]);

  return {
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
  };
};

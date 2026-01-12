import { api } from './api';
import { Notification, NotificationResponse } from '../types/notification';

export const notificationService = {
  getNotifications: async (token: string, page: number = 1): Promise<NotificationResponse> => {
    return api.get<NotificationResponse>(`/notifications?page=${page}`, { token });
  },

  markAsRead: async (token: string, id: string): Promise<void> => {
    return api.put<void>(`/notifications/${id}/read`, {}, { token });
  },

  markAllAsRead: async (token: string): Promise<void> => {
    return api.put<void>('/notifications/read-all', {}, { token });
  },

  deleteNotification: async (token: string, id: string): Promise<void> => {
    return api.delete<void>(`/notifications/${id}`, { token });
  },

  deleteAllNotifications: async (token: string): Promise<void> => {
    return api.delete<void>('/notifications', { token });
  },

  unregisterDevice: async (token: string): Promise<void> => {
    try {
      await api.delete<void>('/devices', { token });
    } catch (error) {
      console.error('Error unregistering device:', error);
      // Don't throw here to avoid blocking logout
    }
  }
};

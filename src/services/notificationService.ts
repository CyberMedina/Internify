import { Notification, NotificationResponse } from '../types/notification';

const BASE_URL = 'https://overfoul-domingo-unharmable.ngrok-free.dev/api';

const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

export const notificationService = {
  getNotifications: async (token: string, page: number = 1): Promise<NotificationResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/notifications?page=${page}`, {
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (token: string, id: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (token: string, id: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to delete notification');
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  deleteAllNotifications: async (token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to delete all notifications');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  unregisterDevice: async (token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/devices`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      if (!response.ok) throw new Error('Failed to unregister device');
    } catch (error) {
      console.error('Error unregistering device:', error);
      // Don't throw here to avoid blocking logout
    }
  }
};

import { axiosInstance } from './axiosInstance';
import {
  Notification,
  NotificationFilters,
  NotificationPreferences,
} from '../../types/notification';

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
}

export class NotificationApiService {
  static async getNotifications(filters?: NotificationFilters): Promise<GetNotificationsResponse> {
    try {
      const response = await axiosInstance.get('/notifications', {
        params: {
          search: filters?.search,
          unread: filters?.unreadOnly ? 'true' : undefined,
          priority: filters?.priority !== 'all' ? filters?.priority : undefined,
          type: filters?.type !== 'all' ? filters?.type : undefined,
          projectId: filters?.projectId,
          workspaceId: filters?.workspaceId,
          isArchived: filters?.isArchived !== undefined ? String(filters.isArchived) : undefined,
          isPinned: filters?.isPinned !== undefined ? String(filters.isPinned) : undefined,
          sort: filters?.sort,
          page: filters?.page,
          limit: filters?.limit,
        },
      });
      return response.data;
    } catch (err) {
      console.warn('Backend notification fetch failed, using fallback client store:', err);
      // Return safe fallback format
      return {
        success: true,
        data: [],
        total: 0,
        unreadCount: 0,
        page: 1,
        pages: 1,
      };
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data?.count ?? 0;
    } catch {
      return 0;
    }
  }

  static async markAsRead(id: string, read: boolean = true): Promise<Notification | null> {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/read`, { read });
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to mark notification as read on server:', err);
      return null;
    }
  }

  static async markAllAsRead(): Promise<number> {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data?.count ?? 0;
    } catch (err) {
      console.warn('Failed to mark all as read on server:', err);
      return 0;
    }
  }

  static async toggleArchive(id: string, isArchived?: boolean): Promise<Notification | null> {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/archive`, { isArchived });
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to toggle archive notification:', err);
      return null;
    }
  }

  static async togglePin(id: string, isPinned?: boolean): Promise<Notification | null> {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/pin`, { isPinned });
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to toggle pin notification:', err);
      return null;
    }
  }

  static async deleteNotification(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return true;
    } catch (err) {
      console.warn('Failed to delete notification:', err);
      return false;
    }
  }

  static async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await axiosInstance.get('/notifications/preferences');
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to load notification preferences from server:', err);
      return null;
    }
  }

  static async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const response = await axiosInstance.put('/notifications/preferences', prefs);
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to update preferences on server:', err);
      return null;
    }
  }
}

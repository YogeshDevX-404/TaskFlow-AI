import { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

export function useNotifications() {
  const store = useNotificationStore();

  useEffect(() => {
    store.fetchNotifications();
    store.fetchPreferences();
  }, []);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    filters: store.filters,
    isLoading: store.isLoading,
    isDrawerOpen: store.isDrawerOpen,
    selectedNotification: store.selectedNotification,
    total: store.total,
    page: store.page,
    // Actions
    fetchNotifications: store.fetchNotifications,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    toggleArchive: store.toggleArchive,
    togglePin: store.togglePin,
    deleteNotification: store.deleteNotification,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    setDrawerOpen: store.setDrawerOpen,
    setSelectedNotification: store.setSelectedNotification,
    addLocalNotification: store.addLocalNotification,
  };
}

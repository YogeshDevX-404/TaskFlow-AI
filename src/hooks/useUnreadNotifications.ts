import { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

export function useUnreadNotifications() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check unread count every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    fetchUnreadCount,
    markAllAsRead,
  };
}

import { create } from 'zustand';
import {
  Notification,
  NotificationFilters,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
} from '../types/notification';
import { NotificationApiService } from '../services/api/notificationService';

// Default initial preferences
const defaultPreferences: NotificationPreferences = {
  id: 'local-pref',
  user: 'current-user',
  emailNotifications: true,
  inAppNotifications: true,
  taskNotifications: true,
  commentNotifications: true,
  mentionNotifications: true,
  projectNotifications: true,
  sprintNotifications: true,
  releaseNotifications: true,
  dailyDigest: false,
  weeklyDigest: true,
};

// Initial dynamic state
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  filters: NotificationFilters;
  isLoading: boolean;
  isDrawerOpen: boolean;
  isPreferencesOpen: boolean;
  selectedNotification: Notification | null;
  total: number;
  page: number;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setFilters: (newFilters: Partial<NotificationFilters>) => void;
  resetFilters: () => void;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => Promise<void>;
  setDrawerOpen: (open: boolean) => void;
  setPreferencesOpen: (open: boolean) => void;
  setSelectedNotification: (notif: Notification | null) => void;
  addLocalNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'read' | 'isArchived' | 'isPinned' | 'isMuted' | 'deliveryStatus'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: defaultPreferences,
  filters: {
    search: '',
    unreadOnly: false,
    priority: 'all',
    type: 'all',
    sort: 'newest',
    page: 1,
    limit: 25,
  },
  isLoading: false,
  isDrawerOpen: false,
  isPreferencesOpen: false,
  selectedNotification: null,
  total: 0,
  page: 1,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const filters = get().filters;
      const response = await NotificationApiService.getNotifications(filters);

      if (response.data && response.data.length > 0) {
        set({
          notifications: response.data,
          unreadCount: response.unreadCount,
          total: response.total,
          page: response.page,
          isLoading: false,
        });
      } else {
        // Filter local state based on active filters
        let local = [...get().notifications];

        if (filters.search) {
          const q = filters.search.toLowerCase();
          local = local.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
        }

        if (filters.unreadOnly) {
          local = local.filter((n) => !n.read);
        }

        if (filters.priority && filters.priority !== 'all') {
          local = local.filter((n) => n.priority === filters.priority);
        }

        if (filters.type && filters.type !== 'all') {
          local = local.filter((n) => n.type === filters.type);
        }

        if (filters.isPinned !== undefined) {
          local = local.filter((n) => n.isPinned === filters.isPinned);
        }

        const unread = get().notifications.filter((n) => !n.read && !n.isArchived).length;

        set({
          unreadCount: unread,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    const count = await NotificationApiService.getUnreadCount();
    if (count > 0) {
      set({ unreadCount: count });
    }
  },

  markAsRead: async (id: string, read = true) => {
    // Optimistic UI update
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read, readAt: read ? new Date().toISOString() : undefined } : n
      );
      const unread = updated.filter((n) => !n.read && !n.isArchived).length;
      return { notifications: updated, unreadCount: unread };
    });

    await NotificationApiService.markAsRead(id, read);
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => {
      const updated = state.notifications.map((n) => ({
        ...n,
        read: true,
        readAt: new Date().toISOString(),
      }));
      return { notifications: updated, unreadCount: 0 };
    });

    await NotificationApiService.markAllAsRead();
  },

  toggleArchive: async (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isArchived: !n.isArchived } : n
      );
      const unread = updated.filter((n) => !n.read && !n.isArchived).length;
      return { notifications: updated, unreadCount: unread };
    });

    const current = get().notifications.find((n) => n.id === id);
    if (current) {
      await NotificationApiService.toggleArchive(id, current.isArchived);
    }
  },

  togglePin: async (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned } : n
      );
      return { notifications: updated };
    });

    const current = get().notifications.find((n) => n.id === id);
    if (current) {
      await NotificationApiService.togglePin(id, current.isPinned);
    }
  },

  deleteNotification: async (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unread = updated.filter((n) => !n.read && !n.isArchived).length;
      return { notifications: updated, unreadCount: unread };
    });

    await NotificationApiService.deleteNotification(id);
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchNotifications();
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        unreadOnly: false,
        priority: 'all',
        type: 'all',
        sort: 'newest',
        page: 1,
        limit: 25,
      },
    });
    get().fetchNotifications();
  },

  fetchPreferences: async () => {
    const prefs = await NotificationApiService.getPreferences();
    if (prefs) {
      set({ preferences: prefs });
    }
  },

  updatePreferences: async (newPrefs) => {
    set((state) => ({
      preferences: { ...state.preferences, ...newPrefs },
    }));
    await NotificationApiService.updatePreferences(newPrefs);
  },

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setPreferencesOpen: (open) => set({ isPreferencesOpen: open }),
  setSelectedNotification: (notif) => set({ selectedNotification: notif }),

  addLocalNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false,
      deliveryStatus: 'Delivered',
      isArchived: false,
      isPinned: false,
      isMuted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = [newNotif, ...state.notifications];
      const unread = updated.filter((n) => !n.read && !n.isArchived).length;
      return { notifications: updated, unreadCount: unread };
    });
  },
}));

import React, { useMemo } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';
import { Notification } from '../../types/notification';
import {
  Bell,
  X,
  CheckCheck,
  Search,
  Filter,
  Sliders,
  Sparkles,
  Inbox,
  Pin,
  AlertTriangle,
  AtSign,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    filters,
    isLoading,
    isDrawerOpen,
    setDrawerOpen,
    setPreferencesOpen,
    markAsRead,
    markAllAsRead,
    toggleArchive,
    togglePin,
    deleteNotification,
    setFilters,
    setSelectedNotification,
  } = useNotificationStore();

  if (!isDrawerOpen) return null;

  // Group notifications into Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    notifications.forEach((notif) => {
      if (notif.isArchived) return; // Hide archived in primary view unless filter asks for it

      const time = new Date(notif.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(notif);
      } else if (time >= startOfYesterday) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  }, [notifications]);

  const hasItems =
    groupedNotifications.today.length > 0 ||
    groupedNotifications.yesterday.length > 0 ||
    groupedNotifications.earlier.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Notifications
                      </h2>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enterprise Activity & Live Mentions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreferencesOpen(true)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Notification preferences"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => markAllAsRead()}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={filters.sort || 'newest'}
                    onChange={(e) => setFilters({ sort: e.target.value as any })}
                    className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="newest" className="dark:bg-slate-900">Newest</option>
                    <option value="oldest" className="dark:bg-slate-900">Oldest</option>
                    <option value="priority" className="dark:bg-slate-900">Priority</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none text-[11px] font-medium">
                <button
                  onClick={() => setFilters({ unreadOnly: false, priority: 'all', type: 'all', isPinned: undefined })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    !filters.unreadOnly && filters.priority === 'all' && filters.type === 'all' && filters.isPinned === undefined
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilters({ unreadOnly: true, priority: 'all', type: 'all', isPinned: undefined })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filters.unreadOnly
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Unread
                </button>

                <button
                  onClick={() => setFilters({ isPinned: true })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filters.isPinned === true
                      ? 'bg-amber-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </button>

                <button
                  onClick={() => setFilters({ type: 'Mention' })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filters.type === 'Mention'
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <AtSign className="w-2.5 h-2.5" /> Mentions
                </button>

                <button
                  onClick={() => setFilters({ type: 'Task Assigned' })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filters.type === 'Task Assigned'
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <UserCheck className="w-2.5 h-2.5" /> Tasks
                </button>

                <button
                  onClick={() => setFilters({ priority: 'High' })}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    filters.priority === 'High'
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-2.5 h-2.5" /> Urgent
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasItems ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    All caught up!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    You have no matching notifications right now. New updates will automatically appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Today Group */}
                  {groupedNotifications.today.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center justify-between">
                        <span>Today</span>
                        <span className="text-[10px] font-semibold">{groupedNotifications.today.length}</span>
                      </div>
                      <div className="space-y-2">
                        {groupedNotifications.today.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkRead={markAsRead}
                            onTogglePin={togglePin}
                            onToggleArchive={toggleArchive}
                            onDelete={deleteNotification}
                            onSelect={setSelectedNotification}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday Group */}
                  {groupedNotifications.yesterday.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center justify-between">
                        <span>Yesterday</span>
                        <span className="text-[10px] font-semibold">{groupedNotifications.yesterday.length}</span>
                      </div>
                      <div className="space-y-2">
                        {groupedNotifications.yesterday.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkRead={markAsRead}
                            onTogglePin={togglePin}
                            onToggleArchive={toggleArchive}
                            onDelete={deleteNotification}
                            onSelect={setSelectedNotification}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Earlier Group */}
                  {groupedNotifications.earlier.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center justify-between">
                        <span>Earlier</span>
                        <span className="text-[10px] font-semibold">{groupedNotifications.earlier.length}</span>
                      </div>
                      <div className="space-y-2">
                        {groupedNotifications.earlier.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkRead={markAsRead}
                            onTogglePin={togglePin}
                            onToggleArchive={toggleArchive}
                            onDelete={deleteNotification}
                            onSelect={setSelectedNotification}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-center text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Real-Time Enterprise Sync
              </span>
              <button
                onClick={() => setPreferencesOpen(true)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal />
    </>
  );
};

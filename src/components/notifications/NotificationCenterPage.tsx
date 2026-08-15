import React, { useState } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';
import {
  Bell,
  CheckCheck,
  Search,
  Sliders,
  Inbox,
  Pin,
  AlertTriangle,
  AtSign,
  UserCheck,
  ArrowUpDown,
  Archive,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const NotificationCenterPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    filters,
    isLoading,
    setPreferencesOpen,
    markAsRead,
    markAllAsRead,
    toggleArchive,
    togglePin,
    deleteNotification,
    setFilters,
    setSelectedNotification,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');

  const filteredItems = notifications.filter((notif) => {
    if (activeTab === 'archived') return notif.isArchived;
    if (notif.isArchived) return false;

    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'pinned') return notif.isPinned;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage live activity alerts, direct mentions, assignments, and system notices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>

            <button
              onClick={() => setPreferencesOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-4 h-4" /> Preferences
            </button>
          </div>
        </div>

        {/* Search & Main Category Filters */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('all');
                setFilters({ unreadOnly: false, isArchived: false, isPinned: undefined });
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Notifications
            </button>

            <button
              onClick={() => {
                setActiveTab('unread');
                setFilters({ unreadOnly: true, isArchived: false, isPinned: undefined });
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Unread
            </button>

            <button
              onClick={() => {
                setActiveTab('pinned');
                setFilters({ isPinned: true, isArchived: false });
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pinned'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Pin className="w-3.5 h-3.5" /> Pinned
            </button>

            <button
              onClick={() => {
                setActiveTab('archived');
                setFilters({ isArchived: true });
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'archived'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" /> Archived
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No notifications found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no notifications matching your current filter criteria.
            </p>
          </div>
        ) : (
          filteredItems.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={markAsRead}
              onTogglePin={togglePin}
              onToggleArchive={toggleArchive}
              onDelete={deleteNotification}
              onSelect={setSelectedNotification}
            />
          ))
        )}
      </div>

      <NotificationPreferencesModal />
    </div>
  );
};

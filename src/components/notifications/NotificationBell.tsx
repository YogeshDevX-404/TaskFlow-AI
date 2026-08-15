import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

export interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isDrawerOpen = useNotificationStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useNotificationStore((state) => state.setDrawerOpen);

  return (
    <button
      onClick={() => setDrawerOpen(!isDrawerOpen)}
      className={`relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center ${className}`}
      title="Notifications & Activity"
      aria-label="Open notifications"
    >
      <Bell className={`w-4 h-4 transition-transform ${unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' : ''}`} />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center leading-none shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50 duration-200">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

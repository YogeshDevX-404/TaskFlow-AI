import React from 'react';
import {
  Notification,
  NotificationPriority,
  NotificationType,
} from '../../types/notification';
import {
  UserCheck,
  CheckCircle2,
  Trash2,
  MessageSquare,
  AtSign,
  Paperclip,
  FolderKanban,
  Zap,
  Tag,
  UserPlus,
  Shield,
  Clock,
  AlertTriangle,
  Bell,
  Pin,
  Archive,
  Check,
  Eye,
  FileText,
} from 'lucide-react';

export interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string, read?: boolean) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (notif: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onSelect,
}) => {
  const {
    id,
    type,
    title,
    message,
    priority,
    read,
    isPinned,
    isArchived,
    createdAt,
    sender,
    project,
    task,
  } = notification;

  // Render Type Specific Icon & Color Scheme
  const getTypeBadge = (notifType: NotificationType) => {
    switch (notifType) {
      case 'Task Assigned':
        return { icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' };
      case 'Task Completed':
        return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' };
      case 'Task Deleted':
        return { icon: <Trash2 className="w-3.5 h-3.5" />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' };
      case 'Comment Added':
        return { icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' };
      case 'Mention':
        return { icon: <AtSign className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' };
      case 'Attachment Uploaded':
        return { icon: <Paperclip className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' };
      case 'Project Updated':
        return { icon: <FolderKanban className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400' };
      case 'Sprint Started':
      case 'Sprint Completed':
        return { icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400' };
      case 'Release Published':
        return { icon: <Tag className="w-3.5 h-3.5" />, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400' };
      case 'Member Invited':
      case 'Member Joined':
        return { icon: <UserPlus className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' };
      case 'Role Changed':
        return { icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' };
      case 'Due Date Reminder':
      case 'Deadline Passed':
        return { icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' };
      default:
        return { icon: <Bell className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'Critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Critical</span>;
      case 'High':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">High</span>;
      case 'Low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Low</span>;
      default:
        return null;
    }
  };

  const badge = getTypeBadge(type);

  // Format relative time string
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const senderName = typeof sender === 'object' && sender ? sender.name || sender.firstName || 'System' : 'System';
  const senderAvatar = typeof sender === 'object' && sender ? sender.avatar : undefined;

  return (
    <div
      onClick={() => onSelect && onSelect(notification)}
      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
        read
          ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 opacity-90 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
          : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/50 shadow-sm hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30'
      } ${isPinned ? 'ring-1 ring-amber-500/30 dark:ring-amber-500/20' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Sender Avatar or Icon */}
        <div className="relative shrink-0 mt-0.5">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
            />
          ) : (
            <div className={`w-9 h-9 rounded-xl ${badge.color} flex items-center justify-center shadow-sm`}>
              {badge.icon}
            </div>
          )}

          {/* Unread dot */}
          {!read && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </span>
              {getPriorityBadge(priority)}
              {isPinned && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
              {formatRelativeTime(createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
            {message}
          </p>

          {/* Optional Tags & Context */}
          <div className="flex items-center gap-2 flex-wrap">
            {project && typeof project === 'object' && project.name && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FolderKanban className="w-2.5 h-2.5 text-indigo-500" />
                {project.name}
              </span>
            )}

            {task && typeof task === 'object' && task.taskKey && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                <FileText className="w-2.5 h-2.5" />
                {task.taskKey}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(id);
            }}
            className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition ${
              isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title={isPinned ? 'Unpin notification' : 'Pin notification'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(id, !read);
            }}
            className="p-1.5 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
            title={read ? 'Mark as unread' : 'Mark as read'}
          >
            {read ? <Eye className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(id);
            }}
            className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition ${
              isArchived ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title={isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-1.5 rounded-lg text-xs hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition"
            title="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

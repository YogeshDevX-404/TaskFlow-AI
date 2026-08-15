import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  User,
  MessageSquare,
  Paperclip,
  Folder,
  Building,
  Users,
  LogIn,
  LogOut,
  Trash2,
  Archive,
  RotateCcw,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Tag,
} from 'lucide-react';
import { ActivityItem } from '../../types/activity';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityTimelineItemProps {
  activity: ActivityItem;
}

export const ActivityTimelineItem: React.FC<ActivityTimelineItemProps> = ({ activity }) => {
  const [showMetadata, setShowMetadata] = useState(false);

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'task_created':
        return {
          icon: <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
          label: 'created task',
        };
      case 'status_changed':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
          label: 'changed status',
        };
      case 'priority_changed':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
          label: 'changed priority',
        };
      case 'assignee_changed':
        return {
          icon: <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
          label: 'reassigned task',
        };
      case 'reporter_changed':
        return {
          icon: <User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />,
          bgColor: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
          badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300',
          label: 'updated reporter',
        };
      case 'label_added':
      case 'label_removed':
        return {
          icon: <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
          label: action === 'label_added' ? 'added label' : 'removed label',
        };
      case 'comment_added':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
          bgColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
          badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
          label: 'commented',
        };
      case 'comment_edited':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
          bgColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
          badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
          label: 'edited comment',
        };
      case 'comment_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
          label: 'deleted comment',
        };
      case 'attachment_uploaded':
        return {
          icon: <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
          bgColor: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
          label: 'uploaded attachment',
        };
      case 'attachment_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
          label: 'deleted attachment',
        };
      case 'task_archived':
      case 'project_archived':
        return {
          icon: <Archive className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700',
          badgeColor: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
          label: 'archived',
        };
      case 'task_restored':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
          label: 'restored',
        };
      case 'task_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
          label: 'deleted task',
        };
      case 'project_updated':
        return {
          icon: <Folder className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
          label: 'updated project',
        };
      case 'workspace_updated':
        return {
          icon: <Building className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
          bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
          badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
          label: 'updated workspace',
        };
      case 'organization_updated':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />,
          bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
          label: 'updated organization',
        };
      case 'member_added':
      case 'member_removed':
      case 'role_changed':
        return {
          icon: <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />,
          bgColor: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
          badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300',
          label: action.replace('_', ' '),
        };
      case 'login':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
          label: 'logged in',
        };
      case 'logout':
        return {
          icon: <LogOut className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
          badgeColor: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
          label: 'logged out',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />,
          bgColor: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
          badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
          label: action.replace(/_/g, ' '),
        };
    }
  };

  const config = getActionConfig(activity.action);
  const createdDate = new Date(activity.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const exactTime = format(createdDate, 'PPP pp');

  const userName = activity.user?.name || 'System User';
  const userAvatar = activity.user?.avatar;

  const taskTitle =
    activity.metadata?.taskTitle ||
    (typeof activity.task === 'object' ? activity.task?.name : '') ||
    '';
  const taskKey =
    activity.metadata?.taskKey ||
    (typeof activity.task === 'object' ? activity.task?.key : '') ||
    '';

  return (
    <div className="relative pl-6 pb-6 last:pb-0 group">
      {/* Timeline connector line */}
      <div className="absolute left-2.5 top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-800 group-last:hidden" />

      {/* Node Icon Circle */}
      <div
        className={`absolute left-0 top-1 w-5 h-5 rounded-full border flex items-center justify-center ${config.bgColor}`}
      >
        {config.icon}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {/* User Avatar & Name */}
            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{userName}</span>
            </div>

            {/* Action Label */}
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${config.badgeColor}`}>
              {config.label}
            </span>

            {/* Entity Key / Title */}
            {taskKey && (
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {taskKey}
              </span>
            )}
            {taskTitle && (
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
                "{taskTitle}"
              </span>
            )}

            {/* Custom File or Comment Snippet */}
            {activity.metadata?.fileName && (
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {activity.metadata.fileName}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0" title={exactTime}>
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Diff value display */}
        {(activity.oldValue || activity.newValue) && (
          <div className="mt-2 text-xs flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800/80">
            {activity.oldValue && (
              <div className="text-rose-600 dark:text-rose-400 line-through truncate max-w-[150px]">
                {String(activity.oldValue)}
              </div>
            )}
            {activity.oldValue && activity.newValue && (
              <span className="text-slate-400 dark:text-slate-600">→</span>
            )}
            {activity.newValue && (
              <div className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[200px]">
                {String(activity.newValue)}
              </div>
            )}
          </div>
        )}

        {/* Comment Snippet Preview */}
        {activity.metadata?.commentContent && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded border-l-2 border-sky-400">
            "{activity.metadata.commentContent}"
          </p>
        )}

        {/* Expandable Technical Metadata / Audit Details */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            {activity.ipAddress && (
              <span className="flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3" />
                {activity.ipAddress}
              </span>
            )}
            <span>Entity: {activity.entityType}</span>
          </div>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {showMetadata ? (
              <>
                <span>Hide Payload</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>View Raw Details</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {showMetadata && (
          <pre className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto">
            {JSON.stringify(activity, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

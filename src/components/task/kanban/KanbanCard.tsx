import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MoreHorizontal,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  Copy,
  Archive,
  Trash2,
  Edit2,
  Bookmark,
  User,
  ExternalLink,
} from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../../../types/task';
import { useBoardStore } from '../../../store/useBoardStore';
import { useTaskStore } from '../../../store/useTaskStore';

interface KanbanCardProps {
  task: Task;
  cardSize?: 'compact' | 'default' | 'expanded';
  showLabels?: boolean;
  showStoryPoints?: boolean;
  showAvatars?: boolean;
  showDueDates?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  onOpenQuickEdit?: (task: Task) => void;
  dndRef?: (element: HTMLElement | null) => void;
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
  dndStyle?: React.CSSProperties;
}

const PRIORITY_STYLES: Record<TaskPriority, { color: string; bg: string; border: string }> = {
  Urgent: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900' },
  Highest: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-900' },
  High: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900' },
  Medium: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-900' },
  Low: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900' },
  Lowest: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40', border: 'border-slate-200 dark:border-slate-700' },
};

const TYPE_COLORS: Record<TaskType, string> = {
  Bug: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
  Feature: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30',
  Story: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  Epic: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
  Task: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
  Improvement: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30',
  Research: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
  Spike: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  cardSize = 'default',
  showLabels = true,
  showStoryPoints = true,
  showAvatars = true,
  showDueDates = true,
  isSelected = false,
  onSelect,
  onOpenQuickEdit,
  dndRef,
  dndAttributes,
  dndListeners,
  dndStyle,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { setSelectedTask, duplicateTask, archiveTask, deleteTask } = useTaskStore();

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'Done' : false;

  const assigneeName = typeof task.assignee === 'object'
    ? task.assignee.name || `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || 'Assigned'
    : task.assignee;

  const assigneeAvatar = typeof task.assignee === 'object' ? task.assignee.avatar : undefined;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/tasks?taskId=${task.id}`);
    setShowMenu(false);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    await duplicateTask(task.id);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    await archiveTask(task.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const typeStyle = TYPE_COLORS[task.type] || TYPE_COLORS.Task;

  const subtaskDone = task.subtaskStats?.completed ?? task.subtaskCount?.done ?? 0;
  const subtaskTotal = task.subtaskStats?.total ?? task.subtaskCount?.total ?? 0;

  return (
    <div
      ref={dndRef}
      style={dndStyle}
      {...dndAttributes}
      {...dndListeners}
      onClick={() => setSelectedTask(task)}
      className={`group relative bg-white dark:bg-slate-800/90 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      } ${cardSize === 'compact' ? 'p-2.5 space-y-1.5' : cardSize === 'expanded' ? 'p-4 space-y-3' : 'p-3 space-y-2'}`}
    >
      {/* Top Header Row: Selection Checkbox, Key, Type, Priority, Menu */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onSelect?.(task.id)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            {task.taskKey || `TASK-${task.id.slice(-4)}`}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${typeStyle}`}>
            {task.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.color} ${priorityStyle.border}`}
          >
            {task.priority}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Quick options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 z-30 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onOpenQuickEdit?.(task);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Quick Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Archive</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h4 className={`font-medium text-slate-900 dark:text-slate-100 line-clamp-2 ${cardSize === 'compact' ? 'text-xs' : 'text-sm'}`}>
        {task.title}
      </h4>

      {/* Description preview in expanded mode */}
      {cardSize === 'expanded' && task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {showLabels && task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {task.labels.slice(0, cardSize === 'compact' ? 2 : 4).map((lbl) => (
            <span
              key={lbl}
              className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
            >
              #{lbl}
            </span>
          ))}
          {task.labels.length > (cardSize === 'compact' ? 2 : 4) && (
            <span className="text-[10px] font-medium text-slate-400">
              +{task.labels.length - (cardSize === 'compact' ? 2 : 4)}
            </span>
          )}
        </div>
      )}

      {/* Subtask progress bar if subtasks exist */}
      {subtaskTotal > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-indigo-500" />
              <span>Subtasks</span>
            </span>
            <span className="font-mono text-[10px]">
              {subtaskDone}/{subtaskTotal}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((subtaskDone / subtaskTotal) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Due Date, Comments, Attachments, Story Points, Assignee */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-slate-400 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {showDueDates && task.dueDate && (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={isOverdue ? 'Overdue Task' : `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
            >
              {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
          )}

          {/* Comment Count */}
          {(task.commentCount ?? task.commentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400" title="Comments">
              <MessageSquare className="w-3 h-3" />
              <span>{task.commentCount ?? task.commentsCount}</span>
            </span>
          )}

          {/* Attachment Count */}
          {(task.attachmentCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400" title="Attachments">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachmentCount}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showStoryPoints && task.storyPoints > 0 && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full" title="Story Points">
              {task.storyPoints} pts
            </span>
          )}

          {showAvatars && (
            <div className="flex items-center" title={assigneeName ? `Assigned to ${assigneeName}` : 'Unassigned'}>
              {assigneeAvatar ? (
                <img
                  src={assigneeAvatar}
                  alt={assigneeName || 'User'}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : assigneeName ? (
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] flex items-center justify-center ring-1 ring-indigo-300 dark:ring-indigo-700">
                  {assigneeName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SortableKanbanCard: React.FC<KanbanCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <KanbanCard
      {...props}
      dndRef={setNodeRef}
      dndAttributes={attributes}
      dndListeners={listeners}
      dndStyle={style}
    />
  );
};

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { TaskTypeBadge, TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';
import {
  MoreVertical,
  Star,
  Eye,
  Copy,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export interface TaskListTableProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onArchiveTask: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatch: (id: string) => void;
  onCopyLink: (taskKey: string) => void;
  onUpdateStatus?: (id: string, newStatus: TaskStatus) => void;
  onUpdatePriority?: (id: string, newPriority: TaskPriority) => void;
}

export const TaskListTable: React.FC<TaskListTableProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onRestoreTask,
  onDuplicateTask,
  onToggleFavorite,
  onToggleWatch,
  onCopyLink,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const getAssigneeInfo = (assignee?: Task['assignee']) => {
    if (!assignee) return { name: 'Unassigned', avatar: '' };
    if (typeof assignee === 'object') {
      const name = assignee.name || `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'User';
      return { name, avatar: assignee.avatar || '' };
    }
    return { name: 'Assigned', avatar: '' };
  };

  const getReporterInfo = (reporter?: Task['reporter']) => {
    if (!reporter) return { name: 'System', avatar: '' };
    if (typeof reporter === 'object') {
      const name = reporter.name || `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim() || 'User';
      return { name, avatar: reporter.avatar || '' };
    }
    return { name: 'User', avatar: '' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate || status === 'Done' || status === 'Cancelled') return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      return due < now;
    } catch {
      return false;
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
              <th className="py-3.5 px-4 w-10"></th>
              <th className="py-3.5 px-4 min-w-[100px]">Task ID</th>
              <th className="py-3.5 px-4 min-w-[260px]">Title</th>
              <th className="py-3.5 px-4 min-w-[120px]">Type</th>
              <th className="py-3.5 px-4 min-w-[130px]">Status</th>
              <th className="py-3.5 px-4 min-w-[110px]">Priority</th>
              <th className="py-3.5 px-4 min-w-[140px]">Assignee</th>
              <th className="py-3.5 px-4 min-w-[130px]">Reporter</th>
              <th className="py-3.5 px-4 min-w-[120px]">Due Date</th>
              <th className="py-3.5 px-4 min-w-[160px]">Labels</th>
              <th className="py-3.5 px-4 min-w-[110px]">Updated</th>
              <th className="py-3.5 px-4 text-right min-w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
            {tasks.map((task) => {
              const assignee = getAssigneeInfo(task.assignee);
              const reporter = getReporterInfo(task.reporter);
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <tr
                  key={task.id}
                  id={`task-row-${task.id}`}
                  className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Star Favorite Button */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(task.id)}
                      className="text-slate-300 dark:text-slate-700 hover:text-amber-400 transition cursor-pointer"
                      title={task.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          task.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </td>

                  {/* Task Key */}
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>{task.taskKey || task.id}</span>
                    </button>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 max-w-md">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="text-slate-900 dark:text-white font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left line-clamp-1 cursor-pointer block"
                    >
                      {task.title}
                    </button>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TaskTypeBadge type={task.type} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TaskStatusBadge status={task.status} />
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {assignee.avatar ? (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold shrink-0">
                          {assignee.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[110px]">
                        {assignee.name}
                      </span>
                    </div>
                  </td>

                  {/* Reporter */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {reporter.avatar ? (
                        <img
                          src={reporter.avatar}
                          alt={reporter.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold shrink-0">
                          {reporter.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-slate-600 dark:text-slate-400 text-xs truncate max-w-[100px]">
                        {reporter.name}
                      </span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1 text-xs ${
                        overdue
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </td>

                  {/* Labels */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {task.labels && task.labels.length > 0 ? (
                        task.labels.slice(0, 3).map((label) => (
                          <span
                            key={label}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                      {task.labels && task.labels.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{task.labels.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatDate(task.updatedAt)}
                  </td>

                  {/* Action Menu */}
                  <td className="py-3 px-4 text-right relative whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        title="View Task Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        title="More Actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Popover Dropdown Menu */}
                    {activeMenuTaskId === task.id && (
                      <div
                        className="absolute right-4 top-10 z-30 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-left animate-in fade-in zoom-in-95 duration-100"
                        onMouseLeave={() => setActiveMenuTaskId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onSelectTask(task);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onEditTask(task);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                          Edit Task
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onCopyLink(task.taskKey || task.id);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          Copy Link
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onDuplicateTask(task.id);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          Duplicate Task
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onToggleWatch(task.id);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-500" />
                          {task.isWatching ? 'Stop Watching' : 'Watch Task'}
                        </button>

                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                        {task.isArchived ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuTaskId(null);
                              onRestoreTask(task.id);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore Task
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuTaskId(null);
                              onArchiveTask(task.id);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archive Task
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuTaskId(null);
                            onDeleteTask(task);
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Task
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { Task } from '../../types/task';
import { TaskTypeBadge, TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';
import {
  Star,
  Eye,
  Calendar,
  Clock,
  ExternalLink,
  MoreVertical,
  CheckSquare,
} from 'lucide-react';

export interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatch: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelectTask,
  onToggleFavorite,
  onToggleWatch,
}) => {
  const getAssigneeInfo = (assignee?: Task['assignee']) => {
    if (!assignee) return { name: 'Unassigned', avatar: '' };
    if (typeof assignee === 'object') {
      const name = assignee.name || `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'User';
      return { name, avatar: assignee.avatar || '' };
    }
    return { name: 'Assigned', avatar: '' };
  };

  const assignee = getAssigneeInfo(task.assignee);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div
      id={`task-card-${task.id}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative cursor-pointer"
      onClick={() => onSelectTask(task)}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {task.taskKey || task.id}
          </span>
          <TaskTypeBadge type={task.type} showLabel={false} />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch(task.id);
            }}
            className={`p-1 rounded-lg transition ${
              task.isWatching
                ? 'text-teal-500 bg-teal-500/10'
                : 'text-slate-300 dark:text-slate-700 hover:text-slate-500'
            }`}
            title={task.isWatching ? 'Watching task' : 'Watch task'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(task.id);
            }}
            className="p-1 rounded-lg transition text-slate-300 dark:text-slate-700 hover:text-amber-400"
            title={task.isFavorite ? 'Starred' : 'Star'}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                task.isFavorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />

        {task.storyPoints > 0 && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {task.storyPoints} pts
          </span>
        )}

        {task.estimatedHours > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {task.estimatedHours}h
          </span>
        )}
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {task.labels.slice(0, 3).map((lbl) => (
            <span
              key={lbl}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            >
              #{lbl}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {assignee.avatar ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {assignee.name.charAt(0)}
            </div>
          )}
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
            {assignee.name}
          </span>
        </div>

        {formattedDueDate && (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3 h-3" />
            <span>{formattedDueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

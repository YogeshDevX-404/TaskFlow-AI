import React from 'react';
import { Task } from '../../types/task';
import { TaskTypeBadge, TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';
import { Star, Calendar, ExternalLink } from 'lucide-react';

export interface TaskCompactRowProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onToggleFavorite: (id: string) => void;
}

export const TaskCompactRow: React.FC<TaskCompactRowProps> = ({
  task,
  onSelectTask,
  onToggleFavorite,
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

  return (
    <div
      id={`task-compact-${task.id}`}
      onClick={() => onSelectTask(task)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-xl px-3 py-2 flex items-center justify-between gap-3 text-xs transition shadow-sm hover:shadow-md cursor-pointer group"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(task.id);
          }}
          className="text-slate-300 dark:text-slate-700 hover:text-amber-400 transition"
        >
          <Star
            className={`w-3.5 h-3.5 ${
              task.isFavorite ? 'fill-amber-400 text-amber-400' : ''
            }`}
          />
        </button>

        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
          {task.taskKey || task.id}
        </span>

        <TaskTypeBadge type={task.type} showLabel={false} />

        <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} showLabel={false} />

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 text-slate-500">
          {assignee.avatar ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
              {assignee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

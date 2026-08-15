import React, { useState } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../../types/task';
import { TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge } from '../TaskBadges';
import {
  Star,
  Copy,
  MoreVertical,
  X,
  Maximize2,
  Minimize2,
  Edit3,
  Archive,
  Trash2,
  CheckCircle2,
  ListTodo,
  Bug,
  BookOpen,
  Zap,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export interface TaskDetailHeaderProps {
  task: Task;
  isEditingTitle: boolean;
  setIsEditingTitle: (editing: boolean) => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onUpdatePriority: (priority: TaskPriority) => void;
  onToggleFavorite: (id: string) => void;
  onCopyLink: (taskKey: string) => void;
  onClose: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ALL_STATUSES: TaskStatus[] = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Testing',
  'Done',
  'Blocked',
  'Cancelled',
];

const ALL_PRIORITIES: TaskPriority[] = [
  'Lowest',
  'Low',
  'Medium',
  'High',
  'Highest',
  'Urgent',
];

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  task,
  isEditingTitle,
  setIsEditingTitle,
  onUpdateTitle,
  onUpdateStatus,
  onUpdatePriority,
  onToggleFavorite,
  onCopyLink,
  onClose,
  isFullScreen,
  onToggleFullScreen,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}) => {
  const [titleValue, setTitleValue] = useState(task.title);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      onUpdateTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const projectKey = typeof task.project === 'object' ? task.project.projectKey || 'TASK' : task.projectKey || 'TASK';

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-all">
      {/* Top Action Ribbon */}
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* Left ID & Type Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold font-mono tracking-wider">
            {task.taskKey}
          </span>
          <TaskTypeBadge type={task.type} />
          {task.isArchived && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Archived
            </span>
          )}
        </div>

        {/* Right Header Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => onToggleFavorite(task.id)}
            className={`p-2 rounded-xl transition ${
              task.isFavorite
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={task.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
          >
            <Star className={`w-4 h-4 ${task.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={() => onCopyLink(task.taskKey)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Copy Link to Task"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* FullScreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullScreen}
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isFullScreen ? 'Restore Size' : 'Maximize Drawer'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowMoreMenu(false)}
              >
                <button
                  type="button"
                  onClick={onEdit}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-500" />
                  <span>Duplicate Task</span>
                </button>
                <button
                  type="button"
                  onClick={onArchive}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{task.isArchived ? 'Restore Task' : 'Archive Task'}</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>

          {/* Close Drawer Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task Title (Editable or Heading) */}
      <div className="mt-1">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="w-full px-3 py-1.5 rounded-xl border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleTitleSubmit}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Save
            </button>
          </div>
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug group flex items-start justify-between gap-2"
            title="Click to edit title"
          >
            <span>{task.title}</span>
            <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 shrink-0 mt-1 transition" />
          </h2>
        )}
      </div>

      {/* Status & Priority Dropdown Triggers Bar */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <TaskStatusBadge status={task.status} />
          </button>

          {showStatusMenu && (
            <div
              className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in duration-100"
              onClick={() => setShowStatusMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                Change Status
              </div>
              {ALL_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(st)}
                  className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/60 transition ${
                    task.status === st
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{st}</span>
                  {task.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <TaskPriorityBadge priority={task.priority} />
          </button>

          {showPriorityMenu && (
            <div
              className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in duration-100"
              onClick={() => setShowPriorityMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                Change Priority
              </div>
              {ALL_PRIORITIES.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => onUpdatePriority(pr)}
                  className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/60 transition ${
                    task.priority === pr
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{pr}</span>
                  {task.priority === pr && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sprint, SprintStatus } from '../../types/sprint';
import {
  MoreVertical,
  Calendar,
  Zap,
  Target,
  Play,
  CheckCircle,
  XCircle,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  Clock,
  Layers,
} from 'lucide-react';

interface SprintCardProps {
  sprint: Sprint;
  onStart?: (sprint: Sprint) => void;
  onComplete?: (sprint: Sprint) => void;
  onCancel?: (sprint: Sprint) => void;
  onEdit?: (sprint: Sprint) => void;
  onDuplicate?: (sprint: Sprint) => void;
  onArchive?: (sprint: Sprint) => void;
  onDelete?: (sprint: Sprint) => void;
  onSelect?: (sprint: Sprint) => void;
}

const STATUS_CONFIG: Record<
  SprintStatus,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  Planning: {
    label: 'Planning',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    icon: Clock,
  },
  Active: {
    label: 'Active',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: Zap,
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: CheckCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    icon: XCircle,
  },
};

export const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  onStart,
  onComplete,
  onCancel,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onSelect,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const statusInfo = STATUS_CONFIG[sprint.status] || STATUS_CONFIG.Planning;
  const StatusIcon = statusInfo.icon;

  const taskCount = Array.isArray(sprint.taskIds)
    ? sprint.taskIds.length
    : Array.isArray(sprint.tasks)
    ? sprint.tasks.length
    : 0;

  const projectName = typeof sprint.project === 'object' ? sprint.project.name : 'Project';

  return (
    <div
      onClick={() => onSelect?.(sprint)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer relative"
    >
      {/* Header & Menu */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 shrink-0 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusInfo.label}</span>
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {sprint.name}
          </h3>
        </div>

        {/* Dropdown Action Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-xs">
              {sprint.status === 'Planning' && onStart && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onStart(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Sprint</span>
                </button>
              )}

              {sprint.status === 'Active' && onComplete && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onComplete(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Complete Sprint</span>
                </button>
              )}

              {(sprint.status === 'Planning' || sprint.status === 'Active') && onCancel && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onCancel(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-2"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Sprint</span>
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Sprint</span>
                </button>
              )}

              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
              )}

              {onArchive && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onArchive(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2"
                >
                  {sprint.isArchived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Sprint</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Sprint</span>
                    </>
                  )}
                </button>
              )}

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(sprint);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Sprint</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Goal */}
      {sprint.goal && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 font-medium flex items-start gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <span>{sprint.goal}</span>
        </p>
      )}

      {/* Info Pills */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Timeline</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'TBD'} -{' '}
              {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Scope & Capacity</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {taskCount} Tasks ({sprint.capacity || 0} pts)
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        <span>Project: <strong className="text-slate-700 dark:text-slate-300">{projectName}</strong></span>
        {sprint.status === 'Completed' && sprint.velocity !== undefined && (
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            Velocity: {sprint.velocity} pts
          </span>
        )}
      </div>
    </div>
  );
};

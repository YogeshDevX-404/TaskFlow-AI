import React from 'react';
import { AssignmentPriority, AssignmentStatus } from '../../types/workAssignment';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  FileCheck2,
  RotateCcw,
  XCircle,
  Archive,
  AlertTriangle,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface StatusBadgeProps {
  status: AssignmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AssignmentStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStatusConfig = (st: AssignmentStatus) => {
    switch (st) {
      case 'Assigned':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: Clock,
          label: 'Assigned',
        };
      case 'Acknowledged':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          icon: CheckCircle2,
          label: 'Acknowledged',
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: PlayCircle,
          label: 'In Progress',
        };
      case 'Blocked':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: PauseCircle,
          label: 'Blocked',
        };
      case 'Submitted':
        return {
          bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: FileCheck2,
          label: 'Submitted for Review',
        };
      case 'Changes Requested':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          icon: RotateCcw,
          label: 'Changes Requested',
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle2,
          label: 'Completed',
        };
      case 'Cancelled':
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
          icon: XCircle,
          label: 'Cancelled',
        };
      case 'Archived':
        return {
          bg: 'bg-zinc-500/10 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800',
          icon: Archive,
          label: 'Archived',
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          icon: AlertCircle,
          label: st,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: AssignmentPriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AssignmentPriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const getPriorityConfig = (pr: AssignmentPriority) => {
    switch (pr) {
      case 'Urgent':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold',
          icon: Flame,
          label: 'Urgent',
        };
      case 'High':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold',
          icon: AlertTriangle,
          label: 'High',
        };
      case 'Medium':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium',
          icon: ArrowUpRight,
          label: 'Medium',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium',
          icon: ArrowUpRight,
          label: 'Low',
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};

interface OverdueBadgeProps {
  isOverdue: boolean;
  isDueSoon?: boolean;
  dueDate?: string | null;
}

export const AssignmentDueBadge: React.FC<OverdueBadgeProps> = ({
  isOverdue,
  isDueSoon,
  dueDate,
}) => {
  if (!dueDate) return null;

  const formattedDate = new Date(dueDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      new Date(dueDate).getFullYear() !== new Date().getFullYear()
        ? 'numeric'
        : undefined,
  });

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
        <AlertTriangle className="w-3 h-3 text-red-500" />
        <span>Overdue: {formattedDate}</span>
      </span>
    );
  }

  if (isDueSoon) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
        <Clock className="w-3 h-3 text-amber-500" />
        <span>Due Soon: {formattedDate}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
      <Clock className="w-3 h-3" />
      <span>Due: {formattedDate}</span>
    </span>
  );
};

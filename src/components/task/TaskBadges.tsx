import React from 'react';
import {
  TaskType,
  TaskStatus,
  TaskPriority,
} from '../../types/task';
import {
  CheckSquare,
  Bug,
  BookOpen,
  Zap,
  Sparkles,
  TrendingUp,
  Search,
  Flame,
  CircleDashed,
  Circle,
  Clock,
  Eye,
  FlaskConical,
  CheckCircle2,
  Ban,
  XCircle,
  ArrowDown,
  ChevronDown,
  Minus,
  ChevronUp,
  ArrowUp,
  AlertTriangle,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* TASK TYPE BADGE                                                            */
/* -------------------------------------------------------------------------- */
export interface TaskTypeBadgeProps {
  type: TaskType;
  showLabel?: boolean;
  className?: string;
}

export const TaskTypeBadge: React.FC<TaskTypeBadgeProps> = ({
  type,
  showLabel = true,
  className = '',
}) => {
  const getConfig = (t: TaskType) => {
    switch (t) {
      case 'Bug':
        return {
          icon: Bug,
          bg: 'bg-rose-500/10 dark:bg-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-500/20',
        };
      case 'Story':
        return {
          icon: BookOpen,
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/20',
        };
      case 'Epic':
        return {
          icon: Zap,
          bg: 'bg-purple-500/10 dark:bg-purple-500/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-500/20',
        };
      case 'Feature':
        return {
          icon: Sparkles,
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
          text: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-500/20',
        };
      case 'Improvement':
        return {
          icon: TrendingUp,
          bg: 'bg-teal-500/10 dark:bg-teal-500/20',
          text: 'text-teal-600 dark:text-teal-400',
          border: 'border-teal-500/20',
        };
      case 'Research':
        return {
          icon: Search,
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20',
        };
      case 'Spike':
        return {
          icon: Flame,
          bg: 'bg-orange-500/10 dark:bg-orange-500/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-500/20',
        };
      case 'Task':
      default:
        return {
          icon: CheckSquare,
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/20',
        };
    }
  };

  const config = getConfig(type);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
      title={`Type: ${type}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{type}</span>}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* TASK STATUS BADGE                                                          */
/* -------------------------------------------------------------------------- */
export interface TaskStatusBadgeProps {
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  showLabel = true,
  className = '',
}) => {
  const getConfig = (s: TaskStatus) => {
    switch (s) {
      case 'Backlog':
        return {
          icon: CircleDashed,
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
        };
      case 'Todo':
        return {
          icon: Circle,
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/20',
        };
      case 'In Progress':
        return {
          icon: Clock,
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20',
        };
      case 'In Review':
        return {
          icon: Eye,
          bg: 'bg-purple-500/10 dark:bg-purple-500/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-500/20',
        };
      case 'Testing':
        return {
          icon: FlaskConical,
          bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
          text: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-500/20',
        };
      case 'Done':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/20',
        };
      case 'Blocked':
        return {
          icon: Ban,
          bg: 'bg-rose-500/10 dark:bg-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-500/20',
        };
      case 'Cancelled':
        return {
          icon: XCircle,
          bg: 'bg-slate-200/60 dark:bg-slate-800/60',
          text: 'text-slate-500 dark:text-slate-500',
          border: 'border-slate-300 dark:border-slate-700',
        };
      default:
        return {
          icon: Circle,
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
      title={`Status: ${status}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{status}</span>}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* TASK PRIORITY BADGE                                                        */
/* -------------------------------------------------------------------------- */
export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  showLabel = true,
  className = '',
}) => {
  const getConfig = (p: TaskPriority) => {
    switch (p) {
      case 'Lowest':
        return {
          icon: ArrowDown,
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-500 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
        };
      case 'Low':
        return {
          icon: ChevronDown,
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/20',
        };
      case 'Medium':
        return {
          icon: Minus,
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20',
        };
      case 'High':
        return {
          icon: ChevronUp,
          bg: 'bg-orange-500/10 dark:bg-orange-500/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-500/20',
        };
      case 'Highest':
        return {
          icon: ArrowUp,
          bg: 'bg-rose-500/10 dark:bg-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-500/20',
        };
      case 'Urgent':
        return {
          icon: AlertTriangle,
          bg: 'bg-red-600/10 dark:bg-red-600/20',
          text: 'text-red-600 dark:text-red-400 font-extrabold animate-pulse',
          border: 'border-red-600/30',
        };
      default:
        return {
          icon: Minus,
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getConfig(priority);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
      title={`Priority: ${priority}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{priority}</span>}
    </span>
  );
};

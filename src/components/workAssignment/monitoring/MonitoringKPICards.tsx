import React from 'react';
import { IAssignmentDashboardSummary } from '../../../types/workAssignment';
import {
  Briefcase,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  RotateCcw,
  ShieldAlert,
  Flame,
  Percent,
} from 'lucide-react';

interface MonitoringKPICardsProps {
  summary: IAssignmentDashboardSummary | null;
  onNavigateTab?: (tab: 'overview' | 'developers' | 'review-queue' | 'attention-needed' | 'projects') => void;
}

export const MonitoringKPICards: React.FC<MonitoringKPICardsProps> = ({ summary, onNavigateTab }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      id: 'total',
      label: 'Total Assignments',
      value: summary.totalAssignments,
      subValue: `${summary.totalActive} Active (${summary.completionRate}% Done)`,
      icon: Briefcase,
      color: 'indigo',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      onClick: () => onNavigateTab?.('overview'),
    },
    {
      id: 'in-progress',
      label: 'In Progress / Active',
      value: summary.statusCounts?.['In Progress'] || 0,
      subValue: `${summary.avgProgress}% Avg Team Progress`,
      icon: PlayCircle,
      color: 'sky',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      onClick: () => onNavigateTab?.('overview'),
    },
    {
      id: 'review-queue',
      label: 'Review Queue',
      value: summary.reviewQueueCount,
      subValue: summary.reviewQueueCount > 0 ? 'Action Needed: Reviews Pending' : 'Queue Clear',
      icon: Send,
      color: 'purple',
      badgeBg: summary.reviewQueueCount > 0
        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-bold animate-pulse'
        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      onClick: () => onNavigateTab?.('review-queue'),
    },
    {
      id: 'blocked',
      label: 'Blocked Items',
      value: summary.blockedCount,
      subValue: summary.blockedCount > 0 ? 'Requires Manager Unblocking' : 'No Blockers',
      icon: ShieldAlert,
      color: 'rose',
      badgeBg: summary.blockedCount > 0
        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      onClick: () => onNavigateTab?.('attention-needed'),
    },
    {
      id: 'overdue',
      label: 'Overdue Work',
      value: summary.overdueCount,
      subValue: summary.overdueCount > 0 ? 'Past Scheduled Due Date' : 'All Deadlines Met',
      icon: Flame,
      color: 'amber',
      badgeBg: summary.overdueCount > 0
        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      onClick: () => onNavigateTab?.('attention-needed'),
    },
    {
      id: 'hours',
      label: 'Logged vs Estimated',
      value: `${summary.totalLoggedHours}h`,
      subValue: `Est: ${summary.totalEstimatedHours}h (${summary.totalEstimatedHours > 0 ? Math.round((summary.totalLoggedHours / summary.totalEstimatedHours) * 100) : 0}% Burn)`,
      icon: Clock,
      color: 'emerald',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      onClick: () => onNavigateTab?.('overview'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <button
            key={kpi.id}
            onClick={kpi.onClick}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex flex-col justify-between ${kpi.badgeBg}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                {kpi.label}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.iconBg} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {kpi.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {kpi.subValue}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

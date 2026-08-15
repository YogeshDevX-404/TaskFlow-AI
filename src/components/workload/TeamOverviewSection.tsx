import React from 'react';
import { TeamWorkloadSummary } from '../../types/workload';
import { Users, Clock, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';

interface TeamOverviewSectionProps {
  summary?: TeamWorkloadSummary;
  isLoading: boolean;
}

export const TeamOverviewSection: React.FC<TeamOverviewSectionProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const getUtilizationColor = (pct: number) => {
    if (pct > 100) return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900';
    if (pct >= 85) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
    if (pct >= 60) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Capacity & Allocated */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Team Capacity
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.totalCapacityHours}h
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weekly Total
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Allocated: <strong>{summary.allocatedCapacityHours}h</strong></span>
            <span>Available: <strong>{summary.availableCapacityHours}h</strong></span>
          </div>
        </div>

        {/* Estimated vs Logged Work */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workload Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.totalEstimatedWorkHours}h
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Estimated Work
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Logged Hours: <strong>{summary.totalLoggedWorkHours}h</strong></span>
            <span>Total Team: <strong>{summary.totalMembers} Members</strong></span>
          </div>
        </div>

        {/* Team Utilization % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Team Utilization
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getUtilizationColor(summary.teamUtilizationPercentage)}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.teamUtilizationPercentage}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overall Average
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3.5 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.teamUtilizationPercentage > 100
                  ? 'bg-rose-500'
                  : summary.teamUtilizationPercentage >= 85
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, summary.teamUtilizationPercentage)}%` }}
            />
          </div>
        </div>

        {/* Capacity Health & Overload Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resource Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {summary.overloadedMembersCount}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                Overloaded
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.availableMembersCount}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                Available
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Normal: <strong>{summary.normalWorkloadMembersCount}</strong></span>
            <span>High: <strong>{summary.highWorkloadMembersCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

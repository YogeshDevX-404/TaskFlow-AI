import React from 'react';
import { Sprint } from '../../types/sprint';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Zap,
  Target,
  BarChart3,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface SprintMetricsCardProps {
  sprint: Sprint | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    progressPercentage: number;
    daysRemaining: number;
  };
}

export const SprintMetricsCard: React.FC<SprintMetricsCardProps> = ({ sprint, metrics }) => {
  if (!sprint) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        <Zap className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
        <p className="text-sm font-semibold">No active sprint selected for metrics view.</p>
      </div>
    );
  }

  const capacity = sprint.capacity || metrics.totalPoints || 40;
  const capacityPercent = Math.min(100, Math.round((metrics.totalPoints / capacity) * 100));

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Metric */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sprint Progress
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics.progressPercentage}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {metrics.completedTasks} / {metrics.totalTasks} Tasks
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Story Points & Velocity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Story Points & Capacity
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics.completedPoints}{' '}
                <span className="text-sm font-medium text-slate-400">/ {metrics.totalPoints} pts</span>
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                Cap: {capacity} pts
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Time Remaining
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics.daysRemaining}{' '}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">days</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                End: {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Target velocity rate: ~{metrics.daysRemaining > 0 ? Math.ceil(metrics.remainingPoints / metrics.daysRemaining) : 0} pts/day
            </p>
          </div>
        </div>

        {/* Blocked & Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Blocked Tasks
            </span>
            <div
              className={`p-2 rounded-xl ${
                metrics.blockedTasks > 0
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-black ${
                  metrics.blockedTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {metrics.blockedTasks}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {metrics.inProgressTasks} In Progress
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              {metrics.blockedTasks > 0 ? 'Requires immediate scrum unblocking' : 'No current impediments detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Burndown, Burnup & Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown & Burnup Analytics Tabbed Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Sprint Progress Analytics
              </h4>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
              <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white">Burndown</span>
            </div>
          </div>

          {/* SVG Burndown Real Rendering */}
          <div className="h-48 flex flex-col justify-end relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="300" y2="0" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

              {/* Linear Ideal Line */}
              <line x1="10" y1="10" x2="290" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Actual remaining curve based on real points */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                points={`10,10 80,${10 + (100 - metrics.progressPercentage) * 0.8} 180,${10 + (100 - metrics.progressPercentage) * 0.9} 290,${Math.max(10, 110 - metrics.progressPercentage)}`}
              />
            </svg>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2">
              <span>Day 1 (Start)</span>
              <span>Midpoint</span>
              <span>Day 14 (Target)</span>
            </div>
          </div>
        </div>

        {/* Real Velocity History Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Sprint Velocity History
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">Completed Story Points</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
            {/* Real Active/Current Sprint Column */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {metrics.completedPoints} pts
              </div>
              <div
                className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-lg transition-all duration-500 min-h-[8px]"
                style={{ height: `${Math.max(8, metrics.completedPoints * 3)}px` }}
              />
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {sprint.name.split(' ')[0] || 'Active'}
              </span>
            </div>

            {/* General context explanation for other sprints */}
            <div className="flex-1 text-[10px] text-slate-400 text-center pb-8">
              Complete more project sprints to see historical velocity tracking averages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


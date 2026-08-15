import React from 'react';
import { ProjectHealthMetrics } from '../../types/dashboard';
import {
  Activity,
  Zap,
  CalendarDays,
  AlertTriangle,
  Ban,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface ProjectHealthProps {
  health?: ProjectHealthMetrics;
}

export const ProjectHealthWidgets: React.FC<ProjectHealthProps> = ({ health }) => {
  const defaultHealth: ProjectHealthMetrics = {
    completion: 65,
    velocity: 48,
    upcomingTasks: 18,
    openIssues: 10,
    blockedItems: 2,
  };

  const h = health || defaultHealth;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Health & Vitals</h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
          Optimal Health Index (88/100)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {/* Completion */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {h.completion}%
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">+5% vs last week</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${h.completion}%` }}
            />
          </div>
        </div>

        {/* Velocity */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Sprint Velocity</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {h.velocity} <span className="text-xs font-normal text-slate-400">pts</span>
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">High output</span>
          </div>
          <p className="text-[10px] text-slate-400">Avg 45 pts target per sprint</p>
        </div>

        {/* Upcoming Tasks */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Upcoming Tasks</span>
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {h.upcomingTasks}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Ready in Backlog</span>
          </div>
          <p className="text-[10px] text-slate-400">Next sprint scope prepared</p>
        </div>

        {/* Open Issues */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Open Issues</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {h.openIssues}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">2 High Priority</span>
          </div>
          <p className="text-[10px] text-slate-400">Requires triage review</p>
        </div>

        {/* Blocked Items */}
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Blocked Items</span>
            <Ban className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
              {h.blockedItems}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Action Required</span>
          </div>
          <p className="text-[10px] text-slate-400">Dependencies pending</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Rocket, CheckCircle2, Clock, AlertTriangle, Bug, Flag, TrendingUp, Layers } from 'lucide-react';
import { RoadmapSummary } from '../../types/release';

interface RoadmapMetricsBannerProps {
  summary: RoadmapSummary;
}

export const RoadmapMetricsBanner: React.FC<RoadmapMetricsBannerProps> = ({ summary }) => {
  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Releases */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Releases
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {summary.totalReleases}
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">
              {summary.currentReleases} Active • {summary.upcomingReleases} Upcoming
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Rocket className="w-5 h-5" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.overallProgress}%
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">
              {summary.completedTasks} of {summary.totalTasks} tasks done
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scope Remaining
            </span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {summary.remainingTasks}
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">Tasks in execution pipeline</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* At Risk & Bugs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Bugs / Blocked
            </span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-2">
              {summary.openBugs} <span className="text-xs text-amber-500 font-semibold">({summary.blockedWork} blocked)</span>
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">Quality & release risk indicators</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Bug className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[120px] flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Roadmap Delivery:
        </div>
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden relative">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${summary.overallProgress}%` }}
          />
        </div>
        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 min-w-[50px] text-right">
          {summary.overallProgress}%
        </div>
      </div>
    </div>
  );
};

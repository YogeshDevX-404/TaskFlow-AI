import React, { useEffect } from 'react';
import { ShieldCheck, Activity, Users, CheckSquare, FileText } from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { ActivityFilterBar } from './ActivityFilterBar';
import { ActivityTimeline } from './ActivityTimeline';

export const AuditLogsPage: React.FC = () => {
  const {
    activities,
    groupedTimeline,
    total,
    page,
    totalPages,
    isLoading,
    isExporting,
    filters,
    setFilters,
    resetFilters,
    fetchActivities,
    exportActivities,
  } = useActivityStore();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Compute stats highlights
  const authEventsCount = activities.filter((a) => a.entityType === 'Auth').length;
  const taskEventsCount = activities.filter((a) => a.entityType === 'Task').length;
  const uniqueUsersCount = new Set(
    activities.map((a) => (typeof a.user === 'object' ? a.user?.id : a.user))
  ).size;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Top Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Enterprise Activity & Audit Logs
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Complete, immutable real-time activity timeline and compliance audit trail across tasks, comments, attachments, security, and organization administration.
            </p>
          </div>

          {/* Real-time Indicator Pill */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Audit Logging Active</span>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-7xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Audit Events</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{total}</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Task Changes</span>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{taskEventsCount}</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Active Contributor Users</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{uniqueUsersCount}</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Security & Auth Events</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{authEventsCount}</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Timeline Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col">
        <ActivityFilterBar
          filters={filters}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onResetFilters={resetFilters}
          onExport={exportActivities}
          isExporting={isExporting}
        />

        <div className="flex-1">
          <ActivityTimeline
            groupedTimeline={groupedTimeline}
            activities={activities}
            isLoading={isLoading}
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setFilters({ page: newPage })}
          />
        </div>
      </div>
    </div>
  );
};

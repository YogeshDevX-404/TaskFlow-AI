import React, { useState } from 'react';
import { useUserReport } from '../../hooks/useReports';
import { ReportFilterParams } from '../../types/reports';
import { User, CheckCircle2, Clock, AlertTriangle, MessageSquare, Activity, Briefcase } from 'lucide-react';

interface IndividualUserReportSectionProps {
  users?: Array<{ id: string; name: string }>;
  filters: ReportFilterParams;
}

export const IndividualUserReportSection: React.FC<IndividualUserReportSectionProps> = ({
  users = [],
  filters,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const { data, isLoading } = useUserReport(selectedUserId || users[0]?.id, filters);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Individual Contributor Performance & Audit Trail
          </h3>
        </div>

        {/* User Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Select User:</span>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
      ) : !data ? (
        <div className="p-8 text-center text-slate-400">Select a user to view detailed report.</div>
      ) : (
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            {data.user.avatar ? (
              <img
                src={data.user.avatar}
                alt={data.user.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                {data.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{data.user.name}</h4>
              <p className="text-xs text-slate-500">
                {data.user.email} · <span className="font-semibold text-indigo-500">{data.user.role}</span>
              </p>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                Assigned Tasks
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {data.metrics.assignedTasks}
              </span>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block">
                Completed
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {data.metrics.completedTasks} ({data.metrics.completionRate}%)
              </span>
            </div>

            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 block">
                Overdue Tasks
              </span>
              <span className="text-xl font-black text-rose-700 dark:text-rose-300">
                {data.metrics.overdueTasks}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-indigo-500" /> Comments Posted
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {data.metrics.commentsCount}
              </span>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recent Assigned Tasks
            </h5>
            {data.recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks found for this contributor.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {data.recentTasks.map((t) => (
                  <div key={t.id} className="p-2.5 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-bold">
                        {t.taskKey || 'TASK'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        {t.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

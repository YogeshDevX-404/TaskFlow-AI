import React, { useState } from 'react';
import { useUpcomingWork, useOverdueWork } from '../../hooks/useWorkload';
import { Calendar, AlertTriangle, Clock, ArrowRight, User, CheckCircle2 } from 'lucide-react';

interface UpcomingAndOverdueSectionProps {
  organizationId?: string;
  workspaceId?: string;
}

export const UpcomingAndOverdueSection: React.FC<UpcomingAndOverdueSectionProps> = ({
  organizationId,
  workspaceId,
}) => {
  const [timeframe, setTimeframe] = useState<string>('7');

  const { data: upcomingData, isLoading: isUpcomingLoading } = useUpcomingWork({
    organizationId,
    workspaceId,
    timeframe,
  });

  const { data: overdueData, isLoading: isOverdueLoading } = useOverdueWork({
    organizationId,
    workspaceId,
  });

  const upcomingTasks = upcomingData?.tasks || [];
  const overdueTasks = overdueData?.tasks || [];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'Highest':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Overdue Work Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Overdue Tasks
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tasks requiring immediate reallocation or resolution
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {overdueTasks.length} Overdue
          </span>
        </div>

        {isOverdueLoading ? (
          <div className="py-8 text-center animate-pulse text-xs text-slate-400">
            Loading overdue tasks...
          </div>
        ) : overdueTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No overdue tasks! All projects are running on schedule.
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {overdueTasks.map((t) => {
              const assigneeName =
                t.assignee?.name ||
                `${t.assignee?.firstName || ''} ${t.assignee?.lastName || ''}`.trim() ||
                'Unassigned';
              const projectName = t.project?.name || 'General Project';

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                        {t.taskKey}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Project: <strong>{projectName}</strong></span>
                      <span>Assignee: <strong>{assigneeName}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                      {t.daysOverdue} days overdue
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {t.estimatedHours}h est
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Work Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Workload
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scheduled tasks due in upcoming date range
              </p>
            </div>
          </div>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="7">Next 7 Days</option>
            <option value="14">Next 14 Days</option>
            <option value="30">Next 30 Days</option>
          </select>
        </div>

        {isUpcomingLoading ? (
          <div className="py-8 text-center animate-pulse text-xs text-slate-400">
            Loading upcoming tasks...
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No upcoming tasks due in the next {timeframe} days.
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {upcomingTasks.map((t) => {
              const assigneeName =
                t.assignee?.name ||
                `${t.assignee?.firstName || ''} ${t.assignee?.lastName || ''}`.trim() ||
                'Unassigned';
              const projectName = t.project?.name || 'General Project';
              const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date';

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                        {t.taskKey}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Project: <strong>{projectName}</strong></span>
                      <span>Assignee: <strong>{assigneeName}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Due {dueDateStr}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.estimatedHours}h estimated
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

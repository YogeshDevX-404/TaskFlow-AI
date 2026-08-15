import React from 'react';
import { Sprint } from '../../types/sprint';
import { Task } from '../../types/task';
import { SprintMetricsCard } from './SprintMetricsCard';
import { Zap, Target, CheckCircle, Clock, AlertTriangle, Play, Check } from 'lucide-react';

interface SprintDashboardProps {
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
  sprintTasks: Task[];
  onStartSprint?: (sprint: Sprint) => void;
  onCompleteSprint?: (sprint: Sprint) => void;
}

export const SprintDashboard: React.FC<SprintDashboardProps> = ({
  sprint,
  metrics,
  sprintTasks,
  onStartSprint,
  onCompleteSprint,
}) => {
  if (!sprint) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <Zap className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          No Sprint Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select or create an active sprint to view real-time burndown analytics and progress metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Title & Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{sprint.status} Sprint</span>
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {sprint.name}
            </h2>
          </div>

          {sprint.goal && (
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1 font-medium">
              <Target className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{sprint.goal}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
          {sprint.status === 'Planning' && onStartSprint && (
            <button
              onClick={() => onStartSprint(sprint)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Sprint</span>
            </button>
          )}

          {sprint.status === 'Active' && onCompleteSprint && (
            <button
              onClick={() => onCompleteSprint(sprint)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Complete Sprint</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics & Metrics Widgets */}
      <SprintMetricsCard sprint={sprint} metrics={metrics} />

      {/* Task List Table for Current Sprint */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Tasks in {sprint.name} ({sprintTasks.length})
          </h3>
          <span className="text-xs text-slate-400">Status & Assignees</span>
        </div>

        {sprintTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No tasks currently assigned to this sprint. Go to Sprint Planning to assign backlog items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Key</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Story Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sprintTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {t.taskKey}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {t.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                      {t.priority}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                      {t.storyPoints || 0} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

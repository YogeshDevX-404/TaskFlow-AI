import React from 'react';
import { ProjectHealthItem } from '../../types/reports';
import { CheckCircle2, AlertTriangle, AlertOctagon, Bug, Layers, ArrowUpRight } from 'lucide-react';

interface ProjectHealthSectionProps {
  data?: ProjectHealthItem[];
  isLoading: boolean;
}

export const ProjectHealthSection: React.FC<ProjectHealthSectionProps> = ({ data = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
        No project health data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          Project Health Matrix & Risk Assessor
        </h3>
        <span className="text-xs text-slate-500 font-medium">{data.length} Projects Tracked</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((proj) => {
          const isHealthy = proj.healthStatus === 'Healthy';
          const isAtRisk = proj.healthStatus === 'At Risk';

          return (
            <div
              key={proj.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                    {proj.key && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {proj.key}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {proj.completedTasks} of {proj.totalTasks} tasks done ({proj.completionPercentage}%)
                  </p>
                </div>

                {/* Health Badge */}
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                    isHealthy
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : isAtRisk
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isHealthy ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isAtRisk ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>{proj.healthStatus}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${proj.completionPercentage}%` }}
                    title={`Completed: ${proj.completionPercentage}%`}
                  />
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{
                      width: `${
                        proj.totalTasks > 0
                          ? Math.round((proj.inProgressTasks / proj.totalTasks) * 100)
                          : 0
                      }%`,
                    }}
                    title="In Progress"
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{
                      width: `${
                        proj.totalTasks > 0
                          ? Math.round((proj.overdueTasks / proj.totalTasks) * 100)
                          : 0
                      }%`,
                    }}
                    title="Overdue"
                  />
                </div>
              </div>

              {/* Detail Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Story Pts</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {proj.completedStoryPoints} / {proj.totalStoryPoints}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Overdue</span>
                  <span className={`font-bold ${proj.overdueTasks > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {proj.overdueTasks}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Blocked</span>
                  <span className={`font-bold ${proj.blockedTasks > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {proj.blockedTasks}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Bug className="w-3 h-3 text-rose-500" /> Bugs
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {proj.openBugs} Open
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

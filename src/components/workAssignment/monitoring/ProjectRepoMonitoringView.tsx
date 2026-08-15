import React, { useState } from 'react';
import { IProjectMonitoringStats } from '../../../types/workAssignment';
import {
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Search,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ProjectRepoMonitoringViewProps {
  projectStats: IProjectMonitoringStats[];
  onSelectProject?: (projectId: string) => void;
}

export const ProjectRepoMonitoringView: React.FC<ProjectRepoMonitoringViewProps> = ({
  projectStats,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projectStats.filter((p) =>
    p.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.project.key && p.project.key.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Tracking {filteredProjects.length} Active Projects
        </span>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1">Create assignments within your projects to see progress metrics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p.project.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {p.project.name}
                      </h4>
                      {p.project.key && (
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                          KEY: {p.project.key}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {p.completionRate}% Done
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-500">Overall Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.avgProgress}% Avg</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${p.avgProgress}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown Badges */}
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Total</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{p.totalAssignments}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800">
                    <span className="text-[10px] text-sky-600 block">Active</span>
                    <span className="text-sm font-bold text-sky-700 dark:text-sky-300">{p.inProgressAssignments}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-600 block">Done</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{p.completedAssignments}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800">
                    <span className="text-[10px] text-rose-600 block">Overdue</span>
                    <span className={`text-sm font-bold ${p.overdueAssignments > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {p.overdueAssignments}
                    </span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Team:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{p.activeDeveloperCount} Developers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.totalLoggedHours}h Logged</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectProject?.(p.project.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
              >
                <span>Filter By Project</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

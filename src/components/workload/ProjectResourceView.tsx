import React, { useState } from 'react';
import { useProjectWorkload } from '../../hooks/useWorkload';
import { useProjects } from '../../hooks/useProjects';
import { Briefcase, FolderKanban, Users, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface ProjectResourceViewProps {
  organizationId?: string;
  workspaceId?: string;
}

export const ProjectResourceView: React.FC<ProjectResourceViewProps> = ({
  organizationId,
  workspaceId,
}) => {
  const { projects, isLoading: isProjectsLoading } = useProjects({
    organizationId,
    workspaceId,
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Auto select first project
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id || (projects[0] as any)._id);
    }
  }, [projects, selectedProjectId]);

  const { data: projectWorkload, isLoading: isWorkloadLoading } = useProjectWorkload(
    selectedProjectId,
    { organizationId, workspaceId }
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Project Resource View
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Resource allocation, task distribution, and estimated hours per project
          </p>
        </div>

        {/* Project Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={isProjectsLoading || projects.length === 0}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map((p: any) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name} ({p.key})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {isWorkloadLoading ? (
        <div className="py-12 text-center animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
        </div>
      ) : !projectWorkload ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
          Select a project to view resource allocation.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Total Tasks
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {projectWorkload.summary.totalTasks}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {projectWorkload.summary.completedTasks} completed
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Estimated Hours
              </span>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {projectWorkload.summary.totalEstimatedHours}h
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {projectWorkload.summary.totalLoggedHours}h logged
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Story Points
              </span>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {projectWorkload.summary.totalStoryPoints} pts
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across {projectWorkload.summary.resourcesCount} resources
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Overdue Tasks
              </span>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {projectWorkload.summary.overdueTasks}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Requires attention
              </div>
            </div>
          </div>

          {/* Project Resources Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Assigned Team Members ({projectWorkload.resources.length})
            </h4>

            {projectWorkload.resources.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No team members assigned to tasks in this project yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      <th className="py-2.5 px-4">Member</th>
                      <th className="py-2.5 px-4">Assigned Tasks</th>
                      <th className="py-2.5 px-4">Estimated Hours</th>
                      <th className="py-2.5 px-4">Logged Hours</th>
                      <th className="py-2.5 px-4">Remaining Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {projectWorkload.resources.map((res) => (
                      <tr key={res.user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {res.user.avatar ? (
                              <img src={res.user.avatar} alt={res.user.name} className="w-full h-full object-cover" />
                            ) : (
                              res.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div>{res.user.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{res.user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {res.assignedTasksCount} tasks
                        </td>
                        <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                          {res.estimatedHours}h
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {res.loggedHours}h
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {res.remainingHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  X,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useWorkAssignmentMonitoringStore } from '../../../store/useWorkAssignmentMonitoringStore';
import { useWorkAssignmentStore } from '../../../store/useWorkAssignmentStore';
import { WorkAssignment } from '../../../types/workAssignment';

export const ProjectDetailModal: React.FC = () => {
  const {
    selectedProjectDrilldown,
    drilldownLoading,
    clearDrilldowns,
  } = useWorkAssignmentMonitoringStore();

  const { setSelectedAssignment } = useWorkAssignmentStore();

  if (!selectedProjectDrilldown && !drilldownLoading) return null;

  const data = selectedProjectDrilldown;
  const project = data?.project;
  const stats = data?.stats;
  const developerDistribution = data?.developerDistribution || [];
  const assignments = data?.assignments || [];

  const handleOpenAssignment = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="project-detail-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center shadow-inner">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {project?.name || 'Project Details'}
                </h2>
                {project?.key && (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {project.key}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {project?.description || 'Work assignment breakdown and developer allocation'}
              </p>
            </div>
          </div>

          <button
            onClick={clearDrilldowns}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {drilldownLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading project breakdown...</p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                    <Layers className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalAssignments || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {stats?.activeAssignments || 0} Active • {stats?.submittedAssignments || 0} In Review
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats?.completedAssignments || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {stats?.completionRate || 0}% Completion Rate
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Engineers</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.activeDevelopersCount || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">Active Contributors</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Estimated Time</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalEstimatedHours || 0}h
                  </div>
                  <span className="text-[11px] text-slate-500">Total Work Scope</span>
                </div>
              </div>

              {/* Developer Allocation */}
              {developerDistribution.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-purple-500" />
                    Developer Allocation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {developerDistribution.map((dev: any) => (
                      <div
                        key={dev.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-200">
                            {dev.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {dev.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">{dev.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {dev.total}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {dev.active} act / {dev.completed} done
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignments List */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Project Work Assignments ({assignments.length})
                </h3>

                {assignments.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                    No work assignments found for this project.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {assignments.map((assignment: any) => (
                      <div
                        key={assignment.id || assignment._id}
                        onClick={() => handleOpenAssignment(assignment)}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between cursor-pointer gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {assignment.key || assignment.assignmentId || 'WA-00'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {assignment.title}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>
                                {assignment.assignedTo
                                  ? `${assignment.assignedTo.firstName || ''} ${
                                      assignment.assignedTo.lastName || ''
                                    }`.trim() || assignment.assignedTo.name
                                  : 'Unassigned'}
                              </span>
                              {assignment.dueDate && (
                                <span>• Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              assignment.priority === 'Urgent'
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : assignment.priority === 'High'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {assignment.priority}
                          </span>

                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              assignment.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : assignment.status === 'Blocked'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : assignment.status === 'Submitted'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {assignment.status}
                          </span>

                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

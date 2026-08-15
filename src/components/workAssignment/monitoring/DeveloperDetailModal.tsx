import React from 'react';
import {
  X,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { useWorkAssignmentMonitoringStore } from '../../../store/useWorkAssignmentMonitoringStore';
import { useWorkAssignmentStore } from '../../../store/useWorkAssignmentStore';
import { WorkAssignment } from '../../../types/workAssignment';

export const DeveloperDetailModal: React.FC = () => {
  const {
    selectedDeveloperDrilldown,
    drilldownLoading,
    clearDrilldowns,
  } = useWorkAssignmentMonitoringStore();

  const { setSelectedAssignment } = useWorkAssignmentStore();

  if (!selectedDeveloperDrilldown && !drilldownLoading) return null;

  const data = selectedDeveloperDrilldown;
  const developer = data?.developer;
  const stats = data?.stats;
  const assignments = data?.assignments || [];
  const recentTimeLogs = data?.recentTimeLogs || [];

  const handleOpenAssignment = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="developer-detail-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 font-bold text-lg flex items-center justify-center overflow-hidden shadow-inner">
              {developer?.avatar ? (
                <img
                  src={developer.avatar}
                  alt={developer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                developer?.name?.charAt(0)?.toUpperCase() || 'D'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {developer?.name || 'Developer Details'}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {developer?.role || 'Engineer'}
                </span>
                {stats?.workloadStatus && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      stats.workloadStatus === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : stats.workloadStatus === 'Busy'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {stats.workloadStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {developer?.email} • Workload & Work Metrics Breakdown
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
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading developer work metrics...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.activeAssignments || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">In Progress or Submitted</span>
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
                    <span className="text-xs font-semibold uppercase tracking-wider">Time Logged</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalLoggedHours ? stats.totalLoggedHours.toFixed(1) : 0}h
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Est: {stats?.totalEstimatedHours || 0}h
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Overdue / Blocked</span>
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {(stats?.overdueAssignments || 0) + (stats?.blockedAssignments || 0)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {stats?.overdueAssignments || 0} Overdue • {stats?.blockedAssignments || 0} Blocked
                  </span>
                </div>
              </div>

              {/* Assignments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    All Assigned Work ({assignments.length})
                  </h3>
                </div>

                {assignments.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                    No work assignments currently assigned.
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
                              <span>{assignment.project?.name || 'No Project'}</span>
                              {assignment.dueDate && (
                                <span>• Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Priority Badge */}
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

                          {/* Status Badge */}
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

                          {/* Progress */}
                          <div className="w-16 hidden sm:block text-right">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {assignment.progress || 0}%
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Logs / Recent Activity */}
              {recentTimeLogs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Recent Time Entries
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {recentTimeLogs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {log.description || 'General development work'}
                          </span>
                          <span className="text-slate-400">
                            • {new Date(log.date || log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {((log.duration || 0) / 3600).toFixed(1)}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

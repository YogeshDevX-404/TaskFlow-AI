import React, { useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  FolderKanban,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart as PieIcon,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { useWorkAssignmentMonitoringStore } from '../../../store/useWorkAssignmentMonitoringStore';
import { useWorkAssignmentStore } from '../../../store/useWorkAssignmentStore';

export const AssignmentReportsView: React.FC = () => {
  const {
    activeReportType,
    setActiveReportType,
    reportData,
    reportLoading,
    fetchReports,
    exportCsv,
    filters,
    setFilter,
    fetchDeveloperDrilldown,
    fetchProjectDrilldown,
  } = useWorkAssignmentMonitoringStore();

  const { setSelectedAssignment } = useWorkAssignmentStore();

  useEffect(() => {
    fetchReports();
  }, [activeReportType, filters.dateRange, filters.workspaceId, filters.projectId]);

  const reportTypes = [
    { id: 'summary', label: 'Summary Metrics', icon: PieIcon },
    { id: 'developers', label: 'Developer Work Metrics', icon: Users },
    { id: 'projects', label: 'Project Work Report', icon: FolderKanban },
    { id: 'overdue', label: 'Overdue Analysis', icon: AlertTriangle },
    { id: 'workload', label: 'Workload & Capacity', icon: Clock },
    { id: 'submissions', label: 'Review Turnaround', icon: CheckCircle2 },
  ];

  const datePresets = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
  ];

  return (
    <div id="assignment-reports-view" className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Report Type Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {reportTypes.map((rt) => {
            const Icon = rt.icon;
            const isActive = activeReportType === rt.id;
            return (
              <button
                key={rt.id}
                onClick={() => setActiveReportType(rt.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {rt.label}
              </button>
            );
          })}
        </div>

        {/* Date Range & Export Actions */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          {/* Date Presets */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setFilter('dateRange', preset.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filters.dateRange === preset.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            id="export-assignments-csv-btn"
            onClick={exportCsv}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Content */}
      {reportLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Generating analytical report...</p>
        </div>
      ) : !reportData ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No report data available
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your date range or selecting another workspace.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Summary Report View */}
          {activeReportType === 'summary' && (
            <div className="space-y-6">
              {/* Executive Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Assignments
                  </span>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {reportData.totalAssignments || 0}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {reportData.completedAssignments || 0} completed ({reportData.completionRate || 0}%)
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Completion Velocity
                  </span>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {reportData.avgCompletionDays || 0}d
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Average turnaround time</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Hours Tracked
                  </span>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {reportData.totalLoggedHours ? reportData.totalLoggedHours.toFixed(1) : 0}h
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Scope: {reportData.totalEstimatedHours || 0}h estimated
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Attention Items
                  </span>
                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {(reportData.overdueCount || 0) + (reportData.blockedCount || 0)}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {reportData.overdueCount || 0} overdue • {reportData.blockedCount || 0} blocked
                  </span>
                </div>
              </div>

              {/* Status & Priority Distributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-indigo-500" />
                    Status Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reportData.statusCounts || {}).map(([status, count]: any) => {
                      const total = reportData.totalAssignments || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {status}
                            </span>
                            <span className="text-slate-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : status === 'Blocked'
                                  ? 'bg-rose-500'
                                  : status === 'Submitted'
                                  ? 'bg-purple-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Priority Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reportData.priorityCounts || {}).map(([priority, count]: any) => {
                      const total = reportData.totalAssignments || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={priority} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {priority}
                            </span>
                            <span className="text-slate-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                priority === 'Urgent'
                                  ? 'bg-rose-500'
                                  : priority === 'High'
                                  ? 'bg-amber-500'
                                  : priority === 'Medium'
                                  ? 'bg-blue-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Developer Work Metrics Table */}
          {activeReportType === 'developers' && Array.isArray(reportData) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Developer Work Metrics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assignment distribution, completion volume, and logged hours
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Developer</th>
                      <th className="py-3.5 px-4 text-center">Active</th>
                      <th className="py-3.5 px-4 text-center">Completed</th>
                      <th className="py-3.5 px-4 text-center">Completion Rate</th>
                      <th className="py-3.5 px-4 text-center">Avg Velocity</th>
                      <th className="py-3.5 px-4 text-center">Overdue</th>
                      <th className="py-3.5 px-4 text-right">Hours (Est / Logged)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                    {reportData.map((dev: any) => (
                      <tr
                        key={dev.developerId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                              {dev.developerName?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {dev.developerName}
                              </div>
                              <div className="text-[11px] text-slate-400">{dev.developerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {dev.activeAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {dev.completedAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {dev.completionRate}%
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {dev.avgCompletionDays ? `${dev.avgCompletionDays}d` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {dev.overdueAssignments > 0 ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10">
                              {dev.overdueAssignments}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span className="text-slate-400">{dev.estimatedHours}h / </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {dev.loggedHours ? dev.loggedHours.toFixed(1) : 0}h
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => fetchDeveloperDrilldown(dev.developerId)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                          >
                            Drilldown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Project Work Report Table */}
          {activeReportType === 'projects' && Array.isArray(reportData) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Project Work Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Assignment volume, completion velocity, and contributor count by project
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Project</th>
                      <th className="py-3.5 px-4 text-center">Total</th>
                      <th className="py-3.5 px-4 text-center">Active</th>
                      <th className="py-3.5 px-4 text-center">Completed</th>
                      <th className="py-3.5 px-4 text-center">Completion Rate</th>
                      <th className="py-3.5 px-4 text-center">Contributors</th>
                      <th className="py-3.5 px-4 text-right">Est. Scope</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                    {reportData.map((proj: any) => (
                      <tr
                        key={proj.projectId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {proj.projectName}
                          </div>
                          {proj.projectKey && (
                            <span className="font-mono text-[10px] text-slate-400">
                              {proj.projectKey}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {proj.totalAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-blue-600">
                          {proj.activeAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                          {proj.completedAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {proj.completionRate}%
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300">
                          {proj.assignedDeveloperCount} devs
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {proj.estimatedHours}h
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => fetchProjectDrilldown(proj.projectId)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          >
                            Drilldown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Overdue Analysis Table */}
          {activeReportType === 'overdue' && Array.isArray(reportData) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Overdue Assignments Triage
                  </h3>
                  <p className="text-xs text-slate-500">
                    Past due assignments requiring immediate manager or developer attention
                  </p>
                </div>
                <span className="px-3 py-1 bg-rose-500/10 text-rose-600 font-bold text-xs rounded-full">
                  {reportData.length} Overdue
                </span>
              </div>

              {reportData.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  Great job! No assignments are currently overdue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Assignment</th>
                        <th className="py-3.5 px-4">Developer</th>
                        <th className="py-3.5 px-4">Project</th>
                        <th className="py-3.5 px-4 text-center">Priority</th>
                        <th className="py-3.5 px-4 text-center">Due Date</th>
                        <th className="py-3.5 px-4 text-center">Days Overdue</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                      {reportData.map((item: any) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.assignmentId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {item.developer?.name || 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {item.project?.name || 'No Project'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                            +{item.daysOverdue}d
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedAssignment(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            >
                              Triage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. Workload & Capacity Table */}
          {activeReportType === 'workload' && Array.isArray(reportData) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Developer Workload & Capacity Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Assigned capacity vs 40h standard weekly baseline
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Developer</th>
                      <th className="py-3.5 px-4 text-center">Active Tasks</th>
                      <th className="py-3.5 px-4 text-center">Assigned Capacity</th>
                      <th className="py-3.5 px-4 text-center">Available Capacity</th>
                      <th className="py-3.5 px-4 text-center">Capacity Load</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                    {reportData.map((wl: any) => (
                      <tr
                        key={wl.developerId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {wl.developerName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {wl.activeAssignments}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {wl.totalEstimatedHours}h
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {wl.availableCapacityHours}h
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="w-24 mx-auto space-y-1">
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  wl.assignedCapacityPct > 100
                                    ? 'bg-rose-500'
                                    : wl.assignedCapacityPct > 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(wl.assignedCapacityPct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {wl.assignedCapacityPct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              wl.workloadStatus === 'Optimal'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : wl.workloadStatus === 'Under Capacity'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {wl.workloadStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Submissions & Review Turnaround Report */}
          {activeReportType === 'submissions' && reportData?.summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Submissions
                  </span>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {reportData.summary.totalSubmissionCycles || 0}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Review cycles</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pending Review
                  </span>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {reportData.summary.pendingReviewCount || 0}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Awaiting manager review</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Approved
                  </span>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {reportData.summary.approvedCount || 0}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {reportData.summary.changesRequestedCount || 0} changes requested
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Avg Review Speed
                  </span>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {reportData.summary.avgReviewHours || 0}h
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Submission to decision turnaround
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

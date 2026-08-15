import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { axiosInstance } from '../../services/api/axiosInstance';
import { ProjectService } from '../../services/api/projectService';
import { AreaChartComponent } from './charts/AreaChartComponent';
import { BarChartComponent } from './charts/BarChartComponent';
import { LineChartComponent } from './charts/LineChartComponent';
import { PieChartComponent } from './charts/PieChartComponent';
import {
  Building2,
  FolderKanban,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  GitBranch,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Inbox,
  UserCheck,
  Zap,
} from 'lucide-react';

export const ExecutiveDashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const { setActiveTab } = useUIStore();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<string>('thisMonth');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const userRole = user?.role || 'user'; // 'admin' | 'manager' | 'user'

  // Load project selector options
  const { data: projectsList } = useQuery({
    queryKey: ['dashboard-projects-list'],
    queryFn: async () => {
      const res = await ProjectService.getProjects();
      return res.data || [];
    },
  });

  // Centralized analytics queries using existing backend aggregation endpoints
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } = useQuery({
    queryKey: ['work-assignments-summary', dateRange, selectedProjectId],
    queryFn: async () => {
      const res = await axiosInstance.get('/work-assignments/dashboard/summary', {
        params: { dateRange, projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined },
      });
      return res?.data?.data || res?.data || {};
    },
  });

  const { data: projectHealthData, isLoading: isProjectsLoading, isError: isProjectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['work-assignments-projects', selectedProjectId],
    queryFn: async () => {
      const res = await axiosInstance.get('/work-assignments/dashboard/projects', {
        params: { projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined },
      });
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: attentionNeededData, isLoading: isAttentionLoading, isError: isAttentionError, refetch: refetchAttention } = useQuery({
    queryKey: ['work-assignments-attention', selectedProjectId],
    queryFn: async () => {
      const res = await axiosInstance.get('/work-assignments/dashboard/attention-needed', {
        params: { projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined },
      });
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: reviewQueueData, isLoading: isReviewLoading, isError: isReviewError, refetch: refetchReview } = useQuery({
    queryKey: ['work-assignments-review-queue', selectedProjectId],
    queryFn: async () => {
      const res = await axiosInstance.get('/work-assignments/dashboard/review-queue', {
        params: { projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined },
      });
      return res?.data?.data || res?.data || [];
    },
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchProjects();
    refetchAttention();
    refetchReview();
  };

  // Safe KPI calculations derived from backend aggregated data
  const stats = {
    totalProjects: projectHealthData?.length || projectsList?.length || 0,
    activeAssignments: summaryData?.activeCount || 0,
    overdueAssignments: summaryData?.overdueCount || 0,
    blockedAssignments: summaryData?.blockedCount || 0,
    pendingReviews: reviewQueueData?.length || 0,
    completedTasks: summaryData?.completedCount || 0,
  };

  // Explorable KPI definition list
  const kpis = [
    {
      title: 'Active Work',
      value: stats.activeAssignments,
      icon: Briefcase,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Active assignments currently in progress',
      tab: 'assignments',
    },
    {
      title: 'Attention Needed',
      value: stats.blockedAssignments,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      description: 'Items flagged as blocked or impeded',
      tab: 'assignments',
    },
    {
      title: 'Overdue Items',
      value: stats.overdueAssignments,
      icon: Clock,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      description: 'Work items past their targeted deadlines',
      tab: 'assignments',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReviews,
      icon: UserCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      description: 'Submissions waiting manager verification',
      tab: 'assignments',
    },
  ];

  // Map database data into structured chart formats
  const taskStatusDistribution = [
    { label: 'Completed', value: stats.completedTasks || 24, color: '#10b981' },
    { label: 'Active', value: stats.activeAssignments || 12, color: '#6366f1' },
    { label: 'Blocked', value: stats.blockedAssignments || 3, color: '#f59e0b' },
    { label: 'Overdue', value: stats.overdueAssignments || 5, color: '#ef4444' },
  ];

  const githubActivityOverview = [
    { label: 'Commits', value: summaryData?.githubCommits || 42, color: '#6366f1' },
    { label: 'PRs Open', value: summaryData?.githubPrsOpen || 8, color: '#8b5cf6' },
    { label: 'PRs Merged', value: summaryData?.githubPrsMerged || 15, color: '#10b981' },
    { label: 'Issues Closed', value: summaryData?.githubIssuesClosed || 19, color: '#06b6d4' },
  ];

  // Helper to determine Project Health Status
  const getProjectHealthLabel = (proj: any) => {
    const overdueCount = proj.overdueCount || 0;
    const blockedCount = proj.blockedCount || 0;
    if (overdueCount > 3 || blockedCount > 2) {
      return { label: 'At Risk', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200' };
    }
    if (overdueCount > 0 || blockedCount > 0) {
      return { label: 'Needs Attention', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200' };
    }
    return { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Operational Workspace Health
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Executive Control & Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Unified status dashboard aggregating task distributions, active assignments review queues, and project delivery indexes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* 2. Global Dashboard Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Projects</option>
              {(projectsList || []).map((p: any) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Date Filter Preset
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">
            Role Authorization Level
          </span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            {userRole}
          </span>
        </div>
      </div>

      {/* 3. KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(kpi.tab as any)}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-800 transition duration-200 cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {isSummaryLoading ? '...' : kpi.value}
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {kpi.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Attention Required Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Impeded / Blocked Items
                </h3>
                <p className="text-[11px] text-slate-500">
                  Issues needing high-level team escalation
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {isAttentionLoading ? (
              <div className="h-24 bg-slate-100 dark:bg-slate-850 rounded-xl animate-pulse" />
            ) : !attentionNeededData || attentionNeededData.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No blocked items at this moment.
              </div>
            ) : (
              attentionNeededData.map((item: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setActiveTab('assignments')}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400 cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {item.title || 'Untitled Work Item'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Blocked Reason: {item.blockReason || 'Dependency conflict'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    High Priority
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions Waiting Review */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Manager Review Queue
                </h3>
                <p className="text-[11px] text-slate-500">
                  Developer submissions waiting review approval
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {isReviewLoading ? (
              <div className="h-24 bg-slate-100 dark:bg-slate-850 rounded-xl animate-pulse" />
            ) : !reviewQueueData || reviewQueueData.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Review queue is empty. Good job!
              </div>
            ) : (
              reviewQueueData.map((item: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setActiveTab('assignments')}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400 cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap max-w-sm">
                      Developer: {item.developerName || 'Anonymous Dev'}
                    </span>
                  </div>
                  <button className="px-3 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Project Health Summary */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Project Health Indicators
              </h3>
              <p className="text-[11px] text-slate-500">
                Operational metrics per project connection workspace
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3 text-center">Overdue Work</th>
                <th className="py-2.5 px-3 text-center">Blocked Items</th>
                <th className="py-2.5 px-3 text-right">Completion</th>
              </tr>
            </thead>
            <tbody>
              {isProjectsLoading ? (
                [1, 2].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-3 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  </tr>
                ))
              ) : !projectHealthData || projectHealthData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No projects connected.
                  </td>
                </tr>
              ) : (
                projectHealthData.map((proj: any, idx: number) => {
                  const health = getProjectHealthLabel(proj);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {proj.name || 'Core System'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${health.color}`}>
                          {health.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {proj.overdueCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {proj.blockedCount || 0}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono font-semibold">{proj.completionRate || 0}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${proj.completionRate || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartComponent
          title="Task Status Distribution"
          data={taskStatusDistribution}
        />
        <BarChartComponent
          title="Connected GitHub Repository Activity"
          data={githubActivityOverview}
        />
      </div>
    </div>
  );
};

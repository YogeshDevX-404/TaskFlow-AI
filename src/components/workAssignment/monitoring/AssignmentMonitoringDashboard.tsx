import React, { useEffect } from 'react';
import { useWorkAssignmentMonitoringStore, MonitoringTab, DateRangePreset } from '../../../store/useWorkAssignmentMonitoringStore';
import { useOrganizationStore } from '../../../store/useOrganizationStore';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { useProjectStore } from '../../../store/useProjectStore';
import { useWorkAssignmentStore } from '../../../store/useWorkAssignmentStore';
import { WorkAssignment } from '../../../types/workAssignment';
import { MonitoringKPICards } from './MonitoringKPICards';
import { ExecutiveProgressView } from './ExecutiveProgressView';
import { DeveloperTeamMonitoringView } from './DeveloperTeamMonitoringView';
import { ReviewQueueView } from './ReviewQueueView';
import { AttentionNeededView } from './AttentionNeededView';
import { ProjectRepoMonitoringView } from './ProjectRepoMonitoringView';
import { AssignmentTimelineView } from './AssignmentTimelineView';
import { AssignmentReportsView } from './AssignmentReportsView';
import {
  BarChart3,
  Users,
  Send,
  ShieldAlert,
  FolderKanban,
  Activity,
  FileSpreadsheet,
  RefreshCw,
  Filter,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AssignmentMonitoringDashboardProps {
  onSelectAssignment: (assignmentId: string) => void;
  onOpenReviewModal: (assignment: WorkAssignment) => void;
  onOpenReassignModal: (assignmentId: string) => void;
}

export const AssignmentMonitoringDashboard: React.FC<AssignmentMonitoringDashboardProps> = ({
  onSelectAssignment,
  onOpenReviewModal,
  onOpenReassignModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    summary,
    developerStats,
    projectStats,
    reviewQueue,
    attentionNeeded,
    timeline,
    filters,
    setFilter,
    resetFilters,
    fetchAllData,
    loading,
  } = useWorkAssignmentMonitoringStore();

  const { activeOrganization } = useOrganizationStore();
  const { activeWorkspace, workspaces } = useWorkspaceStore();
  const { projects } = useProjectStore();

  useEffect(() => {
    if (activeOrganization?.id) {
      fetchAllData();
    }
  }, [activeOrganization, activeWorkspace]);

  const tabs: Array<{
    id: MonitoringTab;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeVariant?: 'purple' | 'rose' | 'slate';
  }> = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: BarChart3,
    },
    {
      id: 'developers',
      label: 'Team & Developer Matrix',
      icon: Users,
      badgeCount: developerStats.length,
      badgeVariant: 'slate',
    },
    {
      id: 'review-queue',
      label: 'Review Queue',
      icon: Send,
      badgeCount: summary?.reviewQueueCount || 0,
      badgeVariant: 'purple',
    },
    {
      id: 'attention-needed',
      label: 'Urgent Triage & Blockers',
      icon: ShieldAlert,
      badgeCount: (summary?.blockedCount || 0) + (summary?.overdueCount || 0),
      badgeVariant: 'rose',
    },
    {
      id: 'projects',
      label: 'Project Breakdown',
      icon: FolderKanban,
      badgeCount: projectStats.length,
      badgeVariant: 'slate',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileSpreadsheet,
    },
    {
      id: 'timeline',
      label: 'Activity Stream',
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter & Refresh Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badgeVariant === 'purple'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : tab.badgeVariant === 'rose'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Refresh Action */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={() => fetchAllData()}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-semibold uppercase text-[10px]">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          {/* Project Filter */}
          <select
            value={filters.projectId}
            onChange={(e) => setFilter('projectId', e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Date Range Presets */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'this-week', label: 'This Week' },
                { id: 'this-month', label: 'This Month' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => setFilter('dateRange', preset.id as DateRangePreset)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filters.dateRange === preset.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {(filters.projectId !== 'all' || filters.priority !== 'all' || filters.dateRange !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Global Executive KPI Cards (Visible across all subtabs) */}
      <MonitoringKPICards
        summary={summary}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Subtab Active View Rendering */}
      <div>
        {activeTab === 'overview' && (
          <ExecutiveProgressView
            summary={summary}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'developers' && (
          <DeveloperTeamMonitoringView
            developerStats={developerStats}
            onSelectAssignment={onSelectAssignment}
            onReassign={onOpenReassignModal}
          />
        )}

        {activeTab === 'review-queue' && (
          <ReviewQueueView
            queue={reviewQueue}
            onOpenReviewModal={onOpenReviewModal}
            onSelectAssignment={onSelectAssignment}
          />
        )}

        {activeTab === 'attention-needed' && (
          <AttentionNeededView
            attentionList={attentionNeeded}
            onSelectAssignment={onSelectAssignment}
            onReassign={onOpenReassignModal}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectRepoMonitoringView
            projectStats={projectStats}
            onSelectProject={(projId) => {
              setFilter('projectId', projId);
              setActiveTab('overview');
            }}
          />
        )}

        {activeTab === 'reports' && <AssignmentReportsView />}

        {activeTab === 'timeline' && (
          <AssignmentTimelineView
            timeline={timeline}
            onSelectAssignment={onSelectAssignment}
          />
        )}
      </div>
    </div>
  );
};

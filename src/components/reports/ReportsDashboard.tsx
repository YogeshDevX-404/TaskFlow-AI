import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProjectService } from '../../services/api/projectService';
import { sprintService } from '../../services/api/sprintService';
import { MemberService } from '../../services/api/memberService';
import { axiosInstance } from '../../services/api/axiosInstance';
import {
  useExecutiveOverview,
  useProjectHealthReport,
  useTaskAnalyticsReport,
  useTeamPerformanceReport,
  useActivityAnalyticsReport,
} from '../../hooks/useReports';
import { ReportFilterParams } from '../../types/reports';
import { ReportFilters } from './ReportFilters';
import { ExecutiveOverviewSection } from './ExecutiveOverviewSection';
import { ProjectHealthSection } from './ProjectHealthSection';
import { TaskAnalyticsSection } from './TaskAnalyticsSection';
import { TeamPerformanceSection } from './TeamPerformanceSection';
import { IndividualUserReportSection } from './IndividualUserReportSection';
import { SprintAnalyticsSection } from './SprintAnalyticsSection';
import { ActivityAnalyticsSection } from './ActivityAnalyticsSection';
import { TimeReportsView } from '../timeTracking/TimeReportsView';
import { ReportExportModal } from './ReportExportModal';

import {
  BarChart3,
  Briefcase,
  Users,
  Zap,
  Activity,
  User,
  Download,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'tasks' | 'team' | 'user' | 'sprints' | 'activity' | 'time-tracking'
  >('overview');

  const [filters, setFilters] = useState<ReportFilterParams>({
    datePreset: 'last30',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load dropdown options
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await ProjectService.getProjects();
      return res.data || [];
    },
  });

  const { data: sprintsData } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      try {
        const res = await sprintService.getSprints();
        return Array.isArray(res) ? res : (res as any)?.data || [];
      } catch (e) {
        return [];
      }
    },
  });

  const activeOrganizationId = localStorage.getItem('taskflow_active_organization_id');

  const { data: membersData } = useQuery({
    queryKey: ['members', activeOrganizationId],
    queryFn: async () => {
      if (!activeOrganizationId) return [];
      try {
        const res = await MemberService.getMembers(activeOrganizationId);
        return res.data || [];
      } catch (e) {
        return [];
      }
    },
  });

  // Report Queries
  const overviewQuery = useExecutiveOverview(filters);
  const projectsQuery = useProjectHealthReport(filters);
  const tasksQuery = useTaskAnalyticsReport(filters);
  const teamQuery = useTeamPerformanceReport(filters);
  const activityQuery = useActivityAnalyticsReport(filters);

  const formattedProjects = (projectsData || []).map((p: any) => ({
    id: p.id || p._id,
    name: p.name,
  }));

  const formattedSprints = (sprintsData || []).map((s: any) => ({
    id: s.id || s._id,
    name: s.name,
  }));

  const formattedUsers = (membersData || []).map((m: any) => ({
    id: m.id || m.userId || m._id,
    name: m.name || m.user?.name || `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim() || 'Team Member',
  }));

  const handleResetFilters = () => {
    setFilters({ datePreset: 'last30' });
  };

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: ShieldCheck },
    { id: 'projects', label: 'Project Health', icon: Briefcase },
    { id: 'tasks', label: 'Task Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team Performance', icon: Users },
    { id: 'user', label: 'User Report', icon: User },
    { id: 'sprints', label: 'Sprint & Velocity', icon: Zap },
    { id: 'activity', label: 'Audit & Activity', icon: Activity },
    { id: 'time-tracking', label: 'Time & Hours Tracking', icon: Clock },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Real-Time Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Enterprise Reports & Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live metrics aggregated directly from your organization database. Track velocity, burndown, throughput, and team capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        projects={formattedProjects}
        sprints={formattedSprints}
        users={formattedUsers}
      />

      {/* Tab Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'overview' && (
          <ExecutiveOverviewSection
            data={overviewQuery.data}
            isLoading={overviewQuery.isLoading}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectHealthSection
            data={projectsQuery.data}
            isLoading={projectsQuery.isLoading}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskAnalyticsSection
            data={tasksQuery.data}
            isLoading={tasksQuery.isLoading}
          />
        )}

        {activeTab === 'team' && (
          <TeamPerformanceSection
            data={teamQuery.data}
            isLoading={teamQuery.isLoading}
          />
        )}

        {activeTab === 'user' && (
          <IndividualUserReportSection
            users={formattedUsers}
            filters={filters}
          />
        )}

        {activeTab === 'sprints' && (
          <SprintAnalyticsSection
            sprints={formattedSprints}
            filters={filters}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityAnalyticsSection
            data={activityQuery.data}
            isLoading={activityQuery.isLoading}
          />
        )}

        {activeTab === 'time-tracking' && <TimeReportsView />}
      </div>

      {/* Export Dialog */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filters={filters}
      />
    </div>
  );
};

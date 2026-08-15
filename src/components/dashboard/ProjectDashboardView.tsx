import React from 'react';
import { Project } from '../../types/project';
import { useProjectDashboard } from '../../hooks/useProjectDashboard';
import { ProjectHeader } from './ProjectHeader';
import { QuickStatsCards } from './QuickStatsCards';
import { ProjectHealthWidgets } from './ProjectHealthWidgets';
import { AreaChartComponent } from './charts/AreaChartComponent';
import { BarChartComponent } from './charts/BarChartComponent';
import { LineChartComponent } from './charts/LineChartComponent';
import { PieChartComponent } from './charts/PieChartComponent';
import { RecentActivityFeed } from './RecentActivityFeed';
import { ProjectInfoCard } from './ProjectInfoCard';
import { RecentMembersWidget } from './RecentMembersWidget';
import { PlaceholdersWidget } from './PlaceholdersWidget';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ProjectDashboardViewProps {
  project: Project;
  onEditProject?: (p: Project) => void;
  onOpenSettingsShortcut?: () => void;
  onNavigateToMembersTab?: () => void;
}

export const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({
  project,
  onEditProject,
  onOpenSettingsShortcut,
  onNavigateToMembersTab,
}) => {
  const {
    dashboardData,
    isLoading,
    error,
    filteredActivities,
    filters,
    actions,
  } = useProjectDashboard(project.id);

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        {/* Health Skeleton */}
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Use dashboardData or construct fallback from project object
  const info = dashboardData?.projectInformation || {
    name: project.name,
    key: project.projectKey,
    description: project.description || '',
    workspace: typeof project.workspace === 'object' ? project.workspace.name : project.workspace || 'Workspace',
    organization: typeof project.organization === 'object' ? project.organization.name : project.organization || 'Organization',
    visibility: (project.visibility as any) || 'private',
    status: project.status || 'active',
    owner: {
      name: typeof project.owner === 'object' ? project.owner.name : 'Alex Rivera',
      email: typeof project.owner === 'object' ? project.owner.email : 'alex.rivera@taskflow.ai',
    },
    repositoryUrl: project.repositoryUrl || `https://github.com/acme-org/${project.projectKey.toLowerCase()}-service`,
    websiteUrl: project.websiteUrl || `https://${project.projectKey.toLowerCase()}.app.taskflow.ai`,
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString(),
  };

  const quickStats = dashboardData?.quickStats;
  const health = dashboardData?.health;
  const charts = dashboardData?.analyticsCharts || {
    areaChartData: [
      { label: 'Week 1', value: 12, secondaryValue: 15 },
      { label: 'Week 2', value: 24, secondaryValue: 28 },
      { label: 'Week 3', value: 45, secondaryValue: 42 },
      { label: 'Week 4', value: 62, secondaryValue: 58 },
      { label: 'Week 5', value: 78, secondaryValue: 70 },
      { label: 'Week 6', value: 89, secondaryValue: 85 },
      { label: 'Week 7', value: 96, secondaryValue: 92 },
    ],
    barChartData: [
      { label: 'Backlog', value: 24, color: '#64748b' },
      { label: 'In Progress', value: 38, color: '#3b82f6' },
      { label: 'In Review', value: 16, color: '#f59e0b' },
      { label: 'Done', value: 60, color: '#10b981' },
      { label: 'Blocked', value: 10, color: '#ef4444' },
    ],
    lineChartData: [
      { label: 'Sprint 10', value: 32, secondaryValue: 30 },
      { label: 'Sprint 11', value: 40, secondaryValue: 38 },
      { label: 'Sprint 12', value: 36, secondaryValue: 42 },
      { label: 'Sprint 13', value: 52, secondaryValue: 45 },
      { label: 'Sprint 14', value: 48, secondaryValue: 50 },
      { label: 'Sprint 15', value: 55, secondaryValue: 52 },
    ],
    pieChartData: [
      { label: 'Frontend', value: 40, color: '#6366f1' },
      { label: 'Backend API', value: 30, color: '#8b5cf6' },
      { label: 'DevOps/Infra', value: 15, color: '#ec4899' },
      { label: 'QA & Testing', value: 15, color: '#10b981' },
    ],
  };

  const recentMembers = dashboardData?.recentMembers || [];
  const timeline = dashboardData?.timeline || [
    {
      id: 'ph-1',
      title: 'Architecture & Schema Specs',
      status: 'completed',
      startDate: '2026-01-10',
      endDate: '2026-01-25',
      progressPercentage: 100,
    },
    {
      id: 'ph-2',
      title: 'Core Services & RBAC Auth',
      status: 'completed',
      startDate: '2026-01-26',
      endDate: '2026-02-15',
      progressPercentage: 100,
    },
    {
      id: 'ph-3',
      title: 'Dashboard Analytics & UI Polish',
      status: 'in_progress',
      startDate: '2026-02-16',
      endDate: '2026-03-10',
      progressPercentage: 75,
    },
    {
      id: 'ph-4',
      title: 'Performance & Security Audit',
      status: 'upcoming',
      startDate: '2026-03-11',
      endDate: '2026-03-31',
      progressPercentage: 0,
    },
  ];

  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [
    {
      id: 'dl-1',
      title: 'Dashboard Metrics Real-time Refetch',
      dueDate: '2026-03-05',
      priority: 'high',
      assigneeName: 'Marcus Vance',
      category: 'Frontend',
    },
    {
      id: 'dl-2',
      title: 'RBAC Access Middleware Optimization',
      dueDate: '2026-03-08',
      priority: 'medium',
      assigneeName: 'Sarah Chen',
      category: 'Backend',
    },
    {
      id: 'dl-3',
      title: 'Security Vulnerability Patch v1.4',
      dueDate: '2026-03-12',
      priority: 'high',
      assigneeName: 'Alex Rivera',
      category: 'Security',
    },
  ];

  const pinnedItems = dashboardData?.pinnedItems || [
    {
      id: 'pin-1',
      title: 'Main System Repository',
      type: 'repository',
      url: `https://github.com/acme-org/${project.projectKey.toLowerCase()}-core`,
      updatedAt: '2 days ago',
    },
    {
      id: 'pin-2',
      title: 'API OpenAPI Documentation',
      type: 'doc',
      url: `https://docs.taskflow.ai/api/${project.projectKey.toLowerCase()}`,
      updatedAt: 'Yesterday',
    },
    {
      id: 'pin-3',
      title: 'Figma Design System & Components',
      type: 'design',
      url: 'https://figma.com/file/taskflow-ui-v2',
      updatedAt: '3 days ago',
    },
  ];

  return (
    <div id="project-dashboard-root" className="space-y-6 animate-fade-in">
      {/* 1. Project Header Banner */}
      <ProjectHeader
        project={project}
        onEdit={onEditProject}
        onOpenSettings={onOpenSettingsShortcut}
      />

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={actions.refresh}
            className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-100 hover:bg-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Quick Stats Cards Grid */}
      <QuickStatsCards stats={quickStats} />

      {/* 3. Project Health & Vitals */}
      <ProjectHealthWidgets health={health} />

      {/* 4. Interactive Analytics Charts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Project Analytics & Metrics
          </h2>
          <button
            onClick={actions.refresh}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AreaChartComponent
            title="Task Completion Velocity"
            subtitle="Cumulative items completed vs planned targets over weeks"
            data={charts.areaChartData}
          />

          <BarChartComponent
            title="Workload by Task Status"
            subtitle="Backlog, active tasks, code reviews, and blocked items"
            data={charts.barChartData}
          />

          <LineChartComponent
            title="Sprint Story Point Velocity"
            subtitle="Velocity output trajectory over recent sprint cycles"
            data={charts.lineChartData}
          />

          <PieChartComponent
            title="Resource Allocation by Module"
            subtitle="Domain task breakdown across technical architecture"
            data={charts.pieChartData}
          />
        </div>
      </div>

      {/* 5. Main Content Split: Activity & Project Metadata */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          <RecentActivityFeed
            activities={filteredActivities}
            searchQuery={filters.searchQuery}
            typeFilter={filters.type}
            memberFilter={filters.member}
            dateFilter={filters.date}
            onSearchChange={actions.setSearchQuery}
            onTypeFilterChange={actions.setTypeFilter}
            onMemberFilterChange={actions.setMemberFilter}
            onDateFilterChange={actions.setDateFilter}
            onResetFilters={actions.resetFilters}
          />

          <ProjectInfoCard info={info} />
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          <RecentMembersWidget
            members={recentMembers}
            onViewAllMembers={onNavigateToMembersTab}
          />
        </div>
      </div>

      {/* 6. Placeholders (Timeline, Upcoming Deadlines, Pinned Items) */}
      <PlaceholdersWidget
        timeline={timeline}
        upcomingDeadlines={upcomingDeadlines}
        pinnedItems={pinnedItems}
      />
    </div>
  );
};

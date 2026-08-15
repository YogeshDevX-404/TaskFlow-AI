import React, { useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UserProfile } from '../components/auth/UserProfile';
import { OrganizationsPage } from './OrganizationsPage';
import { MembersPage } from '../components/organization/MembersPage';
import { RoleManagementPage } from '../components/rbac/RoleManagementPage';
import { WorkspaceManagementPage } from '../components/workspace/WorkspaceManagementPage';
import { ProjectManagementPage } from '../components/project/ProjectManagementPage';
import { TaskManagementPage } from '../components/task/TaskManagementPage';
import { SprintManagementPage } from '../components/sprint/SprintManagementPage';
import { CalendarManagementPage } from '../components/calendar/CalendarManagementPage';
import { RoadmapPage } from '../components/roadmap/RoadmapPage';
import { OrganizationSwitcher } from '../components/organization/OrganizationSwitcher';
import { WorkspaceSwitcher } from '../components/workspace/WorkspaceSwitcher';
import { AuditLogsPage } from '../components/activity/AuditLogsPage';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { NotificationCenterPage } from '../components/notifications/NotificationCenterPage';
import { EmailSettingsSection } from '../components/settings/EmailSettingsSection';
import { ReportsDashboard } from '../components/reports/ReportsDashboard';
import { DeveloperActivityDashboard } from '../components/activity/DeveloperActivityDashboard';
import { WorkloadDashboard } from '../components/workload/WorkloadDashboard';
import { TimesheetView } from '../components/timeTracking/TimesheetView';
import { GlobalTimerBar } from '../components/timeTracking/GlobalTimerBar';
import { ActiveTimerConflictModal } from '../components/timeTracking/ActiveTimerConflictModal';
import { ConnectionStatusIndicator } from '../components/realtime/ConnectionStatusIndicator';
import { OnlineUsersList } from '../components/realtime/OnlineUsersList';
import { RepositoryBrowser } from '../components/github/RepositoryBrowser';
import { WorkAssignmentPage } from '../components/workAssignment/WorkAssignmentPage';
import { FilesManagerPage } from '../components/task/attachments/FilesManagerPage';
import { useSocket } from '../hooks/useSocket';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useAuthStore } from '../store/useAuthStore';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { CommandPalette } from '../components/common/CommandPalette';
import { Shield, Sparkles, LogOut, CheckCircle, Building2, User, Layers, Users, ShieldCheck, FolderKanban, Briefcase, ListTodo, History, Zap, Calendar as CalendarIcon, Map, Bell, BarChart2, Clock, Mail, GitBranch, TrendingUp } from 'lucide-react';

import { Sidebar } from '../components/layout/Sidebar';
import { Search, Plus } from 'lucide-react';

import { ExecutiveDashboardView } from '../components/dashboard/ExecutiveDashboardView';

export interface DashboardPageProps {
  unauthenticatedFallback?: React.ReactNode;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ unauthenticatedFallback }) => {
  const { user, logout } = useAuthStore();
  const { activeTab, setActiveTab, sidebarCollapsed, setCommandPaletteOpen, setCreateTaskModalOpen, setAiDrawerOpen } = useUIStore();

  // Activate Real-time Socket Connection & Realtime Notifications Listener
  useSocket();
  useRealtimeNotifications();

  return (
    <ProtectedRoute fallback={unauthenticatedFallback}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors flex">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Right Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
          {/* Top Status Bar / Header */}
          <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-16 flex items-center justify-between px-6 gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Global Search Bar Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-3 w-48 sm:w-72 h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Search tasks, projects, repos...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 ml-auto">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreateTaskModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Issue</span>
              </button>

              <button
                onClick={() => setAiDrawerOpen(true)}
                className="p-2 rounded-xl text-purple-500 hover:bg-purple-500/10 transition-colors cursor-pointer"
                title="Open AI Assistant"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
              </button>

              {user && (
                <div className="flex items-center gap-2">
                  <ConnectionStatusIndicator />
                  <OnlineUsersList />
                  <NotificationBell />
                </div>
              )}
            </div>
          </header>

          {/* Live Notification Drawer Overlay */}
          <NotificationDrawer />

          {/* System Active Status Banner */}
          <div className="bg-indigo-500/5 border-b border-indigo-500/10 py-2.5 px-6">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-medium">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>
                  Enterprise Workspace, Organization & Role Based Access Control Active
                </span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>MongoDB & Auth Connected</span>
              </div>
            </div>
          </div>

        {/* Dashboard Main View Container */}
        <main className="flex-1 w-full px-6 py-8">
          {activeTab === 'dashboard' ? (
            <ExecutiveDashboardView />
          ) : activeTab === 'tasks' ? (
            <TaskManagementPage />
          ) : activeTab === 'assignments' ? (
            <WorkAssignmentPage />
          ) : activeTab === 'sprints' ? (
            <SprintManagementPage />
          ) : activeTab === 'calendar' ? (
            <CalendarManagementPage />
          ) : activeTab === 'roadmap' ? (
            <RoadmapPage />
          ) : activeTab === 'reports' ? (
            <ReportsDashboard />
          ) : activeTab === 'developer-activity' ? (
            <DeveloperActivityDashboard />
          ) : activeTab === 'workload' ? (
            <WorkloadDashboard />
          ) : activeTab === 'timesheet' ? (
            <TimesheetView />
          ) : activeTab === 'projects' ? (
            <ProjectManagementPage />
          ) : activeTab === 'github-repositories' ? (
            <RepositoryBrowser />
          ) : activeTab === 'workspaces' ? (
            <WorkspaceManagementPage />
          ) : activeTab === 'roles' ? (
            <RoleManagementPage />
          ) : activeTab === 'audit-logs' ? (
            <AuditLogsPage />
          ) : activeTab === 'members' ? (
            <MembersPage />
          ) : activeTab === 'organizations' ? (
            <OrganizationsPage />
          ) : activeTab === 'notifications' ? (
            <NotificationCenterPage />
          ) : activeTab === 'email-settings' ? (
            <EmailSettingsSection />
          ) : activeTab === 'documents' ? (
            <FilesManagerPage />
          ) : (
            <UserProfile />
          )}
        </main>

        {/* Global Floating Timer Bar, Active Conflict Modal & Command Palette */}
        <GlobalTimerBar />
        <ActiveTimerConflictModal />
        <CommandPalette />
        </div>
      </div>
    </ProtectedRoute>
  );
};

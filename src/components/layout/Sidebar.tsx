import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  GitBranch,
  Users,
  BarChart3,
  Bell,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Building2,
  User,
  ListTodo,
  Briefcase,
  Zap,
  Map,
  Clock,
  Mail,
  TrendingUp,
  ShieldCheck,
  History,
  LogOut,
} from 'lucide-react';
import { useUIStore, DashboardTab } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { OrganizationSwitcher } from '../organization/OrganizationSwitcher';
import { WorkspaceSwitcher } from '../workspace/WorkspaceSwitcher';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, setAiDrawerOpen, activeTab, setActiveTab } = useUIStore();
  const { user, logout } = useAuthStore();

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'TaskFlow User';
  const userRole = user?.role || 'user'; // 'admin' | 'manager' | 'user'

  const navGroups = [
    {
      title: 'TASK MANAGEMENT',
      items: [
        { id: 'dashboard' as DashboardTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks' as DashboardTab, label: 'Tasks', icon: ListTodo },
        { id: 'assignments' as DashboardTab, label: 'Assignments', icon: Briefcase },
        { id: 'sprints' as DashboardTab, label: 'Sprints', icon: Zap },
        { id: 'calendar' as DashboardTab, label: 'Calendar', icon: Calendar },
        { id: 'roadmap' as DashboardTab, label: 'Roadmap', icon: Map },
        { id: 'documents' as DashboardTab, label: 'Files Manager', icon: Briefcase },
      ],
    },
    {
      title: 'REPORTING',
      items: [
        { id: 'reports' as DashboardTab, label: 'Reports', icon: BarChart3 },
        { id: 'developer-activity' as DashboardTab, label: 'Activity', icon: TrendingUp },
        { id: 'workload' as DashboardTab, label: 'Workload', icon: Users },
        { id: 'timesheet' as DashboardTab, label: 'Timesheet', icon: Clock },
      ],
    },
    {
      title: 'GITHUB',
      items: [
        { id: 'github-repositories' as DashboardTab, label: 'Repositories', icon: GitBranch },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        { id: 'members' as DashboardTab, label: 'Members', icon: Users },
        { id: 'projects' as DashboardTab, label: 'Projects', icon: FolderKanban },
        { id: 'workspaces' as DashboardTab, label: 'Workspaces', icon: Layers },
        { id: 'roles' as DashboardTab, label: 'Roles & RBAC', icon: ShieldCheck },
        { id: 'audit-logs' as DashboardTab, label: 'Audit Logs', icon: History },
        { id: 'organizations' as DashboardTab, label: 'Organizations', icon: Building2 },
        { id: 'notifications' as DashboardTab, label: 'Center', icon: Bell },
        { id: 'email-settings' as DashboardTab, label: 'Email', icon: Mail },
        { id: 'profile' as DashboardTab, label: 'Profile', icon: User },
      ],
    },
  ];

  // Filter groups and items based on permissions
  const visibleGroups = navGroups.map((group) => {
    if (group.title === 'ADMIN') {
      // Developers / regular users shouldn't see Admin settings except Profile & Notifications Center
      const filteredItems = group.items.filter((item) => {
        if (userRole === 'admin' || userRole === 'manager') return true;
        return ['profile', 'notifications'].includes(item.id);
      });
      return { ...group, items: filteredItems };
    }
    return group;
  }).filter(group => group.items.length > 0);

  const userDropdownItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => setActiveTab('profile'),
    },
    {
      id: 'email-settings',
      label: 'Email Settings',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => setActiveTab('email-settings'),
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Workspace Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl w-full max-w-[190px]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-slate-100 truncate">
                TaskFlow AI
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Enterprise Edition
              </span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base mx-auto shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Switchers section - only visible when expanded */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-4 pb-2 space-y-2 border-b border-slate-800">
          <OrganizationSwitcher onNavigateToOrganizations={() => setActiveTab('organizations')} />
          <WorkspaceSwitcher onOpenManagement={() => setActiveTab('workspaces')} />
        </div>
      )}

      {/* AI Assistant Quick Trigger Banner */}
      <div className="p-3">
        <button
          onClick={() => setAiDrawerOpen(true)}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60 transition-all group cursor-pointer ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Ask TaskFlow AI</span>
              <Badge variant="purple" size="sm">
                Copilot
              </Badge>
            </div>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {visibleGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-500 tracking-wider">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-800">
        {!sidebarCollapsed ? (
          <Dropdown
            align="right"
            trigger={
              <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors text-left cursor-pointer">
                <Avatar src={user?.avatar} name={userName} status="online" size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-100 truncate">{userName}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              </button>
            }
            items={userDropdownItems}
          />
        ) : (
          <Dropdown
            align="right"
            trigger={
              <button className="flex justify-center mx-auto cursor-pointer">
                <Avatar src={user?.avatar} name={userName} status="online" size="sm" />
              </button>
            }
            items={userDropdownItems}
          />
        )}
      </div>
    </aside>
  );
};


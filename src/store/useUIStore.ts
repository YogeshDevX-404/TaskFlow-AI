import { create } from 'zustand';

export type DashboardTab =
  | 'dashboard'
  | 'assignments'
  | 'tasks'
  | 'sprints'
  | 'calendar'
  | 'roadmap'
  | 'reports'
  | 'developer-activity'
  | 'workload'
  | 'timesheet'
  | 'projects'
  | 'github-repositories'
  | 'workspaces'
  | 'members'
  | 'roles'
  | 'audit-logs'
  | 'organizations'
  | 'notifications'
  | 'email-settings'
  | 'documents'
  | 'profile';

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  commandPaletteOpen: boolean;
  aiDrawerOpen: boolean;
  createTaskModalOpen: boolean;
  createProjectModalOpen: boolean;
  selectedTaskId: string | null;
  activeTab: DashboardTab;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setCreateTaskModalOpen: (open: boolean) => void;
  setCreateProjectModalOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setActiveTab: (tab: DashboardTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  commandPaletteOpen: false,
  aiDrawerOpen: false,
  createTaskModalOpen: false,
  createProjectModalOpen: false,
  selectedTaskId: null,
  activeTab: 'dashboard',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),
  setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

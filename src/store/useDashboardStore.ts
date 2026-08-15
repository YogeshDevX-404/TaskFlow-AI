import { create } from 'zustand';
import { ProjectDashboardData, ProjectActivityItem } from '../types/dashboard';
import { DashboardService } from '../services/api/dashboardService';

interface DashboardState {
  dashboardData: ProjectDashboardData | null;
  isLoading: boolean;
  error: string | null;
  activitySearchQuery: string;
  activityTypeFilter: string;
  activityMemberFilter: string;
  activityDateFilter: string;

  // Actions
  fetchProjectDashboard: (projectId: string) => Promise<void>;
  setActivitySearchQuery: (query: string) => void;
  setActivityTypeFilter: (type: string) => void;
  setActivityMemberFilter: (member: string) => void;
  setActivityDateFilter: (date: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardData: null,
  isLoading: false,
  error: null,
  activitySearchQuery: '',
  activityTypeFilter: 'all',
  activityMemberFilter: 'all',
  activityDateFilter: 'all',

  fetchProjectDashboard: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await DashboardService.getProjectDashboard(projectId);
      if (response.success && response.data) {
        set({ dashboardData: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to load dashboard', isLoading: false });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Error loading dashboard',
        isLoading: false,
      });
    }
  },

  setActivitySearchQuery: (query: string) => set({ activitySearchQuery: query }),
  setActivityTypeFilter: (type: string) => set({ activityTypeFilter: type }),
  setActivityMemberFilter: (member: string) => set({ activityMemberFilter: member }),
  setActivityDateFilter: (date: string) => set({ activityDateFilter: date }),

  resetFilters: () =>
    set({
      activitySearchQuery: '',
      activityTypeFilter: 'all',
      activityMemberFilter: 'all',
      activityDateFilter: 'all',
    }),
}));

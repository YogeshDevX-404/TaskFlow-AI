import { create } from 'zustand';
import { ProjectAnalyticsData, AnalyticsService } from '../services/api/analyticsService';

interface AnalyticsState {
  analyticsData: ProjectAnalyticsData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjectAnalytics: (projectId: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analyticsData: null,
  isLoading: false,
  error: null,

  fetchProjectAnalytics: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AnalyticsService.getProjectAnalytics(projectId);
      if (response.success && response.data) {
        set({ analyticsData: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to load analytics', isLoading: false });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Error loading analytics',
        isLoading: false,
      });
    }
  },
}));

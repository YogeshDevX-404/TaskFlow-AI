import { create } from 'zustand';
import { ActivityFilters, ActivityItem, GroupedTimelineItem, ExportFormat } from '../types/activity';
import { activityService } from '../services/api/activityService';

interface ActivityState {
  activities: ActivityItem[];
  groupedTimeline: GroupedTimelineItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;

  filters: ActivityFilters;

  // Actions
  setFilters: (filters: Partial<ActivityFilters>) => void;
  resetFilters: () => void;
  fetchActivities: () => Promise<void>;
  exportActivities: (format: ExportFormat) => Promise<void>;
}

const initialFilters: ActivityFilters = {
  actionType: 'all',
  entityType: 'all',
  search: '',
  sortBy: 'newest',
  page: 1,
  limit: 50,
  grouped: true,
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  groupedTimeline: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  isExporting: false,
  error: null,
  filters: initialFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }));
    get().fetchActivities();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchActivities();
  },

  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = get().filters;
      const response = await activityService.getActivities(currentFilters);

      set({
        activities: response.activities || [],
        groupedTimeline: response.groupedTimeline || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to fetch activity logs',
      });
    }
  },

  exportActivities: async (format: ExportFormat) => {
    set({ isExporting: true });
    try {
      const filters = get().filters;
      const blob = await activityService.exportActivities(filters, format);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'pdf.json';
      link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      set({ isExporting: false });
    }
  },
}));

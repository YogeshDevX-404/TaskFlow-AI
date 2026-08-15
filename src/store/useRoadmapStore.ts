import { create } from 'zustand';
import {
  RoadmapData,
  RoadmapViewMode,
  RoadmapZoomLevel,
  ReleaseFilters,
} from '../types/release';
import { releaseService } from '../services/api/releaseService';

interface RoadmapStoreState {
  roadmapData: RoadmapData | null;
  viewMode: RoadmapViewMode;
  zoomLevel: RoadmapZoomLevel;
  filters: ReleaseFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoadmapData: () => Promise<void>;
  setViewMode: (mode: RoadmapViewMode) => void;
  setZoomLevel: (level: RoadmapZoomLevel) => void;
  setFilters: (filters: Partial<ReleaseFilters>) => void;
  resetFilters: () => void;
  updateReleaseTimelineDates: (releaseId: string, startDate?: string, endDate?: string) => Promise<void>;
}

const initialFilters: ReleaseFilters = {
  status: 'all',
  projectId: '',
  workspaceId: '',
  organizationId: '',
  searchQuery: '',
  version: '',
};

export const useRoadmapStore = create<RoadmapStoreState>((set, get) => ({
  roadmapData: null,
  viewMode: 'quarter',
  zoomLevel: 'normal',
  filters: initialFilters,
  isLoading: false,
  error: null,

  fetchRoadmapData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await releaseService.getRoadmapData(get().filters, get().viewMode);
      set({ roadmapData: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch roadmap', isLoading: false });
    }
  },

  setViewMode: (mode: RoadmapViewMode) => {
    set({ viewMode: mode });
    get().fetchRoadmapData();
  },

  setZoomLevel: (level: RoadmapZoomLevel) => {
    set({ zoomLevel: level });
  },

  setFilters: (newFilters: Partial<ReleaseFilters>) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchRoadmapData();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchRoadmapData();
  },

  updateReleaseTimelineDates: async (releaseId: string, startDate?: string, endDate?: string) => {
    try {
      await releaseService.updateRelease(releaseId, { startDate, endDate });
      get().fetchRoadmapData();
    } catch (err: any) {
      console.error('Failed to update release dates on roadmap', err);
    }
  },
}));

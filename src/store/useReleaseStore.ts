import { create } from 'zustand';
import { Release, ReleaseFilters, ReleaseFormData } from '../types/release';
import { releaseService } from '../services/api/releaseService';

interface ReleaseStoreState {
  releases: Release[];
  selectedRelease: Release | null;
  isLoading: boolean;
  error: string | null;
  filters: ReleaseFilters;

  // Actions
  fetchReleases: (customFilters?: ReleaseFilters) => Promise<void>;
  fetchReleaseById: (id: string) => Promise<Release | null>;
  createRelease: (data: ReleaseFormData) => Promise<Release | null>;
  updateRelease: (id: string, data: Partial<ReleaseFormData>) => Promise<Release | null>;
  deleteRelease: (id: string) => Promise<boolean>;
  archiveRelease: (id: string, isArchived?: boolean) => Promise<Release | null>;
  duplicateRelease: (id: string) => Promise<Release | null>;
  addTasksToRelease: (id: string, taskIds: string[]) => Promise<Release | null>;
  setSelectedRelease: (release: Release | null) => void;
  setFilters: (filters: Partial<ReleaseFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: ReleaseFilters = {
  status: 'all',
  projectId: '',
  workspaceId: '',
  organizationId: '',
  searchQuery: '',
  version: '',
  ownerId: '',
  isArchived: false,
};

export const useReleaseStore = create<ReleaseStoreState>((set, get) => ({
  releases: [],
  selectedRelease: null,
  isLoading: false,
  error: null,
  filters: initialFilters,

  fetchReleases: async (customFilters?: ReleaseFilters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = customFilters || get().filters;
      const data = await releaseService.getReleases(activeFilters);
      set({ releases: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load releases', isLoading: false });
    }
  },

  fetchReleaseById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await releaseService.getReleaseById(id);
      set({ selectedRelease: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to load release', isLoading: false });
      return null;
    }
  },

  createRelease: async (data: ReleaseFormData) => {
    set({ isLoading: true, error: null });
    try {
      const created = await releaseService.createRelease(data);
      set((state) => ({
        releases: [created, ...state.releases],
        isLoading: false,
      }));
      return created;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create release', isLoading: false });
      return null;
    }
  },

  updateRelease: async (id: string, data: Partial<ReleaseFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await releaseService.updateRelease(id, data);
      set((state) => ({
        releases: state.releases.map((r) => (r.id === id ? updated : r)),
        selectedRelease: state.selectedRelease?.id === id ? updated : state.selectedRelease,
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update release', isLoading: false });
      return null;
    }
  },

  deleteRelease: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await releaseService.deleteRelease(id);
      set((state) => ({
        releases: state.releases.filter((r) => r.id !== id),
        selectedRelease: state.selectedRelease?.id === id ? null : state.selectedRelease,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete release', isLoading: false });
      return false;
    }
  },

  archiveRelease: async (id: string, isArchived: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const archived = await releaseService.archiveRelease(id, isArchived);
      set((state) => ({
        releases: state.releases.map((r) => (r.id === id ? archived : r)),
        selectedRelease: state.selectedRelease?.id === id ? archived : state.selectedRelease,
        isLoading: false,
      }));
      return archived;
    } catch (err: any) {
      set({ error: err.message || 'Failed to archive release', isLoading: false });
      return null;
    }
  },

  duplicateRelease: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const duplicated = await releaseService.duplicateRelease(id);
      set((state) => ({
        releases: [duplicated, ...state.releases],
        isLoading: false,
      }));
      return duplicated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to duplicate release', isLoading: false });
      return null;
    }
  },

  addTasksToRelease: async (id: string, taskIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await releaseService.addTasksToRelease(id, taskIds);
      set((state) => ({
        releases: state.releases.map((r) => (r.id === id ? updated : r)),
        selectedRelease: state.selectedRelease?.id === id ? updated : state.selectedRelease,
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add tasks to release', isLoading: false });
      return null;
    }
  },

  setSelectedRelease: (release: Release | null) => set({ selectedRelease: release }),

  setFilters: (newFilters: Partial<ReleaseFilters>) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchReleases(updated);
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchReleases(initialFilters);
  },
}));

import { create } from 'zustand';
import { Release } from '../types/release';
import { releaseService } from '../services/api/releaseService';

export interface VersionItem {
  id: string;
  version: string;
  releaseName: string;
  releaseDate?: string;
  status: Release['status'];
  description?: string;
  isArchived: boolean;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

interface VersionStoreState {
  versions: VersionItem[];
  isLoading: boolean;
  error: string | null;

  fetchVersions: (projectId?: string) => Promise<void>;
  createVersion: (data: { version: string; releaseName: string; description?: string; releaseDate?: string; projectId?: string }) => Promise<void>;
  updateVersion: (id: string, data: Partial<VersionItem>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  archiveVersion: (id: string, isArchived?: boolean) => Promise<void>;
}

export const useVersionStore = create<VersionStoreState>((set, get) => ({
  versions: [],
  isLoading: false,
  error: null,

  fetchVersions: async (projectId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const releases = await releaseService.getReleases({ projectId, isArchived: undefined });
      const versionList: VersionItem[] = releases.map((r) => ({
        id: r.id,
        version: r.version,
        releaseName: r.name,
        releaseDate: r.releaseDate,
        status: r.status,
        description: r.description,
        isArchived: r.isArchived,
        totalTasks: r.totalTasks || 0,
        completedTasks: r.completedTasks || 0,
        progress: r.progress || 0,
      }));
      set({ versions: versionList, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch versions', isLoading: false });
    }
  },

  createVersion: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await releaseService.createRelease({
        name: data.releaseName,
        version: data.version,
        description: data.description,
        releaseDate: data.releaseDate,
        projectId: data.projectId,
      });
      await get().fetchVersions(data.projectId);
    } catch (err: any) {
      set({ error: err.message || 'Failed to create version', isLoading: false });
    }
  },

  updateVersion: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await releaseService.updateRelease(id, {
        version: data.version,
        name: data.releaseName,
        description: data.description,
        releaseDate: data.releaseDate,
        status: data.status,
      });
      await get().fetchVersions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to update version', isLoading: false });
    }
  },

  deleteVersion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await releaseService.deleteRelease(id);
      set((state) => ({
        versions: state.versions.filter((v) => v.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete version', isLoading: false });
    }
  },

  archiveVersion: async (id, isArchived = true) => {
    set({ isLoading: true, error: null });
    try {
      await releaseService.archiveRelease(id, isArchived);
      await get().fetchVersions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to archive version', isLoading: false });
    }
  },
}));

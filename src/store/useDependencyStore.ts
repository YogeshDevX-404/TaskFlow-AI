import { create } from 'zustand';
import { DependencyType, TaskDependency } from '../types/hierarchy';
import { dependencyService } from '../services/api/dependencyService';

interface DependencyState {
  dependencies: TaskDependency[];
  isLoading: boolean;
  error: string | null;
  currentTaskId: string | null;

  fetchDependencies: (taskId: string) => Promise<void>;
  addDependency: (sourceTaskId: string, targetTaskId: string, type: DependencyType) => Promise<void>;
  removeDependency: (sourceTaskId: string, dependencyId: string) => Promise<void>;
}

export const useDependencyStore = create<DependencyState>((set, get) => ({
  dependencies: [],
  isLoading: false,
  error: null,
  currentTaskId: null,

  fetchDependencies: async (taskId) => {
    set({ isLoading: true, error: null, currentTaskId: taskId });
    try {
      const dependencies = await dependencyService.getDependencies(taskId);
      set({ dependencies, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to fetch dependencies',
      });
    }
  },

  addDependency: async (sourceTaskId, targetTaskId, type) => {
    try {
      await dependencyService.addDependency(sourceTaskId, targetTaskId, type);
      await get().fetchDependencies(sourceTaskId);
    } catch (err: any) {
      console.error('Failed to add dependency:', err);
      throw err;
    }
  },

  removeDependency: async (sourceTaskId, dependencyId) => {
    try {
      await dependencyService.removeDependency(sourceTaskId, dependencyId);
      await get().fetchDependencies(sourceTaskId);
    } catch (err: any) {
      console.error('Failed to remove dependency:', err);
      throw err;
    }
  },
}));

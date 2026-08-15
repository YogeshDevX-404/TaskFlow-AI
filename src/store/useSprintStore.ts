import { create } from 'zustand';
import { Sprint, SprintFilters, SprintFormData, SprintSortOption, SprintStatus } from '../types/sprint';
import { Task } from '../types/task';
import { sprintService } from '../services/api/sprintService';

interface SprintState {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  currentSprint: Sprint | null;
  sprintBacklog: Task[];
  isLoading: boolean;
  error: string | null;
  filters: SprintFilters;
  sort: SprintSortOption;

  // Analytics states
  burndownData: Array<{ date: string; idealRemaining: number; actualRemaining: number | null }>;
  burnupData: Array<{ date: string; totalScope: number | null; completed: number | null; remaining: number | null }>;
  velocityData: { history: Array<{ sprintName: string; completedPoints: number; capacity: number }>; average: number };
  retrospective: any;
  sprintActivities: any[];

  // Actions
  fetchSprints: (customFilters?: Partial<SprintFilters>) => Promise<void>;
  fetchSprintById: (id: string) => Promise<Sprint | null>;
  fetchActiveSprint: (projectId: string) => Promise<Sprint | null>;
  createSprint: (data: SprintFormData) => Promise<Sprint>;
  updateSprint: (id: string, data: Partial<SprintFormData & { status?: SprintStatus; velocity?: number }>) => Promise<Sprint>;
  deleteSprint: (id: string) => Promise<void>;
  archiveSprint: (id: string, isArchived?: boolean) => Promise<void>;
  duplicateSprint: (id: string) => Promise<Sprint>;
  startSprint: (id: string) => Promise<void>;
  completeSprint: (id: string, moveUnfinishedToSprintId?: string) => Promise<void>;
  cancelSprint: (id: string) => Promise<void>;
  assignTasksToSprint: (sprintId: string, taskIds: string[]) => Promise<void>;
  removeTaskFromSprint: (sprintId: string, taskId: string) => Promise<void>;
  setFilters: (filters: Partial<SprintFilters>) => void;
  setSort: (sort: SprintSortOption) => void;
  setCurrentSprint: (sprint: Sprint | null) => void;
  resetFilters: () => void;

  // Analytics actions
  fetchBurndown: (id: string) => Promise<void>;
  fetchBurnup: (id: string) => Promise<void>;
  fetchVelocity: (projectId: string) => Promise<void>;
  fetchRetrospective: (id: string) => Promise<void>;
  updateRetrospective: (id: string, data: any) => Promise<void>;
  fetchSprintActivity: (id: string) => Promise<void>;
}


const initialFilters: SprintFilters = {
  status: 'all',
  projectId: undefined,
  searchQuery: '',
  isArchived: false,
};

export const useSprintStore = create<SprintState>((set, get) => ({
  sprints: [],
  activeSprint: null,
  currentSprint: null,
  sprintBacklog: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
  sort: 'newest',

  // Analytics initial values
  burndownData: [],
  burnupData: [],
  velocityData: { history: [], average: 0 },
  retrospective: null,
  sprintActivities: [],


  fetchSprints: async (customFilters?: Partial<SprintFilters>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...customFilters };
      const data = await sprintService.getSprints(mergedFilters, get().sort);
      set({ sprints: data, isLoading: false });

      // Auto set active sprint if available for project
      if (mergedFilters.projectId) {
        const active = data.find(
          (s) =>
            s.status === 'Active' &&
            (typeof s.project === 'object' ? s.project.id === mergedFilters.projectId : s.project === mergedFilters.projectId)
        );
        set({ activeSprint: active || null });
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to load sprints',
        isLoading: false,
      });
    }
  },

  fetchSprintById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const sprint = await sprintService.getSprintById(id);
      set({ currentSprint: sprint, isLoading: false });
      return sprint;
    } catch (err: any) {
      set({ error: err.message || 'Sprint not found', isLoading: false });
      return null;
    }
  },

  fetchActiveSprint: async (projectId: string) => {
    try {
      const all = await sprintService.getSprints({ projectId, status: 'Active' });
      const active = all.find((s) => s.status === 'Active') || null;
      set({ activeSprint: active });
      return active;
    } catch (err) {
      return null;
    }
  },

  createSprint: async (data: SprintFormData) => {
    set({ isLoading: true, error: null });
    try {
      const created = await sprintService.createSprint(data);
      set((state) => ({
        sprints: [created, ...state.sprints],
        isLoading: false,
      }));
      return created;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create sprint', isLoading: false });
      throw err;
    }
  },

  updateSprint: async (id: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await sprintService.updateSprint(id, data);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id ? updated : s)),
        currentSprint: state.currentSprint?.id === id ? updated : state.currentSprint,
        activeSprint: state.activeSprint?.id === id ? updated : state.activeSprint,
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update sprint', isLoading: false });
      throw err;
    }
  },

  deleteSprint: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sprintService.deleteSprint(id);
      set((state) => ({
        sprints: state.sprints.filter((s) => s.id !== id),
        currentSprint: state.currentSprint?.id === id ? null : state.currentSprint,
        activeSprint: state.activeSprint?.id === id ? null : state.activeSprint,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete sprint', isLoading: false });
      throw err;
    }
  },

  archiveSprint: async (id: string, isArchived = true) => {
    try {
      const updated = await sprintService.archiveSprint(id, isArchived);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to archive sprint' });
    }
  },

  duplicateSprint: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const copy = await sprintService.duplicateSprint(id);
      set((state) => ({
        sprints: [copy, ...state.sprints],
        isLoading: false,
      }));
      return copy;
    } catch (err: any) {
      set({ error: err.message || 'Failed to duplicate sprint', isLoading: false });
      throw err;
    }
  },

  startSprint: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await sprintService.startSprint(id);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id ? updated : s)),
        activeSprint: updated,
        currentSprint: state.currentSprint?.id === id ? updated : state.currentSprint,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to start sprint', isLoading: false });
      throw err;
    }
  },

  completeSprint: async (id: string, moveUnfinishedToSprintId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await sprintService.completeSprint(id, moveUnfinishedToSprintId);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id ? updated : s)),
        activeSprint: state.activeSprint?.id === id ? null : state.activeSprint,
        currentSprint: state.currentSprint?.id === id ? updated : state.currentSprint,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to complete sprint', isLoading: false });
      throw err;
    }
  },

  cancelSprint: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await sprintService.cancelSprint(id);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id ? updated : s)),
        activeSprint: state.activeSprint?.id === id ? null : state.activeSprint,
        currentSprint: state.currentSprint?.id === id ? updated : state.currentSprint,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to cancel sprint', isLoading: false });
      throw err;
    }
  },

  assignTasksToSprint: async (sprintId: string, taskIds: string[]) => {
    try {
      const updated = await sprintService.addTasksToSprint(sprintId, taskIds);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updated : s)),
        currentSprint: state.currentSprint?.id === sprintId ? updated : state.currentSprint,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to assign tasks to sprint' });
    }
  },

  removeTaskFromSprint: async (sprintId: string, taskId: string) => {
    try {
      const updated = await sprintService.removeTasksFromSprint(sprintId, [taskId]);
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updated : s)),
        currentSprint: state.currentSprint?.id === sprintId ? updated : state.currentSprint,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove task from sprint' });
    }
  },

  setFilters: (newFilters: Partial<SprintFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchSprints();
  },

  setSort: (sortOption: SprintSortOption) => {
    set({ sort: sortOption });
    get().fetchSprints();
  },

  setCurrentSprint: (sprint: Sprint | null) => {
    set({ currentSprint: sprint });
  },

  resetFilters: () => {
    set({ filters: initialFilters, sort: 'newest' });
    get().fetchSprints();
  },

  fetchBurndown: async (id: string) => {
    try {
      const data = await sprintService.getBurndown(id);
      set({ burndownData: data });
    } catch {}
  },

  fetchBurnup: async (id: string) => {
    try {
      const data = await sprintService.getBurnup(id);
      set({ burnupData: data });
    } catch {}
  },

  fetchVelocity: async (projectId: string) => {
    try {
      const data = await sprintService.getProjectVelocity(projectId);
      set({ velocityData: data });
    } catch {}
  },

  fetchRetrospective: async (id: string) => {
    try {
      const data = await sprintService.getRetrospective(id);
      set({ retrospective: data });
    } catch {}
  },

  updateRetrospective: async (id: string, data: any) => {
    try {
      const updated = await sprintService.updateRetrospective(id, data);
      set({ retrospective: updated });
    } catch (err) {
      throw err;
    }
  },

  fetchSprintActivity: async (id: string) => {
    try {
      const data = await sprintService.getSprintActivity(id);
      set({ sprintActivities: data });
    } catch {}
  },
}));


import { create } from 'zustand';
import { Task, TaskStatus } from '../types/task';
import { BoardColumn, BoardSettings, BoardFilterOptions } from '../types/board';
import { boardService } from '../services/api/boardService';
import { kanbanService } from '../services/api/kanbanService';
import { TaskSortingService } from '../services/taskSortingService';

interface BoardState {
  projectId: string | null;
  boardId: string | null;
  columns: BoardColumn[];
  settings: BoardSettings;
  tasks: Task[];
  groupedTasks: Record<string, Task[]>;
  userRole: 'Project Owner' | 'Project Admin' | 'Developer' | 'Tester' | 'Viewer';
  selectedTaskIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Filters & Controls
  searchQuery: string;
  filters: BoardFilterOptions;

  // Actions
  fetchBoard: (projectId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (newFilters: Partial<BoardFilterOptions>) => void;
  resetFilters: () => void;

  // Multi-Selection Actions
  toggleSelectTask: (taskId: string) => void;
  selectAllInColumn: (columnTasks: Task[]) => void;
  clearSelection: () => void;
  bulkUpdateSelected: (updates: {
    status?: TaskStatus;
    priority?: any;
    assigneeId?: string | null;
    isArchived?: boolean;
    delete?: boolean;
  }) => Promise<void>;

  // Column Actions
  addColumn: (colData: Partial<BoardColumn>) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<BoardColumn>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  toggleCollapseColumn: (columnId: string) => Promise<void>;
  reorderColumns: (newColumns: BoardColumn[]) => Promise<void>;

  // Board Settings
  updateSettings: (newSettings: Partial<BoardSettings>) => Promise<void>;

  // Optimistic & Async Drag and Drop
  moveTaskStatusOptimistic: (
    taskId: string,
    sourceStatusKey: string,
    targetStatusKey: string,
    targetIndex: number
  ) => void;
  reorderColumnTasksOptimistic: (columnStatusKey: string, newOrderTaskIds: string[]) => void;
  syncTaskStatusUpdate: (taskId: string, targetStatus: TaskStatus, newIndex?: number) => Promise<void>;
  syncColumnReorder: (statusKey: TaskStatus, taskIds: string[]) => Promise<void>;
}

const initialFilters: BoardFilterOptions = {
  search: '',
  assigneeId: 'all',
  reporterId: 'all',
  priority: 'all',
  status: 'all',
  type: 'all',
  dueDate: 'all',
  isArchived: false,
};

const initialSettings: BoardSettings = {
  cardSize: 'default',
  showLabels: true,
  showStoryPoints: true,
  showAvatars: true,
  showDueDates: true,
  groupBy: 'status',
};

export const useBoardStore = create<BoardState>((set, get) => ({
  projectId: null,
  boardId: null,
  columns: [],
  settings: initialSettings,
  tasks: [],
  groupedTasks: {},
  userRole: 'Developer',
  selectedTaskIds: new Set<string>(),
  isLoading: false,
  error: null,

  searchQuery: '',
  filters: initialFilters,

  fetchBoard: async (projectId) => {
    set({ isLoading: true, error: null, projectId });
    try {
      const filters = { ...get().filters, search: get().searchQuery };
      const data = await boardService.getBoard(projectId, filters);

      set({
        boardId: data.board.id,
        columns: data.columns || [],
        settings: data.board.settings || initialSettings,
        tasks: data.tasks || [],
        groupedTasks: data.groupedTasks || {},
        userRole: data.userRole || 'Developer',
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to fetch board data',
      });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const pid = get().projectId;
    if (pid) get().fetchBoard(pid);
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    const pid = get().projectId;
    if (pid) get().fetchBoard(pid);
  },

  resetFilters: () => {
    set({ searchQuery: '', filters: initialFilters });
    const pid = get().projectId;
    if (pid) get().fetchBoard(pid);
  },

  toggleSelectTask: (taskId) => {
    set((state) => {
      const next = new Set(state.selectedTaskIds);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return { selectedTaskIds: next };
    });
  },

  selectAllInColumn: (columnTasks) => {
    set((state) => {
      const next = new Set(state.selectedTaskIds);
      const allSelected = columnTasks.every((t) => next.has(t.id));
      if (allSelected) {
        columnTasks.forEach((t) => next.delete(t.id));
      } else {
        columnTasks.forEach((t) => next.add(t.id));
      }
      return { selectedTaskIds: next };
    });
  },

  clearSelection: () => {
    set({ selectedTaskIds: new Set<string>() });
  },

  bulkUpdateSelected: async (updates) => {
    const pid = get().projectId;
    const taskIds = Array.from(get().selectedTaskIds);
    if (!pid || taskIds.length === 0) return;

    try {
      await boardService.bulkUpdateTasks(pid, taskIds, updates);
      get().clearSelection();
      await get().fetchBoard(pid);
    } catch (err: any) {
      set({ error: err?.response?.data?.message || err?.message || 'Failed to apply bulk actions' });
    }
  },

  addColumn: async (colData) => {
    const pid = get().projectId;
    if (!pid) return;
    try {
      await boardService.addColumn(pid, colData);
      await get().fetchBoard(pid);
    } catch (err: any) {
      set({ error: err?.response?.data?.message || err?.message || 'Failed to add column' });
    }
  },

  updateColumn: async (columnId, updates) => {
    const pid = get().projectId;
    if (!pid) return;
    try {
      await boardService.updateColumn(pid, columnId, updates);
      await get().fetchBoard(pid);
    } catch (err: any) {
      set({ error: err?.response?.data?.message || err?.message || 'Failed to update column' });
    }
  },

  deleteColumn: async (columnId) => {
    const pid = get().projectId;
    if (!pid) return;
    try {
      await boardService.deleteColumn(pid, columnId);
      await get().fetchBoard(pid);
    } catch (err: any) {
      set({ error: err?.response?.data?.message || err?.message || 'Failed to delete column' });
    }
  },

  toggleCollapseColumn: async (columnId) => {
    const pid = get().projectId;
    if (!pid) return;
    const col = get().columns.find((c) => c.id === columnId);
    if (!col) return;

    // Optimistic toggle
    set((state) => ({
      columns: state.columns.map((c) =>
        c.id === columnId ? { ...c, isCollapsed: !c.isCollapsed } : c
      ),
    }));

    try {
      await boardService.updateColumn(pid, columnId, { isCollapsed: !col.isCollapsed });
    } catch (err) {
      console.error('Failed to toggle column collapse:', err);
    }
  },

  reorderColumns: async (newColumns) => {
    const pid = get().projectId;
    if (!pid) return;
    set({ columns: newColumns });
    try {
      await boardService.updateColumns(pid, newColumns);
    } catch (err: any) {
      console.error('Failed to update columns order:', err);
      get().fetchBoard(pid);
    }
  },

  updateSettings: async (newSettings) => {
    const pid = get().projectId;
    if (!pid) return;
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));

    try {
      await boardService.updateSettings(pid, newSettings);
      get().fetchBoard(pid);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
    }
  },

  moveTaskStatusOptimistic: (taskId, sourceKey, targetKey, targetIndex) => {
    const { tasks, settings } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: targetKey as TaskStatus, sortOrder: targetIndex };

    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    const grouped = TaskSortingService.groupTasksBy(updatedTasks, settings.groupBy || 'status');

    set({ tasks: updatedTasks, groupedTasks: grouped });
  },

  reorderColumnTasksOptimistic: (columnStatusKey, newOrderTaskIds) => {
    const { tasks, settings } = get();
    const idMap = new Map<string, number>();
    newOrderTaskIds.forEach((id, idx) => idMap.set(id, idx));

    const updatedTasks = tasks.map((t) => {
      if (idMap.has(t.id)) {
        return { ...t, sortOrder: idMap.get(t.id)! };
      }
      return t;
    });

    const grouped = TaskSortingService.groupTasksBy(updatedTasks, settings.groupBy || 'status');
    set({ tasks: updatedTasks, groupedTasks: grouped });
  },

  syncTaskStatusUpdate: async (taskId, targetStatus, newIndex) => {
    try {
      await kanbanService.updateTaskStatus(taskId, targetStatus, newIndex);
    } catch (err: any) {
      console.error('Failed to sync task status update:', err);
      const pid = get().projectId;
      if (pid) get().fetchBoard(pid);
    }
  },

  syncColumnReorder: async (statusKey, taskIds) => {
    const pid = get().projectId;
    if (!pid) return;
    try {
      await kanbanService.reorderTasks(pid, taskIds, statusKey);
    } catch (err: any) {
      console.error('Failed to sync column reorder:', err);
      get().fetchBoard(pid);
    }
  },
}));

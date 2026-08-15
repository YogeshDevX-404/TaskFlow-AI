import { create } from 'zustand';
import { TaskTreeNode, HierarchyFilters } from '../types/hierarchy';
import { hierarchyService } from '../services/api/hierarchyService';

interface TaskTreeState {
  tree: TaskTreeNode[];
  expandedNodes: Set<string>;
  filters: HierarchyFilters;
  isLoading: boolean;
  error: string | null;
  currentTargetId: string | null;

  // Actions
  setFilters: (newFilters: Partial<HierarchyFilters>) => void;
  resetFilters: () => void;
  fetchTree: (targetId?: string) => Promise<void>;
  toggleExpandNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  createSubtask: (parentTaskId: string, data: any) => Promise<void>;
  updateSubtask: (parentTaskId: string, subtaskId: string, data: any) => Promise<void>;
  deleteSubtask: (parentTaskId: string, subtaskId: string) => Promise<void>;
  convertTask: (taskId: string, newParentId: string | null) => Promise<void>;
}

const initialFilters: HierarchyFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  type: 'all',
  onlyParent: false,
  onlySubtasks: false,
  blocked: false,
  completed: false,
  sortBy: 'sortOrder',
  sortOrder: 'asc',
};

export const useTaskTreeStore = create<TaskTreeState>((set, get) => ({
  tree: [],
  expandedNodes: new Set<string>(),
  filters: initialFilters,
  isLoading: false,
  error: null,
  currentTargetId: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    const targetId = get().currentTargetId;
    if (targetId) {
      get().fetchTree(targetId);
    }
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    const targetId = get().currentTargetId;
    if (targetId) {
      get().fetchTree(targetId);
    }
  },

  fetchTree: async (targetId) => {
    const activeId = targetId || get().currentTargetId;
    if (!activeId) return;

    set({ isLoading: true, error: null, currentTargetId: activeId });
    try {
      const filters = get().filters;
      const tree = await hierarchyService.getTaskTree(activeId, filters);

      // Default expand all top-level nodes if set empty
      const expanded = new Set(get().expandedNodes);
      if (expanded.size === 0) {
        tree.forEach((node) => expanded.add(node.id));
      }

      set({ tree, isLoading: false, expandedNodes: expanded });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to fetch task tree',
      });
    }
  },

  toggleExpandNode: (nodeId) => {
    set((state) => {
      const next = new Set(state.expandedNodes);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return { expandedNodes: next };
    });
  },

  expandAll: () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TaskTreeNode[]) => {
      nodes.forEach((n) => {
        allIds.add(n.id);
        if (n.children && n.children.length > 0) {
          collectIds(n.children);
        }
      });
    };
    collectIds(get().tree);
    set({ expandedNodes: allIds });
  },

  collapseAll: () => {
    set({ expandedNodes: new Set<string>() });
  },

  createSubtask: async (parentTaskId, data) => {
    try {
      await hierarchyService.createSubtask(parentTaskId, data);
      await get().fetchTree();
    } catch (err: any) {
      console.error('Failed to create subtask:', err);
      throw err;
    }
  },

  updateSubtask: async (parentTaskId, subtaskId, data) => {
    try {
      await hierarchyService.updateSubtask(parentTaskId, subtaskId, data);
      await get().fetchTree();
    } catch (err: any) {
      console.error('Failed to update subtask:', err);
      throw err;
    }
  },

  deleteSubtask: async (parentTaskId, subtaskId) => {
    try {
      await hierarchyService.deleteSubtask(parentTaskId, subtaskId);
      await get().fetchTree();
    } catch (err: any) {
      console.error('Failed to delete subtask:', err);
      throw err;
    }
  },

  convertTask: async (taskId, newParentId) => {
    try {
      await hierarchyService.convertTask(taskId, newParentId);
      await get().fetchTree();
    } catch (err: any) {
      console.error('Failed to convert task hierarchy:', err);
      throw err;
    }
  },
}));

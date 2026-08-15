import { create } from 'zustand';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskFormData,
  TaskFilters,
  TaskSortOption,
} from '../types/task';
import { TaskService } from '../services/api/taskService';
import { MOCK_TASKS, MOCK_USER } from '../constants/mockData';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  searchQuery: string;
  sort: TaskSortOption;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  viewMode: 'table' | 'card' | 'compact' | 'tree' | 'kanban';

  // Setters
  setSelectedTask: (task: Task | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setTypeFilter: (type: string) => void;
  setProjectFilter: (projectId: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (sort: TaskSortOption) => void;
  setViewMode: (mode: 'table' | 'card' | 'compact' | 'tree' | 'kanban') => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  // Async API & Local Operations
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  fetchTaskDetails: (id: string) => Promise<Task | null>;
  createTask: (data: TaskFormData) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<TaskFormData> & { isArchived?: boolean }) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  archiveTask: (id: string) => Promise<Task | null>;
  restoreTask: (id: string) => Promise<Task | null>;
  duplicateTask: (id: string) => Promise<Task | null>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleWatch: (id: string) => Promise<void>;

  // Convenience local updates
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  updateTaskPriority: (id: string, newPriority: TaskPriority) => Promise<void>;
  addTask: (newTaskData: TaskFormData) => Promise<void>;

  // Local real-time task state updates
  addLocalTask: (task: Task) => void;
  updateLocalTask: (id: string, updates: Partial<Task>) => void;
  removeLocalTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: MOCK_TASKS,
  selectedTask: null,
  filters: {
    status: 'all',
    priority: 'all',
    type: 'all',
    isArchived: false,
  },
  searchQuery: '',
  sort: 'newest',
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: MOCK_TASKS.length,
    totalPages: 1,
  },
  viewMode: 'table',

  setSelectedTask: (task) => set({ selectedTask: task }),
  setSearchQuery: (query) => {
    set((state) => ({
      searchQuery: query,
      filters: { ...state.filters, searchQuery: query },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setStatusFilter: (status) => {
    set((state) => ({
      filters: { ...state.filters, status: status as any },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setPriorityFilter: (priority) => {
    set((state) => ({
      filters: { ...state.filters, priority: priority as any },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setTypeFilter: (type) => {
    set((state) => ({
      filters: { ...state.filters, type: type as any },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setProjectFilter: (projectId) => {
    set((state) => ({
      filters: { ...state.filters, projectId },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchTasks();
  },
  setSort: (sortOption) => {
    set({ sort: sortOption });
    get().fetchTasks();
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchTasks();
  },
  resetFilters: () => {
    set({
      filters: { status: 'all', priority: 'all', type: 'all', isArchived: false },
      searchQuery: '',
      sort: 'newest',
      pagination: { page: 1, limit: 50, total: MOCK_TASKS.length, totalPages: 1 },
    });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    set({ loading: true, error: null });
    const { filters, searchQuery, sort, pagination } = get();

    try {
      const response = await TaskService.getTasks({
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        projectId: filters.projectId,
        workspaceId: filters.workspaceId,
        organizationId: filters.organizationId,
        assigneeId: filters.assigneeId,
        reporterId: filters.reporterId,
        isArchived: filters.isArchived,
        search: searchQuery || filters.searchQuery || undefined,
        sortBy: sort,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response && response.success && Array.isArray(response.data)) {
        set({
          tasks: response.data,
          loading: false,
          pagination: {
            page: response.meta?.page || pagination.page,
            limit: response.meta?.limit || pagination.limit,
            total: response.meta?.totalItems ?? response.data.length,
            totalPages: response.meta?.totalPages || 1,
          },
        });
        return;
      }
    } catch {
      // Graceful fallback to client-filtered mock tasks if server endpoint fails or is offline
    }

    // Client-side filtering fallback
    let result = [...MOCK_TASKS];

    if (filters.isArchived !== undefined) {
      result = result.filter((t) => Boolean(t.isArchived) === filters.isArchived);
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.projectId) {
      result = result.filter((t) => {
        const pId = typeof t.project === 'object' ? t.project.id : t.project || t.projectId;
        return pId === filters.projectId;
      });
    }

    const query = (searchQuery || filters.searchQuery || '').toLowerCase().trim();
    if (query) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.taskKey.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Client sorting
    if (sort === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'dueDate') {
      result.sort((a, b) => new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime());
    } else {
      // 'newest' default
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    set({
      tasks: result,
      loading: false,
      pagination: {
        page: 1,
        limit: 50,
        total: result.length,
        totalPages: 1,
      },
    });
  },

  fetchTaskById: async (id) => {
    try {
      const response = await TaskService.getTaskById(id);
      if (response && response.success && response.data) {
        set({ selectedTask: response.data });
        return response.data;
      }
    } catch {
      // Fallback
    }
    const found = get().tasks.find((t) => t.id === id || t.taskKey === id) || null;
    if (found) set({ selectedTask: found });
    return found;
  },

  fetchTaskDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await TaskService.getTaskDetails(id);
      if (response && response.success && response.data) {
        set({ selectedTask: response.data, loading: false });
        return response.data;
      }
    } catch {
      // Fallback to fetchTaskById or mock lookup
    }
    const found = get().tasks.find((t) => t.id === id || t.taskKey === id) || get().selectedTask;
    set({ selectedTask: found, loading: false });
    return found;
  },

  createTask: async (formData) => {
    set({ loading: true });
    try {
      const response = await TaskService.createTask(formData);
      if (response && response.success && response.data) {
        const created = response.data;
        set((state) => ({
          tasks: [created, ...state.tasks],
          loading: false,
        }));
        return created;
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to create task', loading: false });
    }

    // Fallback local creation
    const taskKey = formData.taskKey || `TASK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskKey,
      title: formData.title,
      description: formData.description || '',
      status: formData.status || 'Todo',
      priority: formData.priority || 'Medium',
      type: formData.type || 'Task',
      project: formData.projectId || 'proj-1',
      workspace: formData.workspaceId || 'ws-eng-001',
      organization: formData.organizationId || 'org-default',
      projectId: formData.projectId || 'proj-1',
      projectKey: taskKey.split('-')[0] || 'TASK',
      projectName: 'Project',
      reporter: MOCK_USER,
      labels: formData.labels || [],
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      estimatedHours: formData.estimatedHours || 0,
      spentHours: formData.spentHours || 0,
      storyPoints: formData.storyPoints || 0,
      watchers: [],
      isFavorite: false,
      isWatching: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      loading: false,
    }));
    return newTask;
  },

  updateTask: async (id, data) => {
    set({ loading: true });
    try {
      const response = await TaskService.updateTask(id, data);
      if (response && response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
          loading: false,
        }));
        return updated;
      }
    } catch {
      // Fallback
    }

    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === id || t.taskKey === id) {
          return {
            ...t,
            ...data,
            updatedAt: new Date().toISOString(),
          } as Task;
        }
        return t;
      });
      const updatedSelected =
        state.selectedTask && (state.selectedTask.id === id || state.selectedTask.taskKey === id)
          ? ({ ...state.selectedTask, ...data, updatedAt: new Date().toISOString() } as Task)
          : state.selectedTask;

      return {
        tasks: updatedTasks,
        selectedTask: updatedSelected,
        loading: false,
      };
    });

    return get().tasks.find((t) => t.id === id) || null;
  },

  deleteTask: async (id) => {
    set({ loading: true });
    try {
      await TaskService.deleteTask(id);
    } catch {
      // Fallback
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id && t.taskKey !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
      loading: false,
    }));
    return true;
  },

  archiveTask: async (id) => {
    try {
      const res = await TaskService.archiveTask(id);
      if (res && res.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? res.data! : t)),
        }));
        return res.data;
      }
    } catch {
      // Fallback
    }
    return get().updateTask(id, { isArchived: true });
  },

  restoreTask: async (id) => {
    try {
      const res = await TaskService.restoreTask(id);
      if (res && res.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? res.data! : t)),
        }));
        return res.data;
      }
    } catch {
      // Fallback
    }
    return get().updateTask(id, { isArchived: false });
  },

  duplicateTask: async (id) => {
    set({ loading: true });
    try {
      const response = await TaskService.duplicateTask(id);
      if (response && response.success && response.data) {
        const duplicated = response.data;
        set((state) => ({
          tasks: [duplicated, ...state.tasks],
          loading: false,
        }));
        return duplicated;
      }
    } catch {
      // Fallback
    }

    const source = get().tasks.find((t) => t.id === id);
    if (!source) {
      set({ loading: false });
      return null;
    }

    const clonedKey = `${source.taskKey.split('-')[0] || 'TASK'}-${Math.floor(100 + Math.random() * 900)}`;
    const cloned: Task = {
      ...source,
      id: `task-${Date.now()}`,
      taskKey: clonedKey,
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    set((state) => ({
      tasks: [cloned, ...state.tasks],
      loading: false,
    }));
    return cloned;
  },

  toggleFavorite: async (id) => {
    try {
      const response = await TaskService.toggleFavorite(id);
      if (response && response.success && response.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? response.data! : t)),
          selectedTask: state.selectedTask?.id === id ? response.data! : state.selectedTask,
        }));
        return;
      }
    } catch {
      // Fallback
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, isFavorite: !state.selectedTask.isFavorite }
          : state.selectedTask,
    }));
  },

  toggleWatch: async (id) => {
    try {
      const response = await TaskService.toggleWatch(id);
      if (response && response.success && response.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? response.data! : t)),
          selectedTask: state.selectedTask?.id === id ? response.data! : state.selectedTask,
        }));
        return;
      }
    } catch {
      // Fallback
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isWatching: !t.isWatching } : t
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, isWatching: !state.selectedTask.isWatching }
          : state.selectedTask,
    }));
  },

  updateTaskStatus: async (id, newStatus) => {
    await get().updateTask(id, { status: newStatus });
  },

  updateTaskPriority: async (id, newPriority) => {
    await get().updateTask(id, { priority: newPriority });
  },

  addTask: async (newTaskData) => {
    await get().createTask(newTaskData);
  },

  addLocalTask: (task) => {
    set((state) => {
      if (state.tasks.some((t) => t.id === task.id)) return state;
      return { tasks: [task, ...state.tasks] };
    });
  },

  updateLocalTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, ...updates } : state.selectedTask,
    }));
  },

  removeLocalTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    }));
  },
}));

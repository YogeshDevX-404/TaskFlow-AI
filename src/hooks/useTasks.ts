import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskFormData, TaskStatus, TaskPriority, TaskFilters, TaskSortOption } from '../types/task';

/**
 * Hook to fetch and manage task list
 */
export function useTasks(initialFilters?: Partial<TaskFilters>) {
  const {
    tasks,
    loading,
    error,
    filters,
    searchQuery,
    sort,
    pagination,
    viewMode,
    fetchTasks,
    setFilters,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setProjectFilter,
    setSort,
    setViewMode,
    setPage,
    resetFilters,
  } = useTaskStore();

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    } else {
      fetchTasks();
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    filters,
    searchQuery,
    sort,
    pagination,
    viewMode,
    refetch: fetchTasks,
    setFilters,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setProjectFilter,
    setSort,
    setViewMode,
    setPage,
    resetFilters,
  };
}

/**
 * Hook to fetch and manage single task by ID or Key
 */
export function useTask(idOrKey?: string) {
  const { selectedTask, loading, error, fetchTaskById, setSelectedTask } = useTaskStore();

  useEffect(() => {
    if (idOrKey) {
      fetchTaskById(idOrKey);
    }
  }, [idOrKey]);

  return {
    task: selectedTask,
    loading,
    error,
    refetch: () => idOrKey ? fetchTaskById(idOrKey) : Promise.resolve(null),
    clearSelectedTask: () => setSelectedTask(null),
  };
}

/**
 * Hook to create task
 */
export function useCreateTask() {
  const { createTask, loading, error } = useTaskStore();

  const handleCreateTask = async (data: TaskFormData): Promise<Task | null> => {
    return createTask(data);
  };

  return {
    createTask: handleCreateTask,
    loading,
    error,
  };
}

/**
 * Hook to update task
 */
export function useUpdateTask() {
  const { updateTask, updateTaskStatus, updateTaskPriority, loading, error } = useTaskStore();

  const handleUpdateTask = async (
    id: string,
    data: Partial<TaskFormData> & { isArchived?: boolean }
  ): Promise<Task | null> => {
    return updateTask(id, data);
  };

  return {
    updateTask: handleUpdateTask,
    updateStatus: (id: string, status: TaskStatus) => updateTaskStatus(id, status),
    updatePriority: (id: string, priority: TaskPriority) => updateTaskPriority(id, priority),
    loading,
    error,
  };
}

/**
 * Hook to delete task
 */
export function useDeleteTask() {
  const { deleteTask, loading, error } = useTaskStore();

  const handleDeleteTask = async (id: string): Promise<boolean> => {
    return deleteTask(id);
  };

  return {
    deleteTask: handleDeleteTask,
    loading,
    error,
  };
}

/**
 * Hook for additional task actions (Archive, Restore, Duplicate, Favorite, Watch)
 */
export function useTaskActions() {
  const { archiveTask, restoreTask, duplicateTask, toggleFavorite, toggleWatch } = useTaskStore();

  return {
    archiveTask,
    restoreTask,
    duplicateTask,
    toggleFavorite,
    toggleWatch,
  };
}

export { useTaskDetails } from './useTaskDetails';
export type { UseTaskDetailsReturn } from './useTaskDetails';

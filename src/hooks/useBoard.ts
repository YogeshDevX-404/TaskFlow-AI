import { useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';

export function useBoard(projectId?: string) {
  const {
    boardId,
    columns,
    settings,
    tasks,
    groupedTasks,
    userRole,
    selectedTaskIds,
    isLoading,
    error,
    searchQuery,
    filters,
    fetchBoard,
    setSearchQuery,
    setFilters,
    resetFilters,
    toggleSelectTask,
    selectAllInColumn,
    clearSelection,
    bulkUpdateSelected,
    updateSettings,
  } = useBoardStore();

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
    }
  }, [projectId, fetchBoard]);

  return {
    boardId,
    columns,
    settings,
    tasks,
    groupedTasks,
    userRole,
    selectedTaskIds,
    isLoading,
    error,
    searchQuery,
    filters,
    refetch: () => projectId && fetchBoard(projectId),
    setSearchQuery,
    setFilters,
    resetFilters,
    toggleSelectTask,
    selectAllInColumn,
    clearSelection,
    bulkUpdateSelected,
    updateSettings,
  };
}

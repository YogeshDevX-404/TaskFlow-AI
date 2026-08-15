import { useEffect } from 'react';
import { useTaskTreeStore } from '../store/useTaskTreeStore';

export function useTaskTree(targetId?: string) {
  const {
    tree,
    expandedNodes,
    filters,
    isLoading,
    error,
    fetchTree,
    setFilters,
    resetFilters,
    toggleExpandNode,
    expandAll,
    collapseAll,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    convertTask,
  } = useTaskTreeStore();

  useEffect(() => {
    if (targetId) {
      fetchTree(targetId);
    }
  }, [targetId, fetchTree]);

  return {
    tree,
    expandedNodes,
    filters,
    isLoading,
    error,
    refetch: () => fetchTree(targetId),
    setFilters,
    resetFilters,
    toggleExpandNode,
    expandAll,
    collapseAll,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    convertTask,
  };
}

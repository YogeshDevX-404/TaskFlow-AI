import { useEffect } from 'react';
import { useDependencyStore } from '../store/useDependencyStore';
import { DependencyType } from '../types/hierarchy';

export function useDependencies(taskId?: string) {
  const {
    dependencies,
    isLoading,
    error,
    fetchDependencies,
    addDependency,
    removeDependency,
  } = useDependencyStore();

  useEffect(() => {
    if (taskId) {
      fetchDependencies(taskId);
    }
  }, [taskId, fetchDependencies]);

  return {
    dependencies,
    isLoading,
    error,
    refetch: () => taskId && fetchDependencies(taskId),
    addDependency: (targetTaskId: string, type: DependencyType) =>
      taskId && addDependency(taskId, targetTaskId, type),
    removeDependency: (dependencyId: string) =>
      taskId && removeDependency(taskId, dependencyId),
  };
}

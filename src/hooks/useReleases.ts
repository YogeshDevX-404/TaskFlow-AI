import { useEffect } from 'react';
import { useReleaseStore } from '../store/useReleaseStore';
import { ReleaseFilters } from '../types/release';

export const useReleases = (autoFetch: boolean = true) => {
  const store = useReleaseStore();

  useEffect(() => {
    if (autoFetch) {
      store.fetchReleases();
    }
  }, [autoFetch]);

  return {
    releases: store.releases,
    selectedRelease: store.selectedRelease,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,
    fetchReleases: store.fetchReleases,
    fetchReleaseById: store.fetchReleaseById,
    createRelease: store.createRelease,
    updateRelease: store.updateRelease,
    deleteRelease: store.deleteRelease,
    archiveRelease: store.archiveRelease,
    duplicateRelease: store.duplicateRelease,
    addTasksToRelease: store.addTasksToRelease,
    setSelectedRelease: store.setSelectedRelease,
    setFilters: (filters: Partial<ReleaseFilters>) => store.setFilters(filters),
    resetFilters: store.resetFilters,
  };
};

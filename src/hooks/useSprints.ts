import { useEffect } from 'react';
import { useSprintStore } from '../store/useSprintStore';
import { SprintFilters } from '../types/sprint';

export const useSprints = (initialFilters?: Partial<SprintFilters>) => {
  const {
    sprints,
    isLoading,
    error,
    filters,
    sort,
    fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
    archiveSprint,
    duplicateSprint,
    startSprint,
    completeSprint,
    cancelSprint,
    setFilters,
    setSort,
    resetFilters,
  } = useSprintStore();

  useEffect(() => {
    fetchSprints(initialFilters);
  }, [initialFilters?.projectId, initialFilters?.status]);

  return {
    sprints,
    isLoading,
    error,
    filters,
    sort,
    fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
    archiveSprint,
    duplicateSprint,
    startSprint,
    completeSprint,
    cancelSprint,
    setFilters,
    setSort,
    resetFilters,
  };
};

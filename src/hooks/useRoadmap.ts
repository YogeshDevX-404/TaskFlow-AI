import { useEffect } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { ReleaseFilters, RoadmapViewMode, RoadmapZoomLevel } from '../types/release';

export const useRoadmap = (autoFetch: boolean = true) => {
  const store = useRoadmapStore();

  useEffect(() => {
    if (autoFetch) {
      store.fetchRoadmapData();
    }
  }, [autoFetch]);

  return {
    roadmapData: store.roadmapData,
    viewMode: store.viewMode,
    zoomLevel: store.zoomLevel,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    fetchRoadmapData: store.fetchRoadmapData,
    setViewMode: (mode: RoadmapViewMode) => store.setViewMode(mode),
    setZoomLevel: (level: RoadmapZoomLevel) => store.setZoomLevel(level),
    setFilters: (filters: Partial<ReleaseFilters>) => store.setFilters(filters),
    resetFilters: store.resetFilters,
    updateReleaseTimelineDates: store.updateReleaseTimelineDates,
  };
};

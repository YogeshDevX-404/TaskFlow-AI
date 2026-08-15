import { useEffect } from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export function useProjectAnalytics(projectId: string) {
  const { analyticsData, isLoading, error, fetchProjectAnalytics } = useAnalyticsStore();

  useEffect(() => {
    if (projectId) {
      fetchProjectAnalytics(projectId);
    }
  }, [projectId, fetchProjectAnalytics]);

  return {
    analyticsData,
    isLoading,
    error,
    refresh: () => fetchProjectAnalytics(projectId),
  };
}

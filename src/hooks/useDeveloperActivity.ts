import { useQuery, useMutation } from '@tanstack/react-query';
import { activityAnalyticsService } from '../services/api/activityAnalyticsService';
import { ActivityAnalyticsFilters } from '../types/activityAnalytics';

export function useDeveloperActivityOverview(filters: ActivityAnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['developerActivityOverview', filters],
    queryFn: () => activityAnalyticsService.getOverview(filters),
    staleTime: 15000,
  });
}

export function useDeveloperLeaderboard(filters: ActivityAnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['developerLeaderboard', filters],
    queryFn: () => activityAnalyticsService.getDevelopers(filters),
    staleTime: 15000,
  });
}

export function useDeveloperDeepDive(userId: string | null, filters: ActivityAnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['developerDeepDive', userId, filters],
    queryFn: () => (userId ? activityAnalyticsService.getDeveloperDeepDive(userId, filters) : null),
    enabled: !!userId,
    staleTime: 15000,
  });
}

export function useRepositoryActivityAnalytics(filters: ActivityAnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['repositoryActivityAnalytics', filters],
    queryFn: () => activityAnalyticsService.getRepositoryAnalytics(filters),
    staleTime: 15000,
  });
}

export function useExportDeveloperActivity() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters: ActivityAnalyticsFilters; format: 'csv' | 'json' }) =>
      activityAnalyticsService.exportAnalytics(filters, format),
  });
}

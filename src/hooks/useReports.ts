import { useQuery } from '@tanstack/react-query';
import { ReportsService } from '../services/api/reportsService';
import { ReportFilterParams } from '../types/reports';

export function useExecutiveOverview(filters: ReportFilterParams) {
  return useQuery({
    queryKey: ['reports', 'overview', filters],
    queryFn: () => ReportsService.getExecutiveOverview(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProjectHealthReport(filters: ReportFilterParams) {
  return useQuery({
    queryKey: ['reports', 'projects', filters],
    queryFn: () => ReportsService.getProjectHealth(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTaskAnalyticsReport(filters: ReportFilterParams) {
  return useQuery({
    queryKey: ['reports', 'tasks', filters],
    queryFn: () => ReportsService.getTaskAnalytics(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeamPerformanceReport(filters: ReportFilterParams) {
  return useQuery({
    queryKey: ['reports', 'team', filters],
    queryFn: () => ReportsService.getTeamPerformance(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserReport(userId?: string, filters: ReportFilterParams = {}) {
  return useQuery({
    queryKey: ['reports', 'user', userId, filters],
    queryFn: () => ReportsService.getUserReport(userId, filters),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSprintReport(sprintId?: string, filters: ReportFilterParams = {}) {
  return useQuery({
    queryKey: ['reports', 'sprint', sprintId, filters],
    queryFn: () => ReportsService.getSprintReport(sprintId, filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSprintVelocityReport(limit = 5, filters: ReportFilterParams = {}) {
  return useQuery({
    queryKey: ['reports', 'velocity', limit, filters],
    queryFn: () => ReportsService.getSprintVelocity(limit, filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useActivityAnalyticsReport(filters: ReportFilterParams) {
  return useQuery({
    queryKey: ['reports', 'activity', filters],
    queryFn: () => ReportsService.getActivityAnalytics(filters),
    staleTime: 1000 * 60 * 2,
  });
}

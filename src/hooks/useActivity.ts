import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/api/activityService';
import { ActivityFilters } from '../types/activity';

export function useTaskActivity(taskId: string, filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ['taskActivity', taskId, filters],
    queryFn: () => activityService.getTaskActivity(taskId, filters),
    enabled: !!taskId,
    staleTime: 10000,
  });
}

export function useProjectActivity(projectId: string, filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ['projectActivity', projectId, filters],
    queryFn: () => activityService.getProjectActivity(projectId, filters),
    enabled: !!projectId,
    staleTime: 10000,
  });
}

export function useWorkspaceActivity(workspaceId: string, filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ['workspaceActivity', workspaceId, filters],
    queryFn: () => activityService.getWorkspaceActivity(workspaceId, filters),
    enabled: !!workspaceId,
    staleTime: 10000,
  });
}

export function useActivities(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.getActivities(filters),
    staleTime: 10000,
  });
}

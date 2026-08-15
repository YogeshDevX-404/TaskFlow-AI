import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkloadService } from '../services/api/workloadService';
import { WorkloadFilterParams, MemberCapacityConfig } from '../types/workload';

export function useWorkloadOverview(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'overview', filters],
    queryFn: () => WorkloadService.getWorkloadOverview(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeamWorkload(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'team', filters],
    queryFn: () => WorkloadService.getTeamWorkload(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMemberWorkload(userId?: string, filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'member', userId, filters],
    queryFn: () => WorkloadService.getMemberWorkload(userId!, filters),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProjectWorkload(projectId?: string, filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'project', projectId, filters],
    queryFn: () => WorkloadService.getProjectWorkload(projectId!, filters),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useWorkloadCalendar(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'calendar', filters],
    queryFn: () => WorkloadService.getWorkloadCalendar(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useOverloadedMembers(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'overloaded', filters],
    queryFn: () => WorkloadService.getOverloadedMembers(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpcomingWork(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'upcoming', filters],
    queryFn: () => WorkloadService.getUpcomingWork(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useOverdueWork(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'overdue', filters],
    queryFn: () => WorkloadService.getOverdueWork(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useWorkloadRecommendations(filters: WorkloadFilterParams = {}) {
  return useQuery({
    queryKey: ['workload', 'recommendations', filters],
    queryFn: () => WorkloadService.getWorkloadRecommendations(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMemberCapacity(userId?: string, organizationId?: string) {
  return useQuery({
    queryKey: ['workload', 'capacity', userId, organizationId],
    queryFn: () => WorkloadService.getMemberCapacity(userId!, organizationId),
    enabled: Boolean(userId),
  });
}

export function useUpdateMemberCapacity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      capacityData,
    }: {
      userId: string;
      capacityData: Partial<MemberCapacityConfig>;
    }) => WorkloadService.updateMemberCapacity(userId, capacityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload'] });
    },
  });
}

export function useBulkReassignTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      taskIds: string[];
      targetAssigneeId: string | null;
      organizationId?: string;
    }) => WorkloadService.reassignTasksBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workload'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

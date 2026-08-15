import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TimeEntryService } from '../services/api/timeEntryService';
import { useTimerStore } from '../store/useTimerStore';
import { TimeEntryFilterParams, WorkLogFormData } from '../types/timeEntry';
import { AxiosError } from 'axios';

/**
 * Fetch and manage currently active timer
 */
export function useActiveTimer() {
  const queryClient = useQueryClient();
  const { setActiveTimer, tick, activeTimer } = useTimerStore();

  const query = useQuery({
    queryKey: ['timeEntries', 'active'],
    queryFn: async () => {
      const timer = await TimeEntryService.getActiveTimer();
      setActiveTimer(timer);
      return timer;
    },
    staleTime: 1000 * 30, // 30s
    refetchOnWindowFocus: true,
  });

  // Ticker effect
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, tick]);

  return query;
}

/**
 * Hook to fetch paginated time entries list
 */
export function useTimeEntries(filters: TimeEntryFilterParams = {}) {
  return useQuery({
    queryKey: ['timeEntries', 'list', filters],
    queryFn: () => TimeEntryService.getTimeEntries(filters),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to fetch time reports
 */
export function useTimeReports(filters: TimeEntryFilterParams = {}) {
  return useQuery({
    queryKey: ['timeEntries', 'reports', filters],
    queryFn: () => TimeEntryService.getTimeReports(filters),
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to fetch timesheet entries
 */
export function useTimesheetData(filters: TimeEntryFilterParams = {}) {
  return useQuery({
    queryKey: ['timeEntries', 'timesheet', filters],
    queryFn: () => TimeEntryService.getTimesheet(filters),
    staleTime: 1000 * 30,
  });
}

/**
 * Start Timer Mutation
 */
export function useStartTimer() {
  const queryClient = useQueryClient();
  const { setActiveTimer, setConflictModal } = useTimerStore();

  return useMutation({
    mutationFn: (data: {
      taskId?: string;
      projectId?: string;
      workspaceId?: string;
      organizationId?: string;
      description?: string;
      isBillable?: boolean;
      billableRate?: number;
    }) => TimeEntryService.startTimer(data),
    onSuccess: (newTimer) => {
      setActiveTimer(newTimer);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: AxiosError<any>, variables) => {
      if (error.response?.status === 409 && error.response?.data?.error?.activeTimerConflict) {
        const activeTimer = error.response.data.error.activeTimer;
        setConflictModal(activeTimer, variables);
      }
    },
  });
}

/**
 * Pause Timer Mutation
 */
export function usePauseTimer() {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimerStore();

  return useMutation({
    mutationFn: (id: string) => TimeEntryService.pauseTimer(id),
    onSuccess: (pausedTimer) => {
      setActiveTimer(pausedTimer);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}

/**
 * Resume Timer Mutation
 */
export function useResumeTimer() {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimerStore();

  return useMutation({
    mutationFn: (id: string) => TimeEntryService.resumeTimer(id),
    onSuccess: (resumedTimer) => {
      setActiveTimer(resumedTimer);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}

/**
 * Stop Timer Mutation
 */
export function useStopTimer() {
  const queryClient = useQueryClient();
  const { clearTimer } = useTimerStore();

  return useMutation({
    mutationFn: ({ id, description }: { id: string; description?: string }) =>
      TimeEntryService.stopTimer(id, description),
    onSuccess: () => {
      clearTimer();
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Cancel Timer Mutation
 */
export function useCancelTimer() {
  const queryClient = useQueryClient();
  const { clearTimer } = useTimerStore();

  return useMutation({
    mutationFn: (id: string) => TimeEntryService.cancelTimer(id),
    onSuccess: () => {
      clearTimer();
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}

/**
 * Create Manual Work Log
 */
export function useCreateWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkLogFormData) => TimeEntryService.createWorkLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Update Time Entry
 */
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkLogFormData> }) =>
      TimeEntryService.updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Delete Time Entry
 */
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TimeEntryService.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

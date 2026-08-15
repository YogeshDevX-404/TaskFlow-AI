import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitHubIntegrationApiService,
  IFetchIssuesParams,
  IImportIssuePayload,
} from '../services/api/githubIntegrationService';

export function useGitHubIssues(connectionId: string | null, params?: IFetchIssuesParams) {
  return useQuery({
    queryKey: ['github-issues', connectionId, params],
    queryFn: () => GitHubIntegrationApiService.getIssues(connectionId!, params),
    enabled: !!connectionId,
    staleTime: 30000,
  });
}

export function useGitHubIssueDetails(connectionId: string | null, issueNumber: number | null) {
  return useQuery({
    queryKey: ['github-issue-details', connectionId, issueNumber],
    queryFn: () => GitHubIntegrationApiService.getIssueDetails(connectionId!, issueNumber!),
    enabled: !!connectionId && !!issueNumber,
    staleTime: 30000,
  });
}

export function useTaskGitHubIssue(taskId: string | null | undefined) {
  return useQuery({
    queryKey: ['task-github-issue', taskId],
    queryFn: () => GitHubIntegrationApiService.getTaskIssueMapping(taskId!),
    enabled: !!taskId,
    staleTime: 15000,
  });
}

export function useImportGitHubIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IImportIssuePayload) =>
      GitHubIntegrationApiService.importIssueAsTask(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github-issues', variables.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.projectId] });
    },
  });
}

export function useLinkGitHubIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      connectionId,
      issueNumber,
    }: {
      taskId: string;
      connectionId: string;
      issueNumber: number;
    }) => GitHubIntegrationApiService.linkTaskToIssue(taskId, connectionId, issueNumber),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github-issues', variables.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['task-github-issue', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });
}

export function useUnlinkGitHubIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => GitHubIntegrationApiService.unlinkTaskFromIssue(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
      queryClient.invalidateQueries({ queryKey: ['task-github-issue', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', taskId] });
    },
  });
}

export function useCreateGitHubIssueFromTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      connectionId,
      payload,
    }: {
      taskId: string;
      connectionId: string;
      payload?: { customTitle?: string; customBody?: string; labels?: string[] };
    }) => GitHubIntegrationApiService.createIssueFromTask(taskId, connectionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github-issues', variables.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['task-github-issue', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });
}

export function useSyncGitHubIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => GitHubIntegrationApiService.syncTaskIssue(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task-github-issue', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', taskId] });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    },
  });
}

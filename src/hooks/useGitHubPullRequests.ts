import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitHubIntegrationApiService,
  IFetchPullRequestsParams,
  ICreatePullRequestPayload,
} from '../services/api/githubIntegrationService';

export function useGitHubPullRequests(connectionId: string | null, params?: IFetchPullRequestsParams) {
  return useQuery({
    queryKey: ['github-pull-requests', connectionId, params],
    queryFn: () => GitHubIntegrationApiService.getPullRequests(connectionId!, params),
    enabled: !!connectionId,
    staleTime: 30000,
  });
}

export function useGitHubPullRequestDetails(connectionId: string | null, prNumber: number | null) {
  return useQuery({
    queryKey: ['github-pr-details', connectionId, prNumber],
    queryFn: () => GitHubIntegrationApiService.getPullRequestDetails(connectionId!, prNumber!),
    enabled: !!connectionId && !!prNumber,
    staleTime: 30000,
  });
}

export function useGitHubPullRequestFiles(connectionId: string | null, prNumber: number | null) {
  return useQuery({
    queryKey: ['github-pr-files', connectionId, prNumber],
    queryFn: () => GitHubIntegrationApiService.getPullRequestFiles(connectionId!, prNumber!),
    enabled: !!connectionId && !!prNumber,
    staleTime: 30000,
  });
}

export function useGitHubPullRequestCommits(connectionId: string | null, prNumber: number | null) {
  return useQuery({
    queryKey: ['github-pr-commits', connectionId, prNumber],
    queryFn: () => GitHubIntegrationApiService.getPullRequestCommits(connectionId!, prNumber!),
    enabled: !!connectionId && !!prNumber,
    staleTime: 30000,
  });
}

export function useGitHubPullRequestReviews(connectionId: string | null, prNumber: number | null) {
  return useQuery({
    queryKey: ['github-pr-reviews', connectionId, prNumber],
    queryFn: () => GitHubIntegrationApiService.getPullRequestReviews(connectionId!, prNumber!),
    enabled: !!connectionId && !!prNumber,
    staleTime: 30000,
  });
}

export function useTaskPullRequests(taskId: string | null | undefined) {
  return useQuery({
    queryKey: ['task-pull-requests', taskId],
    queryFn: () => GitHubIntegrationApiService.getTaskPullRequests(taskId!),
    enabled: !!taskId,
    staleTime: 15000,
  });
}

export function useLinkTaskPullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      connectionId,
      prNumber,
    }: {
      taskId: string;
      connectionId: string;
      prNumber: number;
    }) => GitHubIntegrationApiService.linkTaskPullRequest(taskId, connectionId, prNumber),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-pull-requests', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['github-pull-requests', variables.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });
}

export function useUnlinkTaskPullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, prId }: { taskId: string; prId: string }) =>
      GitHubIntegrationApiService.unlinkTaskPullRequest(taskId, prId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-pull-requests', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['github-pull-requests'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });
}

export function useCreateTaskPullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: ICreatePullRequestPayload }) =>
      GitHubIntegrationApiService.createTaskPullRequest(taskId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-pull-requests', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['github-pull-requests', variables.payload.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });
}

export function useSyncPullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, prNumber }: { connectionId: string; prNumber: number }) =>
      GitHubIntegrationApiService.syncPullRequest(connectionId, prNumber),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github-pull-requests', variables.connectionId] });
      queryClient.invalidateQueries({ queryKey: ['github-pr-details', variables.connectionId, variables.prNumber] });
      queryClient.invalidateQueries({ queryKey: ['task-pull-requests'] });
    },
  });
}

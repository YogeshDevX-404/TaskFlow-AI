import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitHubIntegrationApiService,
  IGitHubConnectionDetailsResponse,
  IGitHubSyncStatusResponse,
  IGitHubSyncHistoryRecord,
  IGitHubRepoConnection,
} from '../services/api/githubIntegrationService';
import { useToast } from '../providers/ToastProvider';

export const GITHUB_KEYS = {
  connectionDetails: (connectionId: string) => ['github', 'connection', connectionId] as const,
  syncStatus: (connectionId: string) => ['github', 'sync-status', connectionId] as const,
  syncHistory: (connectionId: string) => ['github', 'sync-history', connectionId] as const,
  projectRepos: (projectId: string) => ['github', 'project-repos', projectId] as const,
};

/**
 * Hook to fetch GitHub repository connection details & health
 */
export function useGitHubRepositoryDetails(connectionId?: string) {
  return useQuery<IGitHubConnectionDetailsResponse, Error>({
    queryKey: GITHUB_KEYS.connectionDetails(connectionId || ''),
    queryFn: () => GitHubIntegrationApiService.getConnectionDetails(connectionId!),
    enabled: !!connectionId,
    staleTime: 30000,
  });
}

/**
 * Hook to poll repository sync status
 */
export function useRepositorySyncStatus(connectionId?: string, isSyncing = false) {
  return useQuery<IGitHubSyncStatusResponse, Error>({
    queryKey: GITHUB_KEYS.syncStatus(connectionId || ''),
    queryFn: () => GitHubIntegrationApiService.getSyncStatus(connectionId!),
    enabled: !!connectionId,
    refetchInterval: isSyncing ? 3000 : false,
  });
}

/**
 * Hook to fetch sync execution history logs
 */
export function useRepositorySyncHistory(connectionId?: string, limit = 20) {
  return useQuery<IGitHubSyncHistoryRecord[], Error>({
    queryKey: GITHUB_KEYS.syncHistory(connectionId || ''),
    queryFn: () => GitHubIntegrationApiService.getSyncHistory(connectionId!, limit),
    enabled: !!connectionId,
  });
}

/**
 * Hook to trigger manual repository re-sync
 */
export function useSyncRepositoryMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    IGitHubRepoConnection,
    Error,
    { connectionId: string; projectId?: string }
  >({
    mutationFn: ({ connectionId }) =>
      GitHubIntegrationApiService.syncConnection(connectionId),

    onSuccess: (updatedConnection, variables) => {
      const connId = variables.connectionId;

      // Invalidate relevant TanStack Query caches
      queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.connectionDetails(connId) });
      queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.syncStatus(connId) });
      queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.syncHistory(connId) });

      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.projectRepos(variables.projectId) });
      }

      toast({
        title: 'Repository Synchronized',
        description: `Successfully updated metadata for ${updatedConnection.fullName}.`,
        type: 'success',
      });
    },

    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to sync repository.';
      toast({
        title: 'Sync Failed',
        description: msg,
        type: 'error',
      });
    },
  });
}

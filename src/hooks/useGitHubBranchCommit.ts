import { useQuery } from '@tanstack/react-query';
import {
  GitHubIntegrationApiService,
  IFetchBranchesParams,
  IPaginatedBranchesResponse,
  IGitHubBranchData,
  IFetchCommitsParams,
  IPaginatedCommitsResponse,
  IGitHubCommitData,
  IGitHubCommitCompareData,
} from '../services/api/githubIntegrationService';

export const GITHUB_BRANCH_COMMIT_KEYS = {
  branches: (connectionId: string, params?: IFetchBranchesParams) =>
    ['github', 'branches', connectionId, params] as const,
  branchDetails: (connectionId: string, branchName: string) =>
    ['github', 'branch-details', connectionId, branchName] as const,
  commits: (connectionId: string, params?: IFetchCommitsParams) =>
    ['github', 'commits', connectionId, params] as const,
  commitDetails: (connectionId: string, sha: string) =>
    ['github', 'commit-details', connectionId, sha] as const,
  compare: (connectionId: string, base: string, head: string) =>
    ['github', 'compare', connectionId, base, head] as const,
  taskCommits: (taskId: string) =>
    ['github', 'task-commits', taskId] as const,
};

/**
  Hook to fetch repository branches with search, filters, sorting, and pagination
 */
export function useGitHubBranches(connectionId?: string, params?: IFetchBranchesParams) {
  return useQuery<IPaginatedBranchesResponse, Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.branches(connectionId || '', params),
    queryFn: () => GitHubIntegrationApiService.getBranches(connectionId!, params),
    enabled: !!connectionId,
    staleTime: 30000,
  });
}

/**
  Hook to fetch details for a specific branch
 */
export function useGitHubBranchDetails(connectionId?: string, branchName?: string) {
  return useQuery<IGitHubBranchData, Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.branchDetails(connectionId || '', branchName || ''),
    queryFn: () => GitHubIntegrationApiService.getBranchDetails(connectionId!, branchName!),
    enabled: !!connectionId && !!branchName,
    staleTime: 30000,
  });
}

/**
  Hook to fetch repository commits with search, filters, sorting, and pagination
 */
export function useGitHubCommits(connectionId?: string, params?: IFetchCommitsParams) {
  return useQuery<IPaginatedCommitsResponse, Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.commits(connectionId || '', params),
    queryFn: () => GitHubIntegrationApiService.getCommits(connectionId!, params),
    enabled: !!connectionId,
    staleTime: 20000,
  });
}

/**
  Hook to fetch single commit details including stats and file diffs
 */
export function useGitHubCommitDetails(connectionId?: string, sha?: string) {
  return useQuery<IGitHubCommitData, Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.commitDetails(connectionId || '', sha || ''),
    queryFn: () => GitHubIntegrationApiService.getCommitDetails(connectionId!, sha!),
    enabled: !!connectionId && !!sha,
    staleTime: 60000,
  });
}

/**
  Hook to compare two commits or branches
 */
export function useCompareCommits(connectionId?: string, base?: string, head?: string) {
  return useQuery<IGitHubCommitCompareData, Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.compare(connectionId || '', base || '', head || ''),
    queryFn: () => GitHubIntegrationApiService.compareCommits(connectionId!, base!, head!),
    enabled: !!connectionId && !!base && !!head,
    staleTime: 30000,
  });
}

/**
  Hook to fetch commits associated with a TaskFlow task
 */
export function useTaskCommits(taskId?: string) {
  return useQuery<IGitHubCommitData[], Error>({
    queryKey: GITHUB_BRANCH_COMMIT_KEYS.taskCommits(taskId || ''),
    queryFn: () => GitHubIntegrationApiService.getTaskCommits(taskId!),
    enabled: !!taskId,
    staleTime: 15000,
  });
}

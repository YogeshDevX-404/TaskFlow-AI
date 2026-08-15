import { axiosInstance } from './axiosInstance';

export interface IGitHubConnectionData {
  id: string;
  userId: string;
  githubUserId: string;
  githubUsername: string;
  githubName: string;
  githubAvatarUrl: string;
  githubProfileUrl: string;
  githubEmail: string;
  scope: string;
  status: 'Connected' | 'Disconnected' | 'Connection Failed' | 'Revoked' | 'Expired/Invalid';
  connectedAt: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubProfileData {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  email: string | null;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
}

export interface IGitHubStatusResponse {
  connected: boolean;
  connection: IGitHubConnectionData | null;
}

export interface IGitHubOrg {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  description: string;
  html_url: string;
  type: 'Organization' | 'User';
  public_repos?: number;
  isPersonal?: boolean;
}

export interface IGitHubRepoOwner {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface IGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: IGitHubRepoOwner;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  default_branch: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  archived: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
}

export interface IGitHubRepoConnection {
  id: string;
  organizationId: string;
  workspaceId: string;
  projectId: string;
  githubConnectionId: string;
  githubRepositoryId: string;
  githubOwner: string;
  githubOwnerId?: string;
  repositoryName: string;
  fullName: string;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  defaultBranch: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  watchersCount?: number;
  openIssuesCount: number;
  htmlUrl: string;
  cloneUrl?: string;
  sshUrl?: string;
  isArchived: boolean;
  isFork: boolean;
  isDisabled?: boolean;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
  githubPushedAt?: string;
  connectedBy: string;
  connectedAt: string;
  lastSyncedAt: string;
  syncStartedAt?: string;
  syncCompletedAt?: string;
  syncError?: string | null;
  syncVersion?: number;
  syncDuration?: number;
  status: 'Never Synced' | 'Syncing' | 'Synced' | 'Connected' | 'Disconnected' | 'Sync Failed' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubConnectionDetailsResponse {
  connection: IGitHubRepoConnection;
  health: {
    isHealthy: boolean;
    status: string;
    rateLimitInfo: { remaining: number; limit: number; resetsAt: string };
    lastSyncedAgo: string;
    syncDurationMs: number;
    syncVersion: number;
  };
}

export interface IGitHubSyncStatusResponse {
  connectionId: string;
  status: string;
  isSyncing: boolean;
  lastSyncedAt?: string;
  syncStartedAt?: string;
  syncCompletedAt?: string;
  syncDuration: number;
  syncVersion: number;
  syncError?: string | null;
}

export interface IGitHubSyncHistoryRecord {
  id: string;
  connectionId: string;
  projectId: string;
  organizationId: string;
  triggeredBy: string;
  triggeredByName?: string;
  status: 'Synced' | 'Sync Failed';
  syncStartedAt: string;
  syncCompletedAt: string;
  durationMs: number;
  changesDetected: string[];
  error?: string | null;
  createdAt: string;
}

export interface IGitHubIssueLabel {
  id?: number;
  name: string;
  color?: string;
  description?: string;
}

export interface IGitHubIssueUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface IGitHubIssueMapping {
  id: string;
  organization: string;
  workspace: string;
  project: string;
  repositoryConnection: string;
  task: string;
  githubIssueId: number;
  githubIssueNumber: number;
  githubNodeId?: string;
  githubTitle: string;
  githubBody: string;
  githubState: 'open' | 'closed';
  githubStateReason?: string | null;
  githubAuthor: string;
  githubAuthorAvatar?: string;
  githubUrl: string;
  githubLabels: IGitHubIssueLabel[];
  githubAssignees: string[];
  githubCommentsCount: number;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
  githubClosedAt?: string | null;
  relationshipType: 'Imported From GitHub' | 'Linked To GitHub' | 'Created From TaskFlow';
  lastSyncedAt: string;
  syncStatus: 'Synced' | 'Sync Failed' | 'Pending';
  syncError?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubIssue {
  id: number;
  number: number;
  node_id?: string;
  title: string;
  body: string;
  state: 'open' | 'closed';
  state_reason?: string | null;
  user: IGitHubIssueUser;
  labels: IGitHubIssueLabel[];
  assignees: IGitHubIssueUser[];
  comments: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  mappingInfo?: {
    isImported: boolean;
    mappingId?: string;
    taskId?: string;
    taskKey?: string;
    relationshipType?: string;
    syncStatus?: string;
    lastSyncedAt?: string;
  };
}

export interface IFetchIssuesParams {
  state?: 'open' | 'closed' | 'all';
  search?: string;
  label?: string;
  author?: string;
  assignee?: string;
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IPaginatedIssuesResponse {
  issues: IGitHubIssue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IImportIssuePayload {
  connectionId: string;
  issueNumber: number;
  projectId: string;
  statusMapping?: { open?: string; closed?: string };
  customTitle?: string;
  customDescription?: string;
}

export interface IFetchRepositoriesParams {
  org?: string;
  owner?: string;
  search?: string;
  visibility?: 'all' | 'public' | 'private' | 'internal';
  language?: string;
  archived?: boolean;
  fork?: boolean;
  sort?: 'updated' | 'created' | 'stars' | 'forks' | 'name';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IPaginatedRepositoriesResponse {
  repositories: IGitHubRepo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGitHubBranchData {
  name: string;
  protected: boolean;
  isDefault: boolean;
  commit: {
    sha: string;
    shortSha: string;
    url: string;
    message?: string;
    authorName?: string;
    authorEmail?: string;
    authorLogin?: string;
    authorAvatarUrl?: string;
    committedAt?: string;
  };
  html_url?: string;
}

export interface IFetchBranchesParams {
  search?: string;
  filter?: 'default' | 'protected' | 'unprotected' | 'all';
  protected?: boolean;
  sort?: 'name' | 'updated';
  page?: number;
  limit?: number;
}

export interface IPaginatedBranchesResponse {
  branches: IGitHubBranchData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGitHubCommitFileData {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface IGitHubCommitData {
  sha: string;
  shortSha: string;
  message: string;
  author: {
    name: string;
    email: string | null;
    login: string;
    avatar_url: string;
    date: string;
  };
  committer: {
    name: string;
    email: string | null;
    login: string;
    avatar_url: string;
    date: string;
  };
  html_url: string;
  branchName?: string;
  committedAt: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: IGitHubCommitFileData[];
  relatedTask?: {
    id: string;
    taskKey: string;
    title: string;
    status: string;
  } | null;
  relatedIssue?: {
    issueNumber: number;
    title: string;
    state: string;
    url: string;
  } | null;
}

export interface IFetchCommitsParams {
  branch?: string;
  author?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: 'newest' | 'oldest' | 'author';
  page?: number;
  limit?: number;
}

export interface IPaginatedCommitsResponse {
  commits: IGitHubCommitData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGitHubCommitCompareData {
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: IGitHubCommitData[];
  files?: IGitHubCommitFileData[];
}

export interface IGitHubPullRequestUser {
  login: string;
  name?: string;
  avatar_url: string;
  html_url?: string;
}

export interface IGitHubPullRequestReviewData {
  id: number;
  user: IGitHubPullRequestUser;
  body?: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING' | string;
  html_url?: string;
  submitted_at?: string;
}

export interface IGitHubPullRequestFileData {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url?: string;
  raw_url?: string;
  contents_url?: string;
  patch?: string;
  previous_filename?: string;
}

export type GitHubPRReviewStatus = 'Pending' | 'Approved' | 'Changes Requested' | 'Mixed' | 'Merged' | 'Closed';

export interface IGitHubPullRequestData {
  id: string;
  organization?: string;
  workspace?: string;
  project?: string;
  repositoryConnection?: string;
  task?: string | null;
  githubIssue?: string | null;
  githubPullRequestId: number;
  githubPullRequestNumber: number;
  nodeId?: string;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  stateReason?: string | null;
  draft: boolean;
  merged: boolean;
  mergeable?: boolean;
  author: IGitHubPullRequestUser;
  reviewers: Array<{
    login: string;
    name?: string;
    avatar_url: string;
    state: string;
  }>;
  reviewStatus: GitHubPRReviewStatus;
  sourceBranch: string;
  targetBranch: string;
  sourceSha?: string;
  targetSha?: string;
  githubUrl: string;
  createdAtGithub?: string;
  updatedAtGithub?: string;
  closedAtGithub?: string | null;
  mergedAtGithub?: string | null;
  lastSyncedAt?: string;
  syncStatus?: 'Synced' | 'Sync Failed' | 'Pending';
  syncError?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFetchPullRequestsParams {
  state?: 'open' | 'closed' | 'merged' | 'all';
  author?: string;
  reviewer?: string;
  assignee?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  merged?: boolean;
  search?: string;
  sort?: 'created' | 'updated' | 'popularity';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IPaginatedPullRequestsResponse {
  pullRequests: IGitHubPullRequestData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICreatePullRequestPayload {
  connectionId: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  body?: string;
  draft?: boolean;
}

export class GitHubIntegrationApiService {
  /**
   * Get GitHub OAuth connect authorization URL
   */
  public static async getConnectUrl(): Promise<{ url: string; state: string }> {
    const response = await axiosInstance.get('/integrations/github/connect');
    return response.data.data;
  }

  /**
   * Get connection status for current user
   */
  public static async getStatus(): Promise<IGitHubStatusResponse> {
    const response = await axiosInstance.get('/integrations/github/status');
    return response.data.data;
  }

  /**
   * Get authenticated GitHub profile details
   */
  public static async getProfile(): Promise<IGitHubProfileData> {
    const response = await axiosInstance.get('/integrations/github/profile');
    return response.data.data;
  }

  /**
   * Disconnect GitHub connection
   */
  public static async disconnect(): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete('/integrations/github');
    return response.data;
  }

  /**
   * Get organizations accessible to the authenticated user
   */
  public static async getOrganizations(): Promise<IGitHubOrg[]> {
    const response = await axiosInstance.get('/integrations/github/organizations');
    return response.data.data;
  }

  /**
   * Get repositories with search, filter, and pagination
   */
  public static async getRepositories(params?: IFetchRepositoriesParams): Promise<IPaginatedRepositoriesResponse> {
    const response = await axiosInstance.get('/integrations/github/repositories', { params });
    return response.data.data;
  }

  /**
   * Get single repository details
   */
  public static async getRepositoryDetails(owner: string, repo: string): Promise<IGitHubRepo> {
    const response = await axiosInstance.get(`/integrations/github/repositories/${owner}/${repo}`);
    return response.data.data;
  }

  /**
   * Connect a repository to a TaskFlow project
   */
  public static async connectProjectRepository(
    projectId: string,
    owner: string,
    repo: string,
    organizationId?: string
  ): Promise<IGitHubRepoConnection> {
    const response = await axiosInstance.post(`/integrations/github/projects/${projectId}/repositories`, {
      owner,
      repo,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Get connected repositories for a project
   */
  public static async getProjectRepositories(projectId: string): Promise<IGitHubRepoConnection[]> {
    const response = await axiosInstance.get(`/integrations/github/projects/${projectId}/repositories`);
    return response.data.data;
  }

  /**
   * Re-sync a connected repository
   */
  public static async syncProjectRepository(
    projectId: string,
    connectionId: string
  ): Promise<IGitHubRepoConnection> {
    const response = await axiosInstance.post(
      `/integrations/github/projects/${projectId}/repositories/${connectionId}/sync`
    );
    return response.data.data;
  }

  /**
   * Get repository connection details and health indicators by connection ID
   */
  public static async getConnectionDetails(connectionId: string): Promise<IGitHubConnectionDetailsResponse> {
    const response = await axiosInstance.get(`/integrations/github/connections/${connectionId}`);
    return response.data.data;
  }

  /**
   * Sync repository connection by connection ID
   */
  public static async syncConnection(connectionId: string): Promise<IGitHubRepoConnection> {
    const response = await axiosInstance.post(`/integrations/github/connections/${connectionId}/sync`);
    return response.data.data;
  }

  /**
   * Get sync status by connection ID
   */
  public static async getSyncStatus(connectionId: string): Promise<IGitHubSyncStatusResponse> {
    const response = await axiosInstance.get(`/integrations/github/connections/${connectionId}/sync-status`);
    return response.data.data;
  }

  /**
   * Get sync history records for a repository connection
   */
  public static async getSyncHistory(connectionId: string, limit = 20): Promise<IGitHubSyncHistoryRecord[]> {
    const response = await axiosInstance.get(`/integrations/github/connections/${connectionId}/sync-history`, {
      params: { limit },
    });
    return response.data.data;
  }

  /**
   * Disconnect a repository from a project
   */
  public static async disconnectProjectRepository(
    projectId: string,
    connectionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(
      `/integrations/github/projects/${projectId}/repositories/${connectionId}`
    );
    return response.data;
  }

  /**
   * Get issues for a repository connection
   */
  public static async getIssues(
    connectionId: string,
    params?: IFetchIssuesParams
  ): Promise<IPaginatedIssuesResponse> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/issues`,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get single GitHub issue details
   */
  public static async getIssueDetails(
    connectionId: string,
    issueNumber: number
  ): Promise<{ issue: IGitHubIssue; mapping?: IGitHubIssueMapping; linkedTask?: any }> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/issues/${issueNumber}`
    );
    return response.data.data;
  }

  /**
   * Import GitHub Issue as TaskFlow Task
   */
  public static async importIssueAsTask(
    payload: IImportIssuePayload
  ): Promise<{ task: any; mapping: IGitHubIssueMapping }> {
    const response = await axiosInstance.post('/integrations/github/issues/import', payload);
    return response.data.data;
  }

  /**
   * Link existing Task to GitHub Issue
   */
  public static async linkTaskToIssue(
    taskId: string,
    connectionId: string,
    issueNumber: number
  ): Promise<{ task: any; mapping: IGitHubIssueMapping }> {
    const response = await axiosInstance.post(`/tasks/${taskId}/github-issue/link`, {
      connectionId,
      issueNumber,
    });
    return response.data.data;
  }

  /**
   * Unlink GitHub Issue from Task
   */
  public static async unlinkTaskFromIssue(
    taskId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/tasks/${taskId}/github-issue`);
    return response.data;
  }

  /**
   * Create GitHub Issue from TaskFlow Task
   */
  public static async createIssueFromTask(
    taskId: string,
    connectionId: string,
    payload?: { customTitle?: string; customBody?: string; labels?: string[] }
  ): Promise<{ task: any; issue: IGitHubIssue; mapping: IGitHubIssueMapping }> {
    const response = await axiosInstance.post(`/tasks/${taskId}/github-issue/create`, {
      connectionId,
      ...payload,
    });
    return response.data.data;
  }

  /**
   * Sync Task's GitHub Issue metadata
   */
  public static async syncTaskIssue(
    taskId: string
  ): Promise<{ mapping: IGitHubIssueMapping; task: any }> {
    const response = await axiosInstance.post(`/tasks/${taskId}/github-issue/sync`);
    return response.data.data;
  }

  /**
   * Get Task's linked GitHub Issue mapping
   */
  public static async getTaskIssueMapping(
    taskId: string
  ): Promise<{ mapping: IGitHubIssueMapping | null; repository?: { owner: string; name: string } }> {
    const response = await axiosInstance.get(`/tasks/${taskId}/github-issue`);
    return response.data.data;
  }

  /**
   * Get repository branches for a connection
   */
  public static async getBranches(
    connectionId: string,
    params?: IFetchBranchesParams
  ): Promise<IPaginatedBranchesResponse> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/branches`,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get single branch details
   */
  public static async getBranchDetails(
    connectionId: string,
    branchName: string
  ): Promise<IGitHubBranchData> {
    const encodedBranch = encodeURIComponent(branchName);
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/branches/${encodedBranch}`
    );
    return response.data.data;
  }

  /**
   * Get repository commits for a connection
   */
  public static async getCommits(
    connectionId: string,
    params?: IFetchCommitsParams
  ): Promise<IPaginatedCommitsResponse> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/commits`,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get single commit details
   */
  public static async getCommitDetails(
    connectionId: string,
    sha: string
  ): Promise<IGitHubCommitData> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/commits/${sha}`
    );
    return response.data.data;
  }

  /**
   * Compare two branches or commits
   */
  public static async compareCommits(
    connectionId: string,
    base: string,
    head: string
  ): Promise<IGitHubCommitCompareData> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/compare`,
      { params: { base, head } }
    );
    return response.data.data;
  }

  /**
   * Get commits related to a TaskFlow task
   */
  public static async getTaskCommits(taskId: string): Promise<IGitHubCommitData[]> {
    const response = await axiosInstance.get(`/tasks/${taskId}/github-commits`);
    return response.data.data;
  }

  /**
   * Get pull requests for a repository connection
   */
  public static async getPullRequests(
    connectionId: string,
    params?: IFetchPullRequestsParams
  ): Promise<IPaginatedPullRequestsResponse> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/pull-requests`,
      { params }
    );
    return response.data;
  }

  /**
   * Get details of a single pull request
   */
  public static async getPullRequestDetails(
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestData> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/pull-requests/${prNumber}`
    );
    return response.data.pullRequest;
  }

  /**
   * Get files changed in a pull request
   */
  public static async getPullRequestFiles(
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestFileData[]> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/pull-requests/${prNumber}/files`
    );
    return response.data.files;
  }

  /**
   * Get commits in a pull request
   */
  public static async getPullRequestCommits(
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubCommitData[]> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/pull-requests/${prNumber}/commits`
    );
    return response.data.commits;
  }

  /**
   * Get reviews for a pull request
   */
  public static async getPullRequestReviews(
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestReviewData[]> {
    const response = await axiosInstance.get(
      `/integrations/github/connections/${connectionId}/pull-requests/${prNumber}/reviews`
    );
    return response.data.reviews;
  }

  /**
   * Manually sync pull request state
   */
  public static async syncPullRequest(
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestData> {
    const response = await axiosInstance.post(
      `/integrations/github/connections/${connectionId}/pull-requests/${prNumber}/sync`
    );
    return response.data.pullRequest;
  }

  /**
   * Link an existing pull request to a task
   */
  public static async linkTaskPullRequest(
    taskId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestData> {
    const response = await axiosInstance.post(`/tasks/${taskId}/github-pull-requests/link`, {
      connectionId,
      prNumber,
    });
    return response.data.pullRequest;
  }

  /**
   * Unlink a pull request from a task
   */
  public static async unlinkTaskPullRequest(
    taskId: string,
    prId: string
  ): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/tasks/${taskId}/github-pull-requests/${prId}`);
    return response.data;
  }

  /**
   * Create a new pull request on GitHub from a task
   */
  public static async createTaskPullRequest(
    taskId: string,
    payload: ICreatePullRequestPayload
  ): Promise<IGitHubPullRequestData> {
    const response = await axiosInstance.post(`/tasks/${taskId}/github-pull-requests/create`, payload);
    return response.data.pullRequest;
  }

  /**
   * Get pull requests linked to a task
   */
  public static async getTaskPullRequests(taskId: string): Promise<IGitHubPullRequestData[]> {
    const response = await axiosInstance.get(`/tasks/${taskId}/github-pull-requests`);
    return response.data.pullRequests;
  }

  /**
   * Get repository webhook health and connection status
   */
  public static async getWebhookStatus(connectionId: string): Promise<any> {
    const response = await axiosInstance.get(`/integrations/github/connections/${connectionId}/webhook-status`);
    return response.data.data;
  }

  /**
   * Register/enable webhook on GitHub for a repository connection
   */
  public static async registerWebhook(connectionId: string): Promise<any> {
    const response = await axiosInstance.post(`/integrations/github/connections/${connectionId}/webhook/register`);
    return response.data;
  }

  /**
   * Unregister/disable webhook on GitHub for a repository connection
   */
  public static async unregisterWebhook(connectionId: string): Promise<any> {
    const response = await axiosInstance.delete(`/integrations/github/connections/${connectionId}/webhook/unregister`);
    return response.data;
  }

  /**
   * Get audit log of incoming webhook deliveries
   */
  public static async getWebhookDeliveries(params?: {
    repositoryConnectionId?: string;
    eventType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await axiosInstance.get('/integrations/github/webhooks/deliveries', { params });
    return response.data.data;
  }
}

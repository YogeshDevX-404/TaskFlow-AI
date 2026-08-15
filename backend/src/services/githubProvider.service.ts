import { config } from '../config/env.config';
import {
  GitHubApiService,
  IGitHubUserProfile,
  IGitHubOrg,
  IGitHubRepo,
  IFetchRepositoriesOptions,
  IGitHubTokenResponse,
  IGitHubIssue,
  IFetchIssuesOptions,
  ICreateIssueOptions,
  IFetchBranchesOptions,
  IGitHubBranch,
  IFetchCommitsOptions,
  IGitHubCommit,
  IGitHubCommitCompare,
  IGitHubPullRequest,
  IGitHubPullRequestFile,
  IGitHubPullRequestReview,
  IFetchPullRequestsOptions,
  ICreatePullRequestOptions,
  IUpdatePullRequestOptions,
} from './githubApi.service';
import { MockGitHubProvider } from './mockGithub.provider';

export class GitHubProvider {
  /**
   * Determine if mock mode is active for GitHub operations
   */
  public static isMockMode(token?: string): boolean {
    if (config.githubMockMode) {
      return true;
    }
    if (token && token.startsWith('mock_')) {
      return true;
    }
    return false;
  }

  /**
   * Exchange code for access token
   */
  public static async exchangeCodeForToken(code: string, state: string): Promise<IGitHubTokenResponse> {
    if (this.isMockMode()) {
      return MockGitHubProvider.exchangeCodeForToken(code, state);
    }
    return GitHubApiService.exchangeCodeForToken(code, state);
  }

  /**
   * Get authenticated user profile
   */
  public static async getAuthenticatedUser(accessToken: string): Promise<IGitHubUserProfile> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchUserProfile(accessToken);
    }
    return GitHubApiService.fetchGitHubUserProfile(accessToken);
  }

  /**
   * Get organizations accessible to connected user
   */
  public static async getOrganizations(accessToken: string): Promise<IGitHubOrg[]> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchOrganizations(accessToken);
    }
    return GitHubApiService.fetchOrganizations(accessToken);
  }

  /**
   * Get repositories with search, filters, sorting, and pagination
   */
  public static async getRepositories(
    accessToken: string,
    options: IFetchRepositoriesOptions = {}
  ): Promise<{
    repositories: IGitHubRepo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchRepositories(accessToken, options);
    }
    return GitHubApiService.fetchRepositories(accessToken, options);
  }

  /**
   * Get repository details
   */
  public static async getRepository(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<IGitHubRepo> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchRepositoryDetails(accessToken, owner, repo);
    }
    return GitHubApiService.fetchRepositoryDetails(accessToken, owner, repo);
  }

  /**
   * Get issues for a repository
   */
  public static async getIssues(
    accessToken: string,
    owner: string,
    repo: string,
    options: IFetchIssuesOptions = {}
  ): Promise<{
    issues: IGitHubIssue[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchIssues(accessToken, owner, repo, options);
    }
    return GitHubApiService.fetchIssues(accessToken, owner, repo, options);
  }

  /**
   * Get issue details
   */
  public static async getIssue(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<IGitHubIssue> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchIssueDetails(accessToken, owner, repo, issueNumber);
    }
    return GitHubApiService.fetchIssueDetails(accessToken, owner, repo, issueNumber);
  }

  /**
   * Create issue on GitHub
   */
  public static async createIssue(
    accessToken: string,
    owner: string,
    repo: string,
    payload: ICreateIssueOptions
  ): Promise<IGitHubIssue> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.createIssue(accessToken, owner, repo, payload);
    }
    return GitHubApiService.createIssue(accessToken, owner, repo, payload);
  }

  /**
   * Get branches for a repository
   */
  public static async getBranches(
    accessToken: string,
    owner: string,
    repo: string,
    options: IFetchBranchesOptions = {}
  ): Promise<{
    branches: IGitHubBranch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchBranches(accessToken, owner, repo, options);
    }
    return GitHubApiService.fetchBranches(accessToken, owner, repo, options);
  }

  /**
   * Get single branch details
   */
  public static async getBranch(
    accessToken: string,
    owner: string,
    repo: string,
    branchName: string
  ): Promise<IGitHubBranch> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchBranchDetails(accessToken, owner, repo, branchName);
    }
    return GitHubApiService.fetchBranchDetails(accessToken, owner, repo, branchName);
  }

  /**
   * Get commits for a repository with filtering & pagination
   */
  public static async getCommits(
    accessToken: string,
    owner: string,
    repo: string,
    options: IFetchCommitsOptions = {}
  ): Promise<{
    commits: IGitHubCommit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchCommits(accessToken, owner, repo, options);
    }
    return GitHubApiService.fetchCommits(accessToken, owner, repo, options);
  }

  /**
   * Get commit details including file changes
   */
  public static async getCommit(
    accessToken: string,
    owner: string,
    repo: string,
    sha: string
  ): Promise<IGitHubCommit> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchCommitDetails(accessToken, owner, repo, sha);
    }
    return GitHubApiService.fetchCommitDetails(accessToken, owner, repo, sha);
  }

  /**
   * Compare two commits or branches
   */
  public static async compareCommits(
    accessToken: string,
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<IGitHubCommitCompare> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.compareCommits(accessToken, owner, repo, base, head);
    }
    return GitHubApiService.compareCommits(accessToken, owner, repo, base, head);
  }

  /**
   * Get Pull Requests for a repository
   */
  public static async getPullRequests(
    accessToken: string,
    owner: string,
    repo: string,
    options: IFetchPullRequestsOptions = {}
  ): Promise<{
    pullRequests: IGitHubPullRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchPullRequests(accessToken, owner, repo, options);
    }
    return GitHubApiService.fetchPullRequests(accessToken, owner, repo, options);
  }

  /**
   * Get single Pull Request details
   */
  public static async getPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequest> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchPullRequestDetails(accessToken, owner, repo, prNumber);
    }
    return GitHubApiService.fetchPullRequestDetails(accessToken, owner, repo, prNumber);
  }

  /**
   * Get Pull Request changed files
   */
  public static async getPullRequestFiles(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequestFile[]> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchPullRequestFiles(accessToken, owner, repo, prNumber);
    }
    return GitHubApiService.fetchPullRequestFiles(accessToken, owner, repo, prNumber);
  }

  /**
   * Get Pull Request commits
   */
  public static async getPullRequestCommits(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubCommit[]> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchPullRequestCommits(accessToken, owner, repo, prNumber);
    }
    return GitHubApiService.fetchPullRequestCommits(accessToken, owner, repo, prNumber);
  }

  /**
   * Get Pull Request reviews
   */
  public static async getPullRequestReviews(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequestReview[]> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.fetchPullRequestReviews(accessToken, owner, repo, prNumber);
    }
    return GitHubApiService.fetchPullRequestReviews(accessToken, owner, repo, prNumber);
  }

  /**
   * Create a Pull Request
   */
  public static async createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    payload: ICreatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.createPullRequest(accessToken, owner, repo, payload);
    }
    return GitHubApiService.createPullRequest(accessToken, owner, repo, payload);
  }

  /**
   * Update a Pull Request
   */
  public static async updatePullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number,
    payload: IUpdatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    if (this.isMockMode(accessToken)) {
      return MockGitHubProvider.updatePullRequest(accessToken, owner, repo, prNumber, payload);
    }
    return GitHubApiService.updatePullRequest(accessToken, owner, repo, prNumber, payload);
  }
}

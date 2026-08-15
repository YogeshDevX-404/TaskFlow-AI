import axios, { AxiosError } from 'axios';
import { config } from '../config/env.config';

export interface IGitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface IGitHubUserProfile {
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
  created_at?: string;
  updated_at?: string;
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
  watchers_count?: number;
  open_issues_count: number;
  html_url: string;
  clone_url?: string;
  ssh_url?: string;
  archived: boolean;
  disabled?: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
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

export interface IGitHubPullRequestUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url?: string;
  name?: string;
}

export interface IGitHubPullRequestReview {
  id: number;
  user: IGitHubPullRequestUser;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | string;
  body?: string;
  submitted_at: string;
  html_url?: string;
}

export interface IGitHubPullRequestFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface IGitHubPullRequestBranchRef {
  ref: string;
  sha: string;
  label?: string;
  repo?: {
    name: string;
    full_name: string;
  };
}

export interface IGitHubPullRequest {
  id: number;
  number: number;
  node_id?: string;
  title: string;
  body: string;
  state: 'open' | 'closed';
  state_reason?: string | null;
  draft: boolean;
  merged: boolean;
  mergeable?: boolean | null;
  user: IGitHubPullRequestUser;
  assignees?: IGitHubPullRequestUser[];
  requested_reviewers?: IGitHubPullRequestUser[];
  reviews?: IGitHubPullRequestReview[];
  reviewStatus?: 'Pending' | 'Approved' | 'Changes Requested' | 'Mixed' | 'Merged' | 'Closed';
  head: IGitHubPullRequestBranchRef;
  base: IGitHubPullRequestBranchRef;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  merged_at?: string | null;
  commits_count?: number;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface IFetchPullRequestsOptions {
  state?: 'open' | 'closed' | 'all';
  author?: string;
  reviewer?: string;
  assignee?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  merged?: boolean;
  search?: string;
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ICreatePullRequestOptions {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
}

export interface IUpdatePullRequestOptions {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  base?: string;
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
  pull_request?: any;
}

export interface IFetchIssuesOptions {
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

export interface ICreateIssueOptions {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

export interface IFetchRepositoriesOptions {
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

export interface IFetchBranchesOptions {
  search?: string;
  protected?: boolean;
  filter?: 'default' | 'protected' | 'unprotected' | 'all';
  sort?: 'name' | 'updated';
  page?: number;
  limit?: number;
}

export interface IGitHubBranch {
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

export interface IFetchCommitsOptions {
  branch?: string;
  author?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: 'newest' | 'oldest' | 'author';
  page?: number;
  limit?: number;
}

export interface IGitHubCommitFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface IGitHubCommit {
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
  files?: IGitHubCommitFile[];
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

export interface IGitHubCommitCompare {
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: IGitHubCommit[];
  files?: IGitHubCommitFile[];
}

export class GitHubApiService {
  private static get baseUrl(): string {
    return config.githubApiUrl || 'https://api.github.com';
  }

  /**
   * Exchange OAuth authorization code for an access token
   */
  public static async exchangeCodeForToken(code: string, state: string): Promise<IGitHubTokenResponse> {
    if (!config.githubClientId || !config.githubClientSecret) {
      throw new Error('GitHub OAuth is not configured on the server. Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET.');
    }

    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: config.githubClientId,
          client_secret: config.githubClientSecret,
          code,
          redirect_uri: config.githubCallbackUrl,
          state,
        },
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      if (response.data.error) {
        const errorDesc = response.data.error_description || response.data.error;
        throw new Error(`GitHub OAuth exchange error: ${errorDesc}`);
      }

      if (!response.data.access_token) {
        throw new Error('Failed to retrieve access token from GitHub authorization endpoint');
      }

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'bearer',
        scope: response.data.scope || '',
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<any>;
        const msg = axiosErr.response?.data?.error_description || axiosErr.message || 'GitHub OAuth token exchange failed';
        throw new Error(`GitHub Authentication Failed: ${msg}`);
      }
      throw err;
    }
  }

  /**
   * Fetch authenticated GitHub user's profile and primary verified email
   */
  public static async fetchGitHubUserProfile(accessToken: string): Promise<IGitHubUserProfile> {
    try {
      const userResponse = await axios.get(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      // Handle Rate Limit headers if present
      const remaining = userResponse.headers['x-ratelimit-remaining'];
      const resetTime = userResponse.headers['x-ratelimit-reset'];
      if (remaining && parseInt(String(remaining), 10) === 0) {
        const resetDate = new Date(parseInt(String(resetTime), 10) * 1000).toLocaleTimeString();
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}`);
      }

      const userData = userResponse.data;
      let primaryEmail = userData.email || null;

      // If email is null in user profile, fetch private/verified emails if scope permits
      if (!primaryEmail) {
        try {
          const emailsResponse = await axios.get(`${this.baseUrl}/user/emails`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'TaskFlow-AI-App',
            },
            timeout: 5000,
          });

          if (Array.isArray(emailsResponse.data)) {
            const primary = emailsResponse.data.find((e: any) => e.primary && e.verified);
            const verified = emailsResponse.data.find((e: any) => e.verified);
            if (primary) {
              primaryEmail = primary.email;
            } else if (verified) {
              primaryEmail = verified.email;
            } else if (emailsResponse.data.length > 0) {
              primaryEmail = emailsResponse.data[0].email;
            }
          }
        } catch {
          // If user:email scope is missing or emails call fails, proceed gracefully
        }
      }

      return {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        email: primaryEmail,
        public_repos: userData.public_repos,
        public_gists: userData.public_gists,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          throw new Error('GitHub token is invalid or has been revoked');
        }
        if (status === 403 || status === 429) {
          throw new Error('GitHub API rate limit reached or access forbidden');
        }
      }
      throw err;
    }
  }

  /**
   * Fetch organizations accessible to the connected user including personal account
   */
  public static async fetchOrganizations(accessToken: string): Promise<IGitHubOrg[]> {
    try {
      const profile = await this.fetchGitHubUserProfile(accessToken);

      const personalAccountOrg: IGitHubOrg = {
        id: profile.id,
        login: profile.login,
        name: profile.name || profile.login,
        avatar_url: profile.avatar_url,
        description: 'Personal GitHub Account',
        html_url: profile.html_url,
        type: 'User',
        public_repos: profile.public_repos || 0,
        isPersonal: true,
      };

      const orgsResponse = await axios.get(`${this.baseUrl}/user/orgs`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      const fetchedOrgs: IGitHubOrg[] = (orgsResponse.data || []).map((org: any) => ({
        id: org.id,
        login: org.login,
        name: org.login,
        avatar_url: org.avatar_url,
        description: org.description || '',
        html_url: org.html_url || `https://github.com/${org.login}`,
        type: 'Organization',
        public_repos: org.public_repos || 0,
        isPersonal: false,
      }));

      return [personalAccountOrg, ...fetchedOrgs];
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub token is invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
      }
      throw err;
    }
  }

  /**
   * Fetch paginated list of GitHub repositories with search, filter, and sort options
   */
  public static async fetchRepositories(
    accessToken: string,
    options: IFetchRepositoriesOptions = {}
  ): Promise<{
    repositories: IGitHubRepo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sort = options.sort || 'updated';
    const direction = options.direction || 'desc';

    try {
      let endpoint = `${this.baseUrl}/user/repos`;
      const params: Record<string, any> = {
        per_page: limit,
        page,
        sort: sort === 'stars' || sort === 'forks' || sort === 'name' ? 'updated' : sort,
        direction,
      };

      if (options.org) {
        endpoint = `${this.baseUrl}/orgs/${options.org}/repos`;
      }

      if (options.visibility && options.visibility !== 'all') {
        params.visibility = options.visibility;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params,
        timeout: 10000,
      });

      let repos: IGitHubRepo[] = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        full_name: item.full_name,
        owner: {
          id: item.owner?.id || 0,
          login: item.owner?.login || '',
          avatar_url: item.owner?.avatar_url || '',
          html_url: item.owner?.html_url || '',
          type: item.owner?.type || 'User',
        },
        description: item.description || '',
        visibility: item.visibility || (item.private ? 'private' : 'public'),
        default_branch: item.default_branch || 'main',
        language: item.language || '',
        stargazers_count: item.stargazers_count || 0,
        forks_count: item.forks_count || 0,
        watchers_count: item.watchers_count || item.subscribers_count || 0,
        open_issues_count: item.open_issues_count || 0,
        html_url: item.html_url || '',
        clone_url: item.clone_url || `https://github.com/${item.full_name}.git`,
        ssh_url: item.ssh_url || `git@github.com:${item.full_name}.git`,
        archived: !!item.archived,
        disabled: !!item.disabled,
        fork: !!item.fork,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        pushed_at: item.pushed_at,
      }));

      // Apply client-side search/filters if provided
      if (options.search) {
        const q = options.search.toLowerCase();
        repos = repos.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.full_name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.owner.login.toLowerCase().includes(q) ||
            r.language.toLowerCase().includes(q)
        );
      }

      if (options.language) {
        repos = repos.filter((r) => r.language.toLowerCase() === options.language!.toLowerCase());
      }

      if (options.archived !== undefined) {
        repos = repos.filter((r) => r.archived === options.archived);
      }

      if (options.fork !== undefined) {
        repos = repos.filter((r) => r.fork === options.fork);
      }

      if (options.sort === 'stars') {
        repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else if (options.sort === 'forks') {
        repos.sort((a, b) => b.forks_count - a.forks_count);
      } else if (options.sort === 'name') {
        repos.sort((a, b) => a.name.localeCompare(b.name));
      }

      const total = repos.length;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        repositories: repos,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error('Requested organization or repositories not found.');
      }
      throw err;
    }
  }

  /**
   * Fetch single repository details by owner and repo name
   */
  public static async fetchRepositoryDetails(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<IGitHubRepo> {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      const item = response.data;
      return {
        id: item.id,
        name: item.name,
        full_name: item.full_name,
        owner: {
          id: item.owner?.id || 0,
          login: item.owner?.login || '',
          avatar_url: item.owner?.avatar_url || '',
          html_url: item.owner?.html_url || '',
          type: item.owner?.type || 'User',
        },
        description: item.description || '',
        visibility: item.visibility || (item.private ? 'private' : 'public'),
        default_branch: item.default_branch || 'main',
        language: item.language || '',
        stargazers_count: item.stargazers_count || 0,
        forks_count: item.forks_count || 0,
        watchers_count: item.watchers_count || item.subscribers_count || 0,
        open_issues_count: item.open_issues_count || 0,
        html_url: item.html_url || '',
        clone_url: item.clone_url || `https://github.com/${item.full_name}.git`,
        ssh_url: item.ssh_url || `git@github.com:${item.full_name}.git`,
        archived: !!item.archived,
        disabled: !!item.disabled,
        fork: !!item.fork,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        pushed_at: item.pushed_at,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Repository ${owner}/${repo} not found on GitHub.`);
      }
      throw err;
    }
  }

  /**
   * Fetch issues for a repository
   */
  public static async fetchIssues(
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
    try {
      const page = options.page && options.page > 0 ? options.page : 1;
      const limit = options.limit && options.limit > 0 ? options.limit : 10;

      const params: Record<string, any> = {
        state: options.state || 'all',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        page,
        per_page: limit,
      };

      if (options.label) params.labels = options.label;
      if (options.assignee) params.assignee = options.assignee;
      if (options.author) params.creator = options.author;

      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params,
        timeout: 10000,
      });

      // Filter out pull requests (GitHub issues API returns PRs with pull_request field)
      let items: IGitHubIssue[] = (response.data || [])
        .filter((item: any) => !item.pull_request)
        .map((item: any) => ({
          id: item.id,
          number: item.number,
          node_id: item.node_id,
          title: item.title,
          body: item.body || '',
          state: item.state === 'closed' ? 'closed' : 'open',
          state_reason: item.state_reason,
          user: {
            id: item.user?.id || 0,
            login: item.user?.login || 'unknown',
            avatar_url: item.user?.avatar_url || '',
            html_url: item.user?.html_url || '',
          },
          labels: (item.labels || []).map((lbl: any) => ({
            id: lbl.id,
            name: typeof lbl === 'string' ? lbl : lbl.name,
            color: lbl.color || '888888',
            description: lbl.description || '',
          })),
          assignees: (item.assignees || []).map((usr: any) => ({
            id: usr.id,
            login: usr.login,
            avatar_url: usr.avatar_url || '',
            html_url: usr.html_url || '',
          })),
          comments: item.comments || 0,
          html_url: item.html_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
          closed_at: item.closed_at,
        }));

      // Apply client-side search filtering if search query provided
      if (options.search) {
        const q = options.search.toLowerCase().trim();
        items = items.filter(
          (iss) =>
            iss.number.toString().includes(q) ||
            iss.title.toLowerCase().includes(q) ||
            iss.body.toLowerCase().includes(q) ||
            iss.user.login.toLowerCase().includes(q) ||
            iss.labels.some((l) => l.name.toLowerCase().includes(q))
        );
      }

      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        issues: items,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Repository ${owner}/${repo} not found on GitHub.`);
      }
      throw err;
    }
  }

  /**
   * Fetch single GitHub issue details
   */
  public static async fetchIssueDetails(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<IGitHubIssue> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      const item = response.data;
      return {
        id: item.id,
        number: item.number,
        node_id: item.node_id,
        title: item.title,
        body: item.body || '',
        state: item.state === 'closed' ? 'closed' : 'open',
        state_reason: item.state_reason,
        user: {
          id: item.user?.id || 0,
          login: item.user?.login || 'unknown',
          avatar_url: item.user?.avatar_url || '',
          html_url: item.user?.html_url || '',
        },
        labels: (item.labels || []).map((lbl: any) => ({
          id: lbl.id,
          name: typeof lbl === 'string' ? lbl : lbl.name,
          color: lbl.color || '888888',
          description: lbl.description || '',
        })),
        assignees: (item.assignees || []).map((usr: any) => ({
          id: usr.id,
          login: usr.login,
          avatar_url: usr.avatar_url || '',
          html_url: usr.html_url || '',
        })),
        comments: item.comments || 0,
        html_url: item.html_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
        closed_at: item.closed_at,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404)
          throw new Error(`Issue #${issueNumber} not found in ${owner}/${repo}.`);
      }
      throw err;
    }
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
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/issues`,
        {
          title: payload.title,
          body: payload.body || '',
          labels: payload.labels || [],
          assignees: payload.assignees || [],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      const item = response.data;
      return {
        id: item.id,
        number: item.number,
        node_id: item.node_id,
        title: item.title,
        body: item.body || '',
        state: item.state === 'closed' ? 'closed' : 'open',
        state_reason: item.state_reason,
        user: {
          id: item.user?.id || 0,
          login: item.user?.login || 'unknown',
          avatar_url: item.user?.avatar_url || '',
          html_url: item.user?.html_url || '',
        },
        labels: (item.labels || []).map((lbl: any) => ({
          id: lbl.id,
          name: typeof lbl === 'string' ? lbl : lbl.name,
          color: lbl.color || '888888',
          description: lbl.description || '',
        })),
        assignees: (item.assignees || []).map((usr: any) => ({
          id: usr.id,
          login: usr.login,
          avatar_url: usr.avatar_url || '',
          html_url: usr.html_url || '',
        })),
        comments: item.comments || 0,
        html_url: item.html_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
        closed_at: item.closed_at,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404)
          throw new Error(`Repository ${owner}/${repo} not found on GitHub.`);
      }
      throw err;
    }
  }

  /**
   * Fetch branches for a repository
   */
  public static async fetchBranches(
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
    try {
      const page = options.page && options.page > 0 ? options.page : 1;
      const limit = options.limit && options.limit > 0 ? options.limit : 10;

      // First fetch repository details to obtain default branch name
      let defaultBranchName = 'main';
      try {
        const repoInfo = await this.fetchRepositoryDetails(accessToken, owner, repo);
        if (repoInfo && repoInfo.default_branch) {
          defaultBranchName = repoInfo.default_branch;
        }
      } catch {
        // Fallback default branch name if repo metadata call fails
      }

      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params: {
          per_page: 100, // Fetch up to 100 for client-side sorting & search filtering
        },
        timeout: 10000,
      });

      let branches: IGitHubBranch[] = (response.data || []).map((item: any) => {
        const branchName = item.name;
        const sha = item.commit?.sha || '';
        return {
          name: branchName,
          protected: !!item.protected,
          isDefault: branchName === defaultBranchName,
          commit: {
            sha,
            shortSha: sha.substring(0, 7),
            url: item.commit?.url || `https://github.com/${owner}/${repo}/commit/${sha}`,
          },
          html_url: `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branchName)}`,
        };
      });

      // Filter by search query
      if (options.search) {
        const q = options.search.toLowerCase().trim();
        branches = branches.filter((b) => b.name.toLowerCase().includes(q));
      }

      // Filter by category: default, protected, unprotected
      if (options.filter && options.filter !== 'all') {
        if (options.filter === 'default') {
          branches = branches.filter((b) => b.isDefault);
        } else if (options.filter === 'protected') {
          branches = branches.filter((b) => b.protected);
        } else if (options.filter === 'unprotected') {
          branches = branches.filter((b) => !b.protected);
        }
      }

      if (options.protected !== undefined) {
        branches = branches.filter((b) => b.protected === options.protected);
      }

      // Sort
      const sort = options.sort || 'name';
      if (sort === 'name') {
        branches.sort((a, b) => {
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return a.name.localeCompare(b.name);
        });
      }

      const total = branches.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedBranches = branches.slice(startIndex, startIndex + limit);

      return {
        branches: paginatedBranches,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Repository ${owner}/${repo} not found on GitHub.`);
      }
      throw err;
    }
  }

  /**
   * Fetch single branch details
   */
  public static async fetchBranchDetails(
    accessToken: string,
    owner: string,
    repo: string,
    branchName: string
  ): Promise<IGitHubBranch> {
    try {
      const encodedBranch = encodeURIComponent(branchName);
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches/${encodedBranch}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      const item = response.data;
      const sha = item.commit?.sha || '';
      const commitObj = item.commit?.commit || {};
      const authorObj = item.commit?.author || {};

      let isDefault = false;
      try {
        const repoInfo = await this.fetchRepositoryDetails(accessToken, owner, repo);
        isDefault = repoInfo.default_branch === item.name;
      } catch {
        // fallback
      }

      return {
        name: item.name,
        protected: !!item.protected,
        isDefault,
        commit: {
          sha,
          shortSha: sha.substring(0, 7),
          url: item.commit?.html_url || `https://github.com/${owner}/${repo}/commit/${sha}`,
          message: commitObj.message || '',
          authorName: commitObj.author?.name || authorObj.login || '',
          authorEmail: commitObj.author?.email || null,
          authorLogin: authorObj.login || '',
          authorAvatarUrl: authorObj.avatar_url || '',
          committedAt: commitObj.author?.date || commitObj.committer?.date || new Date().toISOString(),
        },
        html_url: `https://github.com/${owner}/${repo}/tree/${encodedBranch}`,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Branch "${branchName}" not found in ${owner}/${repo}.`);
      }
      throw err;
    }
  }

  /**
   * Fetch commits for a repository with filtering and pagination
   */
  public static async fetchCommits(
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
    try {
      const page = options.page && options.page > 0 ? options.page : 1;
      const limit = options.limit && options.limit > 0 ? options.limit : 10;

      const params: Record<string, any> = {
        per_page: limit,
        page,
      };

      if (options.branch) {
        params.sha = options.branch;
      }
      if (options.author) {
        params.author = options.author;
      }
      if (options.from) {
        params.since = options.from;
      }
      if (options.to) {
        params.until = options.to;
      }

      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params,
        timeout: 10000,
      });

      let commits: IGitHubCommit[] = (response.data || []).map((item: any) => {
        const sha = item.sha || '';
        const commitData = item.commit || {};
        const authorObj = item.author || {};
        const committerObj = item.committer || {};

        return {
          sha,
          shortSha: sha.substring(0, 7),
          message: commitData.message || '',
          author: {
            name: commitData.author?.name || authorObj.login || 'Unknown',
            email: commitData.author?.email || null,
            login: authorObj.login || '',
            avatar_url: authorObj.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            date: commitData.author?.date || new Date().toISOString(),
          },
          committer: {
            name: commitData.committer?.name || committerObj.login || 'Unknown',
            email: commitData.committer?.email || null,
            login: committerObj.login || '',
            avatar_url: committerObj.avatar_url || '',
            date: commitData.committer?.date || new Date().toISOString(),
          },
          html_url: item.html_url || `https://github.com/${owner}/${repo}/commit/${sha}`,
          branchName: options.branch || '',
          committedAt: commitData.author?.date || commitData.committer?.date || new Date().toISOString(),
        };
      });

      // Filter by search query (SHA, message, author)
      if (options.search) {
        const q = options.search.toLowerCase().trim();
        commits = commits.filter(
          (c) =>
            c.sha.toLowerCase().includes(q) ||
            c.message.toLowerCase().includes(q) ||
            c.author.name.toLowerCase().includes(q) ||
            c.author.login.toLowerCase().includes(q)
        );
      }

      // Sort
      if (options.sort === 'oldest') {
        commits.sort((a, b) => new Date(a.committedAt).getTime() - new Date(b.committedAt).getTime());
      } else if (options.sort === 'author') {
        commits.sort((a, b) => a.author.name.localeCompare(b.author.name));
      } else {
        commits.sort((a, b) => new Date(b.committedAt).getTime() - new Date(a.committedAt).getTime());
      }

      const total = commits.length;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        commits,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Repository ${owner}/${repo} or branch not found on GitHub.`);
      }
      throw err;
    }
  }

  /**
   * Fetch single commit details with file diff stats
   */
  public static async fetchCommitDetails(
    accessToken: string,
    owner: string,
    repo: string,
    sha: string
  ): Promise<IGitHubCommit> {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      const item = response.data;
      const commitData = item.commit || {};
      const authorObj = item.author || {};
      const committerObj = item.committer || {};

      const files: IGitHubCommitFile[] = (item.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        changes: f.changes || 0,
        patch: f.patch,
        previous_filename: f.previous_filename,
      }));

      return {
        sha: item.sha,
        shortSha: item.sha ? item.sha.substring(0, 7) : '',
        message: commitData.message || '',
        author: {
          name: commitData.author?.name || authorObj.login || 'Unknown',
          email: commitData.author?.email || null,
          login: authorObj.login || '',
          avatar_url: authorObj.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          date: commitData.author?.date || new Date().toISOString(),
        },
        committer: {
          name: commitData.committer?.name || committerObj.login || 'Unknown',
          email: commitData.committer?.email || null,
          login: committerObj.login || '',
          avatar_url: committerObj.avatar_url || '',
          date: commitData.committer?.date || new Date().toISOString(),
        },
        html_url: item.html_url || `https://github.com/${owner}/${repo}/commit/${item.sha}`,
        committedAt: commitData.author?.date || commitData.committer?.date || new Date().toISOString(),
        stats: item.stats
          ? {
              additions: item.stats.additions || 0,
              deletions: item.stats.deletions || 0,
              total: item.stats.total || 0,
            }
          : undefined,
        files,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Commit ${sha} not found in ${owner}/${repo}.`);
      }
      throw err;
    }
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
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      const item = response.data;
      const commitsList: IGitHubCommit[] = (item.commits || []).map((c: any) => {
        const sha = c.sha || '';
        const commitData = c.commit || {};
        const authorObj = c.author || {};
        return {
          sha,
          shortSha: sha.substring(0, 7),
          message: commitData.message || '',
          author: {
            name: commitData.author?.name || authorObj.login || 'Unknown',
            email: commitData.author?.email || null,
            login: authorObj.login || '',
            avatar_url: authorObj.avatar_url || '',
            date: commitData.author?.date || new Date().toISOString(),
          },
          committer: {
            name: commitData.committer?.name || '',
            email: commitData.committer?.email || null,
            login: c.committer?.login || '',
            avatar_url: c.committer?.avatar_url || '',
            date: commitData.committer?.date || new Date().toISOString(),
          },
          html_url: c.html_url || `https://github.com/${owner}/${repo}/commit/${sha}`,
          committedAt: commitData.author?.date || new Date().toISOString(),
        };
      });

      const files: IGitHubCommitFile[] = (item.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        changes: f.changes || 0,
        patch: f.patch,
        previous_filename: f.previous_filename,
      }));

      return {
        status: item.status || 'ahead',
        ahead_by: item.ahead_by || 0,
        behind_by: item.behind_by || 0,
        total_commits: item.total_commits || commitsList.length,
        commits: commitsList,
        files,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Could not compare base ${base} with head ${head} in ${owner}/${repo}.`);
      }
      throw err;
    }
  }

  /**
   * Helper to compute overall PR review status from reviews
   */
  public static calculatePRReviewStatus(
    reviews: IGitHubPullRequestReview[],
    merged: boolean,
    state: string
  ): 'Pending' | 'Approved' | 'Changes Requested' | 'Mixed' | 'Merged' | 'Closed' {
    if (merged) return 'Merged';
    if (state === 'closed') return 'Closed';
    if (!reviews || reviews.length === 0) return 'Pending';

    const latestPerUser = new Map<string, string>();
    for (const r of reviews) {
      if (r.user?.login) {
        latestPerUser.set(r.user.login, r.state);
      }
    }

    const states = Array.from(latestPerUser.values());
    if (states.includes('CHANGES_REQUESTED')) return 'Changes Requested';
    if (states.includes('APPROVED')) {
      if (states.includes('COMMENTED') || states.includes('PENDING')) {
        return 'Approved'; // Still considered approved if at least one approved and no changes requested
      }
      return 'Approved';
    }
    return 'Pending';
  }

  /**
   * Fetch Pull Requests with filters and pagination
   */
  public static async fetchPullRequests(
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
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const stateParam = options.state || 'all';
      const sortParam = options.sort || 'updated';
      const directionParam = options.direction || 'desc';

      const queryParams: Record<string, any> = {
        state: stateParam,
        sort: sortParam,
        direction: directionParam,
        per_page: limit,
        page,
      };

      if (options.base) queryParams.base = options.base;
      if (options.head) queryParams.head = options.head;

      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params: queryParams,
        timeout: 10000,
      });

      let rawList: any[] = response.data || [];

      // Filtering in memory if options specify author/reviewer/draft/merged/search
      if (options.author) {
        const auth = options.author.toLowerCase();
        rawList = rawList.filter((pr) => pr.user?.login?.toLowerCase() === auth);
      }
      if (options.draft !== undefined) {
        rawList = rawList.filter((pr) => !!pr.draft === options.draft);
      }
      if (options.merged !== undefined) {
        rawList = rawList.filter((pr) => !!pr.merged_at === options.merged);
      }
      if (options.search) {
        const q = options.search.toLowerCase();
        rawList = rawList.filter(
          (pr) =>
            pr.title?.toLowerCase().includes(q) ||
            pr.number?.toString().includes(q) ||
            pr.user?.login?.toLowerCase().includes(q) ||
            pr.head?.ref?.toLowerCase().includes(q)
        );
      }

      const total = rawList.length;
      const totalPages = Math.ceil(total / limit) || 1;

      const pullRequests: IGitHubPullRequest[] = rawList.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        node_id: pr.node_id,
        title: pr.title || '',
        body: pr.body || '',
        state: pr.state === 'closed' ? 'closed' : 'open',
        state_reason: pr.state_reason || null,
        draft: !!pr.draft,
        merged: !!pr.merged_at,
        mergeable: pr.mergeable,
        user: {
          id: pr.user?.id || 0,
          login: pr.user?.login || 'unknown',
          avatar_url: pr.user?.avatar_url || '',
          html_url: pr.user?.html_url || '',
        },
        assignees: (pr.assignees || []).map((u: any) => ({
          id: u.id,
          login: u.login,
          avatar_url: u.avatar_url,
        })),
        requested_reviewers: (pr.requested_reviewers || []).map((u: any) => ({
          id: u.id,
          login: u.login,
          avatar_url: u.avatar_url,
        })),
        head: {
          ref: pr.head?.ref || '',
          sha: pr.head?.sha || '',
          label: pr.head?.label || '',
        },
        base: {
          ref: pr.base?.ref || '',
          sha: pr.base?.sha || '',
          label: pr.base?.label || '',
        },
        html_url: pr.html_url || `https://github.com/${owner}/${repo}/pull/${pr.number}`,
        created_at: pr.created_at || new Date().toISOString(),
        updated_at: pr.updated_at || new Date().toISOString(),
        closed_at: pr.closed_at || null,
        merged_at: pr.merged_at || null,
        commits_count: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        reviewStatus: pr.merged_at ? 'Merged' : pr.state === 'closed' ? 'Closed' : 'Pending',
      }));

      return {
        pullRequests,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Repository ${owner}/${repo} not found.`);
      }
      throw err;
    }
  }

  /**
   * Fetch detailed info for a single PR including review status
   */
  public static async fetchPullRequestDetails(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequest> {
    try {
      const [prRes, reviewsRes] = await Promise.all([
        axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }),
        axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }).catch(() => ({ data: [] })),
      ]);

      const pr = prRes.data;
      const reviewsData: IGitHubPullRequestReview[] = (reviewsRes.data || []).map((r: any) => ({
        id: r.id,
        user: {
          id: r.user?.id || 0,
          login: r.user?.login || 'unknown',
          avatar_url: r.user?.avatar_url || '',
          html_url: r.user?.html_url || '',
        },
        state: r.state,
        body: r.body || '',
        submitted_at: r.submitted_at || new Date().toISOString(),
        html_url: r.html_url,
      }));

      const isMerged = !!pr.merged || !!pr.merged_at;
      const reviewStatus = this.calculatePRReviewStatus(reviewsData, isMerged, pr.state);

      return {
        id: pr.id,
        number: pr.number,
        node_id: pr.node_id,
        title: pr.title || '',
        body: pr.body || '',
        state: pr.state === 'closed' ? 'closed' : 'open',
        state_reason: pr.state_reason || null,
        draft: !!pr.draft,
        merged: isMerged,
        mergeable: pr.mergeable,
        user: {
          id: pr.user?.id || 0,
          login: pr.user?.login || 'unknown',
          avatar_url: pr.user?.avatar_url || '',
          html_url: pr.user?.html_url || '',
        },
        assignees: (pr.assignees || []).map((u: any) => ({
          id: u.id,
          login: u.login,
          avatar_url: u.avatar_url,
        })),
        requested_reviewers: (pr.requested_reviewers || []).map((u: any) => ({
          id: u.id,
          login: u.login,
          avatar_url: u.avatar_url,
        })),
        reviews: reviewsData,
        reviewStatus,
        head: {
          ref: pr.head?.ref || '',
          sha: pr.head?.sha || '',
          label: pr.head?.label || '',
        },
        base: {
          ref: pr.base?.ref || '',
          sha: pr.base?.sha || '',
          label: pr.base?.label || '',
        },
        html_url: pr.html_url || `https://github.com/${owner}/${repo}/pull/${pr.number}`,
        created_at: pr.created_at || new Date().toISOString(),
        updated_at: pr.updated_at || new Date().toISOString(),
        closed_at: pr.closed_at || null,
        merged_at: pr.merged_at || null,
        commits_count: pr.commits || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changed_files: pr.changed_files || 0,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 404) throw new Error(`Pull Request #${prNumber} not found in ${owner}/${repo}.`);
      }
      throw err;
    }
  }

  /**
   * Fetch changed files for a Pull Request
   */
  public static async fetchPullRequestFiles(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequestFile[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params: { per_page: 100 },
        timeout: 10000,
      });

      return (response.data || []).map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        changes: f.changes || 0,
        patch: f.patch,
        previous_filename: f.previous_filename,
      }));
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
      }
      throw err;
    }
  }

  /**
   * Fetch commits for a Pull Request
   */
  public static async fetchPullRequestCommits(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubCommit[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/commits`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        params: { per_page: 100 },
        timeout: 10000,
      });

      return (response.data || []).map((c: any) => {
        const sha = c.sha || '';
        const commitData = c.commit || {};
        const authorObj = c.author || {};
        return {
          sha,
          shortSha: sha.substring(0, 7),
          message: commitData.message || '',
          author: {
            name: commitData.author?.name || authorObj.login || 'Unknown',
            email: commitData.author?.email || null,
            login: authorObj.login || '',
            avatar_url: authorObj.avatar_url || '',
            date: commitData.author?.date || new Date().toISOString(),
          },
          committer: {
            name: commitData.committer?.name || '',
            email: commitData.committer?.email || null,
            login: c.committer?.login || '',
            avatar_url: c.committer?.avatar_url || '',
            date: commitData.committer?.date || new Date().toISOString(),
          },
          html_url: c.html_url || `https://github.com/${owner}/${repo}/commit/${sha}`,
          committedAt: commitData.author?.date || new Date().toISOString(),
        };
      });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
      }
      throw err;
    }
  }

  /**
   * Fetch reviews for a Pull Request
   */
  public static async fetchPullRequestReviews(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequestReview[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });

      return (response.data || []).map((r: any) => ({
        id: r.id,
        user: {
          id: r.user?.id || 0,
          login: r.user?.login || 'unknown',
          avatar_url: r.user?.avatar_url || '',
          html_url: r.user?.html_url || '',
        },
        state: r.state,
        body: r.body || '',
        submitted_at: r.submitted_at || new Date().toISOString(),
        html_url: r.html_url,
      }));
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
      }
      throw err;
    }
  }

  /**
   * Create a new Pull Request
   */
  public static async createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    payload: ICreatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/pulls`,
        {
          title: payload.title,
          body: payload.body || '',
          head: payload.head,
          base: payload.base,
          draft: payload.draft || false,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      return this.fetchPullRequestDetails(accessToken, owner, repo, response.data.number);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
        if (status === 422) throw new Error(`GitHub Validation Error: ${msg}`);
      }
      throw err;
    }
  }

  /**
   * Update an existing Pull Request
   */
  public static async updatePullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number,
    payload: IUpdatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    try {
      await axios.patch(
        `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      return this.fetchPullRequestDetails(accessToken, owner, repo, prNumber);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 429) throw new Error('GitHub API rate limit exceeded.');
      }
      throw err;
    }
  }

  /**
   * Create or register a repository webhook on GitHub
   */
  public static async createRepositoryWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string,
    events: string[] = ['push', 'issues', 'issue_comment', 'pull_request', 'pull_request_review', 'repository', 'release']
  ): Promise<{ id: number; url: string; active: boolean; events: string[] }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events,
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret,
            insecure_ssl: '0',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI-App',
          },
          timeout: 10000,
        }
      );

      return {
        id: response.data.id,
        url: response.data.config?.url || webhookUrl,
        active: !!response.data.active,
        events: response.data.events || events,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        if (status === 401) throw new Error('GitHub access token invalid or expired.');
        if (status === 403 || status === 404) {
          throw new Error(`Insufficient GitHub permissions to configure webhooks for ${owner}/${repo}. Required scope: admin:repo_hook or repo (${msg}).`);
        }
        if (status === 422) {
          const errors = err.response?.data?.errors || [];
          const alreadyExists = errors.some((e: any) => e.message && e.message.includes('Hook already exists'));
          if (alreadyExists) {
            throw new Error('A webhook with this configuration already exists on the GitHub repository.');
          }
          throw new Error(`GitHub Validation Error: ${msg}`);
        }
      }
      throw err;
    }
  }

  /**
   * Delete repository webhook from GitHub
   */
  public static async deleteRepositoryWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    hookId: number | string
  ): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/repos/${owner}/${repo}/hooks/${hookId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI-App',
        },
        timeout: 10000,
      });
      return true;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) return true;
      }
      return false;
    }
  }
}

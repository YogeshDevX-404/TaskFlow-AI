import {
  IGitHubUserProfile,
  IGitHubTokenResponse,
  IGitHubOrg,
  IGitHubRepo,
  IFetchRepositoriesOptions,
  IGitHubIssue,
  IFetchIssuesOptions,
  ICreateIssueOptions,
  IFetchBranchesOptions,
  IGitHubBranch,
  IFetchCommitsOptions,
  IGitHubCommitFile,
  IGitHubCommit,
  IGitHubCommitCompare,
  IGitHubPullRequest,
  IGitHubPullRequestFile,
  IGitHubPullRequestReview,
  IFetchPullRequestsOptions,
  ICreatePullRequestOptions,
  IUpdatePullRequestOptions,
} from './githubApi.service';

export const MOCK_GITHUB_USER: IGitHubUserProfile = {
  id: 99190241,
  login: 'dev-taskflow-user',
  name: 'Dev TaskFlow User',
  avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
  html_url: 'https://github.com/dev-taskflow-user',
  email: 'dev.user@taskflow.ai',
  public_repos: 18,
  public_gists: 4,
  followers: 128,
  following: 34,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: new Date().toISOString(),
};

export const MOCK_GITHUB_ORGS: IGitHubOrg[] = [
  {
    id: 99190241,
    login: 'dev-taskflow-user',
    name: 'Dev TaskFlow User',
    avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
    description: 'Personal Account',
    html_url: 'https://github.com/dev-taskflow-user',
    type: 'User',
    public_repos: 2,
    isPersonal: true,
  },
  {
    id: 88200110,
    login: 'taskflow-ai-org',
    name: 'TaskFlow AI Engineering',
    avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
    description: 'Next-generation AI project & workload management platform',
    html_url: 'https://github.com/taskflow-ai-org',
    type: 'Organization',
    public_repos: 4,
    isPersonal: false,
  },
  {
    id: 77300220,
    login: 'acme-corp',
    name: 'Acme Enterprise Systems',
    avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
    description: 'Global cloud infrastructure & enterprise microservices',
    html_url: 'https://github.com/acme-corp',
    type: 'Organization',
    public_repos: 3,
    isPersonal: false,
  },
  {
    id: 66400330,
    login: 'open-source-labs',
    name: 'Open Source AI Labs',
    avatar_url: 'https://avatars.githubusercontent.com/u/1020?v=4',
    description: 'Community driven artificial intelligence and developer tools',
    html_url: 'https://github.com/open-source-labs',
    type: 'Organization',
    public_repos: 1,
    isPersonal: false,
  },
];

export const MOCK_GITHUB_REPOSITORIES: IGitHubRepo[] = [
  {
    id: 101,
    name: 'core-api',
    full_name: 'taskflow-ai-org/core-api',
    owner: {
      id: 88200110,
      login: 'taskflow-ai-org',
      avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
      html_url: 'https://github.com/taskflow-ai-org',
      type: 'Organization',
    },
    description: 'Node.js Express & TypeScript RESTful API microservice for TaskFlow AI backend.',
    visibility: 'private',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 345,
    forks_count: 42,
    open_issues_count: 5,
    html_url: 'https://github.com/taskflow-ai-org/core-api',
    archived: false,
    fork: false,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2026-08-11T14:30:00Z',
  },
  {
    id: 102,
    name: 'frontend-web',
    full_name: 'taskflow-ai-org/frontend-web',
    owner: {
      id: 88200110,
      login: 'taskflow-ai-org',
      avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
      html_url: 'https://github.com/taskflow-ai-org',
      type: 'Organization',
    },
    description: 'React, Vite, and Tailwind CSS web single page application for TaskFlow AI dashboard.',
    visibility: 'public',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 820,
    forks_count: 110,
    open_issues_count: 12,
    html_url: 'https://github.com/taskflow-ai-org/frontend-web',
    archived: false,
    fork: false,
    created_at: '2024-02-05T09:15:00Z',
    updated_at: '2026-08-12T07:10:00Z',
  },
  {
    id: 103,
    name: 'agent-orchestrator',
    full_name: 'taskflow-ai-org/agent-orchestrator',
    owner: {
      id: 88200110,
      login: 'taskflow-ai-org',
      avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
      html_url: 'https://github.com/taskflow-ai-org',
      type: 'Organization',
    },
    description: 'Python LangChain & Gemini API agent worker service for autonomous task execution.',
    visibility: 'private',
    default_branch: 'main',
    language: 'Python',
    stargazers_count: 190,
    forks_count: 18,
    open_issues_count: 2,
    html_url: 'https://github.com/taskflow-ai-org/agent-orchestrator',
    archived: false,
    fork: false,
    created_at: '2024-03-10T11:20:00Z',
    updated_at: '2026-08-10T16:45:00Z',
  },
  {
    id: 104,
    name: 'docs-hub',
    full_name: 'taskflow-ai-org/docs-hub',
    owner: {
      id: 88200110,
      login: 'taskflow-ai-org',
      avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
      html_url: 'https://github.com/taskflow-ai-org',
      type: 'Organization',
    },
    description: 'Public developer documentation site, API references, and SDK tutorials.',
    visibility: 'public',
    default_branch: 'main',
    language: 'MDX',
    stargazers_count: 65,
    forks_count: 12,
    open_issues_count: 1,
    html_url: 'https://github.com/taskflow-ai-org/docs-hub',
    archived: false,
    fork: false,
    created_at: '2024-03-15T14:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 201,
    name: 'microservice-auth',
    full_name: 'acme-corp/microservice-auth',
    owner: {
      id: 77300220,
      login: 'acme-corp',
      avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
      html_url: 'https://github.com/acme-corp',
      type: 'Organization',
    },
    description: 'Go OAuth2 & JWT token authentication gateway service.',
    visibility: 'private',
    default_branch: 'main',
    language: 'Go',
    stargazers_count: 45,
    forks_count: 8,
    open_issues_count: 0,
    html_url: 'https://github.com/acme-corp/microservice-auth',
    archived: false,
    fork: false,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2026-07-28T12:00:00Z',
  },
  {
    id: 202,
    name: 'data-pipeline',
    full_name: 'acme-corp/data-pipeline',
    owner: {
      id: 77300220,
      login: 'acme-corp',
      avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
      html_url: 'https://github.com/acme-corp',
      type: 'Organization',
    },
    description: 'Apache Airflow and Spark ETL workflows for real-time customer analytics.',
    visibility: 'private',
    default_branch: 'main',
    language: 'Python',
    stargazers_count: 78,
    forks_count: 14,
    open_issues_count: 4,
    html_url: 'https://github.com/acme-corp/data-pipeline',
    archived: false,
    fork: false,
    created_at: '2024-02-18T13:40:00Z',
    updated_at: '2026-08-05T15:20:00Z',
  },
  {
    id: 203,
    name: 'legacy-monolith',
    full_name: 'acme-corp/legacy-monolith',
    owner: {
      id: 77300220,
      login: 'acme-corp',
      avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
      html_url: 'https://github.com/acme-corp',
      type: 'Organization',
    },
    description: 'Deprecated Spring Boot 2.x monolith application (migrated to microservices).',
    visibility: 'private',
    default_branch: 'master',
    language: 'Java',
    stargazers_count: 12,
    forks_count: 3,
    open_issues_count: 0,
    html_url: 'https://github.com/acme-corp/legacy-monolith',
    archived: true,
    fork: false,
    created_at: '2022-05-10T08:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 301,
    name: 'llm-eval-toolkit',
    full_name: 'open-source-labs/llm-eval-toolkit',
    owner: {
      id: 66400330,
      login: 'open-source-labs',
      avatar_url: 'https://avatars.githubusercontent.com/u/1020?v=4',
      html_url: 'https://github.com/open-source-labs',
      type: 'Organization',
    },
    description: 'Open source benchmarks and safety testing framework for Large Language Models.',
    visibility: 'public',
    default_branch: 'main',
    language: 'Python',
    stargazers_count: 1250,
    forks_count: 230,
    open_issues_count: 18,
    html_url: 'https://github.com/open-source-labs/llm-eval-toolkit',
    archived: false,
    fork: false,
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2026-08-11T20:00:00Z',
  },
  {
    id: 401,
    name: 'dotfiles',
    full_name: 'dev-taskflow-user/dotfiles',
    owner: {
      id: 99190241,
      login: 'dev-taskflow-user',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      html_url: 'https://github.com/dev-taskflow-user',
      type: 'User',
    },
    description: 'Personal macOS and Linux development environment Zsh & Neovim configurations.',
    visibility: 'public',
    default_branch: 'main',
    language: 'Shell',
    stargazers_count: 14,
    forks_count: 2,
    open_issues_count: 0,
    html_url: 'https://github.com/dev-taskflow-user/dotfiles',
    archived: false,
    fork: false,
    created_at: '2023-11-12T10:00:00Z',
    updated_at: '2026-07-02T11:00:00Z',
  },
  {
    id: 402,
    name: 'react-kanban-board',
    full_name: 'dev-taskflow-user/react-kanban-board',
    owner: {
      id: 99190241,
      login: 'dev-taskflow-user',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      html_url: 'https://github.com/dev-taskflow-user',
      type: 'User',
    },
    description: 'Forked repository of interactive drag-and-drop Kanban board component library.',
    visibility: 'public',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 310,
    forks_count: 55,
    open_issues_count: 3,
    html_url: 'https://github.com/dev-taskflow-user/react-kanban-board',
    archived: false,
    fork: true,
    created_at: '2024-01-08T14:30:00Z',
    updated_at: '2026-06-25T16:00:00Z',
  },
];

export class MockGitHubProvider {
  /**
   * Simulate OAuth authorization code exchange in development mock mode
   */
  public static async exchangeCodeForToken(code: string, _state: string): Promise<IGitHubTokenResponse> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      access_token: `mock_github_access_token_${code}_${Date.now()}`,
      token_type: 'bearer',
      scope: 'read:user user:email repo read:org',
    };
  }

  /**
   * Fetch dummy GitHub user profile for development
   */
  public static async fetchUserProfile(_accessToken: string): Promise<IGitHubUserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      ...MOCK_GITHUB_USER,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Fetch mock organizations accessible to the connected user
   */
  public static async fetchOrganizations(_accessToken: string): Promise<IGitHubOrg[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...MOCK_GITHUB_ORGS];
  }

  /**
   * Fetch mock repositories with search, filter, and pagination support
   */
  public static async fetchRepositories(
    _accessToken: string,
    options: IFetchRepositoriesOptions = {}
  ): Promise<{
    repositories: IGitHubRepo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    let list = [...MOCK_GITHUB_REPOSITORIES];

    // Filter by organization / account owner
    if (options.org) {
      list = list.filter((r) => r.owner.login.toLowerCase() === options.org!.toLowerCase());
    } else if (options.owner) {
      list = list.filter((r) => r.owner.login.toLowerCase() === options.owner!.toLowerCase());
    }

    // Filter by search query
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.owner.login.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q)
      );
    }

    // Filter by visibility
    if (options.visibility && options.visibility !== 'all') {
      list = list.filter((r) => r.visibility === options.visibility);
    }

    // Filter by language
    if (options.language) {
      list = list.filter((r) => r.language.toLowerCase() === options.language!.toLowerCase());
    }

    // Filter by archived status
    if (options.archived !== undefined) {
      list = list.filter((r) => r.archived === options.archived);
    }

    // Filter by fork status
    if (options.fork !== undefined) {
      list = list.filter((r) => r.fork === options.fork);
    }

    // Sorting
    const sort = options.sort || 'updated';
    const direction = options.direction || 'desc';
    const mult = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (sort === 'stars') {
        return (a.stargazers_count - b.stargazers_count) * mult;
      }
      if (sort === 'forks') {
        return (a.forks_count - b.forks_count) * mult;
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name) * mult;
      }
      if (sort === 'created') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mult;
      }
      // default 'updated'
      return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * mult;
    });

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginatedRepos = list.slice(startIndex, startIndex + limit);

    return {
      repositories: paginatedRepos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetch single mock repository details
   */
  public static async fetchRepositoryDetails(
    _accessToken: string,
    owner: string,
    repo: string
  ): Promise<IGitHubRepo> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (repo.toLowerCase() === 'sim-fail-sync') {
      throw new Error('Simulated GitHub API rate limit or endpoint error');
    }

    const fullName = `${owner}/${repo}`.toLowerCase();
    const found = MOCK_GITHUB_REPOSITORIES.find((r) => r.full_name.toLowerCase() === fullName);

    if (found) {
      return {
        ...found,
        watchers_count: found.watchers_count || Math.floor(found.stargazers_count * 0.4),
        clone_url: found.clone_url || `https://github.com/${found.full_name}.git`,
        ssh_url: found.ssh_url || `git@github.com:${found.full_name}.git`,
        pushed_at: found.pushed_at || new Date().toISOString(),
      };
    }

    // Fallback if dynamic custom owner/repo requested
    const isArchivedSim = repo.toLowerCase().includes('archived') || repo.toLowerCase().includes('legacy');
    return {
      id: Math.floor(Math.random() * 900000) + 100000,
      name: repo,
      full_name: `${owner}/${repo}`,
      owner: {
        id: 99190241,
        login: owner,
        avatar_url: `https://avatars.githubusercontent.com/u/9919?v=4`,
        html_url: `https://github.com/${owner}`,
        type: 'Organization',
      },
      description: `GitHub repository ${owner}/${repo} configured for TaskFlow AI workspace integration.`,
      visibility: 'public',
      default_branch: 'main',
      language: 'TypeScript',
      stargazers_count: 42,
      forks_count: 5,
      watchers_count: 18,
      open_issues_count: 1,
      html_url: `https://github.com/${owner}/${repo}`,
      clone_url: `https://github.com/${owner}/${repo}.git`,
      ssh_url: `git@github.com:${owner}/${repo}.git`,
      archived: isArchivedSim,
      disabled: false,
      fork: false,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      pushed_at: new Date(Date.now() - 3600000).toISOString(),
    };
  }

  /**
   * Mock issues repository store
   */
  private static mockIssuesStore: Record<string, IGitHubIssue[]> = {
    'taskflow-ai-org/core-api': [
      {
        id: 5001,
        number: 1,
        node_id: 'I_kwDOG12301',
        title: 'API rate limiting middleware returns 500 on burst traffic',
        body: '### Bug Description\nWhen burst traffic exceeds 100 req/s, the rate limiter crashes due to unhandled Redis connection timeout.\n\n### Steps to reproduce\n1. Run load test with `autocannon`\n2. Observe 500 internal server error response\n\n### Expected Behavior\nShould return HTTP 429 Too Many Requests.',
        state: 'open',
        user: {
          id: 99190241,
          login: 'alex-dev',
          avatar_url: 'https://avatars.githubusercontent.com/u/1012?v=4',
          html_url: 'https://github.com/alex-dev',
        },
        labels: [
          { id: 1, name: 'bug', color: 'd73a4a', description: 'Something isn\'t working' },
          { id: 2, name: 'high-priority', color: 'b60205', description: 'Needs urgent resolution' },
        ],
        assignees: [
          {
            id: 99190241,
            login: 'dev-taskflow-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
            html_url: 'https://github.com/dev-taskflow-user',
          },
        ],
        comments: 4,
        html_url: 'https://github.com/taskflow-ai-org/core-api/issues/1',
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-11T12:00:00Z',
      },
      {
        id: 5002,
        number: 2,
        node_id: 'I_kwDOG12302',
        title: 'Add WebSocket endpoint for task status real-time events',
        body: '### Feature Request\nIntegrate Socket.IO event handler to stream real-time task status updates to connected frontend clients.\n\n- [x] Define event payload schema\n- [ ] Broadcast `task:updated` on status change\n- [ ] Add client room isolation by workspace',
        state: 'open',
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: 'https://github.com/dev-taskflow-user',
        },
        labels: [
          { id: 3, name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
          { id: 4, name: 'realtime', color: '1d76db', description: 'Socket/realtime functionality' },
        ],
        assignees: [],
        comments: 7,
        html_url: 'https://github.com/taskflow-ai-org/core-api/issues/2',
        created_at: '2026-08-03T14:30:00Z',
        updated_at: '2026-08-10T16:20:00Z',
      },
      {
        id: 5003,
        number: 3,
        node_id: 'I_kwDOG12303',
        title: 'Refactor MongoDB database connection pool error recovery',
        body: 'The database connection pool should auto-retry with exponential backoff if primary replica fails during failover testing.',
        state: 'closed',
        user: {
          id: 99190242,
          login: 'sarah-backend',
          avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
          html_url: 'https://github.com/sarah-backend',
        },
        labels: [
          { id: 5, name: 'tech-debt', color: 'fef2c0', description: 'Technical debt refactoring' },
        ],
        assignees: [],
        comments: 2,
        html_url: 'https://github.com/taskflow-ai-org/core-api/issues/3',
        created_at: '2026-07-20T09:15:00Z',
        updated_at: '2026-07-28T11:00:00Z',
        closed_at: '2026-07-28T11:00:00Z',
      },
      {
        id: 5004,
        number: 4,
        node_id: 'I_kwDOG12304',
        title: 'Security audit: Update dependencies to resolve CVE vulnerability',
        body: 'Bump npm dependencies to address medium severity vulnerability reported in security scan.',
        state: 'open',
        user: {
          id: 99190243,
          login: 'security-bot',
          avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
          html_url: 'https://github.com/security-bot',
        },
        labels: [
          { id: 6, name: 'security', color: 'ee0701', description: 'Security issue' },
        ],
        assignees: [],
        comments: 1,
        html_url: 'https://github.com/taskflow-ai-org/core-api/issues/4',
        created_at: '2026-08-08T08:00:00Z',
        updated_at: '2026-08-08T08:00:00Z',
      },
      {
        id: 5005,
        number: 5,
        node_id: 'I_kwDOG12305',
        title: 'Implement user workspace role permission checks in Express middleware',
        body: 'Ensure permissions for workspace admins, project managers, and members are enforced consistently across API routes.',
        state: 'open',
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: 'https://github.com/dev-taskflow-user',
        },
        labels: [
          { id: 7, name: 'rbac', color: '5319e7', description: 'Role-based access control' },
        ],
        assignees: [],
        comments: 3,
        html_url: 'https://github.com/taskflow-ai-org/core-api/issues/5',
        created_at: '2026-08-09T11:20:00Z',
        updated_at: '2026-08-11T15:10:00Z',
      },
    ],
    'taskflow-ai-org/frontend-web': [
      {
        id: 6001,
        number: 1,
        node_id: 'I_kwDOG45601',
        title: 'Kanban board drag and drop performance drops with >100 tasks',
        body: 'Rendering lag occurs on dragging cards across columns when board contains over 100 tasks. Virtualized list optimization needed.',
        state: 'open',
        user: {
          id: 99190244,
          login: 'ui-master',
          avatar_url: 'https://avatars.githubusercontent.com/u/1020?v=4',
          html_url: 'https://github.com/ui-master',
        },
        labels: [
          { id: 1, name: 'bug', color: 'd73a4a', description: 'Bug report' },
          { id: 8, name: 'performance', color: 'f9d0c4', description: 'Performance optimization' },
        ],
        assignees: [
          {
            id: 99190241,
            login: 'dev-taskflow-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
            html_url: 'https://github.com/dev-taskflow-user',
          },
        ],
        comments: 5,
        html_url: 'https://github.com/taskflow-ai-org/frontend-web/issues/1',
        created_at: '2026-08-02T09:00:00Z',
        updated_at: '2026-08-10T14:00:00Z',
      },
      {
        id: 6002,
        number: 2,
        node_id: 'I_kwDOG45602',
        title: 'Dark mode color contrast fails WCAG accessibility compliance',
        body: 'Muted text on dark background does not meet WCAG AA contrast ratio of 4.5:1 in secondary labels.',
        state: 'closed',
        user: {
          id: 99190245,
          login: 'accessibility-lead',
          avatar_url: 'https://avatars.githubusercontent.com/u/1022?v=4',
          html_url: 'https://github.com/accessibility-lead',
        },
        labels: [
          { id: 9, name: 'accessibility', color: '0075ca', description: 'A11y compliance' },
        ],
        assignees: [],
        comments: 8,
        html_url: 'https://github.com/taskflow-ai-org/frontend-web/issues/2',
        created_at: '2026-07-15T10:00:00Z',
        updated_at: '2026-07-25T16:30:00Z',
        closed_at: '2026-07-25T16:30:00Z',
      },
      {
        id: 6003,
        number: 3,
        node_id: 'I_kwDOG45603',
        title: 'Add GitHub Issues browser and task importer modal',
        body: 'Implement full GitHub Issues integration: Issue Browser, Issue Details view, Task Import, Link Task, and Sync Issue metadata.',
        state: 'open',
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: 'https://github.com/dev-taskflow-user',
        },
        labels: [
          { id: 3, name: 'enhancement', color: 'a2eeef', description: 'New feature' },
          { id: 10, name: 'github-integration', color: '24292e', description: 'GitHub feature' },
        ],
        assignees: [],
        comments: 12,
        html_url: 'https://github.com/taskflow-ai-org/frontend-web/issues/3',
        created_at: '2026-08-05T13:00:00Z',
        updated_at: '2026-08-12T08:00:00Z',
      },
    ],
  };

  /**
   * Fetch mock repository issues
   */
  public static async fetchIssues(
    _accessToken: string,
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    let list = this.mockIssuesStore[repoKey] || [
      {
        id: 7001,
        number: 1,
        title: `Sample issue for ${owner}/${repo}`,
        body: `Automated sample issue created for connected repository ${owner}/${repo}.`,
        state: 'open',
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: 'https://github.com/dev-taskflow-user',
        },
        labels: [{ id: 1, name: 'sample', color: '0075ca' }],
        assignees: [],
        comments: 0,
        html_url: `https://github.com/${owner}/${repo}/issues/1`,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Filter by state
    if (options.state && options.state !== 'all') {
      list = list.filter((iss) => iss.state === options.state);
    }

    // Filter by label
    if (options.label) {
      const lbl = options.label.toLowerCase();
      list = list.filter((iss) =>
        iss.labels.some((l) => l.name.toLowerCase() === lbl)
      );
    }

    // Filter by author
    if (options.author) {
      const auth = options.author.toLowerCase();
      list = list.filter((iss) => iss.user.login.toLowerCase() === auth);
    }

    // Filter by assignee
    if (options.assignee) {
      const ass = options.assignee.toLowerCase();
      list = list.filter((iss) =>
        iss.assignees.some((a) => a.login.toLowerCase() === ass)
      );
    }

    // Filter by search query
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (iss) =>
          iss.number.toString().includes(q) ||
          iss.title.toLowerCase().includes(q) ||
          iss.body.toLowerCase().includes(q) ||
          iss.user.login.toLowerCase().includes(q) ||
          iss.labels.some((l) => l.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = options.sort || 'updated';
    const direction = options.direction || 'desc';
    const mult = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (sort === 'comments') {
        return (a.comments - b.comments) * mult;
      }
      if (sort === 'created') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mult;
      }
      return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * mult;
    });

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginatedIssues = list.slice(startIndex, startIndex + limit);

    return {
      issues: paginatedIssues,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetch single mock issue details
   */
  public static async fetchIssueDetails(
    _accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<IGitHubIssue> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const list = this.mockIssuesStore[repoKey] || [];
    const found = list.find((i) => i.number === issueNumber);

    if (found) {
      return { ...found };
    }

    // Fallback if requested custom issue number
    return {
      id: Math.floor(Math.random() * 90000) + 10000,
      number: issueNumber,
      node_id: `I_kwDOG_${issueNumber}`,
      title: `Mock Issue #${issueNumber} for ${owner}/${repo}`,
      body: `Detailed description for mock issue #${issueNumber}. Fully supported in TaskFlow mock mode.`,
      state: 'open',
      user: {
        id: 99190241,
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        html_url: 'https://github.com/dev-taskflow-user',
      },
      labels: [{ id: 1, name: 'taskflow', color: '4f46e5' }],
      assignees: [],
      comments: 1,
      html_url: `https://github.com/${owner}/${repo}/issues/${issueNumber}`,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Create new mock issue
   */
  public static async createIssue(
    _accessToken: string,
    owner: string,
    repo: string,
    payload: ICreateIssueOptions
  ): Promise<IGitHubIssue> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    if (!this.mockIssuesStore[repoKey]) {
      this.mockIssuesStore[repoKey] = [];
    }

    const nextNumber = (this.mockIssuesStore[repoKey].length || 0) + 10;
    const newIssue: IGitHubIssue = {
      id: Math.floor(Math.random() * 90000) + 10000,
      number: nextNumber,
      node_id: `I_kwDOG_${nextNumber}`,
      title: payload.title,
      body: payload.body || '',
      state: 'open',
      user: {
        id: 99190241,
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        html_url: 'https://github.com/dev-taskflow-user',
      },
      labels: (payload.labels || []).map((l, idx) => ({ id: idx + 1, name: l, color: '6366f1' })),
      assignees: (payload.assignees || []).map((a, idx) => ({
        id: idx + 100,
        login: a,
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        html_url: `https://github.com/${a}`,
      })),
      comments: 0,
      html_url: `https://github.com/${owner}/${repo}/issues/${nextNumber}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.mockIssuesStore[repoKey].unshift(newIssue);
    return newIssue;
  }

  /**
   * Mock branches store
   */
  private static mockBranchesStore: Record<string, IGitHubBranch[]> = {
    'taskflow-ai-org/core-api': [
      {
        name: 'main',
        protected: true,
        isDefault: true,
        commit: {
          sha: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
          shortSha: '9f8e7d6',
          url: 'https://github.com/taskflow-ai-org/core-api/commit/9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
          message: 'DEV-101: Fix API rate limiting middleware under burst traffic (Fixes #1)',
          authorName: 'Alex Developer',
          authorEmail: 'alex.dev@taskflow.ai',
          authorLogin: 'alex-dev',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/1012?v=4',
          committedAt: '2026-08-11T14:30:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/tree/main',
      },
      {
        name: 'develop',
        protected: false,
        isDefault: false,
        commit: {
          sha: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
          shortSha: '1a2b3c4',
          url: 'https://github.com/taskflow-ai-org/core-api/commit/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
          message: 'DEV-102: Add Socket.IO room isolation by workspace for real-time updates (Addresses #2)',
          authorName: 'Dev TaskFlow User',
          authorEmail: 'dev.user@taskflow.ai',
          authorLogin: 'dev-taskflow-user',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          committedAt: '2026-08-10T16:20:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/tree/develop',
      },
      {
        name: 'feature/login',
        protected: false,
        isDefault: false,
        commit: {
          sha: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
          shortSha: 'e5f6a7b',
          url: 'https://github.com/taskflow-ai-org/core-api/commit/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
          message: 'Add OAuth PKCE challenge verification helper module',
          authorName: 'Sarah Backend',
          authorEmail: 'sarah.backend@taskflow.ai',
          authorLogin: 'sarah-backend',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/1015?v=4',
          committedAt: '2026-08-08T11:45:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/tree/feature/login',
      },
      {
        name: 'feature/dashboard',
        protected: false,
        isDefault: false,
        commit: {
          sha: 'a1b2c3d4e5f67890123456789abcdef012345678',
          shortSha: 'a1b2c3d',
          url: 'https://github.com/taskflow-ai-org/core-api/commit/a1b2c3d4e5f67890123456789abcdef012345678',
          message: 'DEV-105: Refactor workspace activity analytics metrics response',
          authorName: 'Dev TaskFlow User',
          authorEmail: 'dev.user@taskflow.ai',
          authorLogin: 'dev-taskflow-user',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          committedAt: '2026-08-07T09:15:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/tree/feature/dashboard',
      },
      {
        name: 'bugfix/task-filter',
        protected: false,
        isDefault: false,
        commit: {
          sha: 'f1e2d3c4b5a69876543210fedcba9876543210fe',
          shortSha: 'f1e2d3c',
          url: 'https://github.com/taskflow-ai-org/core-api/commit/f1e2d3c4b5a69876543210fedcba9876543210fe',
          message: 'Fix date range query boundary in task search filters',
          authorName: 'Alex Developer',
          authorEmail: 'alex.dev@taskflow.ai',
          authorLogin: 'alex-dev',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/1012?v=4',
          committedAt: '2026-08-06T14:10:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/tree/bugfix/task-filter',
      },
    ],
  };

  /**
   * Mock commits store
   */
  private static mockCommitsStore: Record<string, IGitHubCommit[]> = {
    'taskflow-ai-org/core-api': [
      {
        sha: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
        shortSha: '9f8e7d6',
        message: 'DEV-101: Fix API rate limiting middleware under burst traffic (Fixes #1)',
        author: {
          name: 'Alex Developer',
          email: 'alex.dev@taskflow.ai',
          login: 'alex-dev',
          avatar_url: 'https://avatars.githubusercontent.com/u/1012?v=4',
          date: '2026-08-11T14:30:00Z',
        },
        committer: {
          name: 'Alex Developer',
          email: 'alex.dev@taskflow.ai',
          login: 'alex-dev',
          avatar_url: 'https://avatars.githubusercontent.com/u/1012?v=4',
          date: '2026-08-11T14:30:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/commit/9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
        branchName: 'main',
        committedAt: '2026-08-11T14:30:00Z',
        stats: { additions: 45, deletions: 12, total: 57 },
        files: [
          {
            filename: 'src/middlewares/rateLimiter.ts',
            status: 'modified',
            additions: 32,
            deletions: 10,
            changes: 42,
            patch: '@@ -14,6 +14,28 @@ const limiter = rateLimit({\n+  store: new RedisStore({\n+    sendCommand: (...args) => redisClient.call(...args),\n+  }),\n+  handler: (req, res) => {\n+    res.status(429).json({ error: "Too many requests" });\n+  }\n',
          },
          {
            filename: 'src/config/redis.ts',
            status: 'modified',
            additions: 13,
            deletions: 2,
            changes: 15,
            patch: '@@ -5,2 +5,13 @@ export const redisClient = createClient({\n+  socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 2000) }\n',
          },
        ],
      },
      {
        sha: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        shortSha: '1a2b3c4',
        message: 'DEV-102: Add Socket.IO room isolation by workspace for real-time updates (Addresses #2)',
        author: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: '2026-08-10T16:20:00Z',
        },
        committer: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: '2026-08-10T16:20:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/commit/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        branchName: 'develop',
        committedAt: '2026-08-10T16:20:00Z',
        stats: { additions: 88, deletions: 5, total: 93 },
        files: [
          {
            filename: 'src/services/socket.service.ts',
            status: 'added',
            additions: 70,
            deletions: 0,
            changes: 70,
            patch: '@@ -0,0 +1,70 @@\n+import { Server } from "socket.io";\n+export class SocketService {\n+  public static joinWorkspaceRoom(socket, workspaceId) {\n+    socket.join(`workspace:${workspaceId}`);\n+  }\n+}\n',
          },
          {
            filename: 'src/controllers/task.controller.ts',
            status: 'modified',
            additions: 18,
            deletions: 5,
            changes: 23,
          },
        ],
      },
      {
        sha: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
        shortSha: 'e5f6a7b',
        message: 'Add OAuth PKCE challenge verification helper module',
        author: {
          name: 'Sarah Backend',
          email: 'sarah.backend@taskflow.ai',
          login: 'sarah-backend',
          avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
          date: '2026-08-08T11:45:00Z',
        },
        committer: {
          name: 'Sarah Backend',
          email: 'sarah.backend@taskflow.ai',
          login: 'sarah-backend',
          avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
          date: '2026-08-08T11:45:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/commit/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
        branchName: 'feature/login',
        committedAt: '2026-08-08T11:45:00Z',
        stats: { additions: 35, deletions: 0, total: 35 },
        files: [
          {
            filename: 'src/utils/pkce.util.ts',
            status: 'added',
            additions: 35,
            deletions: 0,
            changes: 35,
          },
        ],
      },
      {
        sha: 'a1b2c3d4e5f67890123456789abcdef012345678',
        shortSha: 'a1b2c3d',
        message: 'DEV-105: Refactor workspace activity analytics metrics response',
        author: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: '2026-08-07T09:15:00Z',
        },
        committer: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: '2026-08-07T09:15:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/commit/a1b2c3d4e5f67890123456789abcdef012345678',
        branchName: 'feature/dashboard',
        committedAt: '2026-08-07T09:15:00Z',
        stats: { additions: 50, deletions: 20, total: 70 },
        files: [
          {
            filename: 'src/services/reports.service.ts',
            status: 'modified',
            additions: 50,
            deletions: 20,
            changes: 70,
          },
        ],
      },
      {
        sha: 'f1e2d3c4b5a69876543210fedcba9876543210fe',
        shortSha: 'f1e2d3c',
        message: 'Fix date range query boundary in task search filters',
        author: {
          name: 'Alex Developer',
          email: 'alex.dev@taskflow.ai',
          login: 'alex-dev',
          avatar_url: 'https://avatars.githubusercontent.com/u/1012?v=4',
          date: '2026-08-06T14:10:00Z',
        },
        committer: {
          name: 'Alex Developer',
          email: 'alex.dev@taskflow.ai',
          login: 'alex-dev',
          avatar_url: 'https://avatars.githubusercontent.com/u/1012?v=4',
          date: '2026-08-06T14:10:00Z',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/commit/f1e2d3c4b5a69876543210fedcba9876543210fe',
        branchName: 'bugfix/task-filter',
        committedAt: '2026-08-06T14:10:00Z',
        stats: { additions: 8, deletions: 4, total: 12 },
        files: [
          {
            filename: 'src/services/search.service.ts',
            status: 'modified',
            additions: 8,
            deletions: 4,
            changes: 12,
          },
        ],
      },
    ],
  };

  /**
   * Fetch mock branches for a repository
   */
  public static async fetchBranches(
    _accessToken: string,
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
    await new Promise((resolve) => setTimeout(resolve, 120));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    let list = this.mockBranchesStore[repoKey] || [
      {
        name: 'main',
        protected: true,
        isDefault: true,
        commit: {
          sha: 'a1b2c3d4e5f67890123456789abcdef012345678',
          shortSha: 'a1b2c3d',
          url: `https://github.com/${owner}/${repo}/commit/a1b2c3d4e5f67890123456789abcdef012345678`,
          message: `Initial main commit for ${owner}/${repo}`,
          authorName: 'Dev TaskFlow User',
          authorEmail: 'dev.user@taskflow.ai',
          authorLogin: 'dev-taskflow-user',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          committedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        html_url: `https://github.com/${owner}/${repo}/tree/main`,
      },
      {
        name: 'develop',
        protected: false,
        isDefault: false,
        commit: {
          sha: 'f1e2d3c4b5a69876543210fedcba9876543210fe',
          shortSha: 'f1e2d3c',
          url: `https://github.com/${owner}/${repo}/commit/f1e2d3c4b5a69876543210fedcba9876543210fe`,
          message: `Development branch commit for ${owner}/${repo}`,
          authorName: 'Alex Developer',
          authorEmail: 'alex.dev@taskflow.ai',
          authorLogin: 'alex-dev',
          authorAvatarUrl: 'https://avatars.githubusercontent.com/u/1012?v=4',
          committedAt: new Date().toISOString(),
        },
        html_url: `https://github.com/${owner}/${repo}/tree/develop`,
      },
    ];

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }

    if (options.filter && options.filter !== 'all') {
      if (options.filter === 'default') {
        list = list.filter((b) => b.isDefault);
      } else if (options.filter === 'protected') {
        list = list.filter((b) => b.protected);
      } else if (options.filter === 'unprotected') {
        list = list.filter((b) => !b.protected);
      }
    }

    if (options.protected !== undefined) {
      list = list.filter((b) => b.protected === options.protected);
    }

    const sort = options.sort || 'name';
    if (sort === 'name') {
      list.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      branches: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetch single mock branch details
   */
  public static async fetchBranchDetails(
    _accessToken: string,
    owner: string,
    repo: string,
    branchName: string
  ): Promise<IGitHubBranch> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const list = this.mockBranchesStore[repoKey] || [];
    const found = list.find((b) => b.name.toLowerCase() === branchName.toLowerCase());

    if (found) {
      return { ...found };
    }

    const isDefault = branchName === 'main' || branchName === 'master';
    return {
      name: branchName,
      protected: isDefault,
      isDefault,
      commit: {
        sha: 'b1c2d3e4f5a67890123456789abcdef012345678',
        shortSha: 'b1c2d3e',
        url: `https://github.com/${owner}/${repo}/commit/b1c2d3e4f5a67890123456789abcdef012345678`,
        message: `Latest commit on branch ${branchName}`,
        authorName: 'Dev TaskFlow User',
        authorEmail: 'dev.user@taskflow.ai',
        authorLogin: 'dev-taskflow-user',
        authorAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
        committedAt: new Date().toISOString(),
      },
      html_url: `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branchName)}`,
    };
  }

  /**
   * Fetch mock commits for a repository
   */
  public static async fetchCommits(
    _accessToken: string,
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    let list = this.mockCommitsStore[repoKey] || [
      {
        sha: 'c1d2e3f4a5b67890123456789abcdef012345678',
        shortSha: 'c1d2e3f',
        message: `DEV-101: Initial task commit for ${owner}/${repo} (Fixes #1)`,
        author: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        committer: {
          name: 'Dev TaskFlow User',
          email: 'dev.user@taskflow.ai',
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        html_url: `https://github.com/${owner}/${repo}/commit/c1d2e3f4a5b67890123456789abcdef012345678`,
        branchName: options.branch || 'main',
        committedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    if (options.branch) {
      const b = options.branch.toLowerCase();
      list = list.filter((c) => !c.branchName || c.branchName.toLowerCase() === b || b === 'main');
    }

    if (options.author) {
      const a = options.author.toLowerCase();
      list = list.filter((c) => c.author.name.toLowerCase().includes(a) || c.author.login.toLowerCase().includes(a));
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.sha.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q) ||
          c.author.name.toLowerCase().includes(q) ||
          c.author.login.toLowerCase().includes(q)
      );
    }

    if (options.from) {
      const sinceTime = new Date(options.from).getTime();
      list = list.filter((c) => new Date(c.committedAt).getTime() >= sinceTime);
    }

    if (options.to) {
      const untilTime = new Date(options.to).getTime();
      list = list.filter((c) => new Date(c.committedAt).getTime() <= untilTime);
    }

    if (options.sort === 'oldest') {
      list.sort((a, b) => new Date(a.committedAt).getTime() - new Date(b.committedAt).getTime());
    } else if (options.sort === 'author') {
      list.sort((a, b) => a.author.name.localeCompare(b.author.name));
    } else {
      list.sort((a, b) => new Date(b.committedAt).getTime() - new Date(a.committedAt).getTime());
    }

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      commits: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetch single mock commit details
   */
  public static async fetchCommitDetails(
    _accessToken: string,
    owner: string,
    repo: string,
    sha: string
  ): Promise<IGitHubCommit> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const list = this.mockCommitsStore[repoKey] || [];
    const found = list.find((c) => c.sha.toLowerCase() === sha.toLowerCase() || c.shortSha === sha);

    if (found) {
      return { ...found };
    }

    return {
      sha,
      shortSha: sha.substring(0, 7),
      message: `Detailed mock commit message for SHA ${sha} in ${owner}/${repo}`,
      author: {
        name: 'Dev TaskFlow User',
        email: 'dev.user@taskflow.ai',
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        date: new Date().toISOString(),
      },
      committer: {
        name: 'Dev TaskFlow User',
        email: 'dev.user@taskflow.ai',
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        date: new Date().toISOString(),
      },
      html_url: `https://github.com/${owner}/${repo}/commit/${sha}`,
      committedAt: new Date().toISOString(),
      stats: { additions: 15, deletions: 3, total: 18 },
      files: [
        {
          filename: 'src/components/TaskDetail.tsx',
          status: 'modified',
          additions: 10,
          deletions: 2,
          changes: 12,
        },
        {
          filename: 'src/types/task.ts',
          status: 'modified',
          additions: 5,
          deletions: 1,
          changes: 6,
        },
      ],
    };
  }

  /**
   * Compare mock commits
   */
  public static async compareCommits(
    _accessToken: string,
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<IGitHubCommitCompare> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const commits = this.mockCommitsStore[repoKey] || [];

    return {
      status: 'ahead',
      ahead_by: 2,
      behind_by: 0,
      total_commits: 2,
      commits: commits.slice(0, 2),
      files: [
        {
          filename: 'src/middlewares/rateLimiter.ts',
          status: 'modified',
          additions: 32,
          deletions: 10,
          changes: 42,
        },
      ],
    };
  }

  /**
   * Mock Pull Requests Store
   */
  public static mockPullRequestsStore: Record<string, IGitHubPullRequest[]> = {
    'taskflow-ai-org/core-api': [
      {
        id: 5001,
        number: 101,
        node_id: 'PR_kwDOK1234_101',
        title: 'feat(auth): Implement OAuth2 Token Refresh and Session Handling [DEV-1019]',
        body: 'Implements automatic token refresh and session encryption for GitHub OAuth integration.\n\nCloses DEV-1019 and references #2.',
        state: 'open',
        state_reason: null,
        draft: false,
        merged: false,
        mergeable: true,
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: 'https://github.com/dev-taskflow-user',
          name: 'Dev TaskFlow User',
        },
        assignees: [
          {
            id: 99190241,
            login: 'dev-taskflow-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          },
        ],
        requested_reviewers: [
          {
            id: 88201,
            login: 'sarah-connor',
            avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
          },
        ],
        reviews: [
          {
            id: 9001,
            user: {
              id: 88201,
              login: 'sarah-connor',
              avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
              name: 'Sarah Connor',
            },
            state: 'APPROVED',
            body: 'LGTM! Excellent token security handling and clean modular structure.',
            submitted_at: '2026-08-11T14:20:00Z',
          },
        ],
        reviewStatus: 'Approved',
        head: {
          ref: 'feature/DEV-1019-auth-flow',
          sha: 'a1b2c3d4e5f678901234567890abcdef12345678',
          label: 'taskflow-ai-org:feature/DEV-1019-auth-flow',
        },
        base: {
          ref: 'main',
          sha: 'b2c3d4e5f678901234567890abcdef123456789',
          label: 'taskflow-ai-org:main',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/pull/101',
        created_at: '2026-08-10T09:00:00Z',
        updated_at: '2026-08-11T14:20:00Z',
        commits_count: 4,
        additions: 145,
        deletions: 22,
        changed_files: 5,
      },
      {
        id: 5002,
        number: 102,
        node_id: 'PR_kwDOK1234_102',
        title: 'draft: Add Redis Caching Layer for Task Queries',
        body: 'WIP proposal for caching task queries in Redis to improve dashboard load speeds.',
        state: 'open',
        state_reason: null,
        draft: true,
        merged: false,
        mergeable: true,
        user: {
          id: 77202,
          login: 'alex-chen',
          avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
          name: 'Alex Chen',
        },
        requested_reviewers: [
          {
            id: 99190241,
            login: 'dev-taskflow-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          },
        ],
        reviews: [],
        reviewStatus: 'Pending',
        head: {
          ref: 'feature/redis-cache',
          sha: 'c3d4e5f678901234567890abcdef1234567890a',
          label: 'taskflow-ai-org:feature/redis-cache',
        },
        base: {
          ref: 'main',
          sha: 'b2c3d4e5f678901234567890abcdef123456789',
          label: 'taskflow-ai-org:main',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/pull/102',
        created_at: '2026-08-11T11:00:00Z',
        updated_at: '2026-08-11T11:00:00Z',
        commits_count: 2,
        additions: 88,
        deletions: 5,
        changed_files: 3,
      },
      {
        id: 5003,
        number: 103,
        node_id: 'PR_kwDOK1234_103',
        title: 'fix(api): Resolve Rate Limiter Redis Connection Leak',
        body: 'Fixes connection leak when handling rate limit checks under high load.',
        state: 'closed',
        state_reason: 'not_planned',
        draft: false,
        merged: false,
        mergeable: false,
        user: {
          id: 99190241,
          login: 'dev-taskflow-user',
          avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
          name: 'Dev TaskFlow User',
        },
        reviews: [
          {
            id: 9002,
            user: {
              id: 77202,
              login: 'alex-chen',
              avatar_url: 'https://avatars.githubusercontent.com/u/1018?v=4',
            },
            state: 'CHANGES_REQUESTED',
            body: 'Superceded by PR #101 architecture.',
            submitted_at: '2026-08-09T16:00:00Z',
          },
        ],
        reviewStatus: 'Closed',
        head: {
          ref: 'fix/rate-limiter',
          sha: 'd4e5f678901234567890abcdef1234567890ab',
          label: 'taskflow-ai-org:fix/rate-limiter',
        },
        base: {
          ref: 'main',
          sha: 'b2c3d4e5f678901234567890abcdef123456789',
          label: 'taskflow-ai-org:main',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/pull/103',
        created_at: '2026-08-08T10:00:00Z',
        updated_at: '2026-08-09T16:00:00Z',
        closed_at: '2026-08-09T16:05:00Z',
        commits_count: 1,
        additions: 12,
        deletions: 18,
        changed_files: 2,
      },
      {
        id: 5004,
        number: 104,
        node_id: 'PR_kwDOK1234_104',
        title: 'feat(tasks): Task Status & Label Management Endpoint (#2)',
        body: 'Adds bulk updating for task statuses and labels.\n\nCloses #2.',
        state: 'closed',
        state_reason: 'completed',
        draft: false,
        merged: true,
        mergeable: false,
        user: {
          id: 88201,
          login: 'sarah-connor',
          avatar_url: 'https://avatars.githubusercontent.com/u/1015?v=4',
          name: 'Sarah Connor',
        },
        reviews: [
          {
            id: 9003,
            user: {
              id: 99190241,
              login: 'dev-taskflow-user',
              avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
            },
            state: 'APPROVED',
            body: 'Approved and tested in staging environment.',
            submitted_at: '2026-08-07T12:00:00Z',
          },
        ],
        reviewStatus: 'Merged',
        head: {
          ref: 'feature/task-labels',
          sha: 'e5f678901234567890abcdef1234567890abc1',
          label: 'taskflow-ai-org:feature/task-labels',
        },
        base: {
          ref: 'main',
          sha: 'b2c3d4e5f678901234567890abcdef123456789',
          label: 'taskflow-ai-org:main',
        },
        html_url: 'https://github.com/taskflow-ai-org/core-api/pull/104',
        created_at: '2026-08-06T08:00:00Z',
        updated_at: '2026-08-07T12:30:00Z',
        closed_at: '2026-08-07T12:30:00Z',
        merged_at: '2026-08-07T12:30:00Z',
        commits_count: 3,
        additions: 210,
        deletions: 45,
        changed_files: 6,
      },
    ],
  };

  /**
   * Fetch mock Pull Requests
   */
  public static async fetchPullRequests(
    _accessToken: string,
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    let list = [...(this.mockPullRequestsStore[repoKey] || this.mockPullRequestsStore['taskflow-ai-org/core-api'])];

    // Filter by state
    if (options.state && options.state !== 'all') {
      if (options.state === 'open') {
        list = list.filter((pr) => pr.state === 'open');
      } else if (options.state === 'closed') {
        list = list.filter((pr) => pr.state === 'closed');
      }
    }

    // Filter by draft
    if (options.draft !== undefined) {
      list = list.filter((pr) => pr.draft === options.draft);
    }

    // Filter by merged
    if (options.merged !== undefined) {
      list = list.filter((pr) => pr.merged === options.merged);
    }

    // Filter by author
    if (options.author) {
      const q = options.author.toLowerCase();
      list = list.filter((pr) => pr.user.login.toLowerCase() === q);
    }

    // Filter by base / head
    if (options.base) {
      list = list.filter((pr) => pr.base.ref === options.base);
    }
    if (options.head) {
      list = list.filter((pr) => pr.head.ref === options.head);
    }

    // Search
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (pr) =>
          pr.title.toLowerCase().includes(q) ||
          pr.number.toString().includes(q) ||
          pr.user.login.toLowerCase().includes(q) ||
          pr.head.ref.toLowerCase().includes(q)
      );
    }

    // Sort
    const sort = options.sort || 'updated';
    const direction = options.direction || 'desc';
    list.sort((a, b) => {
      let valA = new Date(a.updated_at).getTime();
      let valB = new Date(b.updated_at).getTime();
      if (sort === 'created') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;

    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      pullRequests: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetch mock single Pull Request Details
   */
  public static async fetchPullRequestDetails(
    _accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequest> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const list = this.mockPullRequestsStore[repoKey] || this.mockPullRequestsStore['taskflow-ai-org/core-api'];
    const found = list.find((pr) => pr.number === Number(prNumber));

    if (found) {
      return found;
    }

    // Default mock fallback if not found
    return {
      id: 5099,
      number: Number(prNumber),
      title: `Mock Pull Request #${prNumber}`,
      body: `Detailed description for mock PR #${prNumber} in ${owner}/${repo}`,
      state: 'open',
      draft: false,
      merged: false,
      user: {
        id: 99190241,
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      },
      reviewStatus: 'Pending',
      head: { ref: 'feature/mock-branch', sha: '1234567890abcdef1234567890abcdef12345678' },
      base: { ref: 'main', sha: 'abcdef1234567890abcdef1234567890abcdef12' },
      html_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      commits_count: 2,
      additions: 45,
      deletions: 12,
      changed_files: 3,
    };
  }

  /**
   * Fetch mock PR changed files
   */
  public static async fetchPullRequestFiles(
    _accessToken: string,
    _owner: string,
    _repo: string,
    _prNumber: number
  ): Promise<IGitHubPullRequestFile[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [
      {
        filename: 'src/services/githubApi.service.ts',
        status: 'modified',
        additions: 85,
        deletions: 10,
        changes: 95,
        patch: '@@ -10,6 +10,85 @@ import axios from "axios";\n+// Pull request integration handlers\n+export interface IGitHubPullRequest { id: number; }',
      },
      {
        filename: 'src/components/github/PullRequestBrowser.tsx',
        status: 'added',
        additions: 120,
        deletions: 0,
        changes: 120,
        patch: '@@ -0,0 +1,120 @@\n+// Pull Request Browser component\n+export const PullRequestBrowser = () => {};',
      },
      {
        filename: 'src/types/pullRequest.ts',
        status: 'modified',
        additions: 15,
        deletions: 5,
        changes: 20,
        patch: '@@ -5,3 +5,15 @@ export type PRState = "open" | "closed" | "merged";',
      },
    ];
  }

  /**
   * Fetch mock PR commits
   */
  public static async fetchPullRequestCommits(
    _accessToken: string,
    owner: string,
    repo: string,
    _prNumber: number
  ): Promise<IGitHubCommit[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const repoKey = `${owner}/${repo}`.toLowerCase();
    const commits = this.mockCommitsStore[repoKey] || [];
    return commits.slice(0, 3);
  }

  /**
   * Fetch mock PR reviews
   */
  public static async fetchPullRequestReviews(
    _accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<IGitHubPullRequestReview[]> {
    const pr = await this.fetchPullRequestDetails('', owner, repo, prNumber);
    return pr.reviews || [];
  }

  /**
   * Create mock PR
   */
  public static async createPullRequest(
    _accessToken: string,
    owner: string,
    repo: string,
    payload: ICreatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const existing = this.mockPullRequestsStore[repoKey] || [];
    const nextNumber = existing.length > 0 ? Math.max(...existing.map((p) => p.number)) + 1 : 105;

    const newPr: IGitHubPullRequest = {
      id: Date.now(),
      number: nextNumber,
      node_id: `PR_kwDOK1234_${nextNumber}`,
      title: payload.title,
      body: payload.body || '',
      state: 'open',
      draft: !!payload.draft,
      merged: false,
      user: {
        id: 99190241,
        login: 'dev-taskflow-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        name: 'Dev TaskFlow User',
      },
      reviews: [],
      reviewStatus: 'Pending',
      head: {
        ref: payload.head,
        sha: 'f1a2b3c4d5e678901234567890abcdef12345678',
        label: `${owner}:${payload.head}`,
      },
      base: {
        ref: payload.base,
        sha: 'b2c3d4e5f678901234567890abcdef123456789',
        label: `${owner}:${payload.base}`,
      },
      html_url: `https://github.com/${owner}/${repo}/pull/${nextNumber}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      commits_count: 1,
      additions: 25,
      deletions: 3,
      changed_files: 2,
    };

    if (!this.mockPullRequestsStore[repoKey]) {
      this.mockPullRequestsStore[repoKey] = [];
    }
    this.mockPullRequestsStore[repoKey].unshift(newPr);

    return newPr;
  }

  /**
   * Update mock PR
   */
  public static async updatePullRequest(
    _accessToken: string,
    owner: string,
    repo: string,
    prNumber: number,
    payload: IUpdatePullRequestOptions
  ): Promise<IGitHubPullRequest> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const repoKey = `${owner}/${repo}`.toLowerCase();
    const list = this.mockPullRequestsStore[repoKey] || [];
    const found = list.find((p) => p.number === Number(prNumber));

    if (found) {
      if (payload.title) found.title = payload.title;
      if (payload.body !== undefined) found.body = payload.body;
      if (payload.state) {
        found.state = payload.state;
        if (payload.state === 'closed') {
          found.closed_at = new Date().toISOString();
        }
      }
      if (payload.base) found.base.ref = payload.base;
      found.updated_at = new Date().toISOString();
      return found;
    }

    return this.fetchPullRequestDetails('', owner, repo, prNumber);
  }
}

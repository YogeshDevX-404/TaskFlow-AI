export type ActivityTimeRangePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '14d'
  | '30d'
  | '90d'
  | '1y'
  | 'custom';

export interface ActivityAnalyticsFilters {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  repositoryId?: string;
  userId?: string;
  timeRange?: ActivityTimeRangePreset;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ActivitySummaryMetrics {
  totalContributions: number;
  commitsCount: number;
  pullRequestsCount: number;
  prsMergedCount: number;
  prsOpenCount: number;
  reviewsCount: number;
  tasksCompletedCount: number;
  tasksCreatedCount: number;
  totalHoursLogged: number;
  activeContributorsCount: number;
  connectedRepositoriesCount: number;
}

export interface ActivityTimelinePoint {
  date: string;
  totalContributions: number;
  commits: number;
  pullRequests: number;
  reviews: number;
  tasks: number;
}

export interface DeveloperActivityOverviewResponse {
  summary: ActivitySummaryMetrics;
  timeline: ActivityTimelinePoint[];
  breakdown: {
    commitsPercent: number;
    prsPercent: number;
    reviewsPercent: number;
    tasksPercent: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
}

export interface DeveloperMetricItem {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubConnected: boolean;
  totalContributions: number;
  contributionScore: number;
  commitsCount: number;
  prsOpenedCount: number;
  prsMergedCount: number;
  reviewsCount: number;
  tasksCompletedCount: number;
  tasksCreatedCount: number;
  hoursLogged: number;
  streakDays: number;
  lastActiveAt: string | null;
  impactRank?: number;
}

export interface DeveloperLeaderboardResponse {
  developers: DeveloperMetricItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContributionHeatmapDay {
  date: string;
  count: number;
  commits: number;
  pullRequests: number;
  reviews: number;
  tasks: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface WorkPatternHour {
  hour: number;
  count: number;
}

export interface WorkPatternWeekday {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  count: number;
}

export interface DeveloperDeepDiveResponse {
  developer: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    githubUsername?: string;
    githubAvatarUrl?: string;
    githubConnected: boolean;
  };
  stats: {
    totalCommits: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    tasksCompleted: number;
    totalContributions: number;
  };
  heatmap: ContributionHeatmapDay[];
  workPatterns: {
    byHour: WorkPatternHour[];
    byWeekday: WorkPatternWeekday[];
  };
  recentCommits: Array<{
    id: string;
    sha: string;
    shortSha: string;
    message: string;
    committedAt: string;
    commitUrl: string;
    repositoryName: string;
  }>;
  recentPullRequests: Array<{
    id: string;
    number: number;
    title: string;
    state: string;
    reviewStatus: string;
    githubUrl: string;
    createdAt: string;
    repositoryName: string;
  }>;
  recentTasks: Array<{
    id: string;
    key: string;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
    projectName: string;
  }>;
  recentActivities: any[];
}

export interface RepositoryActivityMetric {
  id: string;
  repositoryName: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  language: string;
  visibility: string;
  status: string;
  commitsCount: number;
  pullRequestsCount: number;
  mergedPRsCount: number;
  openPRsCount: number;
  activeContributorsCount: number;
  lastSyncedAt: string;
}

export interface RepositoryActivityResponse {
  repositories: RepositoryActivityMetric[];
  totalRepositories: number;
}

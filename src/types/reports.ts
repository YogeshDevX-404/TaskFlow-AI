export interface ReportFilterParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  userId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  type?: string;
  label?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  datePreset?:
    | 'today'
    | 'yesterday'
    | 'last7'
    | 'last30'
    | 'last90'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisQuarter'
    | 'custom'
    | 'all';
}

export interface ExecutiveOverview {
  totalOrganizations: number;
  totalWorkspaces: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  activeMembers: number;
  completionRate: number;
}

export interface ProjectHealthItem {
  id: string;
  name: string;
  key: string;
  status: string;
  healthStatus: 'Healthy' | 'At Risk' | 'Critical';
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  openBugs: number;
  completedBugs: number;
}

export interface TaskAnalytics {
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  labelDistribution: Array<{ label: string; count: number }>;
  dailyTrend: Array<{ date: string; created: number; completed: number }>;
}

export interface TeamPerformanceItem {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  assignedTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  completionRate: number;
  avgCompletionHours: number;
}

export interface UserReport {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  metrics: {
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    createdTasks: number;
    commentsCount: number;
    activityCount: number;
    completionRate: number;
  };
  recentTasks: Array<{
    id: string;
    title: string;
    taskKey: string;
    status: string;
    priority: string;
    updatedAt: string;
  }>;
}

export interface SprintBurndownPoint {
  day: string;
  date: string;
  idealRemaining: number;
  actualRemaining: number;
}

export interface SprintBurnupPoint {
  day: string;
  date: string;
  completedWork: number;
  totalScope: number;
}

export interface SprintReport {
  sprint: {
    id: string;
    name: string;
    goal: string;
    status: string;
    startDate?: string;
    endDate?: string;
    velocity: number;
  } | null;
  tasksSummary: {
    total: number;
    completed: number;
    remaining: number;
    blocked: number;
  };
  storyPointsSummary: {
    total: number;
    completed: number;
    remaining: number;
  };
  completionPercentage: number;
  burndownChart: SprintBurndownPoint[];
  burnupChart: SprintBurnupPoint[];
}

export interface VelocityItem {
  sprintId: string;
  sprintName: string;
  plannedPoints: number;
  completedPoints: number;
}

export interface ActivityAnalytics {
  totalLogs: number;
  actionBreakdown: Array<{ action: string; count: number }>;
  recentActivities: Array<{
    id: string;
    userName: string;
    userAvatar: string;
    action: string;
    entityType: string;
    timestamp: string;
  }>;
}

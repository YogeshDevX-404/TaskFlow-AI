export interface DashboardQuickStats {
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  openBugs: number;
  progressPercentage: number;
}

export interface ProjectHealthMetrics {
  completion: number;
  velocity: number;
  upcomingTasks: number;
  openIssues: number;
  blockedItems: number;
}

export interface ProjectActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'member_added' | 'member_removed' | 'role_changed' | 'milestone_reached';
  title: string;
  description: string;
  actor: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  date: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  color?: string;
}

export interface AnalyticsCharts {
  areaChartData: ChartDataPoint[];
  barChartData: ChartDataPoint[];
  lineChartData: ChartDataPoint[];
  pieChartData: ChartDataPoint[];
}

export interface TimelinePhase {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  startDate: string;
  endDate: string;
  progressPercentage: number;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assigneeName?: string;
  category: string;
}

export interface PinnedItem {
  id: string;
  title: string;
  type: 'repository' | 'doc' | 'design' | 'link' | 'board';
  url: string;
  updatedAt: string;
}

export interface ProjectDashboardData {
  projectId: string;
  projectInformation: {
    name: string;
    key: string;
    description: string;
    workspace: string;
    organization: string;
    visibility: 'public' | 'private' | 'internal';
    status: string;
    owner: {
      name: string;
      email: string;
    };
    repositoryUrl: string;
    websiteUrl: string;
    createdAt: string;
    updatedAt: string;
  };
  quickStats: DashboardQuickStats;
  health: ProjectHealthMetrics;
  recentActivity: ProjectActivityItem[];
  recentMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    joinedAt: string;
  }>;
  analyticsCharts: AnalyticsCharts;
  timeline: TimelinePhase[];
  upcomingDeadlines: UpcomingDeadline[];
  pinnedItems: PinnedItem[];
}

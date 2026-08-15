export type WorkloadStatus =
  | 'Available'
  | 'Normal'
  | 'High'
  | 'Overloaded'
  | 'No Capacity Data';

export interface MemberCapacityConfig {
  id?: string;
  user: string;
  organization: string;
  workspace?: string;
  weeklyCapacityHours: number;
  dailyCapacityHours: number;
  workingDays: string[];
  timezone: string;
  startOfWeek: string;
  endOfWeek: string;
  isCustomized?: boolean;
}

export interface TaskStatusDistribution {
  backlog: number;
  todo: number;
  inProgress: number;
  inReview: number;
  testing: number;
  done: number;
  blocked: number;
  cancelled: number;
}

export interface MemberWorkload {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    jobTitle?: string;
    department?: string;
  };
  assignedTasksCount: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  overdueTasksCount: number;
  blockedTasksCount: number;
  taskDistribution: TaskStatusDistribution;
  storyPoints: number;
  estimatedHours: number;
  loggedHours: number;
  remainingHours: number;
  capacity: {
    weeklyCapacityHours: number;
    dailyCapacityHours: number;
    workingDays: string[];
    timezone: string;
  };
  utilizationPercentage: number;
  workloadStatus: WorkloadStatus;
}

export interface TeamWorkloadSummary {
  totalMembers: number;
  totalCapacityHours: number;
  allocatedCapacityHours: number;
  availableCapacityHours: number;
  totalEstimatedWorkHours: number;
  totalLoggedWorkHours: number;
  teamUtilizationPercentage: number;
  overloadedMembersCount: number;
  highWorkloadMembersCount: number;
  normalWorkloadMembersCount: number;
  availableMembersCount: number;
  noCapacityMembersCount: number;
}

export interface ProjectResourceMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTasksCount: number;
  estimatedHours: number;
  loggedHours: number;
  remainingHours: number;
}

export interface ProjectWorkload {
  project: {
    id: string;
    name: string;
    key: string;
  };
  summary: {
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalStoryPoints: number;
    totalEstimatedHours: number;
    totalLoggedHours: number;
    resourcesCount: number;
  };
  resources: ProjectResourceMember[];
}

export interface WorkloadCalendarTask {
  id: string;
  taskKey: string;
  title: string;
  priority: string;
  status: string;
  estimatedHours: number;
}

export interface WorkloadCalendarEntry {
  userId: string;
  userName: string;
  date: string;
  assignedTasksCount: number;
  estimatedHours: number;
  tasks: WorkloadCalendarTask[];
}

export interface OverloadedMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  assignedTasksCount: number;
  estimatedHours: number;
  weeklyCapacityHours: number;
  excessHours: number;
  utilizationPercentage: number;
}

export interface UpcomingTask {
  id: string;
  taskKey: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  estimatedHours: number;
  assignee?: {
    _id?: string;
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  project?: {
    _id?: string;
    id?: string;
    name?: string;
    key?: string;
  };
}

export interface OverdueTask {
  id: string;
  taskKey: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  daysOverdue: number;
  estimatedHours: number;
  assignee?: {
    _id?: string;
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  project?: {
    _id?: string;
    id?: string;
    name?: string;
    key?: string;
  };
}

export interface WorkloadRecommendation {
  id: string;
  type: 'overload' | 'available' | 'unassigned' | 'overdue';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  memberId?: string;
  memberName?: string;
}

export interface WorkloadFilterParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  memberId?: string;
  role?: string;
  workloadStatus?: string;
  search?: string;
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

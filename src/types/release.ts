export type ReleaseStatus =
  | 'Planning'
  | 'Scheduled'
  | 'In Development'
  | 'Testing'
  | 'Ready'
  | 'Released'
  | 'Cancelled'
  | 'Archived';

export type GoalType = 'Release' | 'Business' | 'Technical';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Achieved';

export type MilestoneStatus = 'Upcoming' | 'In Progress' | 'Achieved' | 'Delayed';

export interface ReleaseMilestone {
  id: string;
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  description?: string;
  isCompleted: boolean;
}

export interface ReleaseGoal {
  id: string;
  title: string;
  type: GoalType;
  status: GoalStatus;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  description?: string;
  project?: {
    id: string;
    name: string;
    projectKey?: string;
    key?: string;
    color?: string;
  } | string;
  workspace?: any;
  organization?: any;
  status: ReleaseStatus;
  releaseDate?: string;
  startDate?: string;
  endDate?: string;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | string;
  color?: string;
  icon?: string;
  milestones: ReleaseMilestone[];
  goals: ReleaseGoal[];
  tasks: any[];
  progress: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  openBugs: number;
  blockedWork: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseFormData {
  name: string;
  version: string;
  description?: string;
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  status?: ReleaseStatus;
  releaseDate?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  color?: string;
  icon?: string;
  milestones?: ReleaseMilestone[];
  goals?: ReleaseGoal[];
  taskIds?: string[];
}

export interface ReleaseFilters {
  status?: ReleaseStatus | 'all';
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  searchQuery?: string;
  version?: string;
  ownerId?: string;
  isArchived?: boolean;
  sort?: 'releaseDate_asc' | 'releaseDate_desc' | 'createdAt_desc' | 'name_asc';
}

export interface RoadmapSummary {
  totalReleases: number;
  upcomingReleases: number;
  currentReleases: number;
  completedReleases: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  openBugs: number;
  blockedWork: number;
  overallProgress: number;
}

export interface RoadmapData {
  releases: Release[];
  projects: any[];
  sprints: any[];
  summary: RoadmapSummary;
}

export type RoadmapViewMode = 'quarter' | 'month' | 'week' | 'timeline';
export type RoadmapZoomLevel = 'compact' | 'normal' | 'detailed';

export * from './workspace';
export * from './project';
export * from './projectMember';
export * from './dashboard';
export * from './task';
export * from './timeEntry';
export * from './workload';
export * from './workAssignment';

export type ThemeMode = 'dark' | 'light';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  jobTitle?: string;
  department?: string;
  status?: 'online' | 'busy' | 'offline';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  membersCount: number;
}

export interface TaskComment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface TeamMember extends User {
  assignedTasksCount: number;
  weeklyWorkloadHrs: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  lead: User;
  members: TeamMember[];
  projectsCount: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: User;
  status: 'open' | 'merged' | 'draft' | 'closed';
  branch: string;
  baseBranch: string;
  commentsCount: number;
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
  updatedAt: string;
  pullRequests: PullRequest[];
  pipelineStatus: 'success' | 'running' | 'failed' | 'idle';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'mention' | 'assignment' | 'status_change' | 'system';
  read: boolean;
  createdAt: string;
  actor?: User;
  link?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  timeframe: string;
}

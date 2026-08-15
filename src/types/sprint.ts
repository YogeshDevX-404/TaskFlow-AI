import { Task } from './task';

export type SprintStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled';

export interface SprintUserRef {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export interface SprintProjectRef {
  id: string;
  name: string;
  projectKey?: string;
  icon?: string;
}

export interface Sprint {
  id: string;
  _id?: string;
  name: string;
  goal?: string;
  description?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  project: string | SprintProjectRef;
  workspace?: string | any;
  organization?: string | any;
  createdBy?: string | SprintUserRef;
  updatedBy?: string | SprintUserRef;
  tasks?: string[] | Task[];
  taskIds?: string[];
  velocity: number;
  capacity: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SprintFormData {
  name: string;
  goal?: string;
  description?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
  projectId: string;
  capacity?: number;
}

export interface SprintFilters {
  status?: SprintStatus | 'all';
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  searchQuery?: string;
  ownerId?: string;
  isArchived?: boolean;
}

export type SprintSortOption = 'newest' | 'oldest' | 'startDate' | 'endDate';

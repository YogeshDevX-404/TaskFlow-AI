import { User } from './auth';

export type TaskType =
  | 'Task'
  | 'Bug'
  | 'Story'
  | 'Epic'
  | 'Feature'
  | 'Improvement'
  | 'Research'
  | 'Spike';

export type TaskStatus =
  | 'Backlog'
  | 'Todo'
  | 'In Progress'
  | 'In Review'
  | 'Testing'
  | 'Done'
  | 'Blocked'
  | 'Cancelled';

export type TaskPriority =
  | 'Lowest'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Highest'
  | 'Urgent';

export interface TaskRefObject {
  id: string;
  name: string;
  projectKey?: string;
  icon?: string;
  slug?: string;
  [key: string]: any;
}

export interface TaskUserRef {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  taskKey: string;
  description?: string;
  project: string | TaskRefObject;
  workspace: string | TaskRefObject;
  organization: string | TaskRefObject;
  sprint?: string | any;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee?: string | TaskUserRef;
  reporter?: string | TaskUserRef;
  labels: string[];
  startDate?: string;
  dueDate?: string;
  estimatedHours: number;
  spentHours: number;
  storyPoints: number;
  watchers: string[];
  watcherDetails?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  favoritesCount?: number;
  isFavorite?: boolean;
  isWatching?: boolean;
  isArchived: boolean;
  createdBy?: string | TaskUserRef;
  updatedBy?: string | TaskUserRef;
  createdAt: string;
  updatedAt: string;
  // Hierarchy & Dependencies
  parentTask?: string | any;
  depth?: number;
  sortOrder?: number;
  epic?: string | any;
  story?: string | any;
  subtaskStats?: { total: number; completed: number; percentage: number };
  dependencies?: Array<{ id?: string; targetTask: any; type: string; createdAt?: string }>;
  // UI legacy compatibility fields if needed
  projectId?: string;
  projectKey?: string;
  projectName?: string;
  commentsCount?: number;
  commentCount?: number;
  attachmentCount?: number;
  subtaskCount?: { total: number; done: number };
}

export interface TaskFormData {
  title: string;
  taskKey?: string;
  description?: string;
  projectId: string;
  workspaceId?: string;
  organizationId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  reporterId?: string;
  labels: string[];
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  spentHours?: number;
  storyPoints?: number;
  sprintId?: string;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  type?: TaskType | 'all';
  sprintId?: string;
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  assigneeId?: string;
  reporterId?: string;
  labels?: string[];
  isArchived?: boolean;
  searchQuery?: string;
}

export type TaskSortOption =
  | 'newest'
  | 'oldest'
  | 'priority'
  | 'dueDate'
  | 'updated'
  | 'alphabetical';

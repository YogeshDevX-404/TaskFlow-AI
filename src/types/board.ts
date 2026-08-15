import { Task, TaskStatus, TaskPriority, TaskType } from './task';

export interface BoardColumn {
  id: string;
  name: string;
  statusKey: TaskStatus;
  color: string;
  icon: string;
  order: number;
  isCollapsed: boolean;
  isArchived: boolean;
  wipLimit: number;
}

export interface BoardSettings {
  cardSize: 'compact' | 'default' | 'expanded';
  showLabels: boolean;
  showStoryPoints: boolean;
  showAvatars: boolean;
  showDueDates: boolean;
  groupBy: 'status' | 'assignee' | 'priority' | 'labels' | 'project';
}

export interface BoardData {
  id: string;
  project: string;
  columns: BoardColumn[];
  settings: BoardSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface KanbanFetchResponse {
  board: BoardData;
  tasks: Task[];
  groupedTasks: Record<string, Task[]>;
  columns: BoardColumn[];
  userRole: 'Project Owner' | 'Project Admin' | 'Developer' | 'Tester' | 'Viewer';
}

export interface BoardFilterOptions {
  search?: string;
  assigneeId?: string;
  reporterId?: string;
  priority?: TaskPriority | 'all';
  status?: TaskStatus | 'all';
  type?: TaskType | 'all';
  labels?: string[];
  dueDate?: 'all' | 'overdue' | 'today' | 'this_week';
  isArchived?: boolean;
}

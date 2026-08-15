import { Task, TaskStatus, TaskPriority, TaskType } from './task';

export type DependencyType =
  | 'blocks'
  | 'blocked_by'
  | 'depends_on'
  | 'related_to'
  | 'duplicate_of'
  | 'child_of'
  | 'parent_of';

export interface TaskDependency {
  id?: string;
  targetTask: Task | any;
  type: DependencyType;
  createdAt?: string;
}

export interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface TaskTreeNode extends Task {
  children?: TaskTreeNode[];
  isExpanded?: boolean;
}

export interface HierarchyFilters {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  type?: TaskType | 'all';
  onlyParent?: boolean;
  onlySubtasks?: boolean;
  blocked?: boolean;
  completed?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ActivityActionType =
  | 'all'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_restored'
  | 'task_archived'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'reporter_changed'
  | 'label_added'
  | 'label_removed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'attachment_uploaded'
  | 'attachment_deleted'
  | 'project_updated'
  | 'project_archived'
  | 'workspace_updated'
  | 'organization_updated'
  | 'member_added'
  | 'member_removed'
  | 'role_changed'
  | 'login'
  | 'logout';

export type EntityType =
  | 'all'
  | 'Task'
  | 'Project'
  | 'Workspace'
  | 'Organization'
  | 'Comment'
  | 'Attachment'
  | 'Member'
  | 'Role'
  | 'Auth';

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ActivityRef {
  id: string;
  name: string;
  key?: string;
}

export interface ActivityItem {
  id: string;
  organization: ActivityRef | string;
  workspace?: ActivityRef | string | null;
  project?: ActivityRef | string | null;
  task?: ActivityRef | string | null;
  user: ActivityUser;
  action: ActivityActionType | string;
  entityType: EntityType | string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedTimelineItem {
  dateKey: string;
  dateLabel: string;
  activities: ActivityItem[];
}

export interface ActivityFilters {
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  userId?: string;
  actionType?: ActivityActionType | string;
  entityType?: EntityType | string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
  grouped?: boolean;
}

export interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  groupedTimeline?: GroupedTimelineItem[];
}

export type ExportFormat = 'csv' | 'json' | 'pdf';

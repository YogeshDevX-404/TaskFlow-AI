export type NotificationType =
  | 'Task Assigned'
  | 'Task Updated'
  | 'Task Completed'
  | 'Task Deleted'
  | 'Comment Added'
  | 'Mention'
  | 'Attachment Uploaded'
  | 'Project Updated'
  | 'Sprint Started'
  | 'Sprint Completed'
  | 'Release Published'
  | 'Member Invited'
  | 'Member Joined'
  | 'Role Changed'
  | 'Due Date Reminder'
  | 'Deadline Passed'
  | 'System Notification';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type DeliveryStatus = 'Pending' | 'Delivered' | 'Failed';

export interface NotificationUserRef {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface NotificationProjectRef {
  id: string;
  name?: string;
  key?: string;
  projectKey?: string;
  color?: string;
}

export interface NotificationTaskRef {
  id: string;
  title?: string;
  taskKey?: string;
  status?: string;
  priority?: string;
}

export interface Notification {
  id: string;
  organization?: string | any;
  workspace?: string | any;
  project?: NotificationProjectRef | string | any;
  task?: NotificationTaskRef | string | any;
  recipient: string | NotificationUserRef;
  sender?: NotificationUserRef | string | any;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  deliveryStatus: DeliveryStatus;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  user: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  taskNotifications: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
  projectNotifications: boolean;
  sprintNotifications: boolean;
  releaseNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationFilters {
  search?: string;
  unreadOnly?: boolean;
  priority?: NotificationPriority | 'all';
  type?: NotificationType | 'all';
  projectId?: string;
  workspaceId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
  sort?: 'newest' | 'oldest' | 'priority';
  page?: number;
  limit?: number;
}

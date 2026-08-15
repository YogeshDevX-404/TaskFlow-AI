export type RoomType = 'org' | 'workspace' | 'project' | 'task' | 'assignment' | 'user';

export interface RoomJoinPayload {
  roomType: RoomType;
  roomId: string;
}

export interface UserSocketData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  organizationId?: string;
}

export interface UserPresence {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  currentLocation?: {
    location?: string;
    projectId?: string;
    taskId?: string;
    workspaceId?: string;
    organizationId?: string;
  };
}

export interface TypingEventPayload {
  roomId: string;
  roomType: RoomType;
  action: 'comment' | 'task_edit';
  userId: string;
  userName: string;
  userAvatar?: string;
  taskId?: string;
}

export interface TaskSocketPayload {
  taskId: string;
  projectId: string;
  organizationId?: string;
  workspaceId?: string;
  taskKey?: string;
  title?: string;
  status?: string;
  priority?: string;
  columnId?: string;
  order?: number;
  assigneeId?: string | null;
  version?: number;
  updatedBy: {
    userId: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  data?: any;
}

export interface CommentSocketPayload {
  commentId: string;
  taskId?: string;
  assignmentId?: string;
  projectId?: string;
  content?: string;
  parentCommentId?: string;
  reactions?: any[];
  user: {
    userId: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  data?: any;
}

export interface NotificationSocketPayload {
  notificationId: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  data?: any;
  createdAt: string;
}

export interface ConflictResolutionPayload {
  taskId: string;
  serverVersion: number;
  clientVersion: number;
  serverData: any;
  message: string;
}

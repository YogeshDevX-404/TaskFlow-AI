export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type RoomType = 'org' | 'workspace' | 'project' | 'task' | 'user';

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

export interface TypingUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'comment' | 'task_edit';
  roomId: string;
  timestamp: number;
}

export interface RealtimeTaskEvent {
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

export interface RealtimeCommentEvent {
  commentId: string;
  taskId: string;
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

export interface ConflictResolution {
  taskId: string;
  serverVersion: number;
  clientVersion: number;
  message: string;
  detectedAt: string;
}

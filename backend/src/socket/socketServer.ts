import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import {
  RoomJoinPayload,
  UserSocketData,
  UserPresence,
  TypingEventPayload,
  TaskSocketPayload,
  CommentSocketPayload,
  NotificationSocketPayload,
} from './types';

interface UserPresenceInternal extends UserPresence {
  connectedSockets: Set<string>;
  activeRooms: Set<string>;
}

let ioInstance: Server | null = null;

// Global online users registry
const onlineUsers = new Map<string, UserPresenceInternal>();

/**
 * Returns the active Socket.IO server instance
 */
export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet!');
  }
  return ioInstance;
}

/**
 * Helper to construct socket room names securely
 */
export function formatRoomName(roomType: string, roomId: string): string {
  return `${roomType}:${roomId}`;
}

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173', '*'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  ioInstance = io;

  // Authentication Middleware for Sockets
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) {
        logger.warn(`[Socket Auth] Rejected connection attempt - missing auth token (socket ID: ${socket.id})`);
        return next(new Error('Authentication failed: Missing token'));
      }

      const decoded = jwt.verify(token, config.jwtSecret) as any;
      if (!decoded || (!decoded.id && !decoded.userId)) {
        logger.warn(`[Socket Auth] Rejected connection attempt - invalid token payload`);
        return next(new Error('Authentication failed: Invalid payload'));
      }

      const userId = decoded.id || decoded.userId;
      const firstName = decoded.firstName || '';
      const lastName = decoded.lastName || '';
      const name = decoded.name || `${firstName} ${lastName}`.trim() || decoded.email?.split('@')[0] || 'Team Member';

      socket.data.user = {
        id: userId,
        email: decoded.email || '',
        firstName,
        lastName,
        name,
        avatar: decoded.avatar || '',
        organizationId: decoded.organizationId || '',
      } as UserSocketData;

      return next();
    } catch (err: any) {
      logger.error(`[Socket Auth] JWT verification failed: ${err.message}`);
      return next(new Error('Authentication failed: Invalid signature or expired token'));
    }
  });

  // Socket Connection Life Cycle
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as UserSocketData;
    const userId = user.id;

    logger.info(`[Socket Connected] User: ${user.name} (${userId}) | Socket ID: ${socket.id}`);

    // Join user's personal private room
    const userRoom = formatRoomName('user', userId);
    socket.join(userRoom);

    // Register / Update Presence
    let presence = onlineUsers.get(userId);
    if (!presence) {
      presence = {
        userId,
        name: user.name || 'User',
        email: user.email || '',
        avatar: user.avatar,
        status: 'online',
        lastSeen: new Date().toISOString(),
        connectedSockets: new Set<string>(),
        activeRooms: new Set<string>(),
      };
      onlineUsers.set(userId, presence);
    }

    presence.status = 'online';
    presence.lastSeen = new Date().toISOString();
    presence.connectedSockets.add(socket.id);
    presence.activeRooms.add(userRoom);

    // Broadcast user online event
    broadcastUserOnline(userId);

    // ----------------------------------------------------
    // ROOM JOINING & LEAVING
    // ----------------------------------------------------
    socket.on('join:room', (payload: RoomJoinPayload) => {
      if (!payload || !payload.roomType || !payload.roomId) return;

      const roomName = formatRoomName(payload.roomType, payload.roomId);
      socket.join(roomName);

      if (presence) {
        presence.activeRooms.add(roomName);
      }

      logger.info(`[Socket Room] User ${user.name} joined room ${roomName}`);

      // Emit room presence snapshot back to client
      const roomPresences = getRoomPresences(roomName);
      socket.emit('presence:sync', { roomName, members: roomPresences });

      // Notify others in room
      socket.to(roomName).emit('user:joined_room', {
        userId,
        name: user.name,
        avatar: user.avatar,
        roomName,
      });
    });

    socket.on('leave:room', (payload: RoomJoinPayload) => {
      if (!payload || !payload.roomType || !payload.roomId) return;

      const roomName = formatRoomName(payload.roomType, payload.roomId);
      socket.leave(roomName);

      if (presence) {
        presence.activeRooms.delete(roomName);
      }

      socket.to(roomName).emit('user:left_room', {
        userId,
        roomName,
      });
    });

    // ----------------------------------------------------
    // LIVE PRESENCE & VIEW LOCATION
    // ----------------------------------------------------
    socket.on('presence:view', (locationData: {
      location?: string;
      projectId?: string;
      taskId?: string;
      workspaceId?: string;
      organizationId?: string;
    }) => {
      if (presence) {
        presence.currentLocation = locationData;
        presence.lastSeen = new Date().toISOString();

        // Broadcast updated presence to user's active rooms
        presence.activeRooms.forEach((room) => {
          io.to(room).emit('presence:update', {
            userId,
            presence: {
              userId: presence?.userId,
              name: presence?.name,
              email: presence?.email,
              avatar: presence?.avatar,
              status: presence?.status,
              lastSeen: presence?.lastSeen,
              currentLocation: presence?.currentLocation,
            },
          });
        });
      }
    });

    // Request active online users
    socket.on('presence:get_online', () => {
      const activeList = Array.from(onlineUsers.values()).map((p) => ({
        userId: p.userId,
        name: p.name,
        email: p.email,
        avatar: p.avatar,
        status: p.status,
        lastSeen: p.lastSeen,
        currentLocation: p.currentLocation,
      }));
      socket.emit('presence:online_list', activeList);
    });

    // ----------------------------------------------------
    // TYPING INDICATORS
    // ----------------------------------------------------
    socket.on('typing:start', (data: Omit<TypingEventPayload, 'userId' | 'userName' | 'userAvatar'>) => {
      if (!data || !data.roomId || !data.roomType) return;
      const roomName = formatRoomName(data.roomType, data.roomId);

      const payload: TypingEventPayload = {
        ...data,
        userId,
        userName: user.name || 'Team Member',
        userAvatar: user.avatar,
      };

      socket.to(roomName).emit('typing:update', { ...payload, isTyping: true });
    });

    socket.on('typing:stop', (data: Omit<TypingEventPayload, 'userId' | 'userName' | 'userAvatar'>) => {
      if (!data || !data.roomId || !data.roomType) return;
      const roomName = formatRoomName(data.roomType, data.roomId);

      const payload: TypingEventPayload = {
        ...data,
        userId,
        userName: user.name || 'Team Member',
        userAvatar: user.avatar,
      };

      socket.to(roomName).emit('typing:update', { ...payload, isTyping: false });
    });

    // ----------------------------------------------------
    // REALTIME TASK EVENTS
    // ----------------------------------------------------
    socket.on('task:create', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:create', payload, socket.id);
    });

    socket.on('task:update', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:update', payload, socket.id);
    });

    socket.on('task:delete', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:delete', payload, socket.id);
    });

    socket.on('task:move', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:move', payload, socket.id);
    });

    socket.on('task:assign', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:assign', payload, socket.id);
    });

    socket.on('task:complete', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:complete', payload, socket.id);
    });

    socket.on('task:restore', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:restore', payload, socket.id);
    });

    socket.on('task:archive', (payload: TaskSocketPayload) => {
      broadcastTaskSocketEvent('task:archive', payload, socket.id);
    });

    // ----------------------------------------------------
    // REALTIME COMMENT EVENTS
    // ----------------------------------------------------
    socket.on('comment:create', (payload: CommentSocketPayload) => {
      broadcastCommentSocketEvent('comment:create', payload, socket.id);
    });

    socket.on('comment:update', (payload: CommentSocketPayload) => {
      broadcastCommentSocketEvent('comment:update', payload, socket.id);
    });

    socket.on('comment:delete', (payload: CommentSocketPayload) => {
      broadcastCommentSocketEvent('comment:delete', payload, socket.id);
    });

    socket.on('comment:reaction', (payload: CommentSocketPayload) => {
      broadcastCommentSocketEvent('comment:reaction', payload, socket.id);
    });

    // ----------------------------------------------------
    // HEARTBEAT / PING
    // ----------------------------------------------------
    socket.on('heartbeat', (clientTimestamp: number) => {
      socket.emit('heartbeat:ack', {
        clientTimestamp,
        serverTimestamp: Date.now(),
      });
    });

    // ----------------------------------------------------
    // DISCONNECTION
    // ----------------------------------------------------
    socket.on('disconnect', (reason: string) => {
      logger.info(`[Socket Disconnected] User ${user.name} (${userId}) disconnected: ${reason}`);

      if (presence) {
        presence.connectedSockets.delete(socket.id);

        if (presence.connectedSockets.size === 0) {
          presence.status = 'offline';
          presence.lastSeen = new Date().toISOString();

          // Broadcast user offline to all active rooms
          broadcastUserOffline(userId);

          // Clean up presence after a delay if not reconnected
          setTimeout(() => {
            const p = onlineUsers.get(userId);
            if (p && p.status === 'offline' && p.connectedSockets.size === 0) {
              onlineUsers.delete(userId);
            }
          }, 300000); // 5 minutes
        }
      }
    });
  });

  logger.info('[Socket.IO] Real-Time Enterprise Gateway successfully initialized');
  return io;
}

// ----------------------------------------------------
// HELPER BROADCAST FUNCTIONS (CALLABLE FROM BACKEND CONTROLLERS/SERVICES)
// ----------------------------------------------------

export function broadcastUserOnline(userId: string) {
  if (!ioInstance) return;
  const presence = onlineUsers.get(userId);
  if (!presence) return;

  const userPayload = {
    userId,
    name: presence.name,
    email: presence.email,
    avatar: presence.avatar,
    status: 'online',
    lastSeen: presence.lastSeen,
  };

  ioInstance.emit('user:online', userPayload);
}

export function broadcastUserOffline(userId: string) {
  if (!ioInstance) return;
  const presence = onlineUsers.get(userId);

  ioInstance.emit('user:offline', {
    userId,
    status: 'offline',
    lastSeen: presence ? presence.lastSeen : new Date().toISOString(),
  });
}

export function getRoomPresences(roomName: string): UserPresence[] {
  const result: UserPresence[] = [];
  onlineUsers.forEach((p) => {
    if (p.status === 'online' && p.activeRooms.has(roomName)) {
      result.push({
        userId: p.userId,
        name: p.name,
        email: p.email,
        avatar: p.avatar,
        status: p.status,
        lastSeen: p.lastSeen,
        currentLocation: p.currentLocation,
      });
    }
  });
  return result;
}

export function broadcastTaskSocketEvent(eventName: string, payload: TaskSocketPayload, senderSocketId?: string) {
  if (!ioInstance) return;

  const roomsToEmit: string[] = [];
  if (payload.projectId) roomsToEmit.push(formatRoomName('project', payload.projectId));
  if (payload.taskId) roomsToEmit.push(formatRoomName('task', payload.taskId));
  if (payload.workspaceId) roomsToEmit.push(formatRoomName('workspace', payload.workspaceId));
  if (payload.organizationId) roomsToEmit.push(formatRoomName('org', payload.organizationId));

  roomsToEmit.forEach((room) => {
    if (senderSocketId) {
      ioInstance!.to(room).except(senderSocketId).emit(eventName, payload);
    } else {
      ioInstance!.to(room).emit(eventName, payload);
    }
  });
}

export function broadcastCommentSocketEvent(eventName: string, payload: CommentSocketPayload, senderSocketId?: string) {
  if (!ioInstance) return;

  const roomsToEmit: string[] = [];
  if (payload.taskId) roomsToEmit.push(formatRoomName('task', payload.taskId));
  if (payload.projectId) roomsToEmit.push(formatRoomName('project', payload.projectId));

  roomsToEmit.forEach((room) => {
    if (senderSocketId) {
      ioInstance!.to(room).except(senderSocketId).emit(eventName, payload);
    } else {
      ioInstance!.to(room).emit(eventName, payload);
    }
  });
}

export function broadcastNotificationToUser(targetUserId: string, payload: NotificationSocketPayload) {
  if (!ioInstance) return;
  const userRoom = formatRoomName('user', targetUserId);
  ioInstance.to(userRoom).emit('notification:new', payload);
}

export function broadcastGitHubSocketEvent(eventName: string, payload: any) {
  if (!ioInstance) return;
  const roomsToEmit: string[] = [];
  if (payload.projectId) roomsToEmit.push(formatRoomName('project', payload.projectId));
  if (payload.organizationId) roomsToEmit.push(formatRoomName('org', payload.organizationId));
  if (payload.taskId) roomsToEmit.push(formatRoomName('task', payload.taskId));

  roomsToEmit.forEach((room) => {
    ioInstance!.to(room).emit(eventName, payload);
  });
}

export function broadcastAssignmentSocketEvent(eventName: string, payload: any, senderSocketId?: string) {
  if (!ioInstance) return;
  const roomsToEmit: string[] = [];

  const assignmentId = payload.id || payload.assignmentId;
  if (assignmentId) roomsToEmit.push(formatRoomName('assignment', assignmentId));

  const projId = payload.projectId || (typeof payload.project === 'object' ? payload.project?._id || payload.project?.id : payload.project);
  if (projId) roomsToEmit.push(formatRoomName('project', projId.toString()));

  const wsId = payload.workspaceId || (typeof payload.workspace === 'object' ? payload.workspace?._id || payload.workspace?.id : payload.workspace);
  if (wsId) roomsToEmit.push(formatRoomName('workspace', wsId.toString()));

  const orgId = payload.organizationId || (typeof payload.organization === 'object' ? payload.organization?._id || payload.organization?.id : payload.organization);
  if (orgId) roomsToEmit.push(formatRoomName('org', orgId.toString()));

  const assignedToId = typeof payload.assignedTo === 'object' ? payload.assignedTo?._id || payload.assignedTo?.id : payload.assignedTo;
  if (assignedToId) roomsToEmit.push(formatRoomName('user', assignedToId.toString()));

  const assignedById = typeof payload.assignedBy === 'object' ? payload.assignedBy?._id || payload.assignedBy?.id : payload.assignedBy;
  if (assignedById) roomsToEmit.push(formatRoomName('user', assignedById.toString()));

  const uniqueRooms = Array.from(new Set(roomsToEmit));
  uniqueRooms.forEach((room) => {
    if (senderSocketId) {
      ioInstance!.to(room).except(senderSocketId).emit(eventName, payload);
    } else {
      ioInstance!.to(room).emit(eventName, payload);
    }
  });
}


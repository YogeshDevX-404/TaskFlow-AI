import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import {
  ConnectionStatus,
  RoomType,
  UserPresence,
  TypingUser,
  RealtimeTaskEvent,
  RealtimeCommentEvent,
} from '../types/realtime';
import { useSocketStore } from '../store/useSocketStore';
import { usePresenceStore } from '../store/usePresenceStore';
import { useTypingStore } from '../store/useTypingStore';
import { useNotificationStore } from '../store/useNotificationStore';

class SocketService {
  private socket: Socket | null = null;
  private heartbeatInterval: any = null;

  public connect(token?: string) {
    const authToken = token || useAuthStore.getState().token;
    if (!authToken) {
      console.warn('[SocketService] Cannot connect without JWT auth token');
      return;
    }

    if (this.socket && this.socket.connected) {
      return;
    }

    useSocketStore.getState().setStatus('connecting');

    // Connect to backend server running on port 5000
    const socketUrl = 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.registerEventHandlers();
    this.startHeartbeat();
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    useSocketStore.getState().setStatus('disconnected');
  }

  private registerEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected successfully. ID:', this.socket?.id);
      useSocketStore.getState().setStatus('connected');

      // Request online users
      this.socket?.emit('presence:get_online');

      // Re-join previously joined rooms
      const activeRooms = useSocketStore.getState().joinedRooms;
      activeRooms.forEach((room) => {
        const [roomType, roomId] = room.split(':');
        if (roomType && roomId) {
          this.socket?.emit('join:room', { roomType: roomType as RoomType, roomId });
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[SocketService] Disconnected:', reason);
      useSocketStore.getState().setStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error.message);
      useSocketStore.getState().setStatus('reconnecting');
    });

    // Presence Events
    this.socket.on('presence:online_list', (users: UserPresence[]) => {
      usePresenceStore.getState().setOnlineUsers(users);
    });

    this.socket.on('user:online', (user: UserPresence) => {
      usePresenceStore.getState().addOnlineUser(user);
    });

    this.socket.on('user:offline', ({ userId }: { userId: string }) => {
      usePresenceStore.getState().removeOnlineUser(userId);
    });

    this.socket.on('presence:update', ({ presence }: { presence: UserPresence }) => {
      usePresenceStore.getState().updateUserPresence(presence);
    });

    this.socket.on('presence:sync', ({ members }: { members: UserPresence[] }) => {
      members.forEach((m) => usePresenceStore.getState().addOnlineUser(m));
    });

    // Typing Events
    this.socket.on('typing:update', (data: TypingUser & { isTyping: boolean }) => {
      if (data.isTyping) {
        useTypingStore.getState().addTypingUser({
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          action: data.action,
          roomId: data.roomId,
          timestamp: Date.now(),
        });
      } else {
        useTypingStore.getState().removeTypingUser(data.userId, data.roomId);
      }
    });

    // Live Notification Event
    this.socket.on('notification:new', (payload: any) => {
      useNotificationStore.getState().addLocalNotification({
        recipient: payload.recipientId,
        sender: payload.sender || { name: 'System' },
        type: payload.type || 'System Notification',
        title: payload.title,
        message: payload.message,
        priority: payload.priority || 'Normal',
        data: payload.data,
      });
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', Date.now());
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Room Subscriptions
  public joinRoom(roomType: RoomType, roomId: string) {
    if (!roomId) return;
    const roomKey = `${roomType}:${roomId}`;
    useSocketStore.getState().addRoom(roomKey);

    if (this.socket && this.socket.connected) {
      this.socket.emit('join:room', { roomType, roomId });
    }
  }

  public leaveRoom(roomType: RoomType, roomId: string) {
    if (!roomId) return;
    const roomKey = `${roomType}:${roomId}`;
    useSocketStore.getState().removeRoom(roomKey);

    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:room', { roomType, roomId });
    }
  }

  // Location Presence
  public updateViewLocation(locationData: {
    location?: string;
    projectId?: string;
    taskId?: string;
    workspaceId?: string;
    organizationId?: string;
  }) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('presence:view', locationData);
    }
  }

  // Typing
  public startTyping(roomType: RoomType, roomId: string, action: 'comment' | 'task_edit' = 'comment') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:start', { roomType, roomId, action });
    }
  }

  public stopTyping(roomType: RoomType, roomId: string, action: 'comment' | 'task_edit' = 'comment') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:stop', { roomType, roomId, action });
    }
  }

  // Event Listeners Registration helper
  public on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public emit(event: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();

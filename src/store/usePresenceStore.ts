import { create } from 'zustand';
import { UserPresence } from '../types/realtime';

interface PresenceState {
  onlineUsers: Map<string, UserPresence>;
  setOnlineUsers: (users: UserPresence[]) => void;
  addOnlineUser: (user: UserPresence) => void;
  removeOnlineUser: (userId: string) => void;
  updateUserPresence: (user: UserPresence) => void;
  getUsersInTask: (taskId: string) => UserPresence[];
  getUsersInProject: (projectId: string) => UserPresence[];
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Map<string, UserPresence>(),

  setOnlineUsers: (users) => {
    const map = new Map<string, UserPresence>();
    users.forEach((u) => map.set(u.userId, u));
    set({ onlineUsers: map });
  },

  addOnlineUser: (user) => {
    set((state) => {
      const map = new Map(state.onlineUsers);
      map.set(user.userId, { ...user, status: 'online' });
      return { onlineUsers: map };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const map = new Map(state.onlineUsers);
      const existing = map.get(userId);
      if (existing) {
        map.set(userId, { ...existing, status: 'offline', lastSeen: new Date().toISOString() });
      }
      return { onlineUsers: map };
    });
  },

  updateUserPresence: (user) => {
    set((state) => {
      const map = new Map(state.onlineUsers);
      map.set(user.userId, user);
      return { onlineUsers: map };
    });
  },

  getUsersInTask: (taskId) => {
    const result: UserPresence[] = [];
    get().onlineUsers.forEach((u) => {
      if (u.status === 'online' && u.currentLocation?.taskId === taskId) {
        result.push(u);
      }
    });
    return result;
  },

  getUsersInProject: (projectId) => {
    const result: UserPresence[] = [];
    get().onlineUsers.forEach((u) => {
      if (u.status === 'online' && u.currentLocation?.projectId === projectId) {
        result.push(u);
      }
    });
    return result;
  },
}));

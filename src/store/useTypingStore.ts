import { create } from 'zustand';
import { TypingUser } from '../types/realtime';

interface TypingState {
  typingUsers: TypingUser[];
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, roomId: string) => void;
  getTypingInRoom: (roomId: string) => TypingUser[];
}

export const useTypingStore = create<TypingState>((set, get) => ({
  typingUsers: [],

  addTypingUser: (user) => {
    set((state) => {
      const filtered = state.typingUsers.filter(
        (u) => !(u.userId === user.userId && u.roomId === user.roomId)
      );
      return { typingUsers: [...filtered, user] };
    });
  },

  removeTypingUser: (userId, roomId) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (u) => !(u.userId === userId && u.roomId === roomId)
      ),
    }));
  },

  getTypingInRoom: (roomId) => {
    return get().typingUsers.filter((u) => u.roomId === roomId);
  },
}));

import { create } from 'zustand';
import { ConnectionStatus } from '../types/realtime';

interface SocketState {
  status: ConnectionStatus;
  joinedRooms: Set<string>;
  setStatus: (status: ConnectionStatus) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  clearRooms: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  status: 'disconnected',
  joinedRooms: new Set<string>(),

  setStatus: (status) => set({ status }),

  addRoom: (room) =>
    set((state) => {
      const newRooms = new Set(state.joinedRooms);
      newRooms.add(room);
      return { joinedRooms: newRooms };
    }),

  removeRoom: (room) =>
    set((state) => {
      const newRooms = new Set(state.joinedRooms);
      newRooms.delete(room);
      return { joinedRooms: newRooms };
    }),

  clearRooms: () => set({ joinedRooms: new Set<string>() }),
}));

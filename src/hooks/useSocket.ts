import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useSocketStore } from '../store/useSocketStore';
import { useAuthStore } from '../store/useAuthStore';
import { RoomType } from '../types/realtime';

export function useSocket() {
  const token = useAuthStore((state) => state.token);
  const status = useSocketStore((state) => state.status);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }
  }, [token]);

  const joinRoom = (roomType: RoomType, roomId: string) => {
    socketService.joinRoom(roomType, roomId);
  };

  const leaveRoom = (roomType: RoomType, roomId: string) => {
    socketService.leaveRoom(roomType, roomId);
  };

  return {
    status,
    connect: () => socketService.connect(token || undefined),
    disconnect: () => socketService.disconnect(),
    joinRoom,
    leaveRoom,
  };
}

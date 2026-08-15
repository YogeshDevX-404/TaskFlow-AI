import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../store/useAuthStore';

export function useRealtimeNotifications() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) return;

    socketService.joinRoom('user', user.id);

    return () => {
      socketService.leaveRoom('user', user.id);
    };
  }, [user?.id]);
}

import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { usePresenceStore } from '../store/usePresenceStore';

export function usePresence(locationData?: {
  location?: string;
  projectId?: string;
  taskId?: string;
  workspaceId?: string;
  organizationId?: string;
}) {
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  useEffect(() => {
    if (locationData) {
      socketService.updateViewLocation(locationData);
    }
  }, [
    locationData?.location,
    locationData?.projectId,
    locationData?.taskId,
    locationData?.workspaceId,
    locationData?.organizationId,
  ]);

  return {
    onlineUsers: Array.from(onlineUsers.values()).filter((u) => u.status === 'online'),
    getUsersInTask: (taskId: string) => usePresenceStore.getState().getUsersInTask(taskId),
    getUsersInProject: (projectId: string) => usePresenceStore.getState().getUsersInProject(projectId),
  };
}

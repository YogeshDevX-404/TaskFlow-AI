import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useTaskStore } from '../store/useTaskStore';
import { RealtimeTaskEvent } from '../types/realtime';

export function useRealtimeTask(projectId?: string, taskId?: string) {
  useEffect(() => {
    if (projectId) {
      socketService.joinRoom('project', projectId);
    }
    if (taskId) {
      socketService.joinRoom('task', taskId);
    }

    const handleTaskCreate = (payload: RealtimeTaskEvent) => {
      if (payload.data) {
        useTaskStore.getState().addLocalTask?.(payload.data);
      }
    };

    const handleTaskUpdate = (payload: RealtimeTaskEvent) => {
      if (payload.taskId && payload.data) {
        useTaskStore.getState().updateLocalTask?.(payload.taskId, payload.data);
      }
    };

    const handleTaskMove = (payload: RealtimeTaskEvent) => {
      if (payload.taskId && payload.data) {
        useTaskStore.getState().updateLocalTask?.(payload.taskId, payload.data);
      }
    };

    const handleTaskDelete = (payload: RealtimeTaskEvent) => {
      if (payload.taskId) {
        useTaskStore.getState().removeLocalTask?.(payload.taskId);
      }
    };

    socketService.on('task:create', handleTaskCreate);
    socketService.on('task:update', handleTaskUpdate);
    socketService.on('task:move', handleTaskMove);
    socketService.on('task:delete', handleTaskDelete);
    socketService.on('task:assign', handleTaskUpdate);
    socketService.on('task:complete', handleTaskUpdate);

    return () => {
      socketService.off('task:create', handleTaskCreate);
      socketService.off('task:update', handleTaskUpdate);
      socketService.off('task:move', handleTaskMove);
      socketService.off('task:delete', handleTaskDelete);
      socketService.off('task:assign', handleTaskUpdate);
      socketService.off('task:complete', handleTaskUpdate);

      if (projectId) socketService.leaveRoom('project', projectId);
      if (taskId) socketService.leaveRoom('task', taskId);
    };
  }, [projectId, taskId]);

  const emitTaskMove = (taskId: string, projectId: string, columnId: string, order: number) => {
    socketService.emit('task:move', {
      taskId,
      projectId,
      columnId,
      order,
      timestamp: new Date().toISOString(),
    });
  };

  return { emitTaskMove };
}

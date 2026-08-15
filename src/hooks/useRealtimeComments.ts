import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useCommentStore } from '../store/useCommentStore';
import { RealtimeCommentEvent } from '../types/realtime';

export function useRealtimeComments(taskId?: string) {
  useEffect(() => {
    if (!taskId) return;

    socketService.joinRoom('task', taskId);

    const handleCommentCreate = (payload: RealtimeCommentEvent) => {
      if (payload.data) {
        useCommentStore.getState().addLocalComment?.(payload.data);
      }
    };

    const handleCommentUpdate = (payload: RealtimeCommentEvent) => {
      if (payload.commentId && payload.data) {
        useCommentStore.getState().updateLocalComment?.(payload.commentId, payload.data);
      }
    };

    const handleCommentDelete = (payload: RealtimeCommentEvent) => {
      if (payload.commentId) {
        useCommentStore.getState().removeLocalComment?.(payload.commentId);
      }
    };

    socketService.on('comment:create', handleCommentCreate);
    socketService.on('comment:update', handleCommentUpdate);
    socketService.on('comment:delete', handleCommentDelete);

    return () => {
      socketService.off('comment:create', handleCommentCreate);
      socketService.off('comment:update', handleCommentUpdate);
      socketService.off('comment:delete', handleCommentDelete);
      socketService.leaveRoom('task', taskId);
    };
  }, [taskId]);

  const startTyping = () => {
    if (taskId) socketService.startTyping('task', taskId, 'comment');
  };

  const stopTyping = () => {
    if (taskId) socketService.stopTyping('task', taskId, 'comment');
  };

  return { startTyping, stopTyping };
}

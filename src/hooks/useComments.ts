import { useEffect } from 'react';
import { useCommentStore } from '../store/useCommentStore';
import { CommentFilterOptions } from '../types/comment';

export function useComments(taskId?: string) {
  const {
    comments,
    activeTaskId,
    filters,
    isLoading,
    error,
    setActiveTaskId,
    setFilters,
    fetchComments,
  } = useCommentStore();

  useEffect(() => {
    if (taskId && taskId !== activeTaskId) {
      setActiveTaskId(taskId);
    }
  }, [taskId, activeTaskId, setActiveTaskId]);

  return {
    comments,
    isLoading,
    error,
    filters,
    setFilters,
    refreshComments: () => fetchComments(taskId || activeTaskId || undefined),
  };
}

export function useCreateComment() {
  const { createComment, isLoading, error, quotedComment, replyingToComment, setQuotedComment, setReplyingToComment } =
    useCommentStore();

  return {
    createComment,
    isLoading,
    error,
    quotedComment,
    replyingToComment,
    setQuotedComment,
    setReplyingToComment,
  };
}

export function useUpdateComment() {
  const { updateComment, editingCommentId, setEditingCommentId, isLoading, error } =
    useCommentStore();

  return {
    updateComment,
    editingCommentId,
    setEditingCommentId,
    isLoading,
    error,
  };
}

export function useDeleteComment() {
  const { deleteComment, restoreComment, isLoading, error } = useCommentStore();

  return {
    deleteComment,
    restoreComment,
    isLoading,
    error,
  };
}

export function useReplies(parentCommentId: string) {
  const { repliesMap, fetchReplies, isLoading } = useCommentStore();

  const replies = repliesMap[parentCommentId] || [];

  return {
    replies,
    fetchReplies: () => fetchReplies(parentCommentId),
    isLoading,
  };
}

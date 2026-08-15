import { create } from 'zustand';
import {
  Comment,
  CommentFilterOptions,
} from '../types/comment';
import { CommentService } from '../services/api/commentService';

interface CommentState {
  comments: Comment[];
  repliesMap: Record<string, Comment[]>;
  activeTaskId: string | null;
  filters: CommentFilterOptions;
  drafts: Record<string, string>;
  quotedComment: Comment | null;
  replyingToComment: Comment | null;
  editingCommentId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveTaskId: (taskId: string) => void;
  setFilters: (filters: Partial<CommentFilterOptions>) => void;
  fetchComments: (taskId?: string, filterOverride?: CommentFilterOptions) => Promise<void>;
  fetchReplies: (parentCommentId: string) => Promise<void>;
  createComment: (taskId: string, content: string, parentCommentId?: string) => Promise<Comment | null>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  restoreComment: (commentId: string) => Promise<boolean>;
  toggleReaction: (commentId: string, emoji: string) => Promise<boolean>;
  
  setQuotedComment: (comment: Comment | null) => void;
  setReplyingToComment: (comment: Comment | null) => void;
  setEditingCommentId: (commentId: string | null) => void;
  saveDraft: (taskId: string, content: string) => void;
  clearDraft: (taskId: string) => void;

  // Real-time local helpers
  addLocalComment: (comment: Comment) => void;
  updateLocalComment: (commentId: string, updates: Partial<Comment>) => void;
  removeLocalComment: (commentId: string) => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  repliesMap: {},
  activeTaskId: null,
  filters: {
    sortBy: 'newest',
    editedOnly: false,
    search: '',
  },
  drafts: {},
  quotedComment: null,
  replyingToComment: null,
  editingCommentId: null,
  isLoading: false,
  error: null,

  setActiveTaskId: (taskId: string) => {
    if (get().activeTaskId !== taskId) {
      set({
        activeTaskId: taskId,
        comments: [],
        quotedComment: null,
        replyingToComment: null,
        editingCommentId: null,
        error: null,
      });
      get().fetchComments(taskId);
    }
  },

  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    const { activeTaskId } = get();
    if (activeTaskId) {
      get().fetchComments(activeTaskId, updatedFilters);
    }
  },

  fetchComments: async (taskIdParam?: string, filterOverride?: CommentFilterOptions) => {
    const taskId = taskIdParam || get().activeTaskId;
    if (!taskId) return;

    const currentFilters = filterOverride || get().filters;
    set({ isLoading: true, error: null });

    try {
      const response = await CommentService.getTaskComments(taskId, currentFilters);
      if (response.success && Array.isArray(response.data)) {
        set({ comments: response.data, isLoading: false });
      } else {
        set({ isLoading: false, error: response.message || 'Failed to load comments' });
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Error connecting to comments server.',
      });
    }
  },

  fetchReplies: async (parentCommentId: string) => {
    const { activeTaskId } = get();
    if (!activeTaskId || !parentCommentId) return;

    try {
      const response = await CommentService.getTaskComments(activeTaskId, {
        parentCommentId,
      });
      if (response.success && Array.isArray(response.data)) {
        set((state) => ({
          repliesMap: {
            ...state.repliesMap,
            [parentCommentId]: response.data,
          },
        }));
      }
    } catch (err: any) {
      console.error('Failed to load replies', err);
    }
  },

  createComment: async (taskId: string, content: string, parentCommentId?: string) => {
    set({ isLoading: true, error: null });

    try {
      let newComment: Comment | null = null;
      if (parentCommentId) {
        const res = await CommentService.replyComment(parentCommentId, { taskId, content });
        if (res.success && res.data) {
          newComment = res.data;
          // Update parent comment replyCount and add to repliesMap
          set((state) => {
            const updatedComments = state.comments.map((c) =>
              c.id === parentCommentId
                ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                : c
            );
            const currentReplies = state.repliesMap[parentCommentId] || [];
            return {
              comments: updatedComments,
              repliesMap: {
                ...state.repliesMap,
                [parentCommentId]: [...currentReplies, newComment!],
              },
              quotedComment: null,
              replyingToComment: null,
              isLoading: false,
            };
          });
          get().clearDraft(taskId);
          return newComment;
        }
      } else {
        const res = await CommentService.createComment(taskId, { content, parentCommentId });
        if (res.success && res.data) {
          newComment = res.data;
          set((state) => ({
            comments: [newComment!, ...state.comments],
            quotedComment: null,
            replyingToComment: null,
            isLoading: false,
          }));
          get().clearDraft(taskId);
          return newComment;
        }
      }

      set({ isLoading: false, error: 'Failed to create comment' });
      return null;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error creating comment' });
      return null;
    }
  },

  updateComment: async (commentId: string, content: string) => {
    try {
      const res = await CommentService.updateComment(commentId, { content });
      if (res.success && res.data) {
        const updated = res.data;
        set((state) => {
          const updatedComments = state.comments.map((c) => (c.id === commentId ? updated : c));
          
          // Also update in repliesMap if present
          const newRepliesMap = { ...state.repliesMap };
          Object.keys(newRepliesMap).forEach((parentId) => {
            newRepliesMap[parentId] = newRepliesMap[parentId].map((r) =>
              r.id === commentId ? updated : r
            );
          });

          return {
            comments: updatedComments,
            repliesMap: newRepliesMap,
            editingCommentId: null,
          };
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update comment' });
      return false;
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      const res = await CommentService.deleteComment(commentId);
      if (res.success && res.data) {
        const deleted = res.data;
        set((state) => {
          const updatedComments = state.comments.map((c) => (c.id === commentId ? deleted : c));
          const newRepliesMap = { ...state.repliesMap };
          Object.keys(newRepliesMap).forEach((parentId) => {
            newRepliesMap[parentId] = newRepliesMap[parentId].map((r) =>
              r.id === commentId ? deleted : r
            );
          });
          return { comments: updatedComments, repliesMap: newRepliesMap };
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete comment' });
      return false;
    }
  },

  restoreComment: async (commentId: string) => {
    try {
      const res = await CommentService.restoreComment(commentId);
      if (res.success && res.data) {
        const restored = res.data;
        set((state) => {
          const updatedComments = state.comments.map((c) => (c.id === commentId ? restored : c));
          const newRepliesMap = { ...state.repliesMap };
          Object.keys(newRepliesMap).forEach((parentId) => {
            newRepliesMap[parentId] = newRepliesMap[parentId].map((r) =>
              r.id === commentId ? restored : r
            );
          });
          return { comments: updatedComments, repliesMap: newRepliesMap };
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to restore comment' });
      return false;
    }
  },

  toggleReaction: async (commentId: string, emoji: string) => {
    try {
      const res = await CommentService.toggleReaction(commentId, emoji);
      if (res.success && res.data) {
        const updated = res.data;
        set((state) => {
          const updatedComments = state.comments.map((c) => (c.id === commentId ? updated : c));
          const newRepliesMap = { ...state.repliesMap };
          Object.keys(newRepliesMap).forEach((parentId) => {
            newRepliesMap[parentId] = newRepliesMap[parentId].map((r) =>
              r.id === commentId ? updated : r
            );
          });
          return { comments: updatedComments, repliesMap: newRepliesMap };
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update reaction' });
      return false;
    }
  },

  setQuotedComment: (comment: Comment | null) => set({ quotedComment: comment }),
  setReplyingToComment: (comment: Comment | null) => set({ replyingToComment: comment }),
  setEditingCommentId: (commentId: string | null) => set({ editingCommentId: commentId }),

  saveDraft: (taskId: string, content: string) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [taskId]: content,
      },
    }));
    try {
      localStorage.setItem(`task_comment_draft_${taskId}`, content);
    } catch (e) {
      // ignore
    }
  },

  clearDraft: (taskId: string) => {
    set((state) => {
      const updatedDrafts = { ...state.drafts };
      delete updatedDrafts[taskId];
      return { drafts: updatedDrafts };
    });
    try {
      localStorage.removeItem(`task_comment_draft_${taskId}`);
    } catch (e) {
      // ignore
    }
  },

  addLocalComment: (comment) => {
    set((state) => {
      if (state.comments.some((c) => c.id === comment.id)) return state;
      return { comments: [comment, ...state.comments] };
    });
  },

  updateLocalComment: (commentId, updates) => {
    set((state) => ({
      comments: state.comments.map((c) => (c.id === commentId ? { ...c, ...updates } : c)),
    }));
  },

  removeLocalComment: (commentId) => {
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
    }));
  },
}));

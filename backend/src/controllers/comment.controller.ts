import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { broadcastCommentSocketEvent } from '../socket/socketServer';

export class CommentController {
  /**
   * GET /api/v1/tasks/:id/comments
   */
  public static async getTaskComments(req: Request, res: Response): Promise<Response> {
    try {
      const taskId = req.params.id;
      const currentUserId = req.user?.id || '';
      const { authorId, mentionedUserId, editedOnly, search, sortBy, parentCommentId } = req.query;

      const comments = await CommentService.getTaskComments(
        taskId,
        {
          authorId: authorId as string,
          mentionedUserId: mentionedUserId as string,
          editedOnly: editedOnly === 'true',
          search: search as string,
          sortBy: sortBy === 'oldest' ? 'oldest' : 'newest',
          parentCommentId: parentCommentId as string,
        },
        currentUserId
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Comments retrieved successfully.', comments);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch task comments'
      );
    }
  }

  /**
   * POST /api/v1/tasks/:id/comments
   */
  public static async createTaskComment(req: Request, res: Response): Promise<Response> {
    try {
      const taskId = req.params.id;
      const authorId = req.user?.id;
      const { content, parentCommentId } = req.body;

      if (!authorId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required to create a comment.'
        );
      }

      if (!content || !content.trim()) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Comment content cannot be empty.'
        );
      }

      const comment = await CommentService.createComment({
        taskId,
        authorId,
        content,
        parentCommentId,
      });

      try {
        broadcastCommentSocketEvent('comment:create', {
          commentId: (comment as any).id || (comment as any)._id?.toString(),
          taskId,
          content: (comment as any).content,
          parentCommentId,
          user: {
            userId: authorId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
          data: comment,
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Comment posted successfully.', comment);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to post comment'
      );
    }
  }

  /**
   * GET /api/v1/work-assignments/:id/comments
   */
  public static async getAssignmentComments(req: Request, res: Response): Promise<Response> {
    try {
      const assignmentId = req.params.id;
      const currentUserId = req.user?.id || '';
      const { authorId, mentionedUserId, editedOnly, search, sortBy, parentCommentId } = req.query;

      const comments = await CommentService.getAssignmentComments(
        assignmentId,
        {
          authorId: authorId as string,
          mentionedUserId: mentionedUserId as string,
          editedOnly: editedOnly === 'true',
          search: search as string,
          sortBy: sortBy === 'oldest' ? 'oldest' : 'newest',
          parentCommentId: parentCommentId as string,
        },
        currentUserId
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Assignment comments retrieved successfully.', comments);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch assignment comments'
      );
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/comments
   */
  public static async createAssignmentComment(req: Request, res: Response): Promise<Response> {
    try {
      const assignmentId = req.params.id;
      const authorId = req.user?.id;
      const { content, parentCommentId } = req.body;

      if (!authorId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required to create a comment.'
        );
      }

      if (!content || !content.trim()) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Comment content cannot be empty.'
        );
      }

      const comment = await CommentService.createAssignmentComment({
        assignmentId,
        authorId,
        content,
        parentCommentId,
      });

      try {
        broadcastCommentSocketEvent('comment:create', {
          commentId: (comment as any).id || (comment as any)._id?.toString(),
          assignmentId,
          content: (comment as any).content,
          parentCommentId,
          user: {
            userId: authorId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
          data: comment,
        });
      } catch (e) {
        // Socket fallback
      }

      return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Assignment comment posted successfully.', comment);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to post assignment comment'
      );
    }
  }

  /**
   * PUT /api/v1/comments/:id
   */
  public static async updateComment(req: Request, res: Response): Promise<Response> {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;
      const { content } = req.body;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      const updated = await CommentService.updateComment(commentId, userId, content);

      try {
        broadcastCommentSocketEvent('comment:update', {
          commentId,
          taskId: (updated as any).taskId || (updated as any).task,
          content: (updated as any).content,
          user: {
            userId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
          data: updated,
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Comment updated successfully.', updated);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update comment'
      );
    }
  }

  /**
   * DELETE /api/v1/comments/:id
   */
  public static async deleteComment(req: Request, res: Response): Promise<Response> {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      const deleted = await CommentService.deleteComment(commentId, userId);

      try {
        broadcastCommentSocketEvent('comment:delete', {
          commentId,
          taskId: (deleted as any)?.taskId || (deleted as any)?.task || '',
          user: {
            userId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Comment deleted successfully.', deleted);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete comment'
      );
    }
  }

  /**
   * POST /api/v1/comments/:id/restore
   */
  public static async restoreComment(req: Request, res: Response): Promise<Response> {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      const restored = await CommentService.restoreComment(commentId, userId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Comment restored successfully.', restored);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to restore comment'
      );
    }
  }

  /**
   * POST /api/v1/comments/:id/reply
   */
  public static async replyComment(req: Request, res: Response): Promise<Response> {
    try {
      const parentCommentId = req.params.id;
      const authorId = req.user?.id;
      const { taskId, content } = req.body;

      if (!authorId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      const reply = await CommentService.createComment({
        taskId,
        authorId,
        content,
        parentCommentId,
      });

      return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Reply posted successfully.', reply);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to post reply'
      );
    }
  }

  /**
   * POST /api/v1/comments/:id/reactions
   */
  public static async toggleReaction(req: Request, res: Response): Promise<Response> {
    try {
      const commentId = req.params.id;
      const userId = req.user?.id;
      const { emoji } = req.body;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      if (!emoji) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Emoji reaction is required.');
      }

      const comment = await CommentService.toggleReaction(commentId, userId, emoji);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Reaction toggled successfully.', comment);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update reaction'
      );
    }
  }
}

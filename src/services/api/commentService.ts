import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Comment,
  CommentFilterOptions,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '../../types/comment';

export class CommentService extends BaseApiService {
  /**
   * Fetch comments for a task
   */
  public static async getTaskComments(
    taskId: string,
    filters?: CommentFilterOptions
  ): Promise<ApiResponseData<Comment[]>> {
    return this.get<Comment[]>(`/tasks/${taskId}/comments`, { params: filters });
  }

  /**
   * Create a new comment or reply on a task
   */
  public static async createComment(
    taskId: string,
    payload: { content: string; parentCommentId?: string }
  ): Promise<ApiResponseData<Comment>> {
    return this.post<Comment>(`/tasks/${taskId}/comments`, payload);
  }

  /**
   * Update an existing comment
   */
  public static async updateComment(
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<ApiResponseData<Comment>> {
    return this.put<Comment>(`/comments/${commentId}`, payload);
  }

  /**
   * Soft delete a comment
   */
  public static async deleteComment(commentId: string): Promise<ApiResponseData<Comment>> {
    return this.delete<Comment>(`/comments/${commentId}`);
  }

  /**
   * Restore a soft-deleted comment
   */
  public static async restoreComment(commentId: string): Promise<ApiResponseData<Comment>> {
    return this.post<Comment>(`/comments/${commentId}/restore`, {});
  }

  /**
   * Reply to a specific comment
   */
  public static async replyComment(
    parentCommentId: string,
    payload: { taskId: string; content: string }
  ): Promise<ApiResponseData<Comment>> {
    return this.post<Comment>(`/comments/${parentCommentId}/reply`, payload);
  }

  /**
   * Toggle emoji reaction on a comment
   */
  public static async toggleReaction(
    commentId: string,
    emoji: string
  ): Promise<ApiResponseData<Comment>> {
    return this.post<Comment>(`/comments/${commentId}/reactions`, { emoji });
  }
}

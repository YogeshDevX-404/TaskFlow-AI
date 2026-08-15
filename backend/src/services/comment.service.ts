import { Types } from 'mongoose';
import { CommentModel, ICommentPayload } from '../models/comment.model';
import { TaskModel } from '../models/task.model';
import { WorkAssignmentModel } from '../models/workAssignment.model';
import { ProjectModel } from '../models/project.model';
import { User } from '../models/user.model';
import { ActivityService } from './activity.service';
import { EmailService } from './email.service';

export interface GetCommentsFilterOptions {
  authorId?: string;
  mentionedUserId?: string;
  editedOnly?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest';
  parentCommentId?: string;
}

export class CommentService {
  /**
   * Helper to parse @mentions from content text or markdown
   */
  private static async extractMentionedUserIds(content: string, orgId?: string): Promise<Types.ObjectId[]> {
    if (!content) return [];
    // Match @username or @user_id or @[Name](id)
    const matches = content.match(/@([\w.-]+)/g);
    if (!matches || matches.length === 0) return [];

    const usernames = matches.map((m) => m.replace('@', '').trim()).filter(Boolean);
    if (usernames.length === 0) return [];

    // Find matching users by email, name, or _id
    const validUsers = await User.find({
      $or: [
        { email: { $in: usernames.map((u) => new RegExp(`^${u}$`, 'i')) } },
        { firstName: { $in: usernames.map((u) => new RegExp(`^${u}$`, 'i')) } },
        { _id: { $in: usernames.filter((u) => Types.ObjectId.isValid(u)) } },
      ],
    }).select('_id');

    return validUsers.map((u) => u._id as Types.ObjectId);
  }

  /**
   * GET comments for a task
   */
  public static async getTaskComments(
    taskId: string,
    filters: GetCommentsFilterOptions = {},
    currentUserId?: string
  ): Promise<ICommentPayload[]> {
    const query: any = { task: taskId };

    // Parent vs Thread filter
    if (filters.parentCommentId !== undefined) {
      query.parentComment = filters.parentCommentId || null;
    } else if (!filters.search && !filters.authorId && !filters.mentionedUserId) {
      // Default: Top-level comments only
      query.parentComment = null;
    }

    if (filters.authorId && Types.ObjectId.isValid(filters.authorId)) {
      query.author = filters.authorId;
    }

    if (filters.mentionedUserId && Types.ObjectId.isValid(filters.mentionedUserId)) {
      query.mentions = filters.mentionedUserId;
    }

    if (filters.editedOnly) {
      query.edited = true;
    }

    if (filters.search) {
      query.content = { $regex: filters.search, $options: 'i' };
    }

    const sortOrder = filters.sortBy === 'oldest' ? 1 : -1;

    const comments = await CommentModel.find(query)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar')
      .sort({ createdAt: sortOrder });

    return comments.map((c) => c.toCommentPayload(currentUserId));
  }

  /**
   * GET comments for an assignment
   */
  public static async getAssignmentComments(
    assignmentId: string,
    filters: GetCommentsFilterOptions = {},
    currentUserId?: string
  ): Promise<ICommentPayload[]> {
    let assignmentDoc = null;
    if (Types.ObjectId.isValid(assignmentId)) {
      assignmentDoc = await WorkAssignmentModel.findById(assignmentId);
    } else {
      assignmentDoc = await WorkAssignmentModel.findOne({ assignmentId });
    }

    if (!assignmentDoc) return [];

    const query: any = { assignment: assignmentDoc._id };

    if (filters.parentCommentId !== undefined) {
      query.parentComment = filters.parentCommentId || null;
    } else if (!filters.search && !filters.authorId && !filters.mentionedUserId) {
      query.parentComment = null;
    }

    if (filters.authorId && Types.ObjectId.isValid(filters.authorId)) {
      query.author = filters.authorId;
    }

    if (filters.mentionedUserId && Types.ObjectId.isValid(filters.mentionedUserId)) {
      query.mentions = filters.mentionedUserId;
    }

    if (filters.editedOnly) {
      query.edited = true;
    }

    if (filters.search) {
      query.content = { $regex: filters.search, $options: 'i' };
    }

    const sortOrder = filters.sortBy === 'oldest' ? 1 : -1;

    const comments = await CommentModel.find(query)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar')
      .sort({ createdAt: sortOrder });

    return comments.map((c) => c.toCommentPayload(currentUserId));
  }

  /**
   * Create comment for an assignment
   */
  public static async createAssignmentComment(data: {
    assignmentId: string;
    authorId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<ICommentPayload> {
    if (!data.content || !data.content.trim()) {
      throw new Error('Comment content cannot be empty.');
    }

    let assignment = null;
    if (Types.ObjectId.isValid(data.assignmentId)) {
      assignment = await WorkAssignmentModel.findById(data.assignmentId);
    } else {
      assignment = await WorkAssignmentModel.findOne({ assignmentId: data.assignmentId });
    }

    if (!assignment) {
      throw new Error('Associated work assignment not found.');
    }

    let parentCommentDoc = null;
    if (data.parentCommentId) {
      parentCommentDoc = await CommentModel.findById(data.parentCommentId);
      if (!parentCommentDoc) {
        throw new Error('Parent comment for reply not found.');
      }
    }

    const mentions = await CommentService.extractMentionedUserIds(
      data.content,
      assignment.organization.toString()
    );

    const comment = await CommentModel.create({
      assignment: assignment._id,
      project: assignment.project,
      workspace: assignment.workspace,
      organization: assignment.organization,
      author: data.authorId,
      content: data.content.trim(),
      parentComment: parentCommentDoc ? parentCommentDoc._id : null,
      mentions,
    });

    if (parentCommentDoc) {
      await CommentModel.findByIdAndUpdate(parentCommentDoc._id, {
        $inc: { replyCount: 1 },
      });
    }

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    ActivityService.recordActivity({
      organizationId: assignment.organization.toString(),
      workspaceId: assignment.workspace ? assignment.workspace.toString() : null,
      projectId: assignment.project ? assignment.project.toString() : null,
      assignmentId: assignment._id.toString(),
      userId: data.authorId,
      action: 'comment_added',
      entityType: 'Comment',
      entityId: comment._id.toString(),
      metadata: {
        assignmentId: assignment.assignmentId,
        title: assignment.title,
        commentContent: data.content.substring(0, 100),
      },
    });

    return populated!.toCommentPayload(data.authorId);
  }

  /**
   * Get replies for a parent comment
   */
  public static async getCommentReplies(
    parentCommentId: string,
    currentUserId?: string
  ): Promise<ICommentPayload[]> {
    const replies = await CommentModel.find({ parentComment: parentCommentId })
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar')
      .sort({ createdAt: 1 });

    return replies.map((c) => c.toCommentPayload(currentUserId));
  }

  /**
   * Create a new comment or reply
   */
  public static async createComment(data: {
    taskId: string;
    authorId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<ICommentPayload> {
    if (!data.content || !data.content.trim()) {
      throw new Error('Comment content cannot be empty.');
    }

    const task = await TaskModel.findById(data.taskId);
    if (!task) {
      throw new Error('Associated task not found.');
    }

    let parentCommentDoc = null;
    if (data.parentCommentId) {
      parentCommentDoc = await CommentModel.findById(data.parentCommentId);
      if (!parentCommentDoc) {
        throw new Error('Parent comment for reply not found.');
      }
    }

    const mentions = await CommentService.extractMentionedUserIds(
      data.content,
      task.organization.toString()
    );

    const comment = await CommentModel.create({
      task: task._id,
      project: task.project,
      workspace: task.workspace,
      organization: task.organization,
      author: data.authorId,
      content: data.content.trim(),
      parentComment: parentCommentDoc ? parentCommentDoc._id : null,
      mentions,
    });

    if (parentCommentDoc) {
      await CommentModel.findByIdAndUpdate(parentCommentDoc._id, {
        $inc: { replyCount: 1 },
      });
    }

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    // Trigger Comment Mention Email Notifications asynchronously
    if (mentions && mentions.length > 0) {
      (async () => {
        try {
          const authorUser = await User.findById(data.authorId);
          const authorName = authorUser
            ? `${authorUser.firstName} ${authorUser.lastName}`.trim() || authorUser.email
            : 'A user';

          const projectDoc = await ProjectModel.findById(task.project);
          const projectName = projectDoc ? projectDoc.name : 'Project';

          for (const mentionedId of mentions) {
            // Don't notify self
            if (mentionedId.toString() === data.authorId.toString()) continue;

            await EmailService.sendCommentMentionEmail({
              recipientUserId: mentionedId.toString(),
              commentAuthorName: authorName,
              projectName,
              taskKey: task.taskKey,
              taskTitle: task.title,
              commentExcerpt: data.content,
              taskId: task._id.toString(),
            });
          }
        } catch (err: any) {
          console.error(`[CommentService] Error processing mention emails: ${err.message}`);
        }
      })();
    }

    ActivityService.recordActivity({
      organizationId: task.organization.toString(),
      workspaceId: task.workspace ? task.workspace.toString() : null,
      projectId: task.project ? task.project.toString() : null,
      taskId: task._id.toString(),
      userId: data.authorId,
      action: 'comment_added',
      entityType: 'Comment',
      entityId: comment._id.toString(),
      metadata: {
        taskKey: task.taskKey,
        taskTitle: task.title,
        commentContent: data.content.substring(0, 100),
      },
    });

    return populated!.toCommentPayload(data.authorId);
  }

  /**
   * Update an existing comment
   */
  public static async updateComment(
    commentId: string,
    userId: string,
    newContent: string
  ): Promise<ICommentPayload> {
    if (!newContent || !newContent.trim()) {
      throw new Error('Updated comment content cannot be empty.');
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found.');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('You do not have permission to edit this comment.');
    }

    if (comment.isDeleted) {
      throw new Error('Cannot edit a deleted comment.');
    }

    const oldContent = comment.content;
    const mentions = await CommentService.extractMentionedUserIds(newContent);

    comment.content = newContent.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    comment.mentions = mentions;

    await comment.save();

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    ActivityService.recordActivity({
      organizationId: comment.organization.toString(),
      workspaceId: comment.workspace ? comment.workspace.toString() : null,
      projectId: comment.project ? comment.project.toString() : null,
      taskId: comment.task ? comment.task.toString() : null,
      userId,
      action: 'comment_edited',
      entityType: 'Comment',
      entityId: comment._id.toString(),
      oldValue: oldContent.substring(0, 100),
      newValue: newContent.substring(0, 100),
      metadata: { commentContent: newContent.substring(0, 100) },
    });

    return populated!.toCommentPayload(userId);
  }

  /**
   * Soft Delete a comment
   */
  public static async deleteComment(commentId: string, userId: string): Promise<ICommentPayload> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found.');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('You do not have permission to delete this comment.');
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    ActivityService.recordActivity({
      organizationId: comment.organization.toString(),
      workspaceId: comment.workspace ? comment.workspace.toString() : null,
      projectId: comment.project ? comment.project.toString() : null,
      taskId: comment.task ? comment.task.toString() : null,
      userId,
      action: 'comment_deleted',
      entityType: 'Comment',
      entityId: comment._id.toString(),
      metadata: { commentContent: comment.content.substring(0, 100) },
    });

    return populated!.toCommentPayload(userId);
  }

  /**
   * Restore a soft deleted comment
   */
  public static async restoreComment(commentId: string, userId: string): Promise<ICommentPayload> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found.');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('You do not have permission to restore this comment.');
    }

    comment.isDeleted = false;
    comment.deletedAt = undefined;
    await comment.save();

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    return populated!.toCommentPayload(userId);
  }

  /**
   * Toggle emoji reaction on comment
   */
  public static async toggleReaction(
    commentId: string,
    userId: string,
    emoji: string
  ): Promise<ICommentPayload> {
    const ALLOWED_EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '👀'];
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      throw new Error(`Invalid emoji reaction "${emoji}".`);
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found.');
    }

    if (comment.isDeleted) {
      throw new Error('Cannot add reactions to deleted comments.');
    }

    const userObjId = new Types.ObjectId(userId);
    let reactionEntry = comment.reactions.find((r) => r.emoji === emoji);

    if (reactionEntry) {
      const userIndex = reactionEntry.users.findIndex((u) => u.toString() === userId);
      if (userIndex > -1) {
        // Remove reaction
        reactionEntry.users.splice(userIndex, 1);
        if (reactionEntry.users.length === 0) {
          comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Add reaction
        reactionEntry.users.push(userObjId);
      }
    } else {
      // New emoji entry
      comment.reactions.push({
        emoji,
        users: [userObjId],
      });
    }

    // Update total reaction count
    comment.reactionCount = comment.reactions.reduce((sum, r) => sum + r.users.length, 0);

    await comment.save();

    const populated = await CommentModel.findById(comment._id)
      .populate('author', 'name firstName lastName email avatar role')
      .populate('mentions', 'name firstName lastName email avatar');

    return populated!.toCommentPayload(userId);
  }
}

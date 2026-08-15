import { Types } from 'mongoose';
import { TaskModel, TaskStatus, TaskPriority, ITaskPayload } from '../models/task.model';
import { BoardModel, IBoardDocument } from '../models/board.model';
import { CommentModel } from '../models/comment.model';
import { AttachmentModel } from '../models/attachment.model';
import { BoardService } from './board.service';
import { TaskSortingService } from './taskSorting.service';
import { TaskService } from './task.service';
import { ActivityService } from './activity.service';

export interface KanbanBoardData {
  board: IBoardDocument;
  tasks: ITaskPayload[];
  groupedTasks: Record<string, ITaskPayload[]>;
  columns: any[];
  userRole: string;
}

export class KanbanService {
  /**
   * Fetch complete Kanban board state for a project
   */
  public static async getBoardData(
    projectId: string,
    filters: {
      search?: string;
      assigneeId?: string;
      reporterId?: string;
      priority?: string;
      status?: string;
      type?: string;
      labels?: string[];
      dueDate?: string;
      isArchived?: boolean;
    } = {},
    userId?: string
  ): Promise<KanbanBoardData> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    const userRole = userId
      ? await BoardService.getUserProjectRole(projectId, userId)
      : 'Developer';

    const board = await BoardService.getOrCreateBoard(projectId, userId);

    const query: any = {
      project: new Types.ObjectId(projectId),
      isArchived: filters.isArchived === true ? true : false,
    };

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'all') {
      query.priority = filters.priority;
    }

    if (filters.type && filters.type !== 'all') {
      query.type = filters.type;
    }

    if (filters.assigneeId && filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        query.assignee = null;
      } else if (Types.ObjectId.isValid(filters.assigneeId)) {
        query.assignee = new Types.ObjectId(filters.assigneeId);
      }
    }

    if (filters.reporterId && filters.reporterId !== 'all') {
      if (Types.ObjectId.isValid(filters.reporterId)) {
        query.reporter = new Types.ObjectId(filters.reporterId);
      }
    }

    if (filters.labels && filters.labels.length > 0) {
      query.labels = { $in: filters.labels };
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { taskKey: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    // Due date filter presets
    if (filters.dueDate) {
      const now = new Date();
      if (filters.dueDate === 'overdue') {
        query.dueDate = { $lt: now };
      } else if (filters.dueDate === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
      } else if (filters.dueDate === 'this_week') {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        query.dueDate = { $gte: new Date(), $lte: endOfWeek };
      }
    }

    const taskDocs = await TaskModel.find(query)
      .populate('project', 'name projectKey icon workspace organization')
      .populate('workspace', 'name slug')
      .populate('organization', 'name slug')
      .populate('assignee', 'name firstName lastName email avatar role')
      .populate('reporter', 'name firstName lastName email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .sort({ sortOrder: 1, createdAt: -1 });

    const taskIds = taskDocs.map((t) => t._id);

    // Aggregate comment counts
    const commentCounts = await CommentModel.aggregate([
      { $match: { task: { $in: taskIds }, isDeleted: false } },
      { $group: { _id: '$task', count: { $sum: 1 } } },
    ]);
    const commentCountMap = new Map<string, number>();
    commentCounts.forEach((c) => commentCountMap.set(c._id.toString(), c.count));

    // Aggregate attachment counts
    const attachmentCounts = await AttachmentModel.aggregate([
      { $match: { task: { $in: taskIds } } },
      { $group: { _id: '$task', count: { $sum: 1 } } },
    ]);
    const attachmentCountMap = new Map<string, number>();
    attachmentCounts.forEach((a) => attachmentCountMap.set(a._id.toString(), a.count));

    const tasksPayload: ITaskPayload[] = taskDocs.map((doc) => {
      const payload = doc.toTaskPayload(userId);
      payload.commentCount = commentCountMap.get(doc._id.toString()) || 0;
      payload.attachmentCount = attachmentCountMap.get(doc._id.toString()) || 0;
      return payload;
    });

    const sortedTasks = TaskSortingService.sortTasksByPosition(tasksPayload);
    const groupBySetting = board.settings.groupBy || 'status';
    const groupedTasks = TaskSortingService.groupTasksBy(sortedTasks, groupBySetting);

    return {
      board,
      tasks: sortedTasks,
      groupedTasks,
      columns: board.columns,
      userRole,
    };
  }

  /**
   * Update task status with RBAC checks and optional order index positioning
   */
  public static async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    newIndex?: number,
    userId?: string
  ): Promise<ITaskPayload> {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const projectId = task.project.toString();
    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Developer';

    // RBAC Security Validation
    if (role === 'Viewer') {
      throw new Error('Permission denied: Viewers cannot move or modify tasks.');
    }

    if (role === 'Developer' || role === 'Tester') {
      const isAssignee = task.assignee && task.assignee.toString() === userId?.toString();
      const isReporter = task.reporter && task.reporter.toString() === userId?.toString();
      const isUnassigned = !task.assignee;

      if (!isAssignee && !isReporter && !isUnassigned) {
        throw new Error('Permission denied: Developers and Testers can only move tasks assigned to them or unassigned tasks.');
      }
    }

    const oldStatus = task.status;
    task.status = status;

    if (newIndex !== undefined && newIndex >= 0) {
      task.sortOrder = newIndex;
    } else {
      // Put at end of destination column
      const maxInColumn = await TaskModel.findOne({ project: task.project, status, isArchived: false })
        .sort({ sortOrder: -1 })
        .select('sortOrder');
      task.sortOrder = maxInColumn ? (maxInColumn.sortOrder || 0) + 1 : 0;
    }

    await task.save();

    if (userId && oldStatus !== status) {
      ActivityService.recordActivity({
        organizationId: task.organization.toString(),
        workspaceId: task.workspace ? task.workspace.toString() : null,
        projectId: task.project ? task.project.toString() : null,
        taskId: task._id.toString(),
        userId,
        action: 'task_updated',
        entityType: 'Task',
        entityId: task._id.toString(),
        metadata: {
          field: 'status',
          oldValue: oldStatus,
          newValue: status,
          taskKey: task.taskKey,
          title: task.title,
        },
      });
    }

    return TaskService.getTaskById(taskId, userId);
  }

  /**
   * Reorder list of task IDs in a column or across board
   */
  public static async reorderTasks(
    projectId: string,
    taskIds: string[],
    status?: TaskStatus,
    userId?: string
  ): Promise<boolean> {
    if (!taskIds || taskIds.length === 0) return true;

    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Developer';
    if (role === 'Viewer') {
      throw new Error('Permission denied: Viewers cannot reorder tasks.');
    }

    const bulkOps = taskIds.map((id, idx) => {
      const updateDoc: any = { sortOrder: idx };
      if (status) {
        updateDoc.status = status;
      }
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: { $set: updateDoc },
        },
      };
    });

    await TaskModel.bulkWrite(bulkOps);
    return true;
  }

  /**
   * Execute bulk operations on multi-selected tasks
   */
  public static async bulkUpdateTasks(
    projectId: string,
    taskIds: string[],
    updates: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      isArchived?: boolean;
      delete?: boolean;
    },
    userId?: string
  ): Promise<boolean> {
    if (!taskIds || taskIds.length === 0) return true;

    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Developer';
    if (role === 'Viewer') {
      throw new Error('Permission denied: Viewers cannot perform bulk actions.');
    }

    if (updates.delete) {
      if (role === 'Tester' || role === 'Developer') {
        throw new Error('Permission denied: Only Project Owners, Admins, and PMs can bulk delete tasks.');
      }
      await TaskModel.deleteMany({
        _id: { $in: taskIds.map((id) => new Types.ObjectId(id)) },
        project: new Types.ObjectId(projectId),
      });
      return true;
    }

    const setObj: any = {};
    if (updates.status) setObj.status = updates.status;
    if (updates.priority) setObj.priority = updates.priority;
    if (updates.assigneeId !== undefined) {
      setObj.assignee = updates.assigneeId && Types.ObjectId.isValid(updates.assigneeId)
        ? new Types.ObjectId(updates.assigneeId)
        : null;
    }
    if (updates.isArchived !== undefined) setObj.isArchived = updates.isArchived;

    if (Object.keys(setObj).length > 0) {
      await TaskModel.updateMany(
        {
          _id: { $in: taskIds.map((id) => new Types.ObjectId(id)) },
          project: new Types.ObjectId(projectId),
        },
        { $set: setObj }
      );
    }

    return true;
  }
}

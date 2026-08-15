import { Types } from 'mongoose';
import {
  TaskModel,
  ITaskPayload,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../models/task.model';
import { ProjectModel } from '../models/project.model';
import { Workspace as WorkspaceModel } from '../models/workspace.model';
import { User } from '../models/user.model';
import { ActivityService } from './activity.service';
import { EmailService } from './email.service';

export interface GetTasksQueryParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  userId?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  labels?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTaskDTO {
  title: string;
  taskKey?: string;
  description?: string;
  projectId: string;
  workspaceId?: string;
  organizationId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assigneeId?: string;
  reporterId?: string;
  labels?: string[];
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  spentHours?: number;
  storyPoints?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assigneeId?: string | null;
  reporterId?: string | null;
  labels?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  estimatedHours?: number;
  spentHours?: number;
  storyPoints?: number;
  isArchived?: boolean;
}

export class TaskService {
  /**
   * Helper to validate dates
   */
  public static validateTaskDates(startDate?: string | null, dueDate?: string | null): void {
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      if (isNaN(start.getTime()) || isNaN(due.getTime())) {
        throw new Error('Invalid date format provided for task');
      }
      if (start > due) {
        throw new Error('Task start date cannot be after due date');
      }
    }
  }

  /**
   * Generate next unique taskKey for a project
   */
  public static async generateTaskKey(projectId: string): Promise<string> {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found to generate taskKey');
    }

    let prefix = (project.projectKey || 'TASK').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!prefix) {
      prefix = (project.name || 'TASK')
        .substring(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') || 'TASK';
    }

    // Find all tasks for this project or prefix to compute next sequence number
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
    const existingTasks = await TaskModel.find({
      taskKey: { $regex: prefixRegex },
    }).select('taskKey');

    let maxNumber = 0;
    existingTasks.forEach((t) => {
      const match = t.taskKey.match(prefixRegex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // If no numbered tasks match the prefix yet, check total task count for project
    if (maxNumber === 0) {
      const count = await TaskModel.countDocuments({ project: projectId });
      maxNumber = count;
    }

    const nextKey = `${prefix}-${maxNumber + 1}`;
    return nextKey;
  }

  /**
   * Get filtered tasks with pagination and sorting
   */
  public static async getTasks(params: GetTasksQueryParams): Promise<{
    tasks: ITaskPayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (params.organizationId && Types.ObjectId.isValid(params.organizationId)) {
      query.organization = new Types.ObjectId(params.organizationId);
    }

    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      query.workspace = new Types.ObjectId(params.workspaceId);
    }

    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      query.project = new Types.ObjectId(params.projectId);
    }

    if (params.assigneeId && Types.ObjectId.isValid(params.assigneeId)) {
      query.assignee = new Types.ObjectId(params.assigneeId);
    }

    if (params.reporterId && Types.ObjectId.isValid(params.reporterId)) {
      query.reporter = new Types.ObjectId(params.reporterId);
    }

    if (params.isArchived !== undefined) {
      query.isArchived = params.isArchived;
    } else {
      query.isArchived = false;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.priority) {
      query.priority = params.priority;
    }

    if (params.type) {
      query.type = params.type;
    }

    if (params.labels && params.labels.length > 0) {
      query.labels = { $in: params.labels };
    }

    if (params.isFavorite && params.userId && Types.ObjectId.isValid(params.userId)) {
      query.favorites = new Types.ObjectId(params.userId);
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [
        { taskKey: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      newest: 'createdAt',
      oldest: 'createdAt',
      priority: 'priority',
      dueDate: 'dueDate',
      updated: 'updatedAt',
      alphabetical: 'title',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      title: 'title',
    };

    const sortField = sortFieldMap[params.sortBy || 'newest'] || 'createdAt';
    let sortDirection = 1;

    if (params.sortBy === 'oldest' || params.sortBy === 'alphabetical') {
      sortDirection = 1;
    } else if (params.sortOrder) {
      sortDirection = params.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortDirection = -1;
    }

    const sortOptions: any = { [sortField]: sortDirection };

    const total = await TaskModel.countDocuments(query);
    const taskDocs = await TaskModel.find(query)
      .populate('project', 'name projectKey icon coverImage workspace organization')
      .populate('workspace', 'name slug logoUrl')
      .populate('organization', 'name slug')
      .populate('assignee', 'name firstName lastName email avatar role')
      .populate('reporter', 'name firstName lastName email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const tasks = taskDocs.map((t) => t.toTaskPayload(params.userId));

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single task by ID or taskKey
   */
  public static async getTaskById(idOrKey: string, userId?: string): Promise<ITaskPayload> {
    const isObjectId = Types.ObjectId.isValid(idOrKey);
    const query = isObjectId ? { _id: idOrKey } : { taskKey: idOrKey.toUpperCase() };

    const taskDoc = await TaskModel.findOne(query)
      .populate('project', 'name projectKey icon coverImage workspace organization')
      .populate('workspace', 'name slug logoUrl')
      .populate('organization', 'name slug')
      .populate('assignee', 'name firstName lastName email avatar role')
      .populate('reporter', 'name firstName lastName email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar');

    if (!taskDoc) {
      throw new Error(`Task not found: ${idOrKey}`);
    }

    return taskDoc.toTaskPayload(userId);
  }

  /**
   * Get complete task details including watchers and parent/subtask references
   */
  public static async getTaskDetails(idOrKey: string, userId?: string): Promise<ITaskPayload> {
    const isObjectId = Types.ObjectId.isValid(idOrKey);
    const query = isObjectId ? { _id: idOrKey } : { taskKey: idOrKey.toUpperCase() };

    const taskDoc = await TaskModel.findOne(query)
      .populate('project', 'name projectKey icon coverImage workspace organization')
      .populate('workspace', 'name slug logoUrl')
      .populate('organization', 'name slug')
      .populate('assignee', 'name firstName lastName email avatar role')
      .populate('reporter', 'name firstName lastName email avatar role')
      .populate('watchers', 'name firstName lastName email avatar role')
      .populate('createdBy', 'name firstName lastName email avatar')
      .populate('updatedBy', 'name firstName lastName email avatar');

    if (!taskDoc) {
      throw new Error(`Task details not found for: ${idOrKey}`);
    }

    return taskDoc.toTaskPayload(userId);
  }

  /**
   * Create a new task
   */
  public static async createTask(data: CreateTaskDTO, userId?: string): Promise<ITaskPayload> {
    if (!data.title || !data.title.trim()) {
      throw new Error('Task title is required');
    }

    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    TaskService.validateTaskDates(data.startDate, data.dueDate);

    // Fetch project to resolve workspace and organization if not supplied
    const project = await ProjectModel.findById(data.projectId);
    if (!project) {
      throw new Error('Selected project does not exist');
    }

    const workspaceId = data.workspaceId || project.workspace.toString();
    const organizationId = data.organizationId || project.organization.toString();

    // Auto-generate taskKey if omitted or invalid
    let taskKey = data.taskKey ? data.taskKey.trim().toUpperCase() : '';
    if (!taskKey) {
      taskKey = await TaskService.generateTaskKey(data.projectId);
    } else {
      // Ensure unique taskKey
      const existingKey = await TaskModel.findOne({ taskKey });
      if (existingKey) {
        throw new Error(`Task Key '${taskKey}' already exists. Task Keys must be unique.`);
      }
    }

    const newTask = new TaskModel({
      title: data.title.trim(),
      taskKey,
      description: data.description || '',
      project: new Types.ObjectId(data.projectId),
      workspace: new Types.ObjectId(workspaceId),
      organization: new Types.ObjectId(organizationId),
      status: data.status || 'Todo',
      priority: data.priority || 'Medium',
      type: data.type || 'Task',
      assignee: data.assigneeId && Types.ObjectId.isValid(data.assigneeId)
        ? new Types.ObjectId(data.assigneeId)
        : null,
      reporter: data.reporterId && Types.ObjectId.isValid(data.reporterId)
        ? new Types.ObjectId(data.reporterId)
        : userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : null,
      labels: data.labels || [],
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedHours: data.estimatedHours ?? 0,
      spentHours: data.spentHours ?? 0,
      storyPoints: data.storyPoints ?? 0,
      isArchived: false,
      createdBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
      updatedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
    });

    await newTask.save();

    // Trigger Task Assignment Email
    if (newTask.assignee) {
      (async () => {
        try {
          let assignedByName = 'An Admin/Manager';
          if (userId && Types.ObjectId.isValid(userId)) {
            const assigner = await User.findById(userId);
            if (assigner) {
              assignedByName = `${assigner.firstName} ${assigner.lastName}`.trim() || assigner.email;
            }
          }

          let reporterName = 'N/A';
          if (newTask.reporter) {
            const rep = await User.findById(newTask.reporter);
            if (rep) {
              reporterName = `${rep.firstName} ${rep.lastName}`.trim() || rep.email;
            }
          }

          await EmailService.sendTaskAssignmentEmail({
            recipientUserId: newTask.assignee.toString(),
            projectName: project.name,
            projectKey: project.projectKey || 'PROJECT',
            taskId: newTask._id.toString(),
            taskKey: newTask.taskKey,
            taskTitle: newTask.title,
            taskDescription: newTask.description,
            priority: newTask.priority,
            status: newTask.status,
            assigneeName: 'Assignee',
            reporterName,
            dueDate: newTask.dueDate ? newTask.dueDate.toLocaleDateString() : undefined,
            assignedBy: assignedByName,
          });
        } catch (err: any) {
          console.error(`[TaskService] Error triggering task assignment email: ${err.message}`);
        }
      })();
    }

    if (userId) {
      ActivityService.recordActivity({
        organizationId,
        workspaceId,
        projectId: data.projectId,
        taskId: newTask._id.toString(),
        userId,
        action: 'task_created',
        entityType: 'Task',
        entityId: newTask._id.toString(),
        newValue: { title: newTask.title, status: newTask.status, priority: newTask.priority },
        metadata: { taskKey: newTask.taskKey, taskTitle: newTask.title },
      });
    }

    return TaskService.getTaskById(newTask._id.toString(), userId);
  }

  /**
   * Update an existing task
   */
  public static async updateTask(id: string, data: UpdateTaskDTO, userId?: string): Promise<ITaskPayload> {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const oldStatus = task.status;
    const oldPriority = task.priority;
    const oldAssignee = task.assignee ? task.assignee.toString() : null;
    const oldReporter = task.reporter ? task.reporter.toString() : null;
    const oldArchived = task.isArchived;

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error('Task title cannot be empty');
      }
      task.title = data.title.trim();
    }

    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.type !== undefined) task.type = data.type;

    if (data.assigneeId !== undefined) {
      task.assignee = data.assigneeId && Types.ObjectId.isValid(data.assigneeId)
        ? new Types.ObjectId(data.assigneeId)
        : undefined;
    }

    if (data.reporterId !== undefined) {
      task.reporter = data.reporterId && Types.ObjectId.isValid(data.reporterId)
        ? new Types.ObjectId(data.reporterId)
        : undefined;
    }

    if (data.labels !== undefined) task.labels = data.labels;

    const nextStartDate = data.startDate !== undefined ? data.startDate : (task.startDate ? task.startDate.toISOString() : undefined);
    const nextDueDate = data.dueDate !== undefined ? data.dueDate : (task.dueDate ? task.dueDate.toISOString() : undefined);
    TaskService.validateTaskDates(nextStartDate, nextDueDate);

    if (data.startDate !== undefined) {
      task.startDate = data.startDate ? new Date(data.startDate) : undefined;
    }
    if (data.dueDate !== undefined) {
      task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    }

    if (data.estimatedHours !== undefined) task.estimatedHours = data.estimatedHours;
    if (data.spentHours !== undefined) task.spentHours = data.spentHours;
    if (data.storyPoints !== undefined) task.storyPoints = data.storyPoints;
    if (data.isArchived !== undefined) task.isArchived = data.isArchived;

    if (userId && Types.ObjectId.isValid(userId)) {
      task.updatedBy = new Types.ObjectId(userId);
    }

    await task.save();

    // Trigger Email notifications for Reassignment or Status Update
    (async () => {
      try {
        const project = await ProjectModel.findById(task.project);
        const projectName = project ? project.name : 'Project';
        const projectKey = project ? project.projectKey : 'TASK';

        let modifierName = 'A team member';
        if (userId && Types.ObjectId.isValid(userId)) {
          const mod = await User.findById(userId);
          if (mod) {
            modifierName = `${mod.firstName} ${mod.lastName}`.trim() || mod.email;
          }
        }

        // Reassignment check
        const newAssigneeStr = task.assignee ? task.assignee.toString() : null;
        if (data.assigneeId !== undefined && newAssigneeStr && newAssigneeStr !== oldAssignee) {
          let prevName = 'Unassigned';
          if (oldAssignee) {
            const prevUser = await User.findById(oldAssignee);
            if (prevUser) prevName = `${prevUser.firstName} ${prevUser.lastName}`.trim() || prevUser.email;
          }

          let newName = 'New Assignee';
          const newUser = await User.findById(newAssigneeStr);
          if (newUser) newName = `${newUser.firstName} ${newUser.lastName}`.trim() || newUser.email;

          await EmailService.sendTaskReassignmentEmail({
            recipientUserId: newAssigneeStr,
            projectName,
            projectKey,
            taskKey: task.taskKey,
            taskTitle: task.title,
            previousAssigneeName: prevName,
            newAssigneeName: newName,
            assignedBy: modifierName,
            taskId: task._id.toString(),
          });
        }

        // Status change check
        if (data.status !== undefined && data.status !== oldStatus && task.assignee) {
          await EmailService.sendTaskStatusUpdateEmail({
            recipientUserId: task.assignee.toString(),
            taskKey: task.taskKey,
            taskTitle: task.title,
            projectName,
            oldStatus,
            newStatus: task.status,
            updatedBy: modifierName,
            taskId: task._id.toString(),
          });
        }
      } catch (err: any) {
        console.error(`[TaskService] Error processing update task email notification: ${err.message}`);
      }
    })();

    if (userId) {
      let action: string = 'task_updated';
      if (data.status !== undefined && data.status !== oldStatus) {
        action = 'status_changed';
      } else if (data.priority !== undefined && data.priority !== oldPriority) {
        action = 'priority_changed';
      } else if (data.assigneeId !== undefined && (task.assignee ? task.assignee.toString() : null) !== oldAssignee) {
        action = 'assignee_changed';
      } else if (data.reporterId !== undefined && (task.reporter ? task.reporter.toString() : null) !== oldReporter) {
        action = 'reporter_changed';
      } else if (data.isArchived !== undefined && data.isArchived !== oldArchived) {
        action = data.isArchived ? 'task_archived' : 'task_restored';
      }

      ActivityService.recordActivity({
        organizationId: task.organization.toString(),
        workspaceId: task.workspace ? task.workspace.toString() : null,
        projectId: task.project ? task.project.toString() : null,
        taskId: task._id.toString(),
        userId,
        action,
        entityType: 'Task',
        entityId: task._id.toString(),
        oldValue: oldStatus !== task.status ? oldStatus : oldPriority !== task.priority ? oldPriority : null,
        newValue: oldStatus !== task.status ? task.status : oldPriority !== task.priority ? task.priority : null,
        metadata: { taskKey: task.taskKey, taskTitle: task.title },
      });
    }

    return TaskService.getTaskById(task._id.toString(), userId);
  }

  /**
   * Delete a task
   */
  public static async deleteTask(id: string, userId?: string): Promise<boolean> {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw new Error('Task not found for deletion');
    }

    const orgId = task.organization.toString();
    const wsId = task.workspace ? task.workspace.toString() : null;
    const projId = task.project ? task.project.toString() : null;
    const taskKey = task.taskKey;
    const taskTitle = task.title;

    await TaskModel.findByIdAndDelete(id);

    if (userId) {
      ActivityService.recordActivity({
        organizationId: orgId,
        workspaceId: wsId,
        projectId: projId,
        taskId: id,
        userId,
        action: 'task_deleted',
        entityType: 'Task',
        entityId: id,
        metadata: { taskKey, taskTitle },
      });
    }

    return true;
  }

  /**
   * Archive task
   */
  public static async archiveTask(id: string, userId?: string): Promise<ITaskPayload> {
    return TaskService.updateTask(id, { isArchived: true }, userId);
  }

  /**
   * Restore task
   */
  public static async restoreTask(id: string, userId?: string): Promise<ITaskPayload> {
    return TaskService.updateTask(id, { isArchived: false }, userId);
  }

  /**
   * Duplicate task
   */
  public static async duplicateTask(id: string, userId?: string): Promise<ITaskPayload> {
    const sourceTask = await TaskModel.findById(id);
    if (!sourceTask) {
      throw new Error('Source task not found for duplication');
    }

    const newKey = await TaskService.generateTaskKey(sourceTask.project.toString());

    const newTask = new TaskModel({
      title: `${sourceTask.title} (Copy)`,
      taskKey: newKey,
      description: sourceTask.description,
      project: sourceTask.project,
      workspace: sourceTask.workspace,
      organization: sourceTask.organization,
      status: sourceTask.status,
      priority: sourceTask.priority,
      type: sourceTask.type,
      assignee: sourceTask.assignee,
      reporter: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : sourceTask.reporter,
      labels: [...(sourceTask.labels || [])],
      startDate: sourceTask.startDate,
      dueDate: sourceTask.dueDate,
      estimatedHours: sourceTask.estimatedHours,
      spentHours: 0,
      storyPoints: sourceTask.storyPoints,
      isArchived: false,
      createdBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
      updatedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
    });

    await newTask.save();
    return TaskService.getTaskById(newTask._id.toString(), userId);
  }

  /**
   * Toggle favorite task
   */
  public static async toggleFavorite(id: string, userId: string): Promise<ITaskPayload> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error('User ID is required to favorite task');
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = task.favorites.findIndex((f) => f.toString() === userId);

    if (index > -1) {
      task.favorites.splice(index, 1);
    } else {
      task.favorites.push(userObjId);
    }

    await task.save();
    return TaskService.getTaskById(task._id.toString(), userId);
  }

  /**
   * Toggle watch task
   */
  public static async toggleWatch(id: string, userId: string): Promise<ITaskPayload> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error('User ID is required to watch task');
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = task.watchers.findIndex((w) => w.toString() === userId);

    if (index > -1) {
      task.watchers.splice(index, 1);
    } else {
      task.watchers.push(userObjId);
    }

    await task.save();
    return TaskService.getTaskById(task._id.toString(), userId);
  }
}

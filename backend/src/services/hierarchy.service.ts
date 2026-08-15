import { Types } from 'mongoose';
import { TaskModel, ITaskPayload, ITaskDocument } from '../models/task.model';
import { TaskService, CreateTaskDTO, UpdateTaskDTO } from './task.service';
import { ActivityService } from './activity.service';

export interface TaskTreeNode extends ITaskPayload {
  children?: TaskTreeNode[];
}

export interface HierarchyFilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  onlyParent?: boolean;
  onlySubtasks?: boolean;
  blocked?: boolean;
  completed?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export class HierarchyService {
  /**
   * Recalculates subtask stats for a parent task and updates it in DB
   */
  public static async recalculateParentStats(parentTaskId: string): Promise<void> {
    if (!parentTaskId || !Types.ObjectId.isValid(parentTaskId)) return;

    const children = await TaskModel.find({ parentTask: new Types.ObjectId(parentTaskId), isArchived: false });
    const total = children.length;
    const completed = children.filter((c) => c.status === 'Done').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    await TaskModel.findByIdAndUpdate(parentTaskId, {
      subtaskStats: { total, completed, percentage },
    });

    // Recursively update grand-parents if any
    const parentDoc = await TaskModel.findById(parentTaskId);
    if (parentDoc && parentDoc.parentTask) {
      await HierarchyService.recalculateParentStats(parentDoc.parentTask.toString());
    }
  }

  /**
   * Fetch hierarchical task tree for a project or parent task
   */
  public static async getTaskTree(
    targetId: string,
    options: HierarchyFilterOptions = {}
  ): Promise<TaskTreeNode[]> {
    const isObjectId = Types.ObjectId.isValid(targetId);
    let projectFilter: any = null;
    let rootTaskFilter: any = null;

    if (isObjectId) {
      const taskDoc = await TaskModel.findById(targetId);
      if (taskDoc) {
        rootTaskFilter = taskDoc._id;
      } else {
        projectFilter = new Types.ObjectId(targetId);
      }
    }

    const query: any = { isArchived: false };

    if (projectFilter) {
      query.project = projectFilter;
    } else if (rootTaskFilter) {
      query._id = rootTaskFilter;
    }

    // Apply quick filters if provided
    if (options.status) query.status = options.status;
    if (options.priority) query.priority = options.priority;
    if (options.type) query.type = options.type;
    if (options.onlyParent) query.parentTask = null;
    if (options.onlySubtasks) query.parentTask = { $ne: null };
    if (options.blocked) query.status = 'Blocked';
    if (options.completed) query.status = 'Done';

    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { taskKey: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    // Fetch all relevant tasks for building tree
    const allMatchingTasks = await TaskModel.find(query)
      .populate('project', 'name projectKey icon workspace organization')
      .populate('workspace', 'name slug')
      .populate('organization', 'name slug')
      .populate('assignee', 'name firstName lastName email avatar role')
      .populate('reporter', 'name firstName lastName email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .populate({
        path: 'dependencies.targetTask',
        select: 'title taskKey status priority type assignee',
      })
      .sort({ depth: 1, sortOrder: 1, createdAt: -1 });

    const taskMap = new Map<string, TaskTreeNode>();
    const rootNodes: TaskTreeNode[] = [];

    // Map all docs to payloads
    allMatchingTasks.forEach((doc) => {
      const payload: TaskTreeNode = {
        ...doc.toTaskPayload(options.userId),
        children: [],
      };
      taskMap.set(payload.id, payload);
    });

    // If searching or filtering specific non-tree query, return matched list with children populated
    allMatchingTasks.forEach((doc) => {
      const payload = taskMap.get(doc._id.toString());
      if (!payload) return;

      const parentId = doc.parentTask ? doc.parentTask.toString() : null;
      if (parentId && taskMap.has(parentId)) {
        const parentNode = taskMap.get(parentId)!;
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(payload);
      } else {
        rootNodes.push(payload);
      }
    });

    return rootNodes;
  }

  /**
   * Create a subtask under a parent task
   */
  public static async createSubtask(
    parentTaskId: string,
    subtaskData: CreateTaskDTO,
    userId?: string
  ): Promise<ITaskPayload> {
    const parentTask = await TaskModel.findById(parentTaskId);
    if (!parentTask) {
      throw new Error('Parent task not found for subtask creation');
    }

    const depth = (parentTask.depth || 0) + 1;
    let epicId = parentTask.epic;
    let storyId = parentTask.story;

    if (parentTask.type === 'Epic') {
      epicId = parentTask._id;
    } else if (parentTask.type === 'Story') {
      storyId = parentTask._id;
    }

    const createdSubtask = await TaskService.createTask(
      {
        ...subtaskData,
        projectId: subtaskData.projectId || parentTask.project.toString(),
        workspaceId: subtaskData.workspaceId || parentTask.workspace.toString(),
        organizationId: subtaskData.organizationId || parentTask.organization.toString(),
        type: subtaskData.type || 'Task',
      },
      userId
    );

    // Update created task with hierarchy relations
    const subtaskDoc = await TaskModel.findById(createdSubtask.id);
    if (subtaskDoc) {
      subtaskDoc.parentTask = parentTask._id;
      subtaskDoc.depth = depth;
      if (epicId) subtaskDoc.epic = epicId;
      if (storyId) subtaskDoc.story = storyId;
      await subtaskDoc.save();
    }

    // Recalculate parent progress
    await HierarchyService.recalculateParentStats(parentTaskId);

    if (userId) {
      ActivityService.recordActivity({
        organizationId: parentTask.organization.toString(),
        workspaceId: parentTask.workspace ? parentTask.workspace.toString() : null,
        projectId: parentTask.project ? parentTask.project.toString() : null,
        taskId: createdSubtask.id,
        userId,
        action: 'task_created',
        entityType: 'Task',
        entityId: createdSubtask.id,
        metadata: {
          parentTaskId,
          parentTaskTitle: parentTask.title,
          taskKey: createdSubtask.taskKey,
          taskTitle: createdSubtask.title,
        },
      });
    }

    return TaskService.getTaskById(createdSubtask.id, userId);
  }

  /**
   * Update a subtask
   */
  public static async updateSubtask(
    parentTaskId: string,
    subtaskId: string,
    updateData: UpdateTaskDTO,
    userId?: string
  ): Promise<ITaskPayload> {
    const updated = await TaskService.updateTask(subtaskId, updateData, userId);
    await HierarchyService.recalculateParentStats(parentTaskId);
    return updated;
  }

  /**
   * Delete a subtask and clean up hierarchy
   */
  public static async deleteSubtask(
    parentTaskId: string,
    subtaskId: string,
    userId?: string
  ): Promise<boolean> {
    // Recursively delete children of this subtask
    const subChildren = await TaskModel.find({ parentTask: new Types.ObjectId(subtaskId) });
    for (const child of subChildren) {
      await HierarchyService.deleteSubtask(subtaskId, child._id.toString(), userId);
    }

    await TaskService.deleteTask(subtaskId, userId);
    await HierarchyService.recalculateParentStats(parentTaskId);
    return true;
  }

  /**
   * Convert Task: Subtask -> Parent Task OR Parent Task -> Subtask
   */
  public static async convertTask(
    taskId: string,
    newParentTaskId: string | null,
    userId?: string
  ): Promise<ITaskPayload> {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found for conversion');
    }

    const oldParentId = task.parentTask ? task.parentTask.toString() : null;

    if (!newParentTaskId) {
      // Convert to standalone parent task
      task.parentTask = null;
      task.depth = 0;
      task.epic = null;
      task.story = null;
      await task.save();
    } else {
      if (newParentTaskId === taskId) {
        throw new Error('A task cannot be set as its own parent');
      }

      const newParent = await TaskModel.findById(newParentTaskId);
      if (!newParent) {
        throw new Error('New parent task not found');
      }

      // Check for circular reference in parent chain
      let curr: ITaskDocument | null = newParent;
      while (curr && curr.parentTask) {
        if (curr.parentTask.toString() === taskId) {
          throw new Error('Circular hierarchy detected: parent task cannot become a subtask of its own child');
        }
        curr = await TaskModel.findById(curr.parentTask);
      }

      task.parentTask = newParent._id;
      task.depth = (newParent.depth || 0) + 1;
      task.epic = newParent.type === 'Epic' ? newParent._id : newParent.epic;
      task.story = newParent.type === 'Story' ? newParent._id : newParent.story;
      await task.save();

      await HierarchyService.recalculateParentStats(newParentTaskId);
    }

    if (oldParentId) {
      await HierarchyService.recalculateParentStats(oldParentId);
    }

    if (userId) {
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
          conversion: newParentTaskId ? 'converted_to_subtask' : 'converted_to_parent',
          taskKey: task.taskKey,
          taskTitle: task.title,
        },
      });
    }

    return TaskService.getTaskById(taskId, userId);
  }
}

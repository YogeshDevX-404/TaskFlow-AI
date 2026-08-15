import { Types } from 'mongoose';
import { TaskModel, DependencyType, ITaskPayload } from '../models/task.model';
import { TaskService } from './task.service';
import { ActivityService } from './activity.service';

export class DependencyService {
  /**
   * Helper to map reciprocal dependency types for bi-directional linking
   */
  private static getReciprocalType(type: DependencyType): DependencyType {
    switch (type) {
      case 'blocks':
        return 'blocked_by';
      case 'blocked_by':
        return 'blocks';
      case 'depends_on':
        return 'blocks';
      case 'child_of':
        return 'parent_of';
      case 'parent_of':
        return 'child_of';
      case 'related_to':
        return 'related_to';
      case 'duplicate_of':
        return 'duplicate_of';
      default:
        return 'related_to';
    }
  }

  /**
   * Check for circular dependencies (e.g. A blocks B, B blocks C, C blocks A)
   */
  public static async checkCircularDependency(
    sourceTaskId: string,
    targetTaskId: string,
    visited = new Set<string>()
  ): Promise<boolean> {
    if (sourceTaskId === targetTaskId) return true;
    if (visited.has(targetTaskId)) return false;

    visited.add(targetTaskId);

    const targetDoc = await TaskModel.findById(targetTaskId);
    if (!targetDoc || !targetDoc.dependencies) return false;

    for (const dep of targetDoc.dependencies) {
      if (['blocks', 'depends_on'].includes(dep.type)) {
        const nextId = dep.targetTask.toString();
        if (nextId === sourceTaskId) return true;
        const isCycle = await DependencyService.checkCircularDependency(sourceTaskId, nextId, visited);
        if (isCycle) return true;
      }
    }

    return false;
  }

  /**
   * Add dependency link between sourceTask and targetTask
   */
  public static async addDependency(
    sourceTaskId: string,
    targetTaskId: string,
    type: DependencyType,
    userId?: string
  ): Promise<ITaskPayload> {
    if (sourceTaskId === targetTaskId) {
      throw new Error('A task cannot depend on or block itself');
    }

    const sourceTask = await TaskModel.findById(sourceTaskId);
    const targetTask = await TaskModel.findById(targetTaskId);

    if (!sourceTask || !targetTask) {
      throw new Error('Source or Target task not found for dependency link');
    }

    // Check circular dependencies for blocking types
    if (['blocks', 'depends_on'].includes(type)) {
      const hasCycle = await DependencyService.checkCircularDependency(sourceTaskId, targetTaskId);
      if (hasCycle) {
        throw new Error('Circular dependency detected! This link would create an infinite blocking cycle.');
      }
    }

    const targetObjId = new Types.ObjectId(targetTaskId);
    const sourceObjId = new Types.ObjectId(sourceTaskId);

    // Prevent duplicate dependency entries of same type
    const existingIndex = sourceTask.dependencies.findIndex(
      (d) => d.targetTask.toString() === targetTaskId && d.type === type
    );

    if (existingIndex === -1) {
      sourceTask.dependencies.push({
        targetTask: targetObjId,
        type,
        createdAt: new Date(),
      });

      // Update task status to Blocked if type is blocked_by or depends_on
      if (type === 'blocked_by' && sourceTask.status !== 'Done' && sourceTask.status !== 'Cancelled') {
        sourceTask.status = 'Blocked';
      }

      await sourceTask.save();
    }

    // Reciprocal link on target task
    const reciprocalType = DependencyService.getReciprocalType(type);
    const targetExistingIndex = targetTask.dependencies.findIndex(
      (d) => d.targetTask.toString() === sourceTaskId && d.type === reciprocalType
    );

    if (targetExistingIndex === -1) {
      targetTask.dependencies.push({
        targetTask: sourceObjId,
        type: reciprocalType,
        createdAt: new Date(),
      });

      if (reciprocalType === 'blocked_by' && targetTask.status !== 'Done' && targetTask.status !== 'Cancelled') {
        targetTask.status = 'Blocked';
      }

      await targetTask.save();
    }

    if (userId) {
      ActivityService.recordActivity({
        organizationId: sourceTask.organization.toString(),
        workspaceId: sourceTask.workspace ? sourceTask.workspace.toString() : null,
        projectId: sourceTask.project ? sourceTask.project.toString() : null,
        taskId: sourceTaskId,
        userId,
        action: 'task_updated',
        entityType: 'Task',
        entityId: sourceTaskId,
        metadata: {
          dependencyType: type,
          targetTaskKey: targetTask.taskKey,
          targetTaskTitle: targetTask.title,
        },
      });
    }

    return TaskService.getTaskById(sourceTaskId, userId);
  }

  /**
   * Remove dependency link between sourceTask and targetTask (or by dependencyId)
   */
  public static async removeDependency(
    sourceTaskId: string,
    dependencyIdOrTargetId: string,
    userId?: string
  ): Promise<ITaskPayload> {
    const sourceTask = await TaskModel.findById(sourceTaskId);
    if (!sourceTask) {
      throw new Error('Task not found for dependency removal');
    }

    let targetTaskId: string | null = null;
    let depType: DependencyType | null = null;

    const depIndex = sourceTask.dependencies.findIndex(
      (d) =>
        d._id?.toString() === dependencyIdOrTargetId ||
        d.targetTask.toString() === dependencyIdOrTargetId
    );

    if (depIndex > -1) {
      const dep = sourceTask.dependencies[depIndex];
      targetTaskId = dep.targetTask.toString();
      depType = dep.type;
      sourceTask.dependencies.splice(depIndex, 1);

      // If no more blocking dependencies, reset Blocked status if applicable
      const remainingBlockers = sourceTask.dependencies.filter((d) => d.type === 'blocked_by');
      if (remainingBlockers.length === 0 && sourceTask.status === 'Blocked') {
        sourceTask.status = 'In Progress';
      }

      await sourceTask.save();
    }

    // Remove reciprocal link on target task if found
    if (targetTaskId && depType) {
      const reciprocalType = DependencyService.getReciprocalType(depType);
      const targetTask = await TaskModel.findById(targetTaskId);
      if (targetTask) {
        const targetDepIndex = targetTask.dependencies.findIndex(
          (d) => d.targetTask.toString() === sourceTaskId && d.type === reciprocalType
        );

        if (targetDepIndex > -1) {
          targetTask.dependencies.splice(targetDepIndex, 1);
          const remainingTargetBlockers = targetTask.dependencies.filter((d) => d.type === 'blocked_by');
          if (remainingTargetBlockers.length === 0 && targetTask.status === 'Blocked') {
            targetTask.status = 'In Progress';
          }
          await targetTask.save();
        }
      }
    }

    if (userId) {
      ActivityService.recordActivity({
        organizationId: sourceTask.organization.toString(),
        workspaceId: sourceTask.workspace ? sourceTask.workspace.toString() : null,
        projectId: sourceTask.project ? sourceTask.project.toString() : null,
        taskId: sourceTaskId,
        userId,
        action: 'task_updated',
        entityType: 'Task',
        entityId: sourceTaskId,
        metadata: {
          removedDependency: dependencyIdOrTargetId,
        },
      });
    }

    return TaskService.getTaskById(sourceTaskId, userId);
  }

  /**
   * Get all dependencies for a task with populated target tasks
   */
  public static async getTaskDependencies(taskId: string, userId?: string) {
    const task = await TaskModel.findById(taskId).populate({
      path: 'dependencies.targetTask',
      select: 'title taskKey status priority type assignee project',
      populate: {
        path: 'assignee',
        select: 'name firstName lastName email avatar',
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task.dependencies;
  }
}

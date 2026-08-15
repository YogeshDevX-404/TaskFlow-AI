import { Types } from 'mongoose';
import { Sprint, ISprintDocument, SprintStatus } from '../models/sprint.model';
import { TaskModel } from '../models/task.model';
import { ProjectModel } from '../models/project.model';

export interface GetSprintsFilter {
  status?: SprintStatus | 'all';
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  searchQuery?: string;
  ownerId?: string;
  isArchived?: boolean;
  sort?: 'newest' | 'oldest' | 'startDate' | 'endDate';
}

export class SprintService {
  /**
   * Get all sprints with search, filter, and sort options
   */
  async getSprints(filters: GetSprintsFilter = {}) {
    const query: any = {};

    if (filters.isArchived !== undefined) {
      query.isArchived = filters.isArchived;
    } else {
      query.isArchived = false;
    }

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.projectId) {
      query.project = new Types.ObjectId(filters.projectId);
    }

    if (filters.workspaceId) {
      query.workspace = new Types.ObjectId(filters.workspaceId);
    }

    if (filters.organizationId) {
      query.organization = new Types.ObjectId(filters.organizationId);
    }

    if (filters.ownerId) {
      query.createdBy = new Types.ObjectId(filters.ownerId);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const searchRegex = new RegExp(filters.searchQuery.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { goal: searchRegex },
        { description: searchRegex },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (filters.sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (filters.sort === 'startDate') {
      sortOptions = { startDate: -1, createdAt: -1 };
    } else if (filters.sort === 'endDate') {
      sortOptions = { endDate: -1, createdAt: -1 };
    }

    const sprints = await Sprint.find(query)
      .populate('project', 'name projectKey icon')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('updatedBy', 'firstName lastName email avatar')
      .sort(sortOptions);

    return sprints.map((s) => s.toSprintPayload());
  }

  /**
   * Get single sprint with populated tasks
   */
  async getSprintById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(id)
      .populate('project', 'name projectKey icon')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'firstName lastName email avatar' },
          { path: 'reporter', select: 'firstName lastName email avatar' },
        ],
      })
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('updatedBy', 'firstName lastName email avatar');

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const payload = sprint.toSprintPayload();
    if (Array.isArray(sprint.tasks)) {
      payload.tasks = sprint.tasks.map((t: any) =>
        typeof t.toTaskPayload === 'function' ? t.toTaskPayload() : t
      );
    }

    return payload;
  }

  /**
   * Create a new Sprint
   */
  async createSprint(data: any, userId?: string) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Sprint name is required');
    }
    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    const project = await ProjectModel.findById(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const sprint = new Sprint({
      name: data.name.trim(),
      goal: data.goal ? data.goal.trim() : '',
      description: data.description ? data.description.trim() : '',
      status: data.status || 'Planning',
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      capacity: Number(data.capacity) || 0,
      velocity: 0,
      project: project._id,
      workspace: project.workspace,
      organization: project.organization,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      tasks: [],
    });

    await sprint.save();
    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Update Sprint
   */
  async updateSprint(id: string, data: any, userId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    if (data.name !== undefined) sprint.name = data.name.trim();
    if (data.goal !== undefined) sprint.goal = data.goal.trim();
    if (data.description !== undefined) sprint.description = data.description.trim();
    if (data.status !== undefined) sprint.status = data.status;
    if (data.startDate !== undefined) sprint.startDate = data.startDate ? new Date(data.startDate) : undefined;
    if (data.endDate !== undefined) sprint.endDate = data.endDate ? new Date(data.endDate) : undefined;
    if (data.completedDate !== undefined) sprint.completedDate = data.completedDate ? new Date(data.completedDate) : undefined;
    if (data.capacity !== undefined) sprint.capacity = Number(data.capacity) || 0;
    if (data.velocity !== undefined) sprint.velocity = Number(data.velocity) || 0;

    if (userId) {
      sprint.updatedBy = new Types.ObjectId(userId);
    }

    await sprint.save();
    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Delete Sprint
   */
  async deleteSprint(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findByIdAndDelete(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    // Clear sprint reference on associated tasks
    await TaskModel.updateMany({ sprint: new Types.ObjectId(id) }, { $set: { sprint: null } });

    return { success: true, message: 'Sprint deleted successfully' };
  }

  /**
   * Archive / Restore Sprint
   */
  async archiveSprint(id: string, isArchived: boolean = true) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findByIdAndUpdate(
      id,
      { isArchived },
      { new: true }
    );

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Duplicate Sprint
   */
  async duplicateSprint(id: string, userId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const original = await Sprint.findById(id);
    if (!original) {
      throw new Error('Original sprint not found');
    }

    const newSprint = new Sprint({
      name: `${original.name} (Copy)`,
      goal: original.goal,
      description: original.description,
      status: 'Planning',
      capacity: original.capacity,
      velocity: 0,
      project: original.project,
      workspace: original.workspace,
      organization: original.organization,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      tasks: [],
    });

    await newSprint.save();
    return this.getSprintById(newSprint._id.toString());
  }

  /**
   * Start Sprint
   */
  async startSprint(id: string, userId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    sprint.status = 'Active';
    if (!sprint.startDate) {
      sprint.startDate = new Date();
    }
    if (userId) {
      sprint.updatedBy = new Types.ObjectId(userId);
    }

    await sprint.save();
    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Complete Sprint
   */
  async completeSprint(
    id: string,
    payload: { moveUnfinishedToSprintId?: string } = {},
    userId?: string
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(id).populate('tasks');
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    // Calculate completed story points (velocity)
    let completedPoints = 0;
    const completedTaskIds: Types.ObjectId[] = [];
    const unfinishedTaskIds: Types.ObjectId[] = [];

    const tasksList: any[] = sprint.tasks || [];
    tasksList.forEach((task: any) => {
      const points = Number(task.storyPoints) || 0;
      if (task.status === 'Done') {
        completedPoints += points;
        completedTaskIds.push(task._id);
      } else {
        unfinishedTaskIds.push(task._id);
      }
    });

    sprint.status = 'Completed';
    sprint.completedDate = new Date();
    sprint.velocity = completedPoints;
    if (userId) {
      sprint.updatedBy = new Types.ObjectId(userId);
    }

    await sprint.save();

    // Handle unfinished tasks
    if (unfinishedTaskIds.length > 0) {
      if (
        payload.moveUnfinishedToSprintId &&
        Types.ObjectId.isValid(payload.moveUnfinishedToSprintId)
      ) {
        const targetSprintId = new Types.ObjectId(payload.moveUnfinishedToSprintId);
        await TaskModel.updateMany(
          { _id: { $in: unfinishedTaskIds } },
          { $set: { sprint: targetSprintId } }
        );
        await Sprint.findByIdAndUpdate(targetSprintId, {
          $addToSet: { tasks: { $each: unfinishedTaskIds } },
        });
      } else {
        // Move back to backlog by unsetting sprint field
        await TaskModel.updateMany(
          { _id: { $in: unfinishedTaskIds } },
          { $set: { sprint: null } }
        );
      }
    }

    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Cancel Sprint
   */
  async cancelSprint(id: string, userId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    sprint.status = 'Cancelled';
    if (userId) {
      sprint.updatedBy = new Types.ObjectId(userId);
    }

    await sprint.save();
    return this.getSprintById(sprint._id.toString());
  }

  /**
   * Assign/Add Tasks to Sprint
   */
  async addTasksToSprint(sprintId: string, taskIds: string[]) {
    if (!Types.ObjectId.isValid(sprintId)) {
      throw new Error('Invalid sprint ID');
    }

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const objectIds = taskIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    await Sprint.findByIdAndUpdate(sprintId, {
      $addToSet: { tasks: { $each: objectIds } },
    });

    await TaskModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { sprint: new Types.ObjectId(sprintId) } }
    );

    return this.getSprintById(sprintId);
  }

  /**
   * Remove Tasks from Sprint
   */
  async removeTasksFromSprint(sprintId: string, taskIds: string[]) {
    if (!Types.ObjectId.isValid(sprintId)) {
      throw new Error('Invalid sprint ID');
    }

    const objectIds = taskIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    await Sprint.findByIdAndUpdate(sprintId, {
      $pull: { tasks: { $in: objectIds } },
    });

    await TaskModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { sprint: null } }
    );

    return this.getSprintById(sprintId);
  }

  /**
   * Records a snapshot of sprint points progress
   */
  async recordProgressSnapshot(sprintId: string) {
    if (!Types.ObjectId.isValid(sprintId)) return;

    const sprint = await Sprint.findById(sprintId).populate('tasks');
    if (!sprint) return;

    // Calculate totals
    const tasksList: any[] = sprint.tasks || [];
    let total = 0;
    let completed = 0;
    tasksList.forEach((t) => {
      const pts = Number(t.storyPoints) || 0;
      total += pts;
      if (t.status === 'Done') {
        completed += pts;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { SprintProgressSnapshot } = require('../models/sprintProgressSnapshot.model');
    await SprintProgressSnapshot.findOneAndUpdate(
      { sprintId: sprint._id, date: today },
      {
        organizationId: sprint.organization,
        projectId: sprint.project,
        totalPoints: total,
        completedPoints: completed,
        remainingPoints: total - completed,
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get burndown tracking data
   */
  async getBurndown(id: string) {
    const sprint = await Sprint.findById(id);
    if (!sprint) throw new Error('Sprint not found');

    // Run snapshot update on current access
    await this.recordProgressSnapshot(id);

    const { SprintProgressSnapshot } = require('../models/sprintProgressSnapshot.model');
    const snapshots = await SprintProgressSnapshot.find({ sprintId: id }).sort({ date: 1 });

    const startDate = sprint.startDate || sprint.createdAt;
    const endDate = sprint.endDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const durationDays = Math.max(1, Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000)));

    // Calculate initial points from tasks
    const tasksList = await TaskModel.find({ sprint: sprint._id });
    const initialPoints = tasksList.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    const dataPoints = [];
    for (let i = 0; i <= durationDays; i++) {
      const dayDate = new Date(startMs + i * 24 * 60 * 60 * 1000);
      dayDate.setHours(0, 0, 0, 0);

      // Ideal linear remaining
      const idealRemaining = Math.max(0, initialPoints - (initialPoints / durationDays) * i);

      // Actual remaining from snapshot
      const match = snapshots.find((s: any) => new Date(s.date).toDateString() === dayDate.toDateString());
      const actualRemaining = match ? match.remainingPoints : (dayDate.getTime() > Date.now() ? null : initialPoints);

      dataPoints.push({
        date: dayDate.toISOString().split('T')[0],
        idealRemaining: Number(idealRemaining.toFixed(1)),
        actualRemaining: actualRemaining !== null ? Number(actualRemaining.toFixed(1)) : null,
      });
    }

    return dataPoints;
  }

  /**
   * Get burnup tracking data
   */
  async getBurnup(id: string) {
    const sprint = await Sprint.findById(id);
    if (!sprint) throw new Error('Sprint not found');

    const snapshots = await this.getBurndown(id);
    return snapshots.map((s) => ({
      date: s.date,
      totalScope: s.actualRemaining !== null ? (s.actualRemaining + (s.idealRemaining - s.idealRemaining)) : null,
      completed: s.actualRemaining !== null ? Math.max(0, (s.actualRemaining - s.actualRemaining)) : null,
      remaining: s.actualRemaining,
    }));
  }

  /**
   * Get project sprint velocity averages
   */
  async getProjectVelocity(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) throw new Error('Invalid project ID');

    const completedSprints = await Sprint.find({
      project: new Types.ObjectId(projectId),
      status: 'Completed',
    }).sort({ completedDate: 1 });

    const velocityData = completedSprints.map((s) => ({
      sprintName: s.name,
      completedPoints: s.velocity || 0,
      capacity: s.capacity || 40,
    }));

    const totalPoints = velocityData.reduce((acc, val) => acc + val.completedPoints, 0);
    const average = velocityData.length > 0 ? Math.round(totalPoints / velocityData.length) : 0;

    return {
      history: velocityData,
      average,
    };
  }

  /**
   * Get Sprint localized activities
   */
  async getSprintActivity(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid sprint ID');
    const sprint = await Sprint.findById(id);
    if (!sprint) throw new Error('Sprint not found');

    const { ActivityModel } = require('../models/activity.model');
    const activities = await ActivityModel.find({
      organization: sprint.organization,
      project: sprint.project,
      $or: [
        { taskId: { $in: sprint.tasks } },
        { entityId: id },
      ],
    })
      .populate('user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return activities;
  }

  /**
   * Get or Create retrospective
   */
  async getRetrospective(sprintId: string) {
    if (!Types.ObjectId.isValid(sprintId)) throw new Error('Invalid sprint ID');
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) throw new Error('Sprint not found');

    const { SprintRetrospective } = require('../models/sprintRetrospective.model');
    let retro = await SprintRetrospective.findOne({ sprintId }).populate('actionItems.assignee', 'firstName lastName email avatar');
    return retro;
  }

  /**
   * Update retrospective
   */
  async updateRetrospective(sprintId: string, data: any, userId: string) {
    if (!Types.ObjectId.isValid(sprintId)) throw new Error('Invalid sprint ID');
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) throw new Error('Sprint not found');

    const { SprintRetrospective } = require('../models/sprintRetrospective.model');
    const retro = await SprintRetrospective.findOneAndUpdate(
      { sprintId },
      {
        organizationId: sprint.organization,
        projectId: sprint.project,
        wentWell: data.wentWell || '',
        improvements: data.improvements || '',
        actionItems: data.actionItems || [],
        createdBy: new Types.ObjectId(userId),
      },
      { upsert: true, new: true }
    ).populate('actionItems.assignee', 'firstName lastName email avatar');

    return retro;
  }
}

export const sprintService = new SprintService();


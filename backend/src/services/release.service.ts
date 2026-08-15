import { ReleaseModel, IReleasePayload, ReleaseStatus, GoalType, GoalStatus, MilestoneStatus } from '../models/release.model';
import { TaskModel } from '../models/task.model';
import { Types } from 'mongoose';

export interface GetReleasesFilter {
  status?: ReleaseStatus | 'all';
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  searchQuery?: string;
  version?: string;
  ownerId?: string;
  isArchived?: boolean;
  sort?: 'releaseDate_asc' | 'releaseDate_desc' | 'createdAt_desc' | 'name_asc';
}

export class ReleaseService {
  async getReleases(filters: GetReleasesFilter = {}): Promise<IReleasePayload[]> {
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
      query.project = filters.projectId;
    }

    if (filters.workspaceId) {
      query.workspace = filters.workspaceId;
    }

    if (filters.organizationId) {
      query.organization = filters.organizationId;
    }

    if (filters.ownerId) {
      query.owner = filters.ownerId;
    }

    if (filters.version) {
      query.version = new RegExp(filters.version, 'i');
    }

    if (filters.searchQuery) {
      query.$or = [
        { name: new RegExp(filters.searchQuery, 'i') },
        { version: new RegExp(filters.searchQuery, 'i') },
        { description: new RegExp(filters.searchQuery, 'i') },
        { 'milestones.title': new RegExp(filters.searchQuery, 'i') },
      ];
    }

    let sortOptions: any = { releaseDate: 1, createdAt: -1 };
    if (filters.sort === 'releaseDate_desc') {
      sortOptions = { releaseDate: -1 };
    } else if (filters.sort === 'createdAt_desc') {
      sortOptions = { createdAt: -1 };
    } else if (filters.sort === 'name_asc') {
      sortOptions = { name: 1 };
    }

    const releases = await ReleaseModel.find(query)
      .populate('project', 'name key projectKey color')
      .populate('workspace', 'name')
      .populate('organization', 'name')
      .populate('owner', 'firstName lastName email avatar name')
      .populate({
        path: 'tasks',
        select: 'title taskKey status priority type assignee storyPoints release',
        populate: {
          path: 'assignee',
          select: 'firstName lastName email avatar name',
        },
      })
      .sort(sortOptions);

    return releases.map((rel) => rel.toReleasePayload());
  }

  async getReleaseById(id: string): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid release ID');
    }

    const release = await ReleaseModel.findById(id)
      .populate('project', 'name key projectKey color')
      .populate('workspace', 'name')
      .populate('organization', 'name')
      .populate('owner', 'firstName lastName email avatar name')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignee',
          select: 'firstName lastName email avatar name',
        },
      });

    if (!release) {
      throw new Error('Release not found');
    }

    return release.toReleasePayload();
  }

  async createRelease(data: Partial<IReleasePayload>, userId?: string): Promise<IReleasePayload> {
    const releaseData: any = {
      ...data,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    };

    if (data.owner) {
      releaseData.owner = new Types.ObjectId(data.owner);
    }
    if (data.project) {
      releaseData.project = new Types.ObjectId(data.project);
    }
    if (data.workspace) {
      releaseData.workspace = new Types.ObjectId(data.workspace);
    }
    if (data.organization) {
      releaseData.organization = new Types.ObjectId(data.organization);
    }

    const newRelease = new ReleaseModel(releaseData);
    await newRelease.save();

    return this.getReleaseById(newRelease._id.toString());
  }

  async updateRelease(
    id: string,
    data: Partial<IReleasePayload>,
    userId?: string
  ): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid release ID');
    }

    const updateData: any = {
      ...data,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    };

    if (data.owner !== undefined) {
      updateData.owner = data.owner ? new Types.ObjectId(data.owner) : null;
    }

    const updated = await ReleaseModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      throw new Error('Release not found');
    }

    return this.getReleaseById(id);
  }

  async deleteRelease(id: string): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid release ID');
    }

    const release = await ReleaseModel.findById(id);
    if (!release) {
      throw new Error('Release not found');
    }

    // Unassign tasks linked to this release
    await TaskModel.updateMany({ release: id }, { $unset: { release: '' } });

    await ReleaseModel.findByIdAndDelete(id);
    return { success: true, message: 'Release deleted successfully' };
  }

  async archiveRelease(id: string, isArchived: boolean = true): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid release ID');
    }

    const release = await ReleaseModel.findByIdAndUpdate(
      id,
      { isArchived, status: isArchived ? 'Archived' : 'Planning' },
      { new: true }
    );

    if (!release) {
      throw new Error('Release not found');
    }

    return this.getReleaseById(id);
  }

  async duplicateRelease(id: string, userId?: string): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid release ID');
    }

    const existing = await ReleaseModel.findById(id);
    if (!existing) {
      throw new Error('Release not found');
    }

    const dupData = {
      name: `${existing.name} (Copy)`,
      version: `${existing.version}-copy`,
      description: existing.description,
      project: existing.project,
      workspace: existing.workspace,
      organization: existing.organization,
      status: 'Planning' as ReleaseStatus,
      releaseDate: existing.releaseDate,
      startDate: existing.startDate,
      endDate: existing.endDate,
      owner: existing.owner,
      color: existing.color,
      icon: existing.icon,
      milestones: existing.milestones.map((m) => ({
        title: m.title,
        targetDate: m.targetDate,
        status: m.status,
        description: m.description,
        isCompleted: false,
      })),
      goals: existing.goals.map((g) => ({
        title: g.title,
        type: g.type,
        status: 'Not Started' as GoalStatus,
      })),
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    };

    const duplicated = new ReleaseModel(dupData);
    await duplicated.save();

    return this.getReleaseById(duplicated._id.toString());
  }

  async addTasksToRelease(releaseId: string, taskIds: string[]): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(releaseId)) {
      throw new Error('Invalid release ID');
    }

    const release = await ReleaseModel.findById(releaseId);
    if (!release) {
      throw new Error('Release not found');
    }

    const validTaskObjectIds = taskIds
      .filter((tid) => Types.ObjectId.isValid(tid))
      .map((tid) => new Types.ObjectId(tid));

    // Update Tasks with release
    await TaskModel.updateMany({ _id: { $in: validTaskObjectIds } }, { release: release._id });

    // Add task IDs to release array without duplicates
    const currentTaskIds = release.tasks.map((t) => t.toString());
    validTaskObjectIds.forEach((tot) => {
      if (!currentTaskIds.includes(tot.toString())) {
        release.tasks.push(tot);
      }
    });

    await release.save();
    return this.getReleaseById(releaseId);
  }

  async removeTasksFromRelease(releaseId: string, taskIds: string[]): Promise<IReleasePayload> {
    if (!Types.ObjectId.isValid(releaseId)) {
      throw new Error('Invalid release ID');
    }

    const release = await ReleaseModel.findById(releaseId);
    if (!release) {
      throw new Error('Release not found');
    }

    const validTaskObjectIds = taskIds
      .filter((tid) => Types.ObjectId.isValid(tid))
      .map((tid) => new Types.ObjectId(tid));

    await TaskModel.updateMany({ _id: { $in: validTaskObjectIds } }, { $unset: { release: '' } });

    release.tasks = release.tasks.filter((t) => !taskIds.includes(t.toString()));
    await release.save();

    return this.getReleaseById(releaseId);
  }
}

export const releaseService = new ReleaseService();

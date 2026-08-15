import { ProjectModel, IProjectPayload, ProjectStatus, ProjectVisibility } from '../models/project.model';
import { Types } from 'mongoose';

export interface GetProjectsQueryParams {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  search?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  isArchived?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProjectDTO {
  name: string;
  projectKey: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  workspaceId: string;
  organizationId: string;
  ownerId?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  projectKey?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  workspaceId?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  endDate?: string;
}

export class ProjectService {
  /**
   * Get filtered projects
   */
  public static async getProjects(params: GetProjectsQueryParams): Promise<IProjectPayload[]> {
    const query: any = {};

    if (params.organizationId) {
      query.organization = new Types.ObjectId(params.organizationId);
    }

    if (params.workspaceId) {
      query.workspace = new Types.ObjectId(params.workspaceId);
    }

    if (params.isArchived !== undefined) {
      query.isArchived = params.isArchived;
    } else {
      query.isArchived = false;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.visibility) {
      query.visibility = params.visibility;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search, 'i');
      query.$or = [
        { name: searchRegex },
        { projectKey: searchRegex },
        { description: searchRegex },
      ];
    }

    if (params.isFavorite && params.userId) {
      query.favorites = new Types.ObjectId(params.userId);
    }

    if (params.isPinned && params.userId) {
      query.pinnedBy = new Types.ObjectId(params.userId);
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDirection = params.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortField]: sortDirection };

    const projects = await ProjectModel.find(query)
      .populate('organization', 'name slug')
      .populate('workspace', 'name slug')
      .populate('owner', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort(sortOptions);

    return projects.map((p) => p.toProjectPayload(params.userId));
  }

  /**
   * Get single project by ID
   */
  public static async getProjectById(
    id: string,
    organizationId?: string,
    userId?: string
  ): Promise<IProjectPayload> {
    const query: any = { _id: new Types.ObjectId(id) };
    if (organizationId) {
      query.organization = new Types.ObjectId(organizationId);
    }

    const project = await ProjectModel.findOne(query)
      .populate('organization', 'name slug')
      .populate('workspace', 'name slug')
      .populate('owner', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!project) {
      throw new Error('Project not found or access denied.');
    }

    return project.toProjectPayload(userId);
  }

  /**
   * Create a new project
   */
  public static async createProject(
    data: CreateProjectDTO,
    userId: string
  ): Promise<IProjectPayload> {
    const normalizedKey = data.projectKey.trim().toUpperCase();

    // Check key uniqueness within org
    const existing = await ProjectModel.findOne({
      organization: new Types.ObjectId(data.organizationId),
      projectKey: normalizedKey,
    });

    if (existing) {
      throw new Error(`Project key "${normalizedKey}" already exists in this organization.`);
    }

    const project = new ProjectModel({
      name: data.name,
      projectKey: normalizedKey,
      description: data.description || '',
      icon: data.icon || 'briefcase',
      coverImage: data.coverImage || '',
      workspace: new Types.ObjectId(data.workspaceId),
      organization: new Types.ObjectId(data.organizationId),
      owner: new Types.ObjectId(data.ownerId || userId),
      visibility: data.visibility || 'workspace',
      status: data.status || 'active',
      repositoryUrl: data.repositoryUrl || '',
      websiteUrl: data.websiteUrl || '',
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Update project
   */
  public static async updateProject(
    id: string,
    data: UpdateProjectDTO,
    organizationId: string,
    userId: string
  ): Promise<IProjectPayload> {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(id),
      ...(organizationId ? { organization: new Types.ObjectId(organizationId) } : {}),
    });

    if (!project) {
      throw new Error('Project not found or access denied.');
    }

    if (data.projectKey && data.projectKey.trim().toUpperCase() !== project.projectKey) {
      const normalizedKey = data.projectKey.trim().toUpperCase();
      const existing = await ProjectModel.findOne({
        organization: project.organization,
        projectKey: normalizedKey,
        _id: { $ne: project._id },
      });
      if (existing) {
        throw new Error(`Project key "${normalizedKey}" already in use.`);
      }
      project.projectKey = normalizedKey;
    }

    if (data.name !== undefined) project.name = data.name;
    if (data.description !== undefined) project.description = data.description;
    if (data.icon !== undefined) project.icon = data.icon;
    if (data.coverImage !== undefined) project.coverImage = data.coverImage;
    if (data.workspaceId !== undefined) project.workspace = new Types.ObjectId(data.workspaceId);
    if (data.visibility !== undefined) project.visibility = data.visibility;
    if (data.status !== undefined) project.status = data.status;
    if (data.repositoryUrl !== undefined) project.repositoryUrl = data.repositoryUrl;
    if (data.websiteUrl !== undefined) project.websiteUrl = data.websiteUrl;
    if (data.startDate !== undefined) project.startDate = data.startDate ? new Date(data.startDate) : undefined;
    if (data.endDate !== undefined) project.endDate = data.endDate ? new Date(data.endDate) : undefined;

    if (userId) {
      project.updatedBy = new Types.ObjectId(userId);
    }

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Delete project
   */
  public static async deleteProject(
    id: string,
    organizationId: string,
    _userId?: string
  ): Promise<boolean> {
    const query: any = { _id: new Types.ObjectId(id) };
    if (organizationId) {
      query.organization = new Types.ObjectId(organizationId);
    }

    const result = await ProjectModel.deleteOne(query);
    if (result.deletedCount === 0) {
      throw new Error('Project not found or could not be deleted.');
    }

    return true;
  }

  /**
   * Archive project
   */
  public static async archiveProject(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<IProjectPayload> {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(id),
      ...(organizationId ? { organization: new Types.ObjectId(organizationId) } : {}),
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    project.isArchived = true;
    project.status = 'archived';
    if (userId) project.updatedBy = new Types.ObjectId(userId);

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Restore project
   */
  public static async restoreProject(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<IProjectPayload> {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(id),
      ...(organizationId ? { organization: new Types.ObjectId(organizationId) } : {}),
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    project.isArchived = false;
    project.status = 'active';
    if (userId) project.updatedBy = new Types.ObjectId(userId);

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Toggle favorite
   */
  public static async toggleFavorite(id: string, userId: string): Promise<IProjectPayload> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = project.favorites.findIndex((favId) => favId.toString() === userId);

    if (index >= 0) {
      project.favorites.splice(index, 1);
    } else {
      project.favorites.push(userObjId);
    }

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Toggle pin
   */
  public static async togglePin(id: string, userId: string): Promise<IProjectPayload> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = project.pinnedBy.findIndex((pinId) => pinId.toString() === userId);

    if (index >= 0) {
      project.pinnedBy.splice(index, 1);
    } else {
      project.pinnedBy.push(userObjId);
    }

    await project.save();
    await project.populate('organization', 'name slug');
    await project.populate('workspace', 'name slug');
    await project.populate('owner', 'name email avatar');

    return project.toProjectPayload(userId);
  }

  /**
   * Duplicate project
   */
  public static async duplicateProject(
    id: string,
    newName?: string,
    organizationId?: string,
    userId?: string
  ): Promise<IProjectPayload> {
    const original = await ProjectModel.findById(id);
    if (!original) {
      throw new Error('Original project not found.');
    }

    const nameToUse = newName || `${original.name} (Copy)`;
    let keyToUse = `${original.projectKey}_COPY`.slice(0, 15);
    let counter = 1;

    while (
      await ProjectModel.findOne({
        organization: original.organization,
        projectKey: keyToUse,
      })
    ) {
      keyToUse = `${original.projectKey}_C${counter}`.slice(0, 15);
      counter++;
    }

    const duplicated = new ProjectModel({
      name: nameToUse,
      projectKey: keyToUse,
      description: original.description,
      icon: original.icon,
      coverImage: original.coverImage,
      workspace: original.workspace,
      organization: original.organization,
      owner: userId ? new Types.ObjectId(userId) : original.owner,
      visibility: original.visibility,
      status: original.status,
      repositoryUrl: original.repositoryUrl,
      websiteUrl: original.websiteUrl,
      startDate: original.startDate,
      endDate: original.endDate,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    await duplicated.save();
    await duplicated.populate('organization', 'name slug');
    await duplicated.populate('workspace', 'name slug');
    await duplicated.populate('owner', 'name email avatar');

    return duplicated.toProjectPayload(userId);
  }
}

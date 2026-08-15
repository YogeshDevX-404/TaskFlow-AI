import { Workspace, IWorkspacePayload, WorkspaceVisibility } from '../models/workspace.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Organization } from '../models/organization.model';
import { Types } from 'mongoose';

export interface GetWorkspacesQuery {
  organizationId: string;
  userId: string;
  search?: string;
  visibility?: WorkspaceVisibility;
  isArchived?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  organizationId: string;
  visibility?: WorkspaceVisibility;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: WorkspaceVisibility;
}

export class WorkspaceService {
  /**
   * Helper to format a slug
   */
  public static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get all workspaces for an organization with filtering, search, sorting
   */
  public static async getWorkspaces(query: GetWorkspacesQuery): Promise<IWorkspacePayload[]> {
    const {
      organizationId,
      userId,
      search,
      visibility,
      isArchived = false,
      isFavorite,
      isPinned,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    if (!organizationId) {
      throw new Error('Organization ID is required.');
    }

    const filter: any = {
      organization: new Types.ObjectId(organizationId),
      isArchived: !!isArchived,
    };

    // Filter by search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }

    // Filter by visibility
    if (visibility) {
      filter.visibility = visibility;
    }

    // Filter by favorites
    if (isFavorite && userId) {
      filter.favorites = new Types.ObjectId(userId);
    }

    // Filter by pinned
    if (isPinned && userId) {
      filter.pinnedBy = new Types.ObjectId(userId);
    }

    // Determine sort
    let sortObj: any = {};
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'name' || sortBy === 'alphabetical') {
      sortObj.name = direction;
    } else if (sortBy === 'updatedAt') {
      sortObj.updatedAt = direction;
    } else {
      sortObj.createdAt = direction;
    }

    const workspaces = await Workspace.find(filter)
      .populate('owner', 'name email avatar')
      .populate('organization', 'name slug')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort(sortObj);

    return workspaces.map((w) => w.toWorkspacePayload(userId));
  }

  /**
   * Get single workspace by ID or slug
   */
  public static async getWorkspaceById(
    workspaceIdOrSlug: string,
    organizationId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    let workspace = null;

    if (Types.ObjectId.isValid(workspaceIdOrSlug)) {
      workspace = await Workspace.findById(workspaceIdOrSlug)
        .populate('owner', 'name email avatar')
        .populate('organization', 'name slug')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
    }

    if (!workspace) {
      workspace = await Workspace.findOne({
        slug: workspaceIdOrSlug.toLowerCase(),
        organization: new Types.ObjectId(organizationId),
      })
        .populate('owner', 'name email avatar')
        .populate('organization', 'name slug')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
    }

    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Create new Workspace
   */
  public static async createWorkspace(
    input: CreateWorkspaceInput,
    userId: string
  ): Promise<IWorkspacePayload> {
    const { name, description, icon, color, organizationId, visibility } = input;

    if (!name || !name.trim()) {
      throw new Error('Workspace name is required.');
    }

    if (!organizationId) {
      throw new Error('Organization ID is required.');
    }

    // Verify organization exists
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new Error('Organization not found.');
    }

    const slug = input.slug
      ? this.generateSlug(input.slug)
      : this.generateSlug(name);

    if (!slug) {
      throw new Error('Invalid workspace slug.');
    }

    // Check for existing workspace with same name or slug in organization
    const existing = await Workspace.findOne({
      organization: new Types.ObjectId(organizationId),
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
        { slug },
      ],
    });

    if (existing) {
      throw new Error(
        `A workspace with the name or slug "${name}" already exists in this organization.`
      );
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      icon: icon || 'layout',
      color: color || '#4f46e5',
      organization: new Types.ObjectId(organizationId),
      owner: new Types.ObjectId(userId),
      visibility: visibility || 'organization',
      isArchived: false,
      favorites: [new Types.ObjectId(userId)], // Auto-favorite created workspace
      pinnedBy: [],
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    await workspace.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'organization', select: 'name slug' },
    ]);

    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Update Workspace
   */
  public static async updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceInput,
    organizationId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    if (workspace.organization.toString() !== organizationId) {
      throw new Error('Workspace does not belong to the specified organization.');
    }

    if (input.name && input.name.trim()) {
      const newName = input.name.trim();
      const newSlug = input.slug ? this.generateSlug(input.slug) : this.generateSlug(newName);

      // Check name/slug uniqueness if changed
      if (newName.toLowerCase() !== workspace.name.toLowerCase() || newSlug !== workspace.slug) {
        const duplicate = await Workspace.findOne({
          _id: { $ne: workspace._id },
          organization: workspace.organization,
          $or: [
            { name: { $regex: new RegExp(`^${newName}$`, 'i') } },
            { slug: newSlug },
          ],
        });

        if (duplicate) {
          throw new Error(`A workspace named "${newName}" already exists in this organization.`);
        }

        workspace.name = newName;
        workspace.slug = newSlug;
      }
    }

    if (input.description !== undefined) {
      workspace.description = input.description.trim();
    }

    if (input.icon) {
      workspace.icon = input.icon;
    }

    if (input.color) {
      workspace.color = input.color;
    }

    if (input.visibility) {
      workspace.visibility = input.visibility;
    }

    workspace.updatedBy = new Types.ObjectId(userId);
    await workspace.save();

    await workspace.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'organization', select: 'name slug' },
      { path: 'createdBy', select: 'name' },
      { path: 'updatedBy', select: 'name' },
    ]);

    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Delete Workspace
   */
  public static async deleteWorkspace(
    workspaceId: string,
    organizationId: string,
    userId: string
  ): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    if (workspace.organization.toString() !== organizationId) {
      throw new Error('Workspace does not belong to the specified organization.');
    }

    // Verify permission: Must be organization owner/admin or workspace owner
    const member = await OrganizationMember.findOne({
      organization: organizationId,
      user: userId,
    });

    const isOrgAdminOrOwner =
      member && ['owner', 'admin'].includes(member.role.toLowerCase());
    const isWorkspaceOwner = workspace.owner.toString() === userId;

    if (!isOrgAdminOrOwner && !isWorkspaceOwner) {
      throw new Error('Only Organization Owners, Admins, or Workspace Owners can delete a workspace.');
    }

    await Workspace.findByIdAndDelete(workspaceId);
  }

  /**
   * Archive Workspace
   */
  public static async archiveWorkspace(
    workspaceId: string,
    organizationId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    workspace.isArchived = true;
    workspace.updatedBy = new Types.ObjectId(userId);
    await workspace.save();

    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Restore Workspace
   */
  public static async restoreWorkspace(
    workspaceId: string,
    organizationId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    workspace.isArchived = false;
    workspace.updatedBy = new Types.ObjectId(userId);
    await workspace.save();

    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Toggle Favorite
   */
  public static async toggleFavorite(
    workspaceId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = workspace.favorites.findIndex((id) => id.toString() === userId);

    if (index > -1) {
      workspace.favorites.splice(index, 1);
    } else {
      workspace.favorites.push(userObjId);
    }

    await workspace.save();
    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Toggle Pin
   */
  public static async togglePin(
    workspaceId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    const userObjId = new Types.ObjectId(userId);
    const index = workspace.pinnedBy.findIndex((id) => id.toString() === userId);

    if (index > -1) {
      workspace.pinnedBy.splice(index, 1);
    } else {
      workspace.pinnedBy.push(userObjId);
    }

    await workspace.save();
    return workspace.toWorkspacePayload(userId);
  }

  /**
   * Duplicate Workspace
   */
  public static async duplicateWorkspace(
    workspaceId: string,
    newWorkspaceName: string,
    organizationId: string,
    userId: string
  ): Promise<IWorkspacePayload> {
    const source = await Workspace.findById(workspaceId);
    if (!source) {
      throw new Error('Source workspace not found.');
    }

    const targetName = newWorkspaceName ? newWorkspaceName.trim() : `${source.name} (Copy)`;

    return this.createWorkspace(
      {
        name: targetName,
        description: source.description ? `Copy of ${source.name}. ${source.description}` : '',
        icon: source.icon,
        color: source.color,
        visibility: source.visibility,
        organizationId,
      },
      userId
    );
  }
}

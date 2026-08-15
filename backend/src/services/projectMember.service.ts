import { Types } from 'mongoose';
import { ProjectMemberModel, IProjectMemberPayload, ProjectMemberRole, ProjectMemberStatus } from '../models/projectMember.model';
import { ProjectModel } from '../models/project.model';
import { User } from '../models/user.model';
import { OrganizationMember } from '../models/organizationMember.model';

export interface GetProjectMembersParams {
  search?: string;
  role?: ProjectMemberRole;
  status?: ProjectMemberStatus;
  tab?: 'members' | 'pending' | 'recent';
  sortBy?: 'name' | 'newest' | 'oldest' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface AddProjectMemberDTO {
  userId?: string;
  email?: string;
  role: ProjectMemberRole;
  status?: ProjectMemberStatus;
}

export interface UpdateProjectMemberDTO {
  role?: ProjectMemberRole;
  status?: ProjectMemberStatus;
}

export class ProjectMemberService {
  /**
   * Get members for a specific project
   */
  public static async getMembers(
    projectId: string,
    params: GetProjectMembersParams = {}
  ): Promise<IProjectMemberPayload[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format.');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    const query: any = { project: new Types.ObjectId(projectId) };

    // Tab filter
    if (params.tab === 'pending') {
      query.status = 'pending';
    } else if (params.tab === 'recent') {
      // Members added in last 14 days or active
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: fourteenDaysAgo };
    } else if (params.status) {
      query.status = params.status;
    }

    if (params.role) {
      query.role = params.role;
    }

    let members = await ProjectMemberModel.find(query)
      .populate('user', 'firstName lastName email avatar githubUsername')
      .populate('addedBy', 'firstName lastName email');

    let payloads = members.map((m) => m.toProjectMemberPayload());

    // In-memory filter for search (Name, Email, Username)
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      payloads = payloads.filter((m) => {
        if (typeof m.user === 'object') {
          const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
          const email = m.user.email.toLowerCase();
          const gh = (m.user.githubUsername || '').toLowerCase();
          return fullName.includes(q) || email.includes(q) || gh.includes(q);
        }
        return false;
      });
    }

    // In-memory sorting
    const sortBy = params.sortBy || 'newest';
    payloads.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = typeof a.user === 'object' ? `${a.user.firstName} ${a.user.lastName}` : '';
        const nameB = typeof b.user === 'object' ? `${b.user.firstName} ${b.user.lastName}` : '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'oldest') {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }
      if (sortBy === 'role') {
        const roleOrder: Record<string, number> = {
          'Project Owner': 1,
          'Project Admin': 2,
          'Developer': 3,
          'Tester': 4,
          'Viewer': 5,
        };
        return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
      }
      // 'newest' default
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    });

    return payloads;
  }

  /**
   * Add a member to a project
   */
  public static async addMember(
    projectId: string,
    data: AddProjectMemberDTO,
    currentUserId: string
  ): Promise<IProjectMemberPayload> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID.');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    let targetUser: any = null;
    if (data.userId && Types.ObjectId.isValid(data.userId)) {
      targetUser = await User.findById(data.userId);
    } else if (data.email) {
      targetUser = await User.findOne({ email: data.email.trim().toLowerCase() });
    }

    if (!targetUser) {
      throw new Error('User not found in system.');
    }

    // Check if user belongs to the organization
    if (project.organization) {
      const orgMember = await OrganizationMember.findOne({
        organization: project.organization,
        user: targetUser._id,
      });

      if (!orgMember) {
        throw new Error('User must be an organization member before being added to a project.');
      }
    }

    // Prevent duplicate member
    const existingProjectMember = await ProjectMemberModel.findOne({
      project: project._id,
      user: targetUser._id,
    });

    if (existingProjectMember) {
      throw new Error('User is already a member of this project.');
    }

    const newMember = new ProjectMemberModel({
      project: project._id,
      user: targetUser._id,
      organization: project.organization,
      workspace: project.workspace,
      role: data.role || 'Developer',
      status: data.status || 'active',
      joinedAt: new Date(),
      addedBy: currentUserId && Types.ObjectId.isValid(currentUserId) ? new Types.ObjectId(currentUserId) : undefined,
    });

    await newMember.save();
    await newMember.populate('user', 'firstName lastName email avatar githubUsername');
    await newMember.populate('addedBy', 'firstName lastName email');

    return newMember.toProjectMemberPayload();
  }

  /**
   * Update member role or status
   */
  public static async updateMember(
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberDTO,
    _currentUserId?: string
  ): Promise<IProjectMemberPayload> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(memberId)) {
      throw new Error('Invalid project or member ID.');
    }

    const member = await ProjectMemberModel.findOne({
      _id: new Types.ObjectId(memberId),
      project: new Types.ObjectId(projectId),
    });

    if (!member) {
      throw new Error('Project member record not found.');
    }

    // Prevent removing Project Owner role if this is the only owner
    if (member.role === 'Project Owner' && data.role && data.role !== 'Project Owner') {
      const ownerCount = await ProjectMemberModel.countDocuments({
        project: member.project,
        role: 'Project Owner',
      });
      if (ownerCount <= 1) {
        throw new Error('Cannot change role of the sole Project Owner. Transfer owner role first.');
      }
    }

    if (data.role) {
      member.role = data.role;
    }

    if (data.status) {
      member.status = data.status;
    }

    await member.save();
    await member.populate('user', 'firstName lastName email avatar githubUsername');
    await member.populate('addedBy', 'firstName lastName email');

    return member.toProjectMemberPayload();
  }

  /**
   * Remove member from project
   */
  public static async removeMember(
    projectId: string,
    memberId: string,
    _currentUserId?: string
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(memberId)) {
      throw new Error('Invalid project or member ID.');
    }

    const member = await ProjectMemberModel.findOne({
      _id: new Types.ObjectId(memberId),
      project: new Types.ObjectId(projectId),
    });

    if (!member) {
      throw new Error('Project member not found.');
    }

    // Prevent removing Project Owner
    if (member.role === 'Project Owner') {
      const ownerCount = await ProjectMemberModel.countDocuments({
        project: member.project,
        role: 'Project Owner',
      });
      if (ownerCount <= 1) {
        throw new Error('Cannot remove the project owner from the project.');
      }
    }

    await ProjectMemberModel.deleteOne({ _id: member._id });
    return true;
  }
}

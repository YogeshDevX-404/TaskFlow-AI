import crypto from 'crypto';
import { Types } from 'mongoose';
import {
  OrganizationMember,
  IOrganizationMemberPayload,
  OrganizationMemberRole,
} from '../models/organizationMember.model';
import {
  OrganizationInvite,
  IOrganizationInvitePayload,
} from '../models/organizationInvite.model';
import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';
import { EmailService } from './email.service';

export class MemberService {
  /**
   * Safe cast string ID to Mongoose ObjectId
   */
  private static toObjectId(id: string): Types.ObjectId {
    if (Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return new Types.ObjectId(id.padStart(24, '0').slice(-24));
  }

  /**
   * Helper to verify if user has admin/owner permissions in an organization
   */
  public static async verifyOrgAccess(
    organizationId: string,
    userId: string,
    requiredRoles?: OrganizationMemberRole[]
  ): Promise<{ member: any; organization: any }> {
    const orgObjId = this.toObjectId(organizationId);
    const userObjId = this.toObjectId(userId);

    const organization = await Organization.findById(orgObjId);
    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Check if user is organization owner directly
    const isOwner = organization.owner.toString() === userId;

    let member = await OrganizationMember.findOne({
      organization: orgObjId,
      user: userObjId,
    }).populate('user', 'firstName lastName email avatar');

    // If owner but no member record exists yet, auto-create owner member record
    if (isOwner && !member) {
      member = new OrganizationMember({
        organization: orgObjId,
        user: userObjId,
        role: 'owner',
        joinedAt: organization.createdAt || new Date(),
        status: 'active',
      });
      await member.save();
      await member.populate('user', 'firstName lastName email avatar');
    }

    if (!member && !isOwner) {
      throw new Error('Access denied. You are not a member of this organization.');
    }

    const currentRole = isOwner ? 'owner' : member?.role || 'member';

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(currentRole as OrganizationMemberRole)) {
      throw new Error('Access denied. Insufficient organization permissions.');
    }

    return { member, organization };
  }

  /**
   * Get members of an organization with search, filtering, and sorting
   */
  public static async getMembers(
    organizationId: string,
    userId: string,
    options: {
      search?: string;
      role?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    members: IOrganizationMemberPayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Check membership access
    await this.verifyOrgAccess(organizationId, userId);

    const orgObjId = this.toObjectId(organizationId);
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { organization: orgObjId };

    if (options.role && options.role !== 'all') {
      filter.role = options.role;
    }

    if (options.status && options.status !== 'all') {
      filter.status = options.status;
    }

    // Populate members list
    let memberDocs = await OrganizationMember.find(filter)
      .populate('user', 'firstName lastName email avatar')
      .populate('invitedBy', 'firstName lastName email');

    // Perform search filter in memory if searching by user name/email
    if (options.search && options.search.trim()) {
      const query = options.search.trim().toLowerCase();
      memberDocs = memberDocs.filter((m) => {
        const u = m.user as any;
        if (!u) return false;
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Sorting
    const sortBy = options.sortBy || 'joinedAt';
    const isAsc = options.sortOrder === 'asc';

    memberDocs.sort((a, b) => {
      let valA: any = a[sortBy as keyof typeof a];
      let valB: any = b[sortBy as keyof typeof b];

      if (sortBy === 'name') {
        const uA = a.user as any;
        const uB = b.user as any;
        valA = `${uA?.firstName || ''} ${uA?.lastName || ''}`.toLowerCase();
        valB = `${uB?.firstName || ''} ${uB?.lastName || ''}`.toLowerCase();
      } else if (sortBy === 'email') {
        const uA = a.user as any;
        const uB = b.user as any;
        valA = (uA?.email || '').toLowerCase();
        valB = (uB?.email || '').toLowerCase();
      }

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    const total = memberDocs.length;
    const paginatedDocs = memberDocs.slice(skip, skip + limit);
    const members = paginatedDocs.map((doc) => doc.toMemberPayload());
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      members,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Invite a new member by email
   */
  public static async inviteMember(
    organizationId: string,
    inviterUserId: string,
    data: { email: string; role: 'admin' | 'member' | 'guest' }
  ): Promise<IOrganizationInvitePayload> {
    // Only owner or admin can invite
    const { organization } = await this.verifyOrgAccess(organizationId, inviterUserId, [
      'owner',
      'admin',
    ]);

    const targetEmail = data.email.trim().toLowerCase();

    // Check if inviter is inviting themselves
    const inviterUser = await User.findById(this.toObjectId(inviterUserId));
    if (inviterUser && inviterUser.email.toLowerCase() === targetEmail) {
      throw new Error('You cannot invite yourself to the organization.');
    }

    // Check if user exists and is already a member
    const existingUser = await User.findOne({ email: targetEmail });
    if (existingUser) {
      const existingMember = await OrganizationMember.findOne({
        organization: organization._id,
        user: existingUser._id,
      });
      if (existingMember) {
        throw new Error('User is already a member of this organization.');
      }
    }

    // Check if there is an active pending invitation
    const existingInvite = await OrganizationInvite.findOne({
      organization: organization._id,
      email: targetEmail,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      throw new Error('An active invitation has already been sent to this email address.');
    }

    // Generate token and 7-day expiration
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = new OrganizationInvite({
      organization: organization._id,
      email: targetEmail,
      token,
      role: data.role || 'member',
      status: 'pending',
      expiresAt,
      invitedBy: this.toObjectId(inviterUserId),
    });

    await invite.save();
    await invite.populate('invitedBy', 'firstName lastName email');
    await invite.populate('organization', 'name logo slug');

    // Send invitation email via infrastructure service
    const inviterName = inviterUser
      ? `${inviterUser.firstName} ${inviterUser.lastName}`.trim()
      : 'An Administrator';

    await EmailService.sendInvitationEmail({
      email: targetEmail,
      token,
      organizationName: organization.name,
      inviterName,
      role: data.role,
    });

    return invite.toInvitePayload();
  }

  /**
   * Get pending invitations for an organization
   */
  public static async getInvitations(
    organizationId: string,
    userId: string,
    options: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    invitations: IOrganizationInvitePayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await this.verifyOrgAccess(organizationId, userId);

    const orgObjId = this.toObjectId(organizationId);
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    // Auto-update expired pending invitations
    await OrganizationInvite.updateMany(
      {
        organization: orgObjId,
        status: 'pending',
        expiresAt: { $lt: new Date() },
      },
      { status: 'expired' }
    );

    const filter: Record<string, any> = { organization: orgObjId };

    if (options.status && options.status !== 'all') {
      filter.status = options.status;
    }

    let inviteDocs = await OrganizationInvite.find(filter)
      .populate('invitedBy', 'firstName lastName email')
      .populate('organization', 'name logo slug')
      .sort({ createdAt: -1 });

    if (options.search && options.search.trim()) {
      const search = options.search.trim().toLowerCase();
      inviteDocs = inviteDocs.filter((inv) => inv.email.toLowerCase().includes(search));
    }

    const total = inviteDocs.length;
    const paginated = inviteDocs.slice(skip, skip + limit);
    const invitations = paginated.map((doc) => doc.toInvitePayload());
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      invitations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Resend invitation
   */
  public static async resendInvitation(
    organizationId: string,
    inviteId: string,
    userId: string
  ): Promise<IOrganizationInvitePayload> {
    const { organization } = await this.verifyOrgAccess(organizationId, userId, [
      'owner',
      'admin',
    ]);

    const invite = await OrganizationInvite.findOne({
      _id: this.toObjectId(inviteId),
      organization: organization._id,
    }).populate('invitedBy', 'firstName lastName email');

    if (!invite) {
      throw new Error('Invitation not found.');
    }

    // Refresh token and expiration
    invite.token = crypto.randomBytes(32).toString('hex');
    invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invite.status = 'pending';
    await invite.save();

    const inviter = invite.invitedBy as any;
    const inviterName = inviter
      ? `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim()
      : 'An Administrator';

    await EmailService.sendInvitationEmail({
      email: invite.email,
      token: invite.token,
      organizationName: organization.name,
      inviterName,
      role: invite.role,
    });

    return invite.toInvitePayload();
  }

  /**
   * Cancel/Delete invitation
   */
  public static async cancelInvitation(
    organizationId: string,
    inviteId: string,
    userId: string
  ): Promise<void> {
    await this.verifyOrgAccess(organizationId, userId, ['owner', 'admin']);

    const invite = await OrganizationInvite.findOne({
      _id: this.toObjectId(inviteId),
      organization: this.toObjectId(organizationId),
    });

    if (!invite) {
      throw new Error('Invitation not found.');
    }

    await OrganizationInvite.deleteOne({ _id: invite._id });
  }

  /**
   * Verify invitation token details
   */
  public static async verifyToken(token: string): Promise<IOrganizationInvitePayload> {
    const invite = await OrganizationInvite.findOne({ token })
      .populate('organization', 'name logo slug description')
      .populate('invitedBy', 'firstName lastName email');

    if (!invite) {
      throw new Error('Invalid or expired invitation token.');
    }

    if (invite.status === 'pending' && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      throw new Error('Invitation token has expired.');
    }

    if (invite.status !== 'pending') {
      throw new Error(`Invitation has already been ${invite.status}.`);
    }

    return invite.toInvitePayload();
  }

  /**
   * Accept invitation
   */
  public static async acceptInvitation(
    token: string,
    acceptingUserId: string
  ): Promise<IOrganizationMemberPayload> {
    const invite = await OrganizationInvite.findOne({ token }).populate('organization');

    if (!invite) {
      throw new Error('Invalid invitation token.');
    }

    if (invite.status === 'pending' && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      throw new Error('This invitation has expired.');
    }

    if (invite.status !== 'pending') {
      throw new Error(`This invitation is no longer pending (Status: ${invite.status}).`);
    }

    const acceptingUser = await User.findById(this.toObjectId(acceptingUserId));
    if (!acceptingUser) {
      throw new Error('User not found.');
    }

    // Check if user is already a member
    let member = await OrganizationMember.findOne({
      organization: invite.organization,
      user: acceptingUser._id,
    });

    if (!member) {
      member = new OrganizationMember({
        organization: invite.organization,
        user: acceptingUser._id,
        role: invite.role,
        joinedAt: new Date(),
        status: 'active',
        invitedBy: invite.invitedBy,
      });
      await member.save();
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    await member.populate('user', 'firstName lastName email avatar');
    await member.populate('invitedBy', 'firstName lastName email');

    return member.toMemberPayload();
  }

  /**
   * Reject invitation
   */
  public static async rejectInvitation(token: string, userId: string): Promise<void> {
    const invite = await OrganizationInvite.findOne({ token });

    if (!invite) {
      throw new Error('Invalid invitation token.');
    }

    if (invite.status !== 'pending') {
      throw new Error(`Invitation is no longer pending.`);
    }

    invite.status = 'rejected';
    await invite.save();
  }

  /**
   * Remove member from organization
   */
  public static async removeMember(
    organizationId: string,
    memberId: string,
    operatorUserId: string
  ): Promise<void> {
    const { organization, member: operatorMember } = await this.verifyOrgAccess(
      organizationId,
      operatorUserId,
      ['owner', 'admin']
    );

    const targetMember = await OrganizationMember.findOne({
      _id: this.toObjectId(memberId),
      organization: organization._id,
    });

    if (!targetMember) {
      throw new Error('Member not found in this organization.');
    }

    // Security Rule: Cannot remove organization owner
    if (organization.owner.toString() === targetMember.user.toString() || targetMember.role === 'owner') {
      throw new Error('Security Error: The organization owner cannot be removed.');
    }

    // Admin rule: Admin cannot remove another Admin or Owner unless operator is Owner
    if (operatorMember.role === 'admin' && (targetMember.role === 'admin' || (targetMember.role as string) === 'owner')) {
      throw new Error('Admins cannot remove other Admins or the Organization Owner.');
    }

    await OrganizationMember.deleteOne({ _id: targetMember._id });
  }

  /**
   * Update member role
   */
  public static async updateMemberRole(
    organizationId: string,
    memberId: string,
    newRole: OrganizationMemberRole,
    operatorUserId: string
  ): Promise<IOrganizationMemberPayload> {
    const { organization, member: operatorMember } = await this.verifyOrgAccess(
      organizationId,
      operatorUserId,
      ['owner', 'admin']
    );

    const targetMember = await OrganizationMember.findOne({
      _id: this.toObjectId(memberId),
      organization: organization._id,
    });

    if (!targetMember) {
      throw new Error('Member not found.');
    }

    if (targetMember.role === 'owner' || organization.owner.toString() === targetMember.user.toString()) {
      throw new Error('Cannot change the role of the primary Organization Owner.');
    }

    if (operatorMember.role === 'admin' && (newRole === 'owner' || targetMember.role === 'admin')) {
      throw new Error('Admins cannot grant Owner status or modify fellow Admin roles.');
    }

    targetMember.role = newRole;
    await targetMember.save();

    await targetMember.populate('user', 'firstName lastName email avatar');
    await targetMember.populate('invitedBy', 'firstName lastName email');

    return targetMember.toMemberPayload();
  }

  /**
   * Leave organization
   */
  public static async leaveOrganization(organizationId: string, userId: string): Promise<void> {
    const { organization, member } = await this.verifyOrgAccess(organizationId, userId);

    if (organization.owner.toString() === userId || member.role === 'owner') {
      throw new Error('Organization owner cannot leave. Please transfer ownership first.');
    }

    await OrganizationMember.deleteOne({ _id: member._id });
  }

  /**
   * Transfer ownership placeholder / action
   */
  public static async transferOwnership(
    organizationId: string,
    newOwnerMemberId: string,
    currentOwnerUserId: string
  ): Promise<void> {
    const organization = await Organization.findById(this.toObjectId(organizationId));
    if (!organization) {
      throw new Error('Organization not found.');
    }

    if (organization.owner.toString() !== currentOwnerUserId) {
      throw new Error('Only the current Organization Owner can transfer ownership.');
    }

    const newOwnerMember = await OrganizationMember.findOne({
      _id: this.toObjectId(newOwnerMemberId),
      organization: organization._id,
    });

    if (!newOwnerMember) {
      throw new Error('Target new owner member not found in this organization.');
    }

    // Update current owner's member record to admin
    await OrganizationMember.updateOne(
      { organization: organization._id, user: this.toObjectId(currentOwnerUserId) },
      { role: 'admin' }
    );

    // Update new owner's member record to owner
    newOwnerMember.role = 'owner';
    await newOwnerMember.save();

    // Update Organization owner reference
    organization.owner = newOwnerMember.user as any;
    await organization.save();
  }
}

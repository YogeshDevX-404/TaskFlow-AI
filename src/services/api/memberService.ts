import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  OrganizationMember,
  OrganizationInvite,
  InviteMemberInput,
  MemberRole,
  MemberQueryParams,
  InviteQueryParams,
} from '../../types/organization';

export class MemberService extends BaseApiService {
  /**
   * Fetch organization members
   */
  public static async getMembers(
    organizationId: string,
    params?: MemberQueryParams
  ): Promise<ApiResponseData<OrganizationMember[]>> {
    return this.get<OrganizationMember[]>(`/organizations/${organizationId}/members`, { params });
  }

  /**
   * Invite new member
   */
  public static async inviteMember(
    organizationId: string,
    data: InviteMemberInput
  ): Promise<ApiResponseData<OrganizationInvite>> {
    return this.post<OrganizationInvite, InviteMemberInput>(
      `/organizations/${organizationId}/invite`,
      data
    );
  }

  /**
   * Fetch organization invitations
   */
  public static async getInvitations(
    organizationId: string,
    params?: InviteQueryParams
  ): Promise<ApiResponseData<OrganizationInvite[]>> {
    return this.get<OrganizationInvite[]>(`/organizations/${organizationId}/invitations`, { params });
  }

  /**
   * Resend invitation
   */
  public static async resendInvitation(
    organizationId: string,
    inviteId: string
  ): Promise<ApiResponseData<OrganizationInvite>> {
    return this.post<OrganizationInvite>(
      `/organizations/${organizationId}/invitations/${inviteId}/resend`
    );
  }

  /**
   * Cancel invitation
   */
  public static async cancelInvitation(
    organizationId: string,
    inviteId: string
  ): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/organizations/${organizationId}/invitations/${inviteId}`);
  }

  /**
   * Remove member
   */
  public static async removeMember(
    organizationId: string,
    memberId: string
  ): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/organizations/${organizationId}/members/${memberId}`);
  }

  /**
   * Update member role
   */
  public static async updateMemberRole(
    organizationId: string,
    memberId: string,
    role: MemberRole
  ): Promise<ApiResponseData<OrganizationMember>> {
    return this.patch<OrganizationMember>(
      `/organizations/${organizationId}/members/${memberId}/role`,
      { role }
    );
  }

  /**
   * Leave organization
   */
  public static async leaveOrganization(
    organizationId: string
  ): Promise<ApiResponseData<void>> {
    return this.post<void>(`/organizations/${organizationId}/leave`);
  }

  /**
   * Transfer organization ownership
   */
  public static async transferOwnership(
    organizationId: string,
    newOwnerMemberId: string
  ): Promise<ApiResponseData<void>> {
    return this.post<void>(`/organizations/${organizationId}/transfer-ownership`, {
      newOwnerMemberId,
    });
  }

  /**
   * Verify invitation token details
   */
  public static async verifyInviteToken(
    token: string
  ): Promise<ApiResponseData<OrganizationInvite>> {
    return this.get<OrganizationInvite>(`/invitations/verify/${token}`);
  }

  /**
   * Accept invitation
   */
  public static async acceptInvitation(
    token: string
  ): Promise<ApiResponseData<OrganizationMember>> {
    return this.post<OrganizationMember>('/invitations/accept', { token });
  }

  /**
   * Reject invitation
   */
  public static async rejectInvitation(
    token: string
  ): Promise<ApiResponseData<void>> {
    return this.post<void>('/invitations/reject', { token });
  }
}

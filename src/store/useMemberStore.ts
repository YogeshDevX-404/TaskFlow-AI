import { create } from 'zustand';
import {
  OrganizationMember,
  OrganizationInvite,
  InviteMemberInput,
  MemberRole,
  MemberQueryParams,
  InviteQueryParams,
} from '../types/organization';
import { MemberService } from '../services/api/memberService';

interface MemberState {
  members: OrganizationMember[];
  invitations: OrganizationInvite[];
  totalMembers: number;
  totalInvitations: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedMember: OrganizationMember | null;

  // Actions
  fetchMembers: (organizationId: string, params?: MemberQueryParams) => Promise<void>;
  fetchInvitations: (organizationId: string, params?: InviteQueryParams) => Promise<void>;
  inviteMember: (organizationId: string, data: InviteMemberInput) => Promise<OrganizationInvite | null>;
  resendInvitation: (organizationId: string, inviteId: string) => Promise<boolean>;
  cancelInvitation: (organizationId: string, inviteId: string) => Promise<boolean>;
  removeMember: (organizationId: string, memberId: string) => Promise<boolean>;
  updateMemberRole: (organizationId: string, memberId: string, role: MemberRole) => Promise<boolean>;
  leaveOrganization: (organizationId: string) => Promise<boolean>;
  transferOwnership: (organizationId: string, newOwnerMemberId: string) => Promise<boolean>;
  setSelectedMember: (member: OrganizationMember | null) => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
  setStatusFilter: (status: string) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  clearError: () => void;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  invitations: [],
  totalMembers: 0,
  totalInvitations: 0,
  isLoading: false,
  isActionLoading: false,
  error: null,
  searchQuery: '',
  roleFilter: 'all',
  statusFilter: 'all',
  sortBy: 'joinedAt',
  sortOrder: 'desc',
  selectedMember: null,

  fetchMembers: async (organizationId: string, params = {}) => {
    if (!organizationId) return;
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, roleFilter, statusFilter, sortBy, sortOrder } = get();
      const queryParams: MemberQueryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        role: params.role !== undefined ? params.role : roleFilter,
        status: params.status !== undefined ? params.status : statusFilter,
        sortBy: params.sortBy || sortBy,
        sortOrder: params.sortOrder || sortOrder,
        page: params.page || 1,
        limit: params.limit || 50,
      };

      const response = await MemberService.getMembers(organizationId, queryParams);
      const membersList = response.data || [];
      set({
        members: membersList,
        totalMembers: response.meta?.totalItems || membersList.length,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: (err as Error).message || 'Failed to fetch members.',
        isLoading: false,
      });
    }
  },

  fetchInvitations: async (organizationId: string, params = {}) => {
    if (!organizationId) return;
    try {
      const { searchQuery } = get();
      const queryParams: InviteQueryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        status: params.status || 'all',
        page: params.page || 1,
        limit: params.limit || 50,
      };

      const response = await MemberService.getInvitations(organizationId, queryParams);
      const invitesList = response.data || [];
      set({
        invitations: invitesList,
        totalInvitations: response.meta?.totalItems || invitesList.length,
      });
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    }
  },

  inviteMember: async (organizationId: string, data: InviteMemberInput) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await MemberService.inviteMember(organizationId, data);
      const invite = response.data;
      if (invite) {
        set((state) => ({
          invitations: [invite, ...state.invitations],
          totalInvitations: state.totalInvitations + 1,
          isActionLoading: false,
        }));
        return invite;
      }
      throw new Error(response.message || 'Failed to send invitation');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to send invitation.';
      set({ error: errorMsg, isActionLoading: false });
      return null;
    }
  },

  resendInvitation: async (organizationId: string, inviteId: string) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await MemberService.resendInvitation(organizationId, inviteId);
      const updatedInvite = response.data;
      if (updatedInvite) {
        set((state) => ({
          invitations: state.invitations.map((i) => (i.id === inviteId ? updatedInvite : i)),
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to resend invitation');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to resend invitation.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  cancelInvitation: async (organizationId: string, inviteId: string) => {
    set({ isActionLoading: true, error: null });
    try {
      await MemberService.cancelInvitation(organizationId, inviteId);
      set((state) => ({
        invitations: state.invitations.filter((i) => i.id !== inviteId),
        totalInvitations: Math.max(0, state.totalInvitations - 1),
        isActionLoading: false,
      }));
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to cancel invitation.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  removeMember: async (organizationId: string, memberId: string) => {
    set({ isActionLoading: true, error: null });
    try {
      await MemberService.removeMember(organizationId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        totalMembers: Math.max(0, state.totalMembers - 1),
        selectedMember: state.selectedMember?.id === memberId ? null : state.selectedMember,
        isActionLoading: false,
      }));
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to remove member.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  updateMemberRole: async (organizationId: string, memberId: string, role: MemberRole) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await MemberService.updateMemberRole(organizationId, memberId, role);
      const updatedMember = response.data;
      if (updatedMember) {
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? updatedMember : m)),
          selectedMember:
            state.selectedMember?.id === memberId ? updatedMember : state.selectedMember,
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to update member role');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to update member role.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  leaveOrganization: async (organizationId: string) => {
    set({ isActionLoading: true, error: null });
    try {
      await MemberService.leaveOrganization(organizationId);
      set({ isActionLoading: false });
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to leave organization.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  transferOwnership: async (organizationId: string, newOwnerMemberId: string) => {
    set({ isActionLoading: true, error: null });
    try {
      await MemberService.transferOwnership(organizationId, newOwnerMemberId);
      set({ isActionLoading: false });
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to transfer ownership.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  setSelectedMember: (member) => {
    set({ selectedMember: member });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setRoleFilter: (role) => {
    set({ roleFilter: role });
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
  },

  setSortBy: (field) => {
    set({ sortBy: field });
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
  },

  clearError: () => {
    set({ error: null });
  },
}));

import { useEffect, useCallback } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { MemberQueryParams, MemberRole } from '../types/organization';

export function useOrganizationMembers(orgIdOverride?: string) {
  const { activeOrganization } = useOrganizationStore();
  const orgId = orgIdOverride || activeOrganization?.id;

  const {
    members,
    totalMembers,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    selectedMember,
    fetchMembers,
    removeMember,
    updateMemberRole,
    leaveOrganization,
    transferOwnership,
    setSelectedMember,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    clearError,
  } = useMemberStore();

  const refreshMembers = useCallback(
    (params?: MemberQueryParams) => {
      if (orgId) {
        fetchMembers(orgId, params);
      }
    },
    [orgId, fetchMembers]
  );

  useEffect(() => {
    if (orgId) {
      fetchMembers(orgId);
    }
  }, [orgId, fetchMembers, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!orgId) return false;
      return removeMember(orgId, memberId);
    },
    [orgId, removeMember]
  );

  const handleUpdateRole = useCallback(
    async (memberId: string, role: MemberRole) => {
      if (!orgId) return false;
      return updateMemberRole(orgId, memberId, role);
    },
    [orgId, updateMemberRole]
  );

  const handleLeaveOrganization = useCallback(async () => {
    if (!orgId) return false;
    return leaveOrganization(orgId);
  }, [orgId, leaveOrganization]);

  const handleTransferOwnership = useCallback(
    async (newOwnerMemberId: string) => {
      if (!orgId) return false;
      return transferOwnership(orgId, newOwnerMemberId);
    },
    [orgId, transferOwnership]
  );

  return {
    members,
    totalMembers,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    selectedMember,
    refreshMembers,
    removeMember: handleRemoveMember,
    updateMemberRole: handleUpdateRole,
    leaveOrganization: handleLeaveOrganization,
    transferOwnership: handleTransferOwnership,
    setSelectedMember,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    clearError,
  };
}

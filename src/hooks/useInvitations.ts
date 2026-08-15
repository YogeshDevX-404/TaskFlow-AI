import { useEffect, useCallback } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { InviteQueryParams } from '../types/organization';

export function useInvitations(orgIdOverride?: string) {
  const { activeOrganization } = useOrganizationStore();
  const orgId = orgIdOverride || activeOrganization?.id;

  const {
    invitations,
    totalInvitations,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    fetchInvitations,
    resendInvitation,
    cancelInvitation,
    clearError,
  } = useMemberStore();

  const refreshInvitations = useCallback(
    (params?: InviteQueryParams) => {
      if (orgId) {
        fetchInvitations(orgId, params);
      }
    },
    [orgId, fetchInvitations]
  );

  useEffect(() => {
    if (orgId) {
      fetchInvitations(orgId);
    }
  }, [orgId, fetchInvitations, searchQuery]);

  const handleResend = useCallback(
    async (inviteId: string) => {
      if (!orgId) return false;
      return resendInvitation(orgId, inviteId);
    },
    [orgId, resendInvitation]
  );

  const handleCancel = useCallback(
    async (inviteId: string) => {
      if (!orgId) return false;
      return cancelInvitation(orgId, inviteId);
    },
    [orgId, cancelInvitation]
  );

  return {
    invitations,
    totalInvitations,
    isLoading,
    isActionLoading,
    error,
    refreshInvitations,
    resendInvitation: handleResend,
    cancelInvitation: handleCancel,
    clearError,
  };
}

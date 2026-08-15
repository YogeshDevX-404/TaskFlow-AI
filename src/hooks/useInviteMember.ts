import { useCallback } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { InviteMemberInput } from '../types/organization';

export function useInviteMember(orgIdOverride?: string) {
  const { activeOrganization } = useOrganizationStore();
  const orgId = orgIdOverride || activeOrganization?.id;

  const { inviteMember, isActionLoading, error, clearError } = useMemberStore();

  const sendInvite = useCallback(
    async (data: InviteMemberInput) => {
      if (!orgId) {
        throw new Error('No active organization selected.');
      }
      return inviteMember(orgId, data);
    },
    [orgId, inviteMember]
  );

  return {
    sendInvite,
    isActionLoading,
    error,
    clearError,
  };
}

import { useCallback } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useOrganizationStore } from '../store/useOrganizationStore';

export function useRemoveMember(orgIdOverride?: string) {
  const { activeOrganization } = useOrganizationStore();
  const orgId = orgIdOverride || activeOrganization?.id;

  const { removeMember, isActionLoading, error, clearError } = useMemberStore();

  const handleRemove = useCallback(
    async (memberId: string) => {
      if (!orgId) {
        throw new Error('No active organization selected.');
      }
      return removeMember(orgId, memberId);
    },
    [orgId, removeMember]
  );

  return {
    removeMember: handleRemove,
    isActionLoading,
    error,
    clearError,
  };
}

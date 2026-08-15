import { useEffect, useCallback } from 'react';
import { useProjectMemberStore } from '../store/useProjectMemberStore';
import {
  AddProjectMemberInput,
  UpdateProjectMemberInput,
  ProjectMemberQueryParams,
} from '../types/projectMember';

export function useProjectMembers(projectId?: string, params?: ProjectMemberQueryParams) {
  const {
    members,
    selectedMember,
    activities,
    isLoading,
    isActionLoading,
    error,
    fetchMembers,
    setSelectedMember,
    clearError,
  } = useProjectMemberStore();

  useEffect(() => {
    if (projectId) {
      fetchMembers(projectId, params);
    }
  }, [projectId, fetchMembers, JSON.stringify(params)]);

  return {
    members,
    selectedMember,
    activities,
    isLoading,
    isActionLoading,
    error,
    setSelectedMember,
    clearError,
    refetch: () => projectId && fetchMembers(projectId, params),
  };
}

export function useAddProjectMember() {
  const { addMember, isActionLoading, error, clearError } = useProjectMemberStore();

  const handleAddMember = useCallback(
    async (projectId: string, data: AddProjectMemberInput) => {
      clearError();
      return await addMember(projectId, data);
    },
    [addMember, clearError]
  );

  return {
    addMember: handleAddMember,
    isActionLoading,
    error,
    clearError,
  };
}

export function useUpdateProjectMember() {
  const { updateMember, isActionLoading, error, clearError } = useProjectMemberStore();

  const handleUpdateMember = useCallback(
    async (projectId: string, memberId: string, data: UpdateProjectMemberInput) => {
      clearError();
      return await updateMember(projectId, memberId, data);
    },
    [updateMember, clearError]
  );

  return {
    updateMember: handleUpdateMember,
    isActionLoading,
    error,
    clearError,
  };
}

export function useRemoveProjectMember() {
  const { removeMember, isActionLoading, error, clearError } = useProjectMemberStore();

  const handleRemoveMember = useCallback(
    async (projectId: string, memberId: string) => {
      clearError();
      return await removeMember(projectId, memberId);
    },
    [removeMember, clearError]
  );

  return {
    removeMember: handleRemoveMember,
    isActionLoading,
    error,
    clearError,
  };
}

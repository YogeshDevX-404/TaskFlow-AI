import { useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { WorkspaceQueryParams, CreateWorkspaceInput, UpdateWorkspaceInput } from '../types/workspace';

export function useWorkspaces() {
  const { activeOrganization } = useOrganizationStore();
  const orgId = activeOrganization?.id;

  const {
    workspaces,
    activeWorkspace,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    visibilityFilter,
    isArchivedFilter,
    viewMode,
    fetchWorkspaces,
    fetchWorkspaceById,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    toggleFavorite,
    togglePin,
    duplicateWorkspace,
    setSearchQuery,
    setVisibilityFilter,
    setIsArchivedFilter,
    setViewMode,
    clearError,
  } = useWorkspaceStore();

  const refreshWorkspaces = useCallback(
    (params?: WorkspaceQueryParams) => {
      if (orgId) {
        fetchWorkspaces({ organizationId: orgId, ...params });
      }
    },
    [orgId, fetchWorkspaces]
  );

  useEffect(() => {
    if (orgId) {
      fetchWorkspaces({ organizationId: orgId });
    }
  }, [orgId, fetchWorkspaces, searchQuery, visibilityFilter, isArchivedFilter]);

  const handleCreateWorkspace = useCallback(
    async (input: Omit<CreateWorkspaceInput, 'organizationId'>) => {
      if (!orgId) return null;
      return createWorkspace({ ...input, organizationId: orgId });
    },
    [orgId, createWorkspace]
  );

  const handleUpdateWorkspace = useCallback(
    async (id: string, input: UpdateWorkspaceInput) => {
      return updateWorkspace(id, input);
    },
    [updateWorkspace]
  );

  const handleDeleteWorkspace = useCallback(
    async (id: string) => {
      return deleteWorkspace(id);
    },
    [deleteWorkspace]
  );

  const handleArchiveWorkspace = useCallback(
    async (id: string) => {
      return archiveWorkspace(id);
    },
    [archiveWorkspace]
  );

  const handleRestoreWorkspace = useCallback(
    async (id: string) => {
      return restoreWorkspace(id);
    },
    [restoreWorkspace]
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      return toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const handleTogglePin = useCallback(
    async (id: string) => {
      return togglePin(id);
    },
    [togglePin]
  );

  const handleDuplicateWorkspace = useCallback(
    async (id: string, name?: string) => {
      return duplicateWorkspace(id, name);
    },
    [duplicateWorkspace]
  );

  return {
    workspaces,
    activeWorkspace,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    visibilityFilter,
    isArchivedFilter,
    viewMode,
    refreshWorkspaces,
    fetchWorkspaceById,
    setActiveWorkspace,
    createWorkspace: handleCreateWorkspace,
    updateWorkspace: handleUpdateWorkspace,
    deleteWorkspace: handleDeleteWorkspace,
    archiveWorkspace: handleArchiveWorkspace,
    restoreWorkspace: handleRestoreWorkspace,
    toggleFavorite: handleToggleFavorite,
    togglePin: handleTogglePin,
    duplicateWorkspace: handleDuplicateWorkspace,
    setSearchQuery,
    setVisibilityFilter,
    setIsArchivedFilter,
    setViewMode,
    clearError,
  };
}

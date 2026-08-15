import { useEffect } from 'react';
import { useVersionStore } from '../store/useVersionStore';

export const useVersions = (projectId?: string, autoFetch: boolean = true) => {
  const store = useVersionStore();

  useEffect(() => {
    if (autoFetch) {
      store.fetchVersions(projectId);
    }
  }, [projectId, autoFetch]);

  return {
    versions: store.versions,
    isLoading: store.isLoading,
    error: store.error,
    fetchVersions: store.fetchVersions,
    createVersion: store.createVersion,
    updateVersion: store.updateVersion,
    deleteVersion: store.deleteVersion,
    archiveVersion: store.archiveVersion,
  };
};

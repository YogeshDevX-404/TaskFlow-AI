import { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryParams } from '../types/project';

export function useProjects(params?: ProjectQueryParams) {
  const {
    projects,
    activeProject,
    isLoading,
    isActionLoading,
    error,
    fetchProjects,
    setActiveProject,
    createProject,
    updateProject,
    toggleFavorite,
    togglePin,
    archiveProject,
    restoreProject,
    duplicateProject,
    deleteProject,
  } = useProjectStore();

  useEffect(() => {
    fetchProjects(params);
  }, []);

  return {
    projects,
    activeProject,
    isLoading,
    isActionLoading,
    error,
    refetch: () => fetchProjects(params),
    setActiveProject,
    createProject,
    updateProject,
    toggleFavorite,
    togglePin,
    archiveProject,
    restoreProject,
    duplicateProject,
    deleteProject,
  };
}

export function useProject(id?: string) {
  const { projects, activeProject, getProjectById, isLoading } = useProjectStore();

  const targetProject = id ? projects.find((p) => p.id === id) || null : activeProject;

  return {
    project: targetProject,
    isLoading,
    getProjectById,
  };
}

export function useCreateProject() {
  const { createProject, isActionLoading, error } = useProjectStore();

  return {
    createProject,
    isLoading: isActionLoading,
    error,
  };
}

export function useUpdateProject() {
  const { updateProject, isActionLoading, error } = useProjectStore();

  return {
    updateProject,
    isLoading: isActionLoading,
    error,
  };
}

export function useDeleteProject() {
  const { deleteProject, isActionLoading, error } = useProjectStore();

  return {
    deleteProject,
    isLoading: isActionLoading,
    error,
  };
}

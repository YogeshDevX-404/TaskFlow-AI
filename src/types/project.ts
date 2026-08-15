export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

export type ProjectVisibility = 'private' | 'workspace' | 'organization';

export interface ProjectOrganizationSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectWorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectOwnerSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  projectKey: string;
  description: string;
  icon: string;
  coverImage?: string;
  workspace: string | ProjectWorkspaceSummary;
  organization: string | ProjectOrganizationSummary;
  owner: string | ProjectOwnerSummary;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  repositoryUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  favoritesCount?: number;
  pinnedCount?: number;
  progress?: number;
  taskCount?: {
    total: number;
    completed: number;
    inProgress: number;
  };
  memberCount?: number;
  createdBy?: string | { id: string; name: string };
  updatedBy?: string | { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  projectKey: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  workspaceId: string;
  organizationId?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  projectKey?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  workspaceId?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectQueryParams {
  workspaceId?: string;
  organizationId?: string;
  search?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  isArchived?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  sortBy?: 'name' | 'projectKey' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

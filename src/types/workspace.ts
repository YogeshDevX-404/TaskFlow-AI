export type WorkspaceVisibility = 'private' | 'organization' | 'public';

export interface WorkspaceUserSummary {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface WorkspaceOrgSummary {
  id: string;
  name: string;
  slug: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  organization: WorkspaceOrgSummary | string;
  owner: WorkspaceUserSummary | string;
  visibility: WorkspaceVisibility;
  isArchived: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  favoritesCount: number;
  pinnedCount: number;
  createdBy?: WorkspaceUserSummary | string;
  updatedBy?: WorkspaceUserSummary | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: WorkspaceVisibility;
  organizationId?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: WorkspaceVisibility;
}

export interface WorkspaceQueryParams {
  organizationId?: string;
  search?: string;
  visibility?: WorkspaceVisibility;
  isArchived?: string | boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

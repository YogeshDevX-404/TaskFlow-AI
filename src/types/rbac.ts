export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: (Permission | string)[];
  organization?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[];
  organizationId: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  organizationId: string;
}

export interface DuplicateRoleInput {
  name?: string;
  organizationId: string;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

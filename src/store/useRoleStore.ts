import { create } from 'zustand';
import { RbacService } from '../services/api/rbacService';
import {
  Permission,
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  DuplicateRoleInput,
} from '../types/rbac';

interface RoleState {
  permissions: Permission[];
  roles: Role[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedRoleId: string | null;
  searchQuery: string;
  selectedModuleFilter: string;

  fetchPermissions: () => Promise<void>;
  fetchRoles: (organizationId?: string) => Promise<void>;
  createRole: (input: CreateRoleInput) => Promise<Role>;
  updateRole: (roleId: string, input: UpdateRoleInput) => Promise<Role>;
  deleteRole: (roleId: string, organizationId: string) => Promise<void>;
  duplicateRole: (roleId: string, input: DuplicateRoleInput) => Promise<Role>;
  toggleRolePermission: (
    roleId: string,
    permissionIdOrName: string,
    organizationId: string
  ) => Promise<Role>;
  setSelectedRoleId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedModuleFilter: (module: string) => void;
  clearError: () => void;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  permissions: [],
  roles: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  selectedRoleId: null,
  searchQuery: '',
  selectedModuleFilter: 'All',

  fetchPermissions: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await RbacService.getPermissions();
      set({ permissions: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch permissions',
        isLoading: false,
      });
    }
  },

  fetchRoles: async (organizationId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const roles = await RbacService.getRoles(organizationId);
      set({
        roles,
        isLoading: false,
        selectedRoleId: roles.length > 0 ? roles[0].id : null,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch roles',
        isLoading: false,
      });
    }
  },

  createRole: async (input: CreateRoleInput) => {
    try {
      set({ isSubmitting: true, error: null });
      const newRole = await RbacService.createRole(input);
      set((state) => ({
        roles: [...state.roles, newRole],
        isSubmitting: false,
        selectedRoleId: newRole.id,
      }));
      return newRole;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create role';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateRole: async (roleId: string, input: UpdateRoleInput) => {
    try {
      set({ isSubmitting: true, error: null });
      const updated = await RbacService.updateRole(roleId, input);
      set((state) => ({
        roles: state.roles.map((r) => (r.id === roleId ? updated : r)),
        isSubmitting: false,
      }));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update role';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteRole: async (roleId: string, organizationId: string) => {
    try {
      set({ isSubmitting: true, error: null });
      await RbacService.deleteRole(roleId, organizationId);
      set((state) => {
        const filtered = state.roles.filter((r) => r.id !== roleId);
        return {
          roles: filtered,
          isSubmitting: false,
          selectedRoleId:
            state.selectedRoleId === roleId
              ? filtered.length > 0
                ? filtered[0].id
                : null
              : state.selectedRoleId,
        };
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete role';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  duplicateRole: async (roleId: string, input: DuplicateRoleInput) => {
    try {
      set({ isSubmitting: true, error: null });
      const duplicated = await RbacService.duplicateRole(roleId, input);
      set((state) => ({
        roles: [...state.roles, duplicated],
        isSubmitting: false,
        selectedRoleId: duplicated.id,
      }));
      return duplicated;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to duplicate role';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  toggleRolePermission: async (
    roleId: string,
    permissionIdOrName: string,
    organizationId: string
  ) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found');

    // Extract existing permission identifiers (IDs or names)
    const currentPerms: string[] = role.permissions.map((p) =>
      typeof p === 'object' ? p.id || p.name : p
    );

    let updatedPerms: string[];
    if (currentPerms.includes(permissionIdOrName)) {
      updatedPerms = currentPerms.filter((p) => p !== permissionIdOrName);
    } else {
      updatedPerms = [...currentPerms, permissionIdOrName];
    }

    return get().updateRole(roleId, {
      permissions: updatedPerms,
      organizationId,
    });
  },

  setSelectedRoleId: (id) => set({ selectedRoleId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedModuleFilter: (selectedModuleFilter) => set({ selectedModuleFilter }),
  clearError: () => set({ error: null }),
}));

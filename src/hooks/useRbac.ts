import { useEffect, useMemo } from 'react';
import { useRoleStore } from '../store/useRoleStore';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMemberStore } from '../store/useMemberStore';

/**
 * Hook to access and management RBAC roles list
 */
export function useRoles(organizationId?: string) {
  const { activeOrganization } = useOrganizationStore();
  const targetOrgId = organizationId || activeOrganization?.id;
  const { roles, isLoading, error, fetchRoles, createRole, updateRole, deleteRole, duplicateRole } =
    useRoleStore();

  useEffect(() => {
    fetchRoles(targetOrgId);
  }, [targetOrgId, fetchRoles]);

  return {
    roles,
    isLoading,
    error,
    refreshRoles: () => fetchRoles(targetOrgId),
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
  };
}

/**
 * Hook to access all system permissions list
 */
export function usePermissions() {
  const { permissions, isLoading, fetchPermissions } = useRoleStore();

  useEffect(() => {
    if (permissions.length === 0) {
      fetchPermissions();
    }
  }, [permissions.length, fetchPermissions]);

  return { permissions, isLoading };
}

/**
 * Hook to retrieve a specific role by ID or slug
 */
export function useRole(roleIdOrSlug?: string, organizationId?: string) {
  const { activeOrganization } = useOrganizationStore();
  const targetOrgId = organizationId || activeOrganization?.id;
  const { roles, isLoading, fetchRoles } = useRoleStore();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles(targetOrgId);
    }
  }, [roles.length, targetOrgId, fetchRoles]);

  const role = useMemo(() => {
    if (!roleIdOrSlug) return null;
    return (
      roles.find(
        (r) =>
          r.id === roleIdOrSlug ||
          r.slug === roleIdOrSlug.toLowerCase() ||
          r.name.toLowerCase() === roleIdOrSlug.toLowerCase()
      ) || null
    );
  }, [roles, roleIdOrSlug]);

  return { role, isLoading };
}

/**
 * Hook to check if current user in active organization has specific permission(s)
 */
export function usePermission(
  requiredPermission: string | string[],
  organizationId?: string
) {
  const { user } = useAuthStore();
  const { activeOrganization } = useOrganizationStore();
  const { members } = useMemberStore();
  const { roles, fetchRoles, isLoading: rolesLoading } = useRoleStore();

  const targetOrgId = organizationId || activeOrganization?.id;

  useEffect(() => {
    if (targetOrgId && roles.length === 0) {
      fetchRoles(targetOrgId);
    }
  }, [targetOrgId, roles.length, fetchRoles]);

  const hasPermission = useMemo(() => {
    if (!user || !targetOrgId) return false;

    // 1. Organization Owner has ALL permissions automatically
    if (activeOrganization && activeOrganization.id === targetOrgId) {
      if (
        activeOrganization.owner === user.id ||
        (typeof activeOrganization.owner === 'object' &&
          (activeOrganization.owner as any).id === user.id)
      ) {
        return true;
      }
    }

    // 2. Find member role in organization
    const currentMember = members.find(
      (m) =>
        (m.user?.id === user.id || (m.user as any) === user.id) &&
        m.organization === targetOrgId
    );

    const userRoleStr = currentMember?.role || 'member';

    // If member role is owner
    if (userRoleStr.toLowerCase() === 'owner') return true;

    // 3. Find role details in roles store
    const userRoleDoc = roles.find(
      (r) =>
        r.id === userRoleStr ||
        r.slug === userRoleStr.toLowerCase() ||
        r.name.toLowerCase() === userRoleStr.toLowerCase()
    );

    if (!userRoleDoc) {
      // Fallback: If role document not loaded yet, default admin or owner to true for base roles
      if (['owner', 'admin'].includes(userRoleStr.toLowerCase())) return true;
      return false;
    }

    const rolePermNames: string[] = [];
    if (Array.isArray(userRoleDoc.permissions)) {
      userRoleDoc.permissions.forEach((p) => {
        if (typeof p === 'object' && p.name) {
          rolePermNames.push(p.name);
        } else if (typeof p === 'string') {
          rolePermNames.push(p);
        }
      });
    }

    const checkList = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    return checkList.every((reqPerm) => rolePermNames.includes(reqPerm));
  }, [user, activeOrganization, targetOrgId, members, roles, requiredPermission]);

  return { hasPermission, isLoading: rolesLoading };
}

/**
 * Convenient boolean hook for quick inline permission checks
 */
export function useHasPermission(
  requiredPermission: string | string[],
  organizationId?: string
): boolean {
  const { hasPermission } = usePermission(requiredPermission, organizationId);
  return hasPermission;
}

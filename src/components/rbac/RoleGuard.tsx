import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useMemberStore } from '../../store/useMemberStore';

export interface RoleGuardProps {
  role: string | string[];
  organizationId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  organizationId,
  fallback = null,
  children,
}) => {
  const { user } = useAuthStore();
  const { activeOrganization } = useOrganizationStore();
  const { members } = useMemberStore();

  const targetOrgId = organizationId || activeOrganization?.id;

  if (!user || !targetOrgId) {
    return <>{fallback}</>;
  }

  // Owner check
  const isOwner =
    activeOrganization &&
    activeOrganization.id === targetOrgId &&
    (activeOrganization.owner === user.id ||
      (activeOrganization.owner as any)?.id === user.id);

  if (isOwner) {
    return <>{children}</>;
  }

  // Member role check
  const member = members.find(
    (m) =>
      (m.user?.id === user.id || (m.user as any) === user.id) &&
      m.organization === targetOrgId
  );

  const currentRole = member?.role?.toLowerCase() || 'member';
  const allowed = Array.isArray(role) ? role.map((r) => r.toLowerCase()) : [role.toLowerCase()];

  if (currentRole === 'owner' || allowed.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

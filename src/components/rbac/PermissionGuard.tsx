import React from 'react';
import { usePermission } from '../../hooks/useRbac';

export interface PermissionGuardProps {
  permission: string | string[];
  organizationId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  organizationId,
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermission(permission, organizationId);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

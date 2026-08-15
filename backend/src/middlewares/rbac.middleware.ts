import { Request, Response, NextFunction } from 'express';
import { OrganizationMember } from '../models/organizationMember.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export interface AuthenticatedOrgRequest extends Request {
  orgMember?: any;
  orgRole?: any;
  userPermissions?: string[];
}

/**
 * Middleware to require specific permissions within an organization context.
 * Extract organization ID from params, headers, body, or query.
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (req: AuthenticatedOrgRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required to access this resource.',
          'UNAUTHENTICATED'
        );
      }

      // 1. Resolve Organization ID
      const organizationId =
        req.params.organizationId ||
        req.params.orgId ||
        req.params.id ||
        (req.headers['x-organization-id'] as string) ||
        req.body?.organizationId ||
        (req.query?.organizationId as string);

      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required for permission evaluation.',
          'MISSING_ORGANIZATION_CONTEXT'
        );
      }

      // 2. Find Organization Member
      const member = await OrganizationMember.findOne({
        organization: organizationId,
        user: req.user.id,
        status: 'active',
      });

      if (!member) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          'You are not an active member of this organization.',
          'NOT_ORGANIZATION_MEMBER'
        );
      }

      req.orgMember = member;

      // 3. Owner automatically passes all permission checks
      if (member.role === 'owner') {
        req.userPermissions = ['*'];
        return next();
      }

      // 4. Look up Role (Custom role for Org or System role)
      let roleDoc = await Role.findOne({
        organization: organizationId,
        $or: [{ _id: member.role }, { slug: member.role }, { name: member.role }],
      }).populate('permissions');

      if (!roleDoc) {
        // Fallback to global system role
        roleDoc = await Role.findOne({
          organization: null,
          $or: [{ slug: member.role }, { name: member.role }],
        }).populate('permissions');
      }

      if (!roleDoc) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          `No permission configuration found for role "${member.role}".`,
          'ROLE_NOT_CONFIGURED'
        );
      }

      req.orgRole = roleDoc;

      // 5. Gather permission names
      const permissionNames: string[] = [];
      if (Array.isArray(roleDoc.permissions)) {
        roleDoc.permissions.forEach((perm: any) => {
          if (typeof perm === 'object' && perm.name) {
            permissionNames.push(perm.name);
          } else if (typeof perm === 'string') {
            permissionNames.push(perm);
          }
        });
      }

      req.userPermissions = permissionNames;

      // Check if required permissions are satisfied
      const hasAllPermissions = requiredPermissions.every((reqPerm) =>
        permissionNames.includes(reqPerm)
      );

      if (!hasAllPermissions) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          `Access Denied: You lack required permission(s) (${requiredPermissions.join(', ')})`,
          'FORBIDDEN_INSUFFICIENT_PERMISSIONS'
        );
      }

      next();
    } catch (error) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Error verifying permissions.',
        'RBAC_EVALUATION_ERROR'
      );
    }
  };
}

/**
 * Middleware to require specific organization role(s).
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedOrgRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required.',
          'UNAUTHENTICATED'
        );
      }

      const organizationId =
        req.params.organizationId ||
        req.params.orgId ||
        req.params.id ||
        (req.headers['x-organization-id'] as string) ||
        req.body?.organizationId ||
        (req.query?.organizationId as string);

      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.',
          'MISSING_ORGANIZATION_CONTEXT'
        );
      }

      const member = await OrganizationMember.findOne({
        organization: organizationId,
        user: req.user.id,
        status: 'active',
      });

      if (!member) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          'You are not an active member of this organization.',
          'NOT_ORGANIZATION_MEMBER'
        );
      }

      const normalizedRole = member.role.toLowerCase();
      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

      // Owner is always allowed unless strictly excluded
      if (normalizedRole === 'owner' || normalizedAllowed.includes(normalizedRole)) {
        req.orgMember = member;
        return next();
      }

      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        `Access Denied: Requires one of [${allowedRoles.join(', ')}] role.`,
        'FORBIDDEN_ROLE'
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Error verifying organization role.',
        'ROLE_CHECK_ERROR'
      );
    }
  };
}

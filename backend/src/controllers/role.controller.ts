import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class RoleController {
  /**
   * GET /api/v1/permissions
   */
  public static async getPermissions(req: Request, res: Response): Promise<Response> {
    try {
      const permissions = await RoleService.getAllPermissions();
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Permissions retrieved successfully.',
        permissions
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve permissions.'
      );
    }
  }

  /**
   * GET /api/v1/roles
   */
  public static async getRoles(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId =
        (req.query.organizationId as string) ||
        (req.headers['x-organization-id'] as string) ||
        req.params.organizationId;

      const roles = await RoleService.getRolesForOrganization(organizationId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Roles retrieved successfully.',
        roles
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve roles.'
      );
    }
  }

  /**
   * GET /api/v1/roles/:id
   */
  public static async getRoleById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId =
        (req.query.organizationId as string) ||
        (req.headers['x-organization-id'] as string);

      const role = await RoleService.getRoleById(id, organizationId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Role retrieved successfully.', role);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Role not found.'
      );
    }
  }

  /**
   * POST /api/v1/roles
   */
  public static async createRole(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, permissions, organizationId } = req.body;
      const orgId =
        organizationId ||
        (req.headers['x-organization-id'] as string) ||
        req.params.organizationId;

      if (!name) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Role name is required.'
        );
      }

      if (!orgId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.'
        );
      }

      const role = await RoleService.createRole({
        name,
        description,
        permissions: permissions || [],
        organizationId: orgId,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Custom role created successfully.',
        role
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create role.'
      );
    }
  }

  /**
   * PUT /api/v1/roles/:id
   */
  public static async updateRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, permissions, organizationId } = req.body;
      const orgId =
        organizationId ||
        (req.headers['x-organization-id'] as string) ||
        req.params.organizationId;

      const operatorUserId = req.user?.id || '';

      const updatedRole = await RoleService.updateRole(
        id,
        { name, description, permissions },
        orgId,
        operatorUserId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Role updated successfully.',
        updatedRole
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update role.'
      );
    }
  }

  /**
   * DELETE /api/v1/roles/:id
   */
  public static async deleteRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId =
        (req.query.organizationId as string) ||
        (req.headers['x-organization-id'] as string) ||
        req.body?.organizationId;

      await RoleService.deleteRole(id, organizationId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Role deleted successfully.');
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete role.'
      );
    }
  }

  /**
   * POST /api/v1/roles/:id/duplicate
   */
  public static async duplicateRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, organizationId } = req.body;
      const orgId =
        organizationId ||
        (req.headers['x-organization-id'] as string) ||
        req.params.organizationId;

      const duplicated = await RoleService.duplicateRole(id, name, orgId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Role duplicated successfully.',
        duplicated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to duplicate role.'
      );
    }
  }
}

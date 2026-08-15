import { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class WorkspaceController {
  /**
   * Helper to extract Organization ID from headers, query, or params
   */
  private static extractOrgId(req: Request): string {
    return (
      (req.headers['x-organization-id'] as string) ||
      (req.query.organizationId as string) ||
      req.params.organizationId ||
      (req.body && req.body.organizationId) ||
      ''
    );
  }

  /**
   * GET /api/v1/workspaces
   */
  public static async getWorkspaces(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required. Pass X-Organization-Id header or organizationId query.'
        );
      }

      const {
        search,
        visibility,
        isArchived,
        isFavorite,
        isPinned,
        sortBy,
        sortOrder,
      } = req.query;

      const workspaces = await WorkspaceService.getWorkspaces({
        organizationId,
        userId,
        search: search as string,
        visibility: visibility as any,
        isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : false,
        isFavorite: isFavorite === 'true',
        isPinned: isPinned === 'true',
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspaces retrieved successfully.',
        workspaces
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve workspaces.'
      );
    }
  }

  /**
   * GET /api/v1/workspaces/:id
   */
  public static async getWorkspaceById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      const workspace = await WorkspaceService.getWorkspaceById(id, organizationId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace retrieved successfully.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Workspace not found.'
      );
    }
  }

  /**
   * POST /api/v1/workspaces
   */
  public static async createWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';
      const { name, slug, description, icon, color, visibility } = req.body;

      if (!name) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Workspace name is required.'
        );
      }

      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization ID is required.'
        );
      }

      const workspace = await WorkspaceService.createWorkspace(
        {
          name,
          slug,
          description,
          icon,
          color,
          visibility,
          organizationId,
        },
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Workspace created successfully.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create workspace.'
      );
    }
  }

  /**
   * PUT /api/v1/workspaces/:id
   */
  public static async updateWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';
      const { name, slug, description, icon, color, visibility } = req.body;

      const workspace = await WorkspaceService.updateWorkspace(
        id,
        { name, slug, description, icon, color, visibility },
        organizationId,
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace updated successfully.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update workspace.'
      );
    }
  }

  /**
   * DELETE /api/v1/workspaces/:id
   */
  public static async deleteWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      await WorkspaceService.deleteWorkspace(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace deleted successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete workspace.'
      );
    }
  }

  /**
   * PATCH /api/v1/workspaces/:id/archive
   */
  public static async archiveWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      const workspace = await WorkspaceService.archiveWorkspace(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace archived successfully.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to archive workspace.'
      );
    }
  }

  /**
   * PATCH /api/v1/workspaces/:id/restore
   */
  public static async restoreWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      const workspace = await WorkspaceService.restoreWorkspace(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace restored successfully.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to restore workspace.'
      );
    }
  }

  /**
   * PATCH /api/v1/workspaces/:id/favorite
   */
  public static async toggleFavorite(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const workspace = await WorkspaceService.toggleFavorite(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace favorite status updated.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to toggle favorite.'
      );
    }
  }

  /**
   * PATCH /api/v1/workspaces/:id/pin
   */
  public static async togglePin(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const workspace = await WorkspaceService.togglePin(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Workspace pin status updated.',
        workspace
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to toggle pin.'
      );
    }
  }

  /**
   * POST /api/v1/workspaces/:id/duplicate
   */
  public static async duplicateWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const organizationId = WorkspaceController.extractOrgId(req);
      const userId = req.user?.id || '';

      const duplicated = await WorkspaceService.duplicateWorkspace(
        id,
        name,
        organizationId,
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Workspace duplicated successfully.',
        duplicated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to duplicate workspace.'
      );
    }
  }
}

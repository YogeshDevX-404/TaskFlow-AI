import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class ProjectController {
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
   * GET /api/v1/projects
   */
  public static async getProjects(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const {
        workspaceId,
        search,
        status,
        visibility,
        isArchived,
        isFavorite,
        isPinned,
        sortBy,
        sortOrder,
      } = req.query;

      const projects = await ProjectService.getProjects({
        organizationId,
        workspaceId: workspaceId as string,
        userId,
        search: search as string,
        status: status as any,
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
        'Projects retrieved successfully.',
        projects
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve projects.'
      );
    }
  }

  /**
   * GET /api/v1/projects/:id
   */
  public static async getProjectById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const project = await ProjectService.getProjectById(id, organizationId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project retrieved successfully.',
        project
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Project not found.'
      );
    }
  }

  /**
   * POST /api/v1/projects
   */
  public static async createProject(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';
      const {
        name,
        projectKey,
        description,
        icon,
        coverImage,
        workspaceId,
        visibility,
        status,
        repositoryUrl,
        websiteUrl,
        startDate,
        endDate,
      } = req.body;

      if (!name || !projectKey) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Project name and projectKey are required.'
        );
      }

      if (!workspaceId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Workspace ID is required.'
        );
      }

      const project = await ProjectService.createProject(
        {
          name,
          projectKey,
          description,
          icon,
          coverImage,
          workspaceId,
          organizationId: organizationId || req.body.organizationId,
          ownerId: userId,
          visibility,
          status,
          repositoryUrl,
          websiteUrl,
          startDate,
          endDate,
        },
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Project created successfully.',
        project
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create project.'
      );
    }
  }

  /**
   * PUT /api/v1/projects/:id
   */
  public static async updateProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const project = await ProjectService.updateProject(
        id,
        req.body,
        organizationId,
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project updated successfully.',
        project
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update project.'
      );
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   */
  public static async deleteProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      await ProjectService.deleteProject(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project deleted successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete project.'
      );
    }
  }

  /**
   * PATCH /api/v1/projects/:id/archive
   */
  public static async archiveProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const project = await ProjectService.archiveProject(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project archived successfully.',
        project
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to archive project.'
      );
    }
  }

  /**
   * PATCH /api/v1/projects/:id/restore
   */
  public static async restoreProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const project = await ProjectService.restoreProject(id, organizationId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project restored successfully.',
        project
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to restore project.'
      );
    }
  }

  /**
   * PATCH /api/v1/projects/:id/favorite
   */
  public static async toggleFavorite(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const project = await ProjectService.toggleFavorite(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project favorite status updated.',
        project
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
   * PATCH /api/v1/projects/:id/pin
   */
  public static async togglePin(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const project = await ProjectService.togglePin(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project pin status updated.',
        project
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
   * POST /api/v1/projects/:id/duplicate
   */
  public static async duplicateProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const organizationId = ProjectController.extractOrgId(req);
      const userId = req.user?.id || '';

      const duplicated = await ProjectService.duplicateProject(
        id,
        name,
        organizationId,
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Project duplicated successfully.',
        duplicated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to duplicate project.'
      );
    }
  }
}

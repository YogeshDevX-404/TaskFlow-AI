import { Request, Response } from 'express';
import { ActivityAnalyticsService, ActivityAnalyticsFilterParams } from '../services/activityAnalytics.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { OrganizationMember } from '../models/organizationMember.model';

export class ActivityAnalyticsController {
  /**
   * Resolve user organization ID safely from request context
   */
  private static async resolveUserOrgId(req: Request): Promise<string | null> {
    const headerOrgId = req.headers['x-organization-id'] as string;
    if (headerOrgId) return headerOrgId;

    const queryOrgId = req.query.organizationId as string;
    if (queryOrgId) return queryOrgId;

    if (req.user?.id) {
      const activeMember = await OrganizationMember.findOne({
        user: req.user.id,
        status: 'active',
      }).sort({ createdAt: -1 });
      if (activeMember) {
        return activeMember.organization.toString();
      }
    }

    return null;
  }

  private static async extractParams(req: Request): Promise<ActivityAnalyticsFilterParams | null> {
    const organizationId = await ActivityAnalyticsController.resolveUserOrgId(req);
    if (!organizationId) {
      return null;
    }

    return {
      organizationId,
      workspaceId: req.query.workspaceId as string,
      projectId: req.query.projectId as string,
      repositoryId: req.query.repositoryId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      timeRange: (req.query.timeRange as any) || '30d',
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 25,
    };
  }

  /**
   * GET /api/v1/activity/analytics/overview
   */
  public static async getOverview(req: Request, res: Response): Promise<Response | void> {
    try {
      const params = await ActivityAnalyticsController.extractParams(req);
      if (!params) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required for developer activity analytics.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const overview = await ActivityAnalyticsService.getDeveloperActivityOverview(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer activity overview retrieved successfully', overview);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch activity overview',
        'ACTIVITY_ANALYTICS_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/activity/analytics/developers
   */
  public static async getDevelopers(req: Request, res: Response): Promise<Response | void> {
    try {
      const params = await ActivityAnalyticsController.extractParams(req);
      if (!params) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const result = await ActivityAnalyticsService.getDeveloperLeaderboard(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer leaderboard retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch developer leaderboard',
        'ACTIVITY_ANALYTICS_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/activity/analytics/developers/:userId
   */
  public static async getDeveloperDeepDive(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User ID is required', 'MISSING_USER_ID');
      }

      const params = await ActivityAnalyticsController.extractParams(req);
      if (!params) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const deepDive = await ActivityAnalyticsService.getDeveloperDeepDive(userId, params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer deep dive analytics retrieved successfully', deepDive);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch developer deep dive',
        'ACTIVITY_ANALYTICS_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/activity/analytics/repositories
   */
  public static async getRepositoryAnalytics(req: Request, res: Response): Promise<Response | void> {
    try {
      const params = await ActivityAnalyticsController.extractParams(req);
      if (!params) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const result = await ActivityAnalyticsService.getRepositoryActivityAnalytics(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository activity analytics retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch repository analytics',
        'ACTIVITY_ANALYTICS_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/activity/analytics/export
   */
  public static async exportAnalytics(req: Request, res: Response): Promise<Response | void> {
    try {
      const params = await ActivityAnalyticsController.extractParams(req);
      if (!params) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const format = (req.query.format as 'csv' | 'json') || 'csv';
      const exportResult = await ActivityAnalyticsService.exportAnalytics(params, format);

      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      return res.status(HTTP_STATUS.OK).send(exportResult.data);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to export developer activity analytics',
        'EXPORT_ERROR'
      );
    }
  }
}

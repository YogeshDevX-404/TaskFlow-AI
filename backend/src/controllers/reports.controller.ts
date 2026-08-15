import { Request, Response } from 'express';
import { ReportsService, ReportFilterParams } from '../services/reports.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class ReportsController {
  private static extractFilterParams(req: Request): ReportFilterParams {
    return {
      organizationId: (req.query.organizationId as string) || (req.headers['x-organization-id'] as string) || undefined,
      workspaceId: (req.query.workspaceId as string) || undefined,
      projectId: (req.query.projectId as string) || undefined,
      sprintId: (req.query.sprintId as string) || undefined,
      userId: (req.query.userId as string) || undefined,
      assigneeId: (req.query.assigneeId as string) || undefined,
      status: (req.query.status as string) || undefined,
      priority: (req.query.priority as string) || undefined,
      type: (req.query.type as string) || undefined,
      label: (req.query.label as string) || undefined,
      search: (req.query.search as string) || undefined,
      startDate: (req.query.startDate as string) || undefined,
      endDate: (req.query.endDate as string) || undefined,
      datePreset: (req.query.datePreset as any) || 'last30',
    };
  }

  public static async getOverview(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const data = await ReportsService.getExecutiveOverview(filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Executive overview fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch executive overview.');
    }
  }

  public static async getProjectHealth(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const data = await ReportsService.getProjectHealthReport(filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project health report fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch project health report.');
    }
  }

  public static async getTaskAnalytics(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const data = await ReportsService.getTaskAnalyticsReport(filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Task analytics fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch task analytics.');
    }
  }

  public static async getTeamPerformance(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const data = await ReportsService.getTeamPerformanceReport(filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Team performance report fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch team performance.');
    }
  }

  public static async getUserReport(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const targetUserId = req.params.userId || req.user?.id;
      if (!targetUserId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'User ID is required');
      }
      const data = await ReportsService.getUserReport(targetUserId, filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'User report fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch user report.');
    }
  }

  public static async getSprintReport(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const sprintId = req.params.sprintId || filters.sprintId;
      const data = await ReportsService.getSprintReport(sprintId, filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Sprint report fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch sprint report.');
    }
  }

  public static async getSprintVelocity(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await ReportsService.getSprintVelocity(limit, filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Sprint velocity fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch velocity.');
    }
  }

  public static async getActivityAnalytics(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const data = await ReportsService.getActivityAnalytics(filters);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Activity analytics fetched successfully.', data);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch activity analytics.');
    }
  }

  public static async exportReport(req: Request, res: Response) {
    try {
      const filters = ReportsController.extractFilterParams(req);
      const reportType = (req.query.type as string) || 'tasks';
      const format = ((req.query.format as string) || 'csv').toLowerCase() as 'csv' | 'json';

      const result = await ReportsService.exportReportData(reportType, format, filters);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(HTTP_STATUS.OK).send(result.content);
    } catch (error: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Failed to export report.');
    }
  }
}

import { Request, Response } from 'express';
import { ActivityService, GetActivitiesQueryParams } from '../services/activity.service';
import { TimelineService } from '../services/timeline.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { TaskModel } from '../models/task.model';
import { ProjectModel } from '../models/project.model';
import { Workspace } from '../models/workspace.model';
import { OrganizationMember } from '../models/organizationMember.model';

export class ActivityController {
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

  /**
   * GET /api/v1/activity
   * Get organization-wide or filtered audit activities & timeline
   */
  public static async getActivities(req: Request, res: Response): Promise<Response | void> {
    try {
      const organizationId = await ActivityController.resolveUserOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required to access activity logs.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const params: GetActivitiesQueryParams = {
        organizationId,
        workspaceId: req.query.workspaceId as string,
        projectId: req.query.projectId as string,
        taskId: req.query.taskId as string,
        userId: req.query.userId as string,
        action: req.query.action as string,
        actionType: req.query.actionType as string,
        entityType: req.query.entityType as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: (req.query.sortBy as 'newest' | 'oldest') || 'newest',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      };

      if (req.query.grouped === 'true') {
        const groupedResult = await TimelineService.GroupedTimeline(params);
        return sendSuccessResponse(res, HTTP_STATUS.OK, 'Grouped activity timeline retrieved successfully', groupedResult);
      }

      const result = await ActivityService.getActivities(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Activities retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch activity logs',
        'ACTIVITY_FETCH_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/tasks/:id/activity
   * Get activity timeline for a specific task
   */
  public static async getTaskActivity(req: Request, res: Response): Promise<Response | void> {
    try {
      const taskId = req.params.id;
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Task not found', 'TASK_NOT_FOUND');
      }

      const organizationId = task.organization ? task.organization.toString() : (await ActivityController.resolveUserOrgId(req)) || undefined;

      const params: GetActivitiesQueryParams = {
        organizationId,
        taskId,
        action: req.query.action as string,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as 'newest' | 'oldest') || 'newest',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 100,
      };

      const result = await ActivityService.getActivities(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Task activity timeline retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch task activity',
        'TASK_ACTIVITY_FETCH_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/projects/:id/activity
   * Get activity timeline for a specific project
   */
  public static async getProjectActivity(req: Request, res: Response): Promise<Response | void> {
    try {
      const projectId = req.params.id;
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Project not found', 'PROJECT_NOT_FOUND');
      }

      const params: GetActivitiesQueryParams = {
        organizationId: project.organization.toString(),
        projectId,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as 'newest' | 'oldest') || 'newest',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 100,
      };

      const result = await ActivityService.getActivities(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project activity timeline retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch project activity',
        'PROJECT_ACTIVITY_FETCH_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/workspaces/:id/activity
   * Get activity timeline for a specific workspace
   */
  public static async getWorkspaceActivity(req: Request, res: Response): Promise<Response | void> {
    try {
      const workspaceId = req.params.id;
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Workspace not found', 'WORKSPACE_NOT_FOUND');
      }

      const params: GetActivitiesQueryParams = {
        organizationId: workspace.organization.toString(),
        workspaceId,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as 'newest' | 'oldest') || 'newest',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 100,
      };

      const result = await ActivityService.getActivities(params);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Workspace activity timeline retrieved successfully', result);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch workspace activity',
        'WORKSPACE_ACTIVITY_FETCH_ERROR'
      );
    }
  }

  /**
   * GET /api/v1/activity/export
   * Export audit logs to CSV, JSON, or PDF format
   */
  public static async exportActivities(req: Request, res: Response): Promise<Response | void> {
    try {
      const organizationId = await ActivityController.resolveUserOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Organization context is required to export activity logs.',
          'MISSING_ORGANIZATION_ID'
        );
      }

      const format = (req.query.format as 'csv' | 'json' | 'pdf') || 'csv';

      const params: GetActivitiesQueryParams = {
        organizationId,
        workspaceId: req.query.workspaceId as string,
        projectId: req.query.projectId as string,
        taskId: req.query.taskId as string,
        userId: req.query.userId as string,
        action: req.query.action as string,
        entityType: req.query.entityType as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: 'newest',
      };

      const exported = await ActivityService.exportActivities(params, format);

      res.setHeader('Content-Type', exported.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.fileName}"`);

      return res.status(HTTP_STATUS.OK).send(exported.data);
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to export activity logs',
        'EXPORT_ACTIVITY_ERROR'
      );
    }
  }
}

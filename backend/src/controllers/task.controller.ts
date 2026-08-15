import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { broadcastTaskSocketEvent } from '../socket/socketServer';

export class TaskController {
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
   * GET /api/v1/tasks
   */
  public static async getTasks(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = TaskController.extractOrgId(req);
      const userId = req.user?.id || '';

      const {
        workspaceId,
        projectId,
        assigneeId,
        reporterId,
        search,
        status,
        priority,
        type,
        labels,
        isArchived,
        isFavorite,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query;

      const labelsArray = typeof labels === 'string'
        ? labels.split(',').map((l) => l.trim()).filter(Boolean)
        : Array.isArray(labels)
        ? (labels as string[])
        : undefined;

      const result = await TaskService.getTasks({
        organizationId,
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        assigneeId: assigneeId as string,
        reporterId: reporterId as string,
        userId,
        search: search as string,
        status: status as any,
        priority: priority as any,
        type: type as any,
        labels: labelsArray,
        isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
        isFavorite: isFavorite === 'true',
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Tasks retrieved successfully.',
        result.tasks,
        {
          totalItems: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        }
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve tasks.'
      );
    }
  }

  /**
   * GET /api/v1/tasks/:id
   */
  public static async getTaskById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.getTaskById(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task retrieved successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Task not found.'
      );
    }
  }

  /**
   * GET /api/v1/tasks/:id/details
   */
  public static async getTaskDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.getTaskDetails(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task details retrieved successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Task details not found.'
      );
    }
  }

  /**
   * POST /api/v1/tasks
   */
  public static async createTask(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = TaskController.extractOrgId(req);
      const userId = req.user?.id || '';

      const {
        title,
        taskKey,
        description,
        projectId,
        workspaceId,
        status,
        priority,
        type,
        assigneeId,
        reporterId,
        labels,
        startDate,
        dueDate,
        estimatedHours,
        spentHours,
        storyPoints,
      } = req.body;

      if (!title || !title.trim()) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Task title is required.'
        );
      }

      if (!projectId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Project ID is required.'
        );
      }

      const task = await TaskService.createTask(
        {
          title,
          taskKey,
          description,
          projectId,
          workspaceId,
          organizationId: organizationId || req.body.organizationId,
          status,
          priority,
          type,
          assigneeId,
          reporterId,
          labels,
          startDate,
          dueDate,
          estimatedHours,
          spentHours,
          storyPoints,
        },
        userId
      );

      try {
        broadcastTaskSocketEvent('task:create', {
          taskId: (task as any).id || (task as any)._id?.toString(),
          projectId: (task as any).projectId || projectId,
          workspaceId: (task as any).workspaceId || workspaceId,
          organizationId: (task as any).organizationId || organizationId,
          title: (task as any).title,
          status: (task as any).status,
          priority: (task as any).priority,
          updatedBy: {
            userId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
          data: task,
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Task created successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create task.'
      );
    }
  }

  /**
   * PUT /api/v1/tasks/:id
   */
  public static async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.updateTask(id, req.body, userId);

      try {
        broadcastTaskSocketEvent('task:update', {
          taskId: id,
          projectId: (task as any).projectId,
          workspaceId: (task as any).workspaceId,
          organizationId: (task as any).organizationId,
          title: (task as any).title,
          status: (task as any).status,
          priority: (task as any).priority,
          updatedBy: {
            userId,
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
          data: task,
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task updated successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update task.'
      );
    }
  }

  /**
   * DELETE /api/v1/tasks/:id
   */
  public static async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await TaskService.deleteTask(id);

      try {
        broadcastTaskSocketEvent('task:delete', {
          taskId: id,
          projectId: '',
          updatedBy: {
            userId: req.user?.id || '',
            name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : req.user?.email || 'User',
            avatar: req.user?.avatar,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // Socket broadcast fallback
      }

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task deleted successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete task.'
      );
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/archive
   */
  public static async archiveTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.archiveTask(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task archived successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to archive task.'
      );
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/restore
   */
  public static async restoreTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.restoreTask(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task restored successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to restore task.'
      );
    }
  }

  /**
   * POST /api/v1/tasks/:id/duplicate
   */
  public static async duplicateTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const duplicated = await TaskService.duplicateTask(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Task duplicated successfully.',
        duplicated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to duplicate task.'
      );
    }
  }

  /**
   * PATCH /api/v1/tasks/:id/favorite
   */
  public static async toggleFavorite(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.toggleFavorite(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task favorite status toggled.',
        task
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
   * PATCH /api/v1/tasks/:id/watch
   */
  public static async toggleWatch(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const task = await TaskService.toggleWatch(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task watch status toggled.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to toggle watch.'
      );
    }
  }
}

import { Request, Response } from 'express';
import { KanbanService } from '../services/kanban.service';
import { BoardService } from '../services/board.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class BoardController {
  /**
   * GET /api/v1/boards/:projectId
   */
  public static async getBoardByProjectId(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || '';

      const {
        search,
        assigneeId,
        reporterId,
        priority,
        status,
        type,
        labels,
        dueDate,
        isArchived,
      } = req.query;

      const labelsArray = typeof labels === 'string'
        ? labels.split(',').map((l) => l.trim()).filter(Boolean)
        : Array.isArray(labels)
        ? (labels as string[])
        : undefined;

      const data = await KanbanService.getBoardData(
        projectId,
        {
          search: search as string,
          assigneeId: assigneeId as string,
          reporterId: reporterId as string,
          priority: priority as string,
          status: status as string,
          type: type as string,
          labels: labelsArray,
          dueDate: dueDate as string,
          isArchived: isArchived === 'true',
        },
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Board data retrieved successfully.',
        data
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve board data.'
      );
    }
  }

  /**
   * PUT /api/v1/tasks/:taskId/status
   */
  public static async updateTaskStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId } = req.params;
      const { status, newIndex } = req.body;
      const userId = req.user?.id || '';

      if (!status) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Status is required.'
        );
      }

      const updatedTask = await KanbanService.updateTaskStatus(
        taskId,
        status,
        newIndex !== undefined ? Number(newIndex) : undefined,
        userId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task status updated successfully.',
        updatedTask
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update task status.'
      );
    }
  }

  /**
   * PUT /api/v1/tasks/reorder
   */
  public static async reorderTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId, taskIds, status } = req.body;
      const userId = req.user?.id || '';

      if (!projectId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Project ID is required for task reordering.'
        );
      }

      if (!Array.isArray(taskIds)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'taskIds array is required.'
        );
      }

      await KanbanService.reorderTasks(projectId, taskIds, status, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Tasks reordered successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to reorder tasks.'
      );
    }
  }

  /**
   * PUT /api/v1/boards/:projectId/columns
   */
  public static async updateColumns(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const { columns } = req.body;
      const userId = req.user?.id || '';

      if (!Array.isArray(columns)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Columns array is required.'
        );
      }

      const updatedBoard = await BoardService.updateColumns(projectId, columns, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Board columns updated successfully.',
        updatedBoard
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update board columns.'
      );
    }
  }

  /**
   * POST /api/v1/boards/:projectId/columns
   */
  public static async addColumn(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || '';

      const updatedBoard = await BoardService.addColumn(projectId, req.body, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Board column created successfully.',
        updatedBoard
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create board column.'
      );
    }
  }

  /**
   * PUT /api/v1/boards/:projectId/columns/:columnId
   */
  public static async renameColumn(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId, columnId } = req.params;
      const userId = req.user?.id || '';

      const updatedBoard = await BoardService.renameColumn(projectId, columnId, req.body, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Board column updated successfully.',
        updatedBoard
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update board column.'
      );
    }
  }

  /**
   * DELETE /api/v1/boards/:projectId/columns/:columnId
   */
  public static async deleteColumn(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId, columnId } = req.params;
      const userId = req.user?.id || '';

      const updatedBoard = await BoardService.deleteColumn(projectId, columnId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Board column deleted successfully.',
        updatedBoard
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete board column.'
      );
    }
  }

  /**
   * PUT /api/v1/boards/:projectId/settings
   */
  public static async updateSettings(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || '';

      const updatedBoard = await BoardService.updateSettings(projectId, req.body, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Board settings updated successfully.',
        updatedBoard
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update board settings.'
      );
    }
  }

  /**
   * POST /api/v1/boards/:projectId/bulk-tasks
   */
  public static async bulkUpdateTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const { taskIds, updates } = req.body;
      const userId = req.user?.id || '';

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'taskIds array is required.'
        );
      }

      await KanbanService.bulkUpdateTasks(projectId, taskIds, updates || {}, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Bulk tasks update applied successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to execute bulk tasks update.'
      );
    }
  }
}

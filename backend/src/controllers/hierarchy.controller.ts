import { Request, Response } from 'express';
import { HierarchyService } from '../services/hierarchy.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class HierarchyController {
  /**
   * GET /api/v1/tasks/:id/tree
   */
  public static async getTaskTree(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const {
        search,
        status,
        priority,
        type,
        onlyParent,
        onlySubtasks,
        blocked,
        completed,
        sortBy,
        sortOrder,
      } = req.query;

      const tree = await HierarchyService.getTaskTree(id, {
        search: search as string,
        status: status as string,
        priority: priority as string,
        type: type as string,
        onlyParent: onlyParent === 'true',
        onlySubtasks: onlySubtasks === 'true',
        blocked: blocked === 'true',
        completed: completed === 'true',
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        userId,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task hierarchy tree retrieved successfully.',
        tree
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve task tree.'
      );
    }
  }

  /**
   * POST /api/v1/tasks/:id/subtasks
   */
  public static async createSubtask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const subtask = await HierarchyService.createSubtask(id, req.body, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Subtask created successfully.',
        subtask
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to create subtask.'
      );
    }
  }

  /**
   * PUT /api/v1/tasks/:id/subtasks/:subtaskId
   */
  public static async updateSubtask(req: Request, res: Response): Promise<Response> {
    try {
      const { id, subtaskId } = req.params;
      const userId = req.user?.id || '';

      const updated = await HierarchyService.updateSubtask(id, subtaskId, req.body, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Subtask updated successfully.',
        updated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update subtask.'
      );
    }
  }

  /**
   * DELETE /api/v1/tasks/:id/subtasks/:subtaskId
   */
  public static async deleteSubtask(req: Request, res: Response): Promise<Response> {
    try {
      const { id, subtaskId } = req.params;
      const userId = req.user?.id || '';

      await HierarchyService.deleteSubtask(id, subtaskId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Subtask deleted successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete subtask.'
      );
    }
  }

  /**
   * POST /api/v1/tasks/:id/convert
   */
  public static async convertTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { parentTaskId } = req.body;
      const userId = req.user?.id || '';

      const result = await HierarchyService.convertTask(id, parentTaskId || null, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task hierarchy converted successfully.',
        result
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to convert task hierarchy.'
      );
    }
  }
}

import { Request, Response } from 'express';
import { DependencyService } from '../services/dependency.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class DependencyController {
  /**
   * POST /api/v1/tasks/:id/dependencies
   */
  public static async addDependency(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { targetTaskId, type } = req.body;
      const userId = req.user?.id || '';

      if (!targetTaskId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Target task ID is required for dependency link.'
        );
      }

      if (!type) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Dependency type is required.'
        );
      }

      const task = await DependencyService.addDependency(id, targetTaskId, type, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Dependency added successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to add dependency.'
      );
    }
  }

  /**
   * DELETE /api/v1/tasks/:id/dependencies/:dependencyId
   */
  public static async removeDependency(req: Request, res: Response): Promise<Response> {
    try {
      const { id, dependencyId } = req.params;
      const userId = req.user?.id || '';

      const task = await DependencyService.removeDependency(id, dependencyId, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Dependency removed successfully.',
        task
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to remove dependency.'
      );
    }
  }

  /**
   * GET /api/v1/tasks/:id/dependencies
   */
  public static async getDependencies(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';

      const dependencies = await DependencyService.getTaskDependencies(id, userId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Task dependencies retrieved successfully.',
        dependencies
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Failed to retrieve task dependencies.'
      );
    }
  }
}

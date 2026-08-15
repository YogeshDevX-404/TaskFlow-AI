import { Request, Response } from 'express';
import { ProjectMemberService } from '../services/projectMember.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class ProjectMemberController {
  /**
   * GET /api/v1/projects/:projectId/members
   */
  public static async getMembers(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const { search, role, status, tab, sortBy, sortOrder } = req.query;

      const members = await ProjectMemberService.getMembers(projectId, {
        search: search as string,
        role: role as any,
        status: status as any,
        tab: tab as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project members retrieved successfully.',
        members
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to retrieve project members.'
      );
    }
  }

  /**
   * POST /api/v1/projects/:projectId/members
   */
  public static async addMember(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const currentUserId = req.user?.id || '';
      const { userId, email, role, status } = req.body;

      if (!userId && !email) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Either userId or email is required to add a project member.'
        );
      }

      if (!role) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Project role is required.'
        );
      }

      const newMember = await ProjectMemberService.addMember(
        projectId,
        { userId, email, role, status },
        currentUserId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        'Project member added successfully.',
        newMember
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to add project member.'
      );
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/members/:memberId
   */
  public static async updateMember(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId, memberId } = req.params;
      const currentUserId = req.user?.id || '';
      const { role, status } = req.body;

      const updated = await ProjectMemberService.updateMember(
        projectId,
        memberId,
        { role, status },
        currentUserId
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project member updated successfully.',
        updated
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update project member.'
      );
    }
  }

  /**
   * DELETE /api/v1/projects/:projectId/members/:memberId
   */
  public static async removeMember(req: Request, res: Response): Promise<Response> {
    try {
      const { projectId, memberId } = req.params;
      const currentUserId = req.user?.id || '';

      await ProjectMemberService.removeMember(projectId, memberId, currentUserId);

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Project member removed successfully.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to remove project member.'
      );
    }
  }
}

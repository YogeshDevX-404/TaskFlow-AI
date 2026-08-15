import { Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class InviteController {
  /**
   * GET /api/v1/invitations/verify/:token
   */
  public static async verifyToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    try {
      const invite = await MemberService.verifyToken(token);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Invitation token verified.',
        invite
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Invalid invitation token.'
      );
    }
  }

  /**
   * POST /api/v1/invitations/accept
   */
  public static async accept(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required to accept invitation.');
    }

    const { token } = req.body;

    try {
      const member = await MemberService.acceptInvitation(token, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Invitation accepted! Welcome to the organization.',
        member
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to accept invitation.'
      );
    }
  }

  /**
   * POST /api/v1/invitations/reject
   */
  public static async reject(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { token } = req.body;

    try {
      await MemberService.rejectInvitation(token, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Invitation rejected.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to reject invitation.'
      );
    }
  }
}

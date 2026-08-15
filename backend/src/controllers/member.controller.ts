import { Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class MemberController {
  /**
   * GET /api/v1/organizations/:id/members
   */
  public static async getMembers(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    const { search, role, status, sortBy, sortOrder, page, limit } = req.query;

    try {
      const result = await MemberService.getMembers(id, userId, {
        search: search as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization members retrieved successfully.',
        result.members,
        {
          totalItems: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        }
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        (err as Error).message || 'Failed to fetch organization members.'
      );
    }
  }

  /**
   * POST /api/v1/organizations/:id/invite
   */
  public static async inviteMember(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    const { email, role } = req.body;

    try {
      const invite = await MemberService.inviteMember(id, userId, { email, role });
      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        `Invitation successfully sent to ${email}.`,
        invite
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to invite member.'
      );
    }
  }

  /**
   * GET /api/v1/organizations/:id/invitations
   */
  public static async getInvitations(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    const { search, status, page, limit } = req.query;

    try {
      const result = await MemberService.getInvitations(id, userId, {
        search: search as string,
        status: status as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization invitations retrieved successfully.',
        result.invitations,
        {
          totalItems: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        }
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        (err as Error).message || 'Failed to fetch organization invitations.'
      );
    }
  }

  /**
   * POST /api/v1/organizations/:id/invitations/:inviteId/resend
   */
  public static async resendInvite(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id, inviteId } = req.params;

    try {
      const invite = await MemberService.resendInvitation(id, inviteId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        `Invitation resent successfully to ${invite.email}.`,
        invite
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to resend invitation.'
      );
    }
  }

  /**
   * DELETE /api/v1/organizations/:id/invitations/:inviteId
   */
  public static async cancelInvite(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id, inviteId } = req.params;

    try {
      await MemberService.cancelInvitation(id, inviteId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Invitation canceled successfully.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to cancel invitation.'
      );
    }
  }

  /**
   * DELETE /api/v1/organizations/:id/members/:memberId
   */
  public static async removeMember(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id, memberId } = req.params;

    try {
      await MemberService.removeMember(id, memberId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Member removed from organization.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to remove member.'
      );
    }
  }

  /**
   * PATCH /api/v1/organizations/:id/members/:memberId/role
   */
  public static async updateMemberRole(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id, memberId } = req.params;
    const { role } = req.body;

    try {
      const member = await MemberService.updateMemberRole(id, memberId, role, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Member role updated successfully.',
        member
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to update member role.'
      );
    }
  }

  /**
   * POST /api/v1/organizations/:id/leave
   */
  public static async leaveOrganization(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;

    try {
      await MemberService.leaveOrganization(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'You have successfully left the organization.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to leave organization.'
      );
    }
  }

  /**
   * POST /api/v1/organizations/:id/transfer-ownership
   */
  public static async transferOwnership(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    const { newOwnerMemberId } = req.body;

    try {
      await MemberService.transferOwnership(id, newOwnerMemberId, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization ownership successfully transferred.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to transfer ownership.'
      );
    }
  }
}

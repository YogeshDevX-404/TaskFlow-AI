import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class OrganizationController {
  /**
   * Create new organization
   */
  public static async create(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const organization = await OrganizationService.createOrganization(userId, req.body);
    return sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      'Organization created successfully.',
      organization
    );
  }

  /**
   * Get user's organizations with search, filtering, and pagination
   */
  public static async getAll(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const {
      search,
      status,
      isArchived,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await OrganizationService.getMyOrganizations(userId, {
      search: search as string,
      status: status as string,
      isArchived: isArchived as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    });

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Organizations fetched successfully.',
      result.organizations,
      {
        totalItems: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      }
    );
  }

  /**
   * Get single organization details by ID or slug
   */
  public static async getById(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    try {
      const organization = await OrganizationService.getOrganizationByIdOrSlug(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization details retrieved.',
        organization
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        (err as Error).message || 'Organization not found.'
      );
    }
  }

  /**
   * Update organization
   */
  public static async update(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    try {
      const organization = await OrganizationService.updateOrganization(id, userId, req.body);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization updated successfully.',
        organization
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to update organization.'
      );
    }
  }

  /**
   * Archive organization
   */
  public static async archive(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    try {
      const organization = await OrganizationService.archiveOrganization(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization archived successfully.',
        organization
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to archive organization.'
      );
    }
  }

  /**
   * Restore organization
   */
  public static async restore(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    try {
      const organization = await OrganizationService.restoreOrganization(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization restored successfully.',
        organization
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        (err as Error).message || 'Failed to restore organization.'
      );
    }
  }

  /**
   * Delete organization
   */
  public static async delete(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    const { id } = req.params;
    try {
      await OrganizationService.deleteOrganization(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Organization deleted successfully.'
      );
    } catch (err) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        (err as Error).message || 'Failed to delete organization.'
      );
    }
  }
}

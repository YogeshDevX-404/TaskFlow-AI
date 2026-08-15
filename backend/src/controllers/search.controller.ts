import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class SearchController {
  /**
   * Main Enterprise Search endpoint
   * GET /api/v1/search
   */
  public static async search(req: Request, res: Response) {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required for global search.',
        'UNAUTHORIZED'
      );
    }

    const userId = req.user.id;
    const {
      q,
      query,
      category,
      type,
      organizationId,
      workspaceId,
      projectId,
      status,
      priority,
      assigneeId,
      reporterId,
      taskType,
      labels,
      sprintId,
      releaseId,
      dateFilter,
      startDate,
      endDate,
      sortBy,
      page,
      limit,
      saveRecent,
    } = req.query;

    const searchQuery = (q || query || '') as string;
    const searchCategory = (category || type || 'all') as string;

    const result = await SearchService.executeSearch({
      userId,
      query: searchQuery,
      category: searchCategory,
      organizationId: organizationId as string,
      workspaceId: workspaceId as string,
      projectId: projectId as string,
      status: status as string,
      priority: priority as string,
      assigneeId: assigneeId as string,
      reporterId: reporterId as string,
      taskType: taskType as string,
      labels: labels as string | string[],
      sprintId: sprintId as string,
      releaseId: releaseId as string,
      dateFilter: dateFilter as any,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    // Save recent search if requested and query isn't empty
    if (saveRecent !== 'false' && searchQuery.trim().length >= 2) {
      await SearchService.saveRecentSearch(userId, searchQuery.trim(), searchCategory);
    }

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Search results retrieved successfully.',
      result
    );
  }

  /**
   * Search suggestions for typeahead
   * GET /api/v1/search/suggestions
   */
  public static async getSuggestions(req: Request, res: Response) {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required.',
        'UNAUTHORIZED'
      );
    }

    const { q, query } = req.query;
    const searchQuery = (q || query || '') as string;

    const result = await SearchService.getSuggestions(req.user.id, searchQuery);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Search suggestions retrieved successfully.',
      result
    );
  }

  /**
   * Get user's recent searches
   * GET /api/v1/search/recent
   */
  public static async getRecent(req: Request, res: Response) {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required.',
        'UNAUTHORIZED'
      );
    }

    const recent = await SearchService.getRecentSearches(req.user.id);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Recent searches retrieved successfully.',
      recent
    );
  }

  /**
   * Save a recent search query
   * POST /api/v1/search/recent
   */
  public static async saveRecent(req: Request, res: Response) {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required.',
        'UNAUTHORIZED'
      );
    }

    const { query, category, filters } = req.body;
    if (!query) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Query is required to save recent search.',
        'INVALID_INPUT'
      );
    }

    const recent = await SearchService.saveRecentSearch(
      req.user.id,
      query,
      category || 'all',
      filters || {}
    );

    return sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      'Recent search saved.',
      recent
    );
  }

  /**
   * Clear one or all recent searches
   * DELETE /api/v1/search/recent
   */
  public static async clearRecent(req: Request, res: Response) {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required.',
        'UNAUTHORIZED'
      );
    }

    const { id } = req.query;
    await SearchService.deleteRecentSearch(req.user.id, id as string);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      id ? 'Recent search removed.' : 'All recent searches cleared.'
    );
  }
}

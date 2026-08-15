import { Request, Response } from 'express';
import { GitHubBranchCommitService } from '../services/githubBranchCommit.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class GitHubBranchCommitController {
  /**
   * Get branches for a repository connection
   * GET /api/v1/integrations/github/connections/:connectionId/branches
   */
  public static async getBranches(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const search = req.query.search as string;
      const filter = req.query.filter as 'default' | 'protected' | 'unprotected' | 'all';
      const sort = req.query.sort as 'name' | 'updated';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const protectedParam = req.query.protected === 'true' ? true : req.query.protected === 'false' ? false : undefined;

      const result = await GitHubBranchCommitService.getBranches(userId, connectionId, {
        search,
        filter,
        sort,
        page,
        limit,
        protected: protectedParam,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Branches retrieved successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to retrieve repository branches',
        'FETCH_BRANCHES_FAILED'
      );
    }
  }

  /**
   * Get branch details
   * GET /api/v1/integrations/github/connections/:connectionId/branches/:branchName
   */
  public static async getBranchDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId, branchName } = req.params;
      const requestMeta = {
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await GitHubBranchCommitService.getBranchDetails(
        userId,
        connectionId,
        decodeURIComponent(branchName),
        requestMeta
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Branch details retrieved successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to retrieve branch details',
        'FETCH_BRANCH_DETAILS_FAILED'
      );
    }
  }

  /**
   * Get commits for a repository connection
   * GET /api/v1/integrations/github/connections/:connectionId/commits
   */
  public static async getCommits(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const branch = req.query.branch as string;
      const author = req.query.author as string;
      const search = req.query.search as string;
      const from = req.query.from as string;
      const to = req.query.to as string;
      const sort = req.query.sort as 'newest' | 'oldest' | 'author';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await GitHubBranchCommitService.getCommits(userId, connectionId, {
        branch,
        author,
        search,
        from,
        to,
        sort,
        page,
        limit,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Commits retrieved successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to retrieve repository commits',
        'FETCH_COMMITS_FAILED'
      );
    }
  }

  /**
   * Get commit details
   * GET /api/v1/integrations/github/connections/:connectionId/commits/:sha
   */
  public static async getCommitDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId, sha } = req.params;
      const requestMeta = {
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await GitHubBranchCommitService.getCommitDetails(
        userId,
        connectionId,
        sha,
        requestMeta
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Commit details retrieved successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to retrieve commit details',
        'FETCH_COMMIT_DETAILS_FAILED'
      );
    }
  }

  /**
   * Compare commits or branches
   * GET /api/v1/integrations/github/connections/:connectionId/compare
   */
  public static async compareCommits(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const base = req.query.base as string;
      const head = req.query.head as string;

      if (!base || !head) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Both base and head parameters are required for commit comparison',
          'INVALID_COMPARE_PARAMS'
        );
      }

      const result = await GitHubBranchCommitService.compareCommits(
        userId,
        connectionId,
        base,
        head
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Commit comparison completed successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to compare commits',
        'COMPARE_COMMITS_FAILED'
      );
    }
  }

  /**
   * Get commits related to a task
   * GET /api/v1/tasks/:taskId/github-commits
   */
  public static async getTaskCommits(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { taskId } = req.params;
      const result = await GitHubBranchCommitService.getTaskCommits(userId, taskId);

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Task commits retrieved successfully', result);
    } catch (err: any) {
      return sendErrorResponse(
        res,
        err.message.includes('Unauthorized') ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to retrieve task commits',
        'FETCH_TASK_COMMITS_FAILED'
      );
    }
  }
}

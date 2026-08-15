import { Request, Response } from 'express';
import { GitHubIssueService } from '../services/githubIssue.service';

export class GitHubIssueController {
  /**
   * GET /api/v1/integrations/github/connections/:connectionId/issues
   */
  public static async getIssues(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { connectionId } = req.params;
      const { state, search, label, author, assignee, sort, direction, page, limit } = req.query;

      const result = await GitHubIssueService.getIssuesForConnection(userId, connectionId, {
        state: state as any,
        search: search as string,
        label: label as string,
        author: author as string,
        assignee: assignee as string,
        sort: sort as any,
        direction: direction as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to fetch GitHub issues',
      });
    }
  }

  /**
   * GET /api/v1/integrations/github/connections/:connectionId/issues/:issueNumber
   */
  public static async getIssueDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { connectionId, issueNumber } = req.params;

      const result = await GitHubIssueService.getIssueDetails(
        userId,
        connectionId,
        parseInt(issueNumber, 10)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to fetch GitHub issue details',
      });
    }
  }

  /**
   * POST /api/v1/integrations/github/issues/import
   */
  public static async importIssue(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { connectionId, issueNumber, projectId, statusMapping, customTitle, customDescription } = req.body;

      if (!connectionId || !issueNumber || !projectId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: connectionId, issueNumber, or projectId',
        });
        return;
      }

      const result = await GitHubIssueService.importIssueToTask(userId, {
        connectionId,
        issueNumber: parseInt(issueNumber, 10),
        projectId,
        statusMapping,
        customTitle,
        customDescription,
      });

      res.status(201).json({
        success: true,
        message: 'Successfully imported GitHub Issue as TaskFlow Task',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to import GitHub issue',
      });
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/github-issue/link or /api/v1/integrations/github/issues/link
   */
  public static async linkIssue(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const taskId = req.params.taskId || req.body.taskId;
      const { connectionId, issueNumber } = req.body;

      if (!taskId || !connectionId || !issueNumber) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: taskId, connectionId, or issueNumber',
        });
        return;
      }

      const result = await GitHubIssueService.linkTaskToIssue(userId, {
        taskId,
        connectionId,
        issueNumber: parseInt(issueNumber, 10),
      });

      res.status(200).json({
        success: true,
        message: 'Successfully linked Task to GitHub Issue',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to link task to GitHub issue',
      });
    }
  }

  /**
   * DELETE /api/v1/tasks/:taskId/github-issue or /api/v1/integrations/github/issues/unlink/:taskId
   */
  public static async unlinkIssue(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const taskId = req.params.taskId;

      const result = await GitHubIssueService.unlinkIssueFromTask(userId, taskId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to unlink GitHub issue from task',
      });
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/github-issue/create or /api/v1/integrations/github/issues/create-from-task
   */
  public static async createIssueFromTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const taskId = req.params.taskId || req.body.taskId;
      const { connectionId, customTitle, customBody, labels } = req.body;

      if (!taskId || !connectionId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: taskId or connectionId',
        });
        return;
      }

      const result = await GitHubIssueService.createIssueFromTask(userId, {
        taskId,
        connectionId,
        customTitle,
        customBody,
        labels,
      });

      res.status(201).json({
        success: true,
        message: 'Successfully created GitHub Issue from TaskFlow Task',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to create GitHub issue from task',
      });
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/github-issue/sync or /api/v1/integrations/github/issues/sync/:taskId
   */
  public static async syncIssue(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const taskId = req.params.taskId;

      const result = await GitHubIssueService.syncIssueMapping(userId, taskId);

      res.status(200).json({
        success: true,
        message: 'GitHub issue metadata synced successfully',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to sync GitHub issue metadata',
      });
    }
  }

  /**
   * GET /api/v1/tasks/:taskId/github-issue
   */
  public static async getTaskIssueMapping(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.taskId;

      const result = await GitHubIssueService.getTaskIssueMapping(taskId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to fetch task GitHub issue mapping',
      });
    }
  }
}

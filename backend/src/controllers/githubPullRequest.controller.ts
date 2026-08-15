import { Request, Response } from 'express';
import { GitHubPullRequestService } from '../services/githubPullRequest.service';

export class GitHubPullRequestController {
  /**
   * GET /api/v1/github/connections/:connectionId/pull-requests
   */
  public static async getPullRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId } = req.params;
      const {
        state,
        author,
        reviewer,
        assignee,
        base,
        head,
        draft,
        merged,
        search,
        sort,
        direction,
        page,
        limit,
      } = req.query;

      const options = {
        state: state as any,
        author: author as string,
        reviewer: reviewer as string,
        assignee: assignee as string,
        base: base as string,
        head: head as string,
        draft: draft !== undefined ? draft === 'true' : undefined,
        merged: merged !== undefined ? merged === 'true' : undefined,
        search: search as string,
        sort: sort as any,
        direction: direction as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await GitHubPullRequestService.getPullRequests(userId, connectionId, options);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * GET /api/v1/github/connections/:connectionId/pull-requests/:prNumber
   */
  public static async getPullRequestDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId, prNumber } = req.params;
      const num = parseInt(prNumber, 10);
      if (isNaN(num)) {
        res.status(400).json({ message: 'Invalid pull request number' });
        return;
      }

      const pr = await GitHubPullRequestService.getPullRequestDetails(userId, connectionId, num);
      res.status(200).json({ pullRequest: pr });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * GET /api/v1/github/connections/:connectionId/pull-requests/:prNumber/files
   */
  public static async getPullRequestFiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId, prNumber } = req.params;
      const num = parseInt(prNumber, 10);
      if (isNaN(num)) {
        res.status(400).json({ message: 'Invalid pull request number' });
        return;
      }

      const files = await GitHubPullRequestService.getPullRequestFiles(userId, connectionId, num);
      res.status(200).json({ files });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * GET /api/v1/github/connections/:connectionId/pull-requests/:prNumber/commits
   */
  public static async getPullRequestCommits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId, prNumber } = req.params;
      const num = parseInt(prNumber, 10);
      if (isNaN(num)) {
        res.status(400).json({ message: 'Invalid pull request number' });
        return;
      }

      const commits = await GitHubPullRequestService.getPullRequestCommits(userId, connectionId, num);
      res.status(200).json({ commits });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * GET /api/v1/github/connections/:connectionId/pull-requests/:prNumber/reviews
   */
  public static async getPullRequestReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId, prNumber } = req.params;
      const num = parseInt(prNumber, 10);
      if (isNaN(num)) {
        res.status(400).json({ message: 'Invalid pull request number' });
        return;
      }

      const reviews = await GitHubPullRequestService.getPullRequestReviews(userId, connectionId, num);
      res.status(200).json({ reviews });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * POST /api/v1/github/connections/:connectionId/pull-requests/:prNumber/sync
   */
  public static async syncPullRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { connectionId, prNumber } = req.params;
      const num = parseInt(prNumber, 10);
      if (isNaN(num)) {
        res.status(400).json({ message: 'Invalid pull request number' });
        return;
      }

      const pr = await GitHubPullRequestService.syncPullRequest(userId, connectionId, num);
      res.status(200).json({ pullRequest: pr });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/github-pull-requests/link
   */
  public static async linkPullRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const { connectionId, prNumber } = req.body;

      if (!connectionId || !prNumber) {
        res.status(400).json({ message: 'Missing required parameters connectionId or prNumber' });
        return;
      }

      const num = parseInt(prNumber, 10);
      const pr = await GitHubPullRequestService.linkPullRequestToTask(userId, taskId, connectionId, num);
      res.status(200).json({ pullRequest: pr });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * DELETE /api/v1/tasks/:taskId/github-pull-requests/:prId
   */
  public static async unlinkPullRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { taskId, prId } = req.params;
      const result = await GitHubPullRequestService.unlinkPullRequestFromTask(userId, taskId, prId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/github-pull-requests/create
   */
  public static async createPullRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const { connectionId, sourceBranch, targetBranch, title, body, draft } = req.body;

      if (!connectionId || !sourceBranch || !targetBranch || !title) {
        res.status(400).json({ message: 'Missing required fields: connectionId, sourceBranch, targetBranch, title' });
        return;
      }

      const pr = await GitHubPullRequestService.createPullRequestFromTask(userId, taskId, {
        connectionId,
        sourceBranch,
        targetBranch,
        title,
        body,
        draft,
      });

      res.status(201).json({ pullRequest: pr });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }

  /**
   * GET /api/v1/tasks/:taskId/github-pull-requests
   */
  public static async getTaskPullRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const pullRequests = await GitHubPullRequestService.getTaskPullRequests(userId, taskId);
      res.status(200).json({ pullRequests });
    } catch (err: any) {
      res.status(err.message.includes('Unauthorized') ? 403 : 400).json({ message: err.message });
    }
  }
}

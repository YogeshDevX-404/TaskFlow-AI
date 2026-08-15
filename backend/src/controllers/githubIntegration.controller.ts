import { Request, Response } from 'express';
import { GitHubIntegrationService } from '../services/githubIntegration.service';
import { GitHubRepositoryService } from '../services/githubRepository.service';
import { GitHubSyncService } from '../services/githubSync.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { config } from '../config/env.config';

export class GitHubIntegrationController {
  /**
   * Initiate GitHub OAuth Flow
   * GET /api/v1/integrations/github/connect
   */
  public static async connect(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'User must be authenticated to connect GitHub',
          'UNAUTHORIZED'
        );
      }

      const redirectUri = (req.query.redirectUri as string) || undefined;
      const result = await GitHubIntegrationService.createOAuthUrl(userId, redirectUri);

      // If requested with redirect=true directly in browser, send 302
      if (req.query.redirect === 'true') {
        return res.redirect(result.url);
      }

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'GitHub authorization URL generated successfully',
        result
      );
    } catch (err: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        err.message || 'Failed to initiate GitHub connection',
        'GITHUB_CONNECT_FAILED'
      );
    }
  }

  /**
   * GitHub OAuth Callback Handler
   * GET /api/v1/integrations/github/callback
   */
  public static async callback(req: Request, res: Response): Promise<Response | void> {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const oauthError = req.query.error as string;
    const oauthErrorDesc = req.query.error_description as string;

    const wantsJson = req.headers.accept?.includes('application/json');

    // Handle user denial or OAuth error from GitHub
    if (oauthError) {
      const msg = oauthErrorDesc || oauthError || 'GitHub authorization was denied by user';
      if (wantsJson) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, msg, 'OAUTH_DENIED');
      }
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>GitHub Connection Denied</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; max-width: 400px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155;">
            <h2 style="color: #f43f5e; margin-top: 0;">Authorization Denied</h2>
            <p style="color: #94a3b8; font-size: 0.9rem;">${msg}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: '${msg}' }, '*');
                setTimeout(() => window.close(), 2000);
              } else {
                setTimeout(() => { window.location.href = '${config.clientUrl}/dashboard?github=denied'; }, 2000);
              }
            </script>
          </div>
        </body>
        </html>
      `);
    }

    if (!code || !state) {
      if (wantsJson) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Missing code or state in callback', 'INVALID_CALLBACK_PARAMS');
      }
      return res.status(400).send('Missing authorization code or state parameter.');
    }

    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const result = await GitHubIntegrationService.handleOAuthCallback(code, state, {
        ipAddress,
        userAgent,
      });

      if (wantsJson) {
        return sendSuccessResponse(
          res,
          HTTP_STATUS.OK,
          'GitHub account connected successfully',
          result.connection
        );
      }

      // Render popup success handler that notifies opener window & closes
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>GitHub Connected Successfully</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; max-width: 400px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
            <div style="width: 48px; height: 48px; background: #10b98120; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #10b981; font-size: 24px;">✓</div>
            <h2 style="margin-top: 0; font-size: 1.25rem;">GitHub Connected!</h2>
            <p style="color: #94a3b8; font-size: 0.875rem;">Successfully connected as <strong style="color: #6366f1;">@${result.connection.githubUsername}</strong>.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GITHUB_OAUTH_SUCCESS',
                  githubUsername: '${result.connection.githubUsername}'
                }, '*');
                setTimeout(function() { window.close(); }, 1200);
              } else {
                setTimeout(function() { window.location.href = '${config.clientUrl}/dashboard?github=success'; }, 1500);
              }
            </script>
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      const errMsg = err.message || 'GitHub OAuth connection failed';
      if (wantsJson) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, errMsg, 'GITHUB_OAUTH_FAILED');
      }

      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>GitHub Connection Failed</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; max-width: 400px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #f43f5e30;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 1.25rem;">Connection Failed</h2>
            <p style="color: #94a3b8; font-size: 0.875rem;">${errMsg}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: '${errMsg}' }, '*');
                setTimeout(function() { window.close(); }, 3000);
              } else {
                setTimeout(function() { window.location.href = '${config.clientUrl}/dashboard?github=error'; }, 3000);
              }
            </script>
          </div>
        </body>
        </html>
      `);
    }
  }

  /**
   * Get connection status for authenticated user
   * GET /api/v1/integrations/github/status
   */
  public static async getStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const result = await GitHubIntegrationService.getConnectionStatus(userId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'GitHub connection status fetched successfully', result);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch GitHub status', 'STATUS_FETCH_FAILED');
    }
  }

  /**
   * Get authenticated GitHub user profile details
   * GET /api/v1/integrations/github/profile
   */
  public static async getProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const profile = await GitHubIntegrationService.getGitHubProfile(userId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'GitHub user profile fetched successfully', profile);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch GitHub profile', 'PROFILE_FETCH_FAILED');
    }
  }

  /**
   * Disconnect GitHub integration for authenticated user
   * DELETE /api/v1/integrations/github
   */
  public static async disconnect(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const result = await GitHubIntegrationService.disconnectGitHub(userId, { ipAddress, userAgent });
      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to disconnect GitHub', 'DISCONNECT_FAILED');
    }
  }

  /**
   * Get GitHub organizations for authenticated user
   * GET /api/v1/integrations/github/organizations
   */
  public static async getOrganizations(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const orgs = await GitHubRepositoryService.getUserOrganizations(userId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'GitHub organizations fetched successfully', orgs);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch GitHub organizations', 'ORGS_FETCH_FAILED');
    }
  }

  /**
   * Get GitHub repositories with search, filter, and pagination
   * GET /api/v1/integrations/github/repositories
   */
  public static async getRepositories(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const options = {
        org: req.query.org as string | undefined,
        owner: req.query.owner as string | undefined,
        search: req.query.search as string | undefined,
        visibility: req.query.visibility as any,
        language: req.query.language as string | undefined,
        archived: req.query.archived !== undefined ? req.query.archived === 'true' : undefined,
        fork: req.query.fork !== undefined ? req.query.fork === 'true' : undefined,
        sort: req.query.sort as any,
        direction: req.query.direction as any,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const result = await GitHubRepositoryService.getUserRepositories(userId, options);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'GitHub repositories fetched successfully', result);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch GitHub repositories', 'REPOSITORIES_FETCH_FAILED');
    }
  }

  /**
   * Get single GitHub repository details
   * GET /api/v1/integrations/github/repositories/:owner/:repo
   */
  public static async getRepositoryDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { owner, repo } = req.params;
      if (!owner || !repo) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Owner and repo params are required', 'MISSING_PARAMS');
      }

      const repoDetails = await GitHubRepositoryService.getRepositoryDetails(userId, owner, repo);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository details fetched successfully', repoDetails);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch repository details', 'REPO_DETAILS_FAILED');
    }
  }

  /**
   * Connect a GitHub repository to a project
   * POST /api/v1/integrations/github/projects/:projectId/repositories
   * or POST /api/v1/projects/:projectId/github-repositories
   */
  public static async connectProjectRepository(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { projectId } = req.params;
      const { owner, repo, organizationId } = req.body;

      if (!owner || !repo) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Repository owner and name are required', 'MISSING_PARAMS');
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const connection = await GitHubRepositoryService.connectRepositoryToProject(
        userId,
        projectId,
        owner,
        repo,
        organizationId,
        { ipAddress, userAgent }
      );

      return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Repository connected to project successfully', connection);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to connect repository to project', 'CONNECT_REPO_FAILED');
    }
  }

  /**
   * Get connected GitHub repositories for a project
   * GET /api/v1/integrations/github/projects/:projectId/repositories
   * or GET /api/v1/projects/:projectId/github-repositories
   */
  public static async getProjectRepositories(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { projectId } = req.params;
      const repositories = await GitHubRepositoryService.getProjectRepositories(userId, projectId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project connected repositories fetched successfully', repositories);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch project repositories', 'PROJECT_REPOS_FAILED');
    }
  }

  /**
   * Re-sync connected repository
   * POST /api/v1/integrations/github/projects/:projectId/repositories/:connectionId/sync
   */
  public static async syncProjectRepository(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { projectId, connectionId } = req.params;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const updated = await GitHubSyncService.syncRepository(userId, connectionId, {
        ipAddress,
        userAgent,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository re-synced successfully', updated);
    } catch (err: any) {
      const isConflict = err.message?.includes('already in progress');
      const status = isConflict ? HTTP_STATUS.CONFLICT : HTTP_STATUS.BAD_REQUEST;
      return sendErrorResponse(res, status, err.message || 'Failed to sync repository', 'SYNC_REPO_FAILED');
    }
  }

  /**
   * Get connection details & health by connectionId
   * GET /api/v1/github/repositories/:connectionId or GET /api/v1/integrations/github/repositories/connections/:connectionId
   */
  public static async getConnectionDetails(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const details = await GitHubSyncService.getConnectionDetails(userId, connectionId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository connection details fetched successfully', details);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch repository connection details', 'GET_CONNECTION_FAILED');
    }
  }

  /**
   * Trigger sync for a repository connection by connectionId
   * POST /api/v1/github/repositories/:connectionId/sync
   */
  public static async syncConnection(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const connection = await GitHubSyncService.syncRepository(userId, connectionId, {
        ipAddress,
        userAgent,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository synchronized successfully', connection);
    } catch (err: any) {
      const isConflict = err.message?.includes('already in progress');
      const status = isConflict ? HTTP_STATUS.CONFLICT : HTTP_STATUS.BAD_REQUEST;
      return sendErrorResponse(res, status, err.message || 'Failed to sync repository', 'SYNC_FAILED');
    }
  }

  /**
   * Get sync status by connectionId
   * GET /api/v1/github/repositories/:connectionId/sync-status
   */
  public static async getSyncStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const syncStatus = await GitHubSyncService.getSyncStatus(userId, connectionId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository sync status fetched successfully', syncStatus);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch sync status', 'SYNC_STATUS_FAILED');
    }
  }

  /**
   * Get sync history logs by connectionId
   * GET /api/v1/github/repositories/:connectionId/sync-history
   */
  public static async getSyncHistory(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { connectionId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const history = await GitHubSyncService.getSyncHistory(userId, connectionId, limit);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Repository sync history fetched successfully', history);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to fetch sync history', 'SYNC_HISTORY_FAILED');
    }
  }

  /**
   * Disconnect repository from project
   * DELETE /api/v1/integrations/github/projects/:projectId/repositories/:connectionId
   */
  public static async disconnectProjectRepository(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'UNAUTHORIZED');
      }

      const { projectId, connectionId } = req.params;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const result = await GitHubRepositoryService.disconnectProjectRepository(userId, projectId, connectionId, {
        ipAddress,
        userAgent,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message || 'Failed to disconnect repository', 'DISCONNECT_REPO_FAILED');
    }
  }
}

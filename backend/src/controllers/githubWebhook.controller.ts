import { Request, Response } from 'express';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { decryptToken } from '../utils/encryption.util';
import { GitHubWebhookService } from '../services/githubWebhook.service';
import { GitHubApiService } from '../services/githubApi.service';
import { GitHubWebhookEventModel } from '../models/githubWebhookEvent.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubConnectionModel } from '../models/githubConnection.model';

export class GitHubWebhookController {
  /**
   * Public endpoint receiving GitHub Webhook HTTP POST calls
   * POST /api/v1/integrations/github/webhook
   */
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      if (!config.githubWebhookEnabled) {
        res.status(400).json({
          success: false,
          message: 'GitHub Webhook processing is currently disabled on this server',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await GitHubWebhookService.processWebhookRequest(req);

      res.status(200).json({
        success: result.success,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[GitHub Webhook Controller Error]: ${err.message}`);

      if (err.message && err.message.includes('Unauthorized')) {
        res.status(401).json({
          success: false,
          message: err.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: err.message || 'Error processing GitHub Webhook',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Development endpoint to trigger simulated GitHub webhook events
   * POST /api/v1/integrations/github/webhook/test
   */
  public static async handleTestWebhook(req: Request, res: Response): Promise<void> {
    if (config.nodeEnv === 'production' && !config.githubMockMode) {
      res.status(403).json({
        success: false,
        message: 'Simulated webhook endpoint is disabled in production environment',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const { eventType = 'push', payload = {}, deliveryId } = req.body || {};
      const mockDeliveryId = deliveryId || `mock-del-${Date.now()}`;

      const rawBuffer = Buffer.from(JSON.stringify(payload));
      const simulatedReq: any = {
        headers: {
          'x-github-delivery': mockDeliveryId,
          'x-github-event': eventType,
          'content-type': 'application/json',
        },
        body: payload,
        rawBody: rawBuffer,
      };

      const result = await GitHubWebhookService.processWebhookRequest(simulatedReq as Request);

      res.status(200).json({
        success: result.success,
        message: 'Test webhook event processed successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[GitHub Test Webhook Error]: ${err.message}`);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to process test webhook event',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Query recent webhook delivery logs
   * GET /api/v1/integrations/github/webhooks/deliveries
   */
  public static async getWebhookDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const { repositoryConnectionId, eventType, status } = req.query || {};

      const filter: Record<string, any> = {};
      if (repositoryConnectionId) {
        filter.repositoryConnection = repositoryConnectionId;
      }
      if (eventType) {
        filter.eventType = eventType;
      }
      if (status) {
        filter.status = status;
      }

      const totalItems = await GitHubWebhookEventModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const skip = (page - 1) * limit;

      const events = await GitHubWebhookEventModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        message: 'Fetched webhook delivery logs',
        data: {
          deliveries: events.map((e) => e.toPayload()),
          meta: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[Get Webhook Deliveries Error]: ${err.message}`);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch webhook delivery logs',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get webhook connection status for a repository connection
   * GET /api/v1/integrations/github/connections/:connectionId/webhook-status
   */
  public static async getConnectionWebhookStatus(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;

      const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
      if (!connection) {
        res.status(404).json({
          success: false,
          message: 'Repository connection not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const totalDeliveries = await GitHubWebhookEventModel.countDocuments({ repositoryConnection: connection._id });
      const successfulDeliveries = await GitHubWebhookEventModel.countDocuments({
        repositoryConnection: connection._id,
        status: 'Processed',
      });
      const failedDeliveries = await GitHubWebhookEventModel.countDocuments({
        repositoryConnection: connection._id,
        status: 'Failed',
      });

      const lastEvent = await GitHubWebhookEventModel.findOne({ repositoryConnection: connection._id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: 'Fetched repository webhook status',
        data: {
          connectionId: connection._id.toString(),
          repositoryFullName: connection.fullName,
          githubWebhookId: connection.githubWebhookId || null,
          webhookStatus: connection.webhookStatus || 'Pending',
          webhookEnabled: config.githubWebhookEnabled,
          lastWebhookAt: connection.lastWebhookAt ? connection.lastWebhookAt.toISOString() : null,
          lastWebhookSuccessAt: connection.lastWebhookSuccessAt ? connection.lastWebhookSuccessAt.toISOString() : null,
          webhookError: connection.webhookError || null,
          deliveryStats: {
            totalDeliveries,
            successfulDeliveries,
            failedDeliveries,
            lastDeliveryEvent: lastEvent ? lastEvent.eventType : null,
            lastDeliveryStatus: lastEvent ? lastEvent.status : null,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[Get Connection Webhook Status Error]: ${err.message}`);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch repository webhook status',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Register repository webhook on GitHub
   * POST /api/v1/integrations/github/connections/:connectionId/webhook/register
   */
  public static async registerConnectionWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
      if (!connection) {
        res.status(404).json({
          success: false,
          message: 'Repository connection not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find user's connected OAuth account
      const ghAccount = await GitHubConnectionModel.findOne({
        user: user.id,
        status: 'Connected',
      }).select('+accessTokenEncrypted');

      if (!ghAccount || !ghAccount.accessTokenEncrypted) {
        res.status(400).json({
          success: false,
          message: 'You must connect your GitHub account with repo administrative permissions before registering webhooks.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const accessToken = decryptToken(ghAccount.accessTokenEncrypted);
      const appUrl = process.env.APP_URL || process.env.CLIENT_URL || `http://localhost:${config.port}`;
      const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/v1/integrations/github/webhook`;

      let hookResult: { id: number; url: string; active: boolean; events: string[] };

      if (config.githubMockMode) {
        // Mock mode webhook registration
        hookResult = {
          id: Math.floor(Math.random() * 10000000) + 100000,
          url: webhookUrl,
          active: true,
          events: ['push', 'issues', 'issue_comment', 'pull_request', 'pull_request_review', 'repository', 'release'],
        };
      } else {
        hookResult = await GitHubApiService.createRepositoryWebhook(
          accessToken,
          connection.githubOwner,
          connection.repositoryName,
          webhookUrl,
          config.githubWebhookSecret
        );
      }

      connection.githubWebhookId = String(hookResult.id);
      connection.webhookStatus = 'Connected';
      connection.webhookError = undefined;
      connection.lastWebhookAt = new Date();
      await connection.save();

      res.status(200).json({
        success: true,
        message: `Successfully registered webhook for repository '${connection.fullName}'`,
        data: {
          connection: connection.toPayload(),
          webhook: hookResult,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[Register Connection Webhook Error]: ${err.message}`);

      const { connectionId } = req.params;
      if (connectionId) {
        await GitHubRepositoryConnectionModel.findByIdAndUpdate(connectionId, {
          webhookStatus: 'Sync Failed',
          webhookError: err.message,
        });
      }

      res.status(400).json({
        success: false,
        message: err.message || 'Failed to register repository webhook on GitHub',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete repository webhook from GitHub
   * DELETE /api/v1/integrations/github/connections/:connectionId/webhook/unregister
   */
  public static async unregisterConnectionWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
      if (!connection) {
        res.status(404).json({
          success: false,
          message: 'Repository connection not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (connection.githubWebhookId && !config.githubMockMode) {
        const ghAccount = await GitHubConnectionModel.findOne({
          user: user.id,
          status: 'Connected',
        }).select('+accessTokenEncrypted');

        if (ghAccount && ghAccount.accessTokenEncrypted) {
          try {
            const accessToken = decryptToken(ghAccount.accessTokenEncrypted);
            await GitHubApiService.deleteRepositoryWebhook(
              accessToken,
              connection.githubOwner,
              connection.repositoryName,
              connection.githubWebhookId
            );
          } catch {
            // Proceed even if GitHub deletion call fails
          }
        }
      }

      connection.githubWebhookId = '';
      connection.webhookStatus = 'Disconnected';
      connection.webhookError = undefined;
      await connection.save();

      res.status(200).json({
        success: true,
        message: `Successfully unregistered webhook for repository '${connection.fullName}'`,
        data: {
          connection: connection.toPayload(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[Unregister Connection Webhook Error]: ${err.message}`);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to unregister repository webhook',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

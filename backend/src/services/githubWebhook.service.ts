import crypto from 'crypto';
import { Request } from 'express';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { GitHubWebhookEventModel } from '../models/githubWebhookEvent.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubIssueMappingModel } from '../models/githubIssueMapping.model';
import { GitHubPullRequestModel } from '../models/githubPullRequest.model';
import { GitHubCommitModel } from '../models/githubCommit.model';
import { TaskModel } from '../models/task.model';
import { NotificationService } from './notification.service';
import { ActivityService } from './activity.service';
import { broadcastGitHubSocketEvent } from '../socket/socketServer';

export interface IWebhookProcessResult {
  success: boolean;
  deliveryId: string;
  eventType: string;
  status: 'Processed' | 'Ignored' | 'Failed';
  message: string;
  repository?: string;
  error?: string;
}

export class GitHubWebhookService {
  /**
   * Verify X-Hub-Signature-256 header using HMAC SHA-256
   */
  public static verifySignature(rawBody: Buffer | string | undefined, signatureHeader?: string): boolean {
    // If webhook feature is disabled, return false
    if (!config.githubWebhookEnabled) {
      return false;
    }

    const secret = config.githubWebhookSecret;

    // In mock mode / dev mode without secret and without signature header, allow pass for local testing
    if (config.githubMockMode && !signatureHeader && (!secret || secret === 'taskflow_github_webhook_secret_dev')) {
      return true;
    }

    if (!signatureHeader || !rawBody) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8');
      const calculatedDigest = 'sha256=' + hmac.update(bodyBuffer).digest('hex');

      const sigBuffer = Buffer.from(signatureHeader, 'utf8');
      const calcBuffer = Buffer.from(calculatedDigest, 'utf8');

      if (sigBuffer.length !== calcBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, calcBuffer);
    } catch (err: any) {
      logger.error(`[GitHub Webhook Signature Verification Error]: ${err.message}`);
      return false;
    }
  }

  /**
   * Process incoming GitHub Webhook HTTP Request
   */
  public static async processWebhookRequest(req: Request): Promise<IWebhookProcessResult> {
    const deliveryId = (req.headers['x-github-delivery'] as string) || (req.headers['X-GitHub-Delivery'] as string) || `dev-del-${Date.now()}`;
    const eventType = (req.headers['x-github-event'] as string) || (req.headers['X-GitHub-Event'] as string) || 'ping';
    const signatureHeader = (req.headers['x-hub-signature-256'] as string) || (req.headers['X-Hub-Signature-256'] as string);

    // 1. Verify Signature
    const isValidSignature = this.verifySignature((req as any).rawBody, signatureHeader);
    if (!isValidSignature) {
      logger.warn(`[GitHub Webhook] Unauthorized or invalid signature for delivery: ${deliveryId}`);
      throw new Error('Unauthorized: Invalid GitHub Webhook HMAC SHA-256 signature');
    }

    const payload = req.body || {};
    const action = payload.action || '';
    const repoData = payload.repository || {};
    const repoId = repoData.id ? String(repoData.id) : '';
    const repoFullName = repoData.full_name || '';

    // Handle GitHub ping event
    if (eventType === 'ping') {
      logger.info(`[GitHub Webhook] Received ping event for repo: ${repoFullName || 'N/A'} (Delivery: ${deliveryId})`);
      return {
        success: true,
        deliveryId,
        eventType: 'ping',
        status: 'Processed',
        message: 'GitHub ping event received successfully',
        repository: repoFullName,
      };
    }

    // 2. Idempotency Check
    const existingLog = await GitHubWebhookEventModel.findOne({ deliveryId });
    if (existingLog) {
      if (existingLog.status === 'Processed' || existingLog.status === 'Processing' || existingLog.status === 'Ignored') {
        logger.info(`[GitHub Webhook] Idempotent hit for delivery ${deliveryId} - status: ${existingLog.status}`);
        return {
          success: true,
          deliveryId,
          eventType: existingLog.eventType,
          status: existingLog.status === 'Processing' ? 'Processed' : existingLog.status,
          message: `Webhook delivery ${deliveryId} already handled (${existingLog.status})`,
          repository: existingLog.repositoryFullName,
        };
      }
    }

    // Hash payload for verification
    const rawBuffer = (req as any).rawBody || Buffer.from(JSON.stringify(payload));
    const payloadHash = crypto.createHash('sha256').update(rawBuffer).digest('hex');

    // Create or update log document to 'Processing'
    const eventDoc = existingLog || new GitHubWebhookEventModel({
      deliveryId,
      eventType,
      action,
      repositoryId: repoId,
      repositoryFullName: repoFullName,
      payloadHash,
      sender: payload.sender ? {
        login: payload.sender.login || '',
        id: payload.sender.id,
        avatar_url: payload.sender.avatar_url || '',
      } : undefined,
      status: 'Processing',
      attempts: 1,
    });
    await eventDoc.save();

    try {
      // 3. Find connected TaskFlow repository
      const repoConn = await GitHubRepositoryConnectionModel.findOne({
        $or: [
          { githubRepositoryId: repoId },
          { fullName: repoFullName.toLowerCase() },
          { fullName: repoFullName },
        ],
      });

      if (!repoConn) {
        eventDoc.status = 'Ignored';
        eventDoc.ignoreReason = 'Repository is not connected to any TaskFlow project';
        eventDoc.processedAt = new Date();
        await eventDoc.save();

        logger.info(`[GitHub Webhook] Ignored event '${eventType}' for unconnected repo: ${repoFullName}`);
        return {
          success: true,
          deliveryId,
          eventType,
          status: 'Ignored',
          message: `Event ignored: Repository '${repoFullName}' is not connected to TaskFlow AI`,
          repository: repoFullName,
        };
      }

      if (repoConn.status === 'Disconnected') {
        eventDoc.status = 'Ignored';
        eventDoc.ignoreReason = 'Repository connection is disconnected';
        eventDoc.repositoryConnection = repoConn._id;
        eventDoc.organization = repoConn.organization;
        eventDoc.workspace = repoConn.workspace;
        eventDoc.project = repoConn.project;
        eventDoc.processedAt = new Date();
        await eventDoc.save();

        return {
          success: true,
          deliveryId,
          eventType,
          status: 'Ignored',
          message: `Event ignored: Repository connection '${repoFullName}' is disconnected`,
          repository: repoFullName,
        };
      }

      // Populate log with connection details
      eventDoc.repositoryConnection = repoConn._id;
      eventDoc.organization = repoConn.organization;
      eventDoc.workspace = repoConn.workspace;
      eventDoc.project = repoConn.project;

      // 4. Dispatch Event
      switch (eventType) {
        case 'push':
          await this.handlePushEvent(payload, repoConn);
          break;
        case 'issues':
          await this.handleIssueEvent(payload, repoConn);
          break;
        case 'issue_comment':
          await this.handleIssueCommentEvent(payload, repoConn);
          break;
        case 'pull_request':
          await this.handlePullRequestEvent(payload, repoConn);
          break;
        case 'pull_request_review':
          await this.handlePullRequestReviewEvent(payload, repoConn);
          break;
        case 'repository':
          await this.handleRepositoryEvent(payload, repoConn);
          break;
        case 'release':
          await this.handleReleaseEvent(payload, repoConn);
          break;
        default:
          logger.info(`[GitHub Webhook] Received unhandled event type '${eventType}' for repo ${repoFullName}`);
          eventDoc.status = 'Ignored';
          eventDoc.ignoreReason = `Unhandled event type: ${eventType}`;
          eventDoc.processedAt = new Date();
          await eventDoc.save();
          return {
            success: true,
            deliveryId,
            eventType,
            status: 'Ignored',
            message: `Event type '${eventType}' acknowledged and ignored`,
            repository: repoFullName,
          };
      }

      // Mark webhook connection healthy & delivery processed
      repoConn.lastWebhookAt = new Date();
      repoConn.lastWebhookSuccessAt = new Date();
      repoConn.webhookStatus = 'Connected';
      repoConn.webhookError = undefined;
      await repoConn.save();

      eventDoc.status = 'Processed';
      eventDoc.processedAt = new Date();
      await eventDoc.save();

      logger.info(`[GitHub Webhook] Successfully processed '${eventType}' (${action}) for ${repoFullName}`);
      return {
        success: true,
        deliveryId,
        eventType,
        status: 'Processed',
        message: `Successfully processed GitHub webhook event '${eventType}'`,
        repository: repoFullName,
      };
    } catch (err: any) {
      logger.error(`[GitHub Webhook Error] Processing failed for delivery ${deliveryId} (${eventType}): ${err.message}`);

      eventDoc.status = 'Failed';
      eventDoc.error = err.message;
      eventDoc.processedAt = new Date();
      await eventDoc.save();

      if (eventDoc.repositoryConnection) {
        await GitHubRepositoryConnectionModel.findByIdAndUpdate(eventDoc.repositoryConnection, {
          webhookStatus: 'Sync Failed',
          webhookError: err.message,
          lastWebhookAt: new Date(),
          $inc: { failedWebhookCount: 1 },
        });
      }

      return {
        success: false,
        deliveryId,
        eventType,
        status: 'Failed',
        message: `Webhook processing error: ${err.message}`,
        repository: repoFullName,
        error: err.message,
      };
    }
  }

  /**
   * Handle 'push' event
   */
  private static async handlePushEvent(payload: any, repoConn: any) {
    const ref = payload.ref || '';
    const branchName = ref.replace('refs/heads/', '');
    const pusherName = payload.pusher?.name || payload.sender?.login || 'GitHub User';
    const commits = payload.commits || [];

    // Update repository connection pushed_at
    if (payload.repository?.pushed_at) {
      repoConn.githubPushedAt = new Date(payload.repository.pushed_at * 1000);
    } else {
      repoConn.githubPushedAt = new Date();
    }
    if (payload.repository?.default_branch) {
      repoConn.defaultBranch = payload.repository.default_branch;
    }
    repoConn.lastSyncedAt = new Date();
    await repoConn.save();

    // Store commits if present
    for (const c of commits) {
      const sha = c.id;
      if (!sha) continue;

      const existingCommit = await GitHubCommitModel.findOne({
        repositoryConnection: repoConn._id,
        sha,
      });

      if (!existingCommit) {
        // Parse related task keys e.g. "Fixes TASK-12" or "TF-10"
        let relatedTaskObj: any = null;
        const taskKeyMatch = c.message.match(/([A-Z0-9]+-\d+)/i);
        if (taskKeyMatch) {
          const taskKey = taskKeyMatch[1].toUpperCase();
          const foundTask = await TaskModel.findOne({
            project: repoConn.project,
            taskKey,
          });
          if (foundTask) {
            relatedTaskObj = {
              id: foundTask._id,
              taskKey: foundTask.taskKey,
              title: foundTask.title,
              status: foundTask.status,
            };
          }
        }

        await GitHubCommitModel.create({
          repositoryConnection: repoConn._id,
          githubCommitSha: sha,
          message: c.message || '',
          authorName: c.author?.name || pusherName,
          authorEmail: c.author?.email || '',
          authorLogin: c.author?.username || payload.sender?.login || pusherName,
          authorAvatarUrl: payload.sender?.avatar_url || '',
          committerName: c.committer?.name || pusherName,
          committerEmail: c.committer?.email || '',
          committerLogin: c.committer?.username || payload.sender?.login || pusherName,
          commitUrl: c.url || `https://github.com/${repoConn.fullName}/commit/${sha}`,
          branchName,
          committedAt: c.timestamp ? new Date(c.timestamp) : new Date(),
        });
      }
    }

    // Broadcast Realtime Socket Event
    broadcastGitHubSocketEvent('github:commit:received', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      repositoryConnectionId: repoConn._id.toString(),
      repositoryFullName: repoConn.fullName,
      branchName,
      pusherName,
      commitCount: commits.length,
      headCommitMessage: payload.head_commit?.message || '',
    });

    // Record Activity Log
    await ActivityService.recordActivity({
      organizationId: repoConn.organization.toString(),
      workspaceId: repoConn.workspace ? repoConn.workspace.toString() : null,
      projectId: repoConn.project ? repoConn.project.toString() : null,
      userId: repoConn.connectedBy.toString(),
      action: 'github.commit.received',
      entityType: 'github_repository',
      entityId: repoConn._id.toString(),
      metadata: {
        title: `Pushed ${commits.length} commit(s) to ${branchName}`,
        description: `${pusherName} pushed ${commits.length} commit(s) to branch '${branchName}' in ${repoConn.fullName}`,
        branchName,
        commitCount: commits.length,
        pusherName,
        headSha: payload.after,
      },
    });
  }

  /**
   * Handle 'issues' event
   */
  private static async handleIssueEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const issueData = payload.issue;
    if (!issueData) return;

    const issueNumber = issueData.number;
    const issueTitle = issueData.title || '';
    const issueBody = issueData.body || '';
    const issueState = issueData.state === 'closed' ? 'closed' : 'open';

    // Find existing issue mapping
    let mapping = await GitHubIssueMappingModel.findOne({
      repositoryConnection: repoConn._id,
      githubIssueNumber: issueNumber,
    });

    if (!mapping) {
      // Create new issue mapping
      mapping = new GitHubIssueMappingModel({
        organization: repoConn.organization,
        workspace: repoConn.workspace,
        project: repoConn.project,
        repositoryConnection: repoConn._id,
        githubIssueId: issueData.id,
        githubIssueNumber: issueNumber,
        githubNodeId: issueData.node_id || '',
        githubTitle: issueTitle,
        githubBody: issueBody,
        githubState: issueState,
        githubStateReason: issueData.state_reason || null,
        githubAuthor: issueData.user?.login || 'unknown',
        githubAuthorAvatar: issueData.user?.avatar_url || '',
        githubUrl: issueData.html_url || `https://github.com/${repoConn.fullName}/issues/${issueNumber}`,
        githubLabels: (issueData.labels || []).map((lbl: any) => ({
          id: lbl.id,
          name: typeof lbl === 'string' ? lbl : lbl.name,
          color: lbl.color || '888888',
          description: lbl.description || '',
        })),
        githubAssignees: (issueData.assignees || []).map((a: any) => a.login),
        githubCommentsCount: issueData.comments || 0,
        githubCreatedAt: issueData.created_at ? new Date(issueData.created_at) : new Date(),
        githubUpdatedAt: issueData.updated_at ? new Date(issueData.updated_at) : new Date(),
        githubClosedAt: issueData.closed_at ? new Date(issueData.closed_at) : null,
        relationshipType: 'Imported From GitHub',
        lastSyncedAt: new Date(),
        syncStatus: 'Synced',
      });
    } else {
      // Update existing issue mapping
      mapping.githubTitle = issueTitle;
      mapping.githubBody = issueBody;
      mapping.githubState = issueState;
      mapping.githubStateReason = issueData.state_reason || null;
      mapping.githubLabels = (issueData.labels || []).map((lbl: any) => ({
        id: lbl.id,
        name: typeof lbl === 'string' ? lbl : lbl.name,
        color: lbl.color || '888888',
        description: lbl.description || '',
      }));
      mapping.githubAssignees = (issueData.assignees || []).map((a: any) => a.login);
      mapping.githubCommentsCount = issueData.comments || 0;
      mapping.githubUpdatedAt = issueData.updated_at ? new Date(issueData.updated_at) : new Date();
      mapping.githubClosedAt = issueData.closed_at ? new Date(issueData.closed_at) : null;
      mapping.lastSyncedAt = new Date();
      mapping.syncStatus = 'Synced';
    }

    await mapping.save();

    // If mapped to a task, update task status or title if appropriate
    let taskIdStr: string | undefined;
    if (mapping.task) {
      taskIdStr = mapping.task.toString();
      const task = await TaskModel.findById(mapping.task);
      if (task) {
        if (action === 'closed' && task.status !== 'Done') {
          task.status = 'Done';
          await task.save();
        } else if (action === 'reopened' && task.status === 'Done') {
          task.status = 'In Progress';
          await task.save();
        }
      }
    }

    // Broadcast Realtime Event
    broadcastGitHubSocketEvent('github:issue:updated', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      taskId: taskIdStr,
      connectionId: repoConn._id.toString(),
      issueNumber,
      action,
      title: issueTitle,
      state: issueState,
    });

    // Activity Log
    await ActivityService.recordActivity({
      organizationId: repoConn.organization.toString(),
      workspaceId: repoConn.workspace ? repoConn.workspace.toString() : null,
      projectId: repoConn.project ? repoConn.project.toString() : null,
      taskId: mapping.task ? mapping.task.toString() : null,
      userId: repoConn.connectedBy.toString(),
      action: 'github.issue.updated',
      entityType: 'task',
      entityId: mapping.task ? mapping.task.toString() : repoConn._id.toString(),
      metadata: {
        title: `GitHub Issue #${issueNumber} ${action}`,
        description: `Issue #${issueNumber} "${issueTitle}" was ${action} on GitHub (${repoConn.fullName})`,
        issueNumber,
        action,
        issueState,
      },
    });
  }

  /**
   * Handle 'issue_comment' event
   */
  private static async handleIssueCommentEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const issueData = payload.issue;
    const commentData = payload.comment;
    if (!issueData || !commentData) return;

    const issueNumber = issueData.number;

    const mapping = await GitHubIssueMappingModel.findOne({
      repositoryConnection: repoConn._id,
      githubIssueNumber: issueNumber,
    });

    if (mapping) {
      mapping.githubCommentsCount = issueData.comments || (mapping.githubCommentsCount + 1);
      mapping.githubUpdatedAt = new Date();
      mapping.lastSyncedAt = new Date();
      await mapping.save();
    }

    // Broadcast Realtime Event
    broadcastGitHubSocketEvent('github:issue:updated', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      taskId: mapping?.task ? mapping.task.toString() : undefined,
      connectionId: repoConn._id.toString(),
      issueNumber,
      action: `comment_${action}`,
      commentAuthor: commentData.user?.login || 'unknown',
    });
  }

  /**
   * Handle 'pull_request' event
   */
  private static async handlePullRequestEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const prData = payload.pull_request;
    if (!prData) return;

    const prNumber = prData.number;
    const prTitle = prData.title || '';
    const prBody = prData.body || '';
    const isMerged = !!prData.merged;
    const prState: 'open' | 'closed' | 'merged' = isMerged ? 'merged' : prData.state === 'closed' ? 'closed' : 'open';

    let prDoc = await GitHubPullRequestModel.findOne({
      repositoryConnection: repoConn._id,
      githubPullRequestNumber: prNumber,
    });

    if (!prDoc) {
      prDoc = new GitHubPullRequestModel({
        organization: repoConn.organization,
        workspace: repoConn.workspace,
        project: repoConn.project,
        repositoryConnection: repoConn._id,
        githubPullRequestId: prData.id,
        githubPullRequestNumber: prNumber,
        nodeId: prData.node_id || '',
        title: prTitle,
        body: prBody,
        state: prState,
        stateReason: prData.state_reason || null,
        draft: !!prData.draft,
        merged: isMerged,
        mergeable: prData.mergeable ?? true,
        author: {
          login: prData.user?.login || 'unknown',
          name: prData.user?.name || '',
          avatar_url: prData.user?.avatar_url || '',
          html_url: prData.user?.html_url || '',
        },
        reviewers: (prData.requested_reviewers || []).map((r: any) => ({
          login: r.login,
          name: r.name || '',
          avatar_url: r.avatar_url || '',
          state: 'PENDING',
        })),
        reviewStatus: isMerged ? 'Merged' : prState === 'closed' ? 'Closed' : 'Pending',
        sourceBranch: prData.head?.ref || 'feature',
        targetBranch: prData.base?.ref || 'main',
        sourceSha: prData.head?.sha || '',
        targetSha: prData.base?.sha || '',
        githubUrl: prData.html_url || `https://github.com/${repoConn.fullName}/pull/${prNumber}`,
        createdAtGithub: prData.created_at ? new Date(prData.created_at) : new Date(),
        updatedAtGithub: prData.updated_at ? new Date(prData.updated_at) : new Date(),
        closedAtGithub: prData.closed_at ? new Date(prData.closed_at) : null,
        mergedAtGithub: prData.merged_at ? new Date(prData.merged_at) : null,
        lastSyncedAt: new Date(),
        syncStatus: 'Synced',
      });
    } else {
      prDoc.title = prTitle;
      prDoc.body = prBody;
      prDoc.state = prState;
      prDoc.draft = !!prData.draft;
      prDoc.merged = isMerged;
      prDoc.mergeable = prData.mergeable ?? prDoc.mergeable;
      prDoc.sourceBranch = prData.head?.ref || prDoc.sourceBranch;
      prDoc.targetBranch = prData.base?.ref || prDoc.targetBranch;
      prDoc.sourceSha = prData.head?.sha || prDoc.sourceSha;
      prDoc.targetSha = prData.base?.sha || prDoc.targetSha;
      prDoc.updatedAtGithub = prData.updated_at ? new Date(prData.updated_at) : new Date();
      prDoc.closedAtGithub = prData.closed_at ? new Date(prData.closed_at) : null;
      prDoc.mergedAtGithub = prData.merged_at ? new Date(prData.merged_at) : null;
      prDoc.reviewStatus = isMerged ? 'Merged' : prState === 'closed' ? 'Closed' : prDoc.reviewStatus;
      prDoc.lastSyncedAt = new Date();
      prDoc.syncStatus = 'Synced';
    }

    await prDoc.save();

    // If PR is linked to a task and merged, update task if applicable
    if (prDoc.task && isMerged) {
      const task = await TaskModel.findById(prDoc.task);
      if (task && task.status !== 'Done') {
        task.status = 'Done';
        await task.save();
      }
    }

    // Broadcast Realtime Socket Event
    broadcastGitHubSocketEvent('github:pull-request:updated', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      connectionId: repoConn._id.toString(),
      prNumber,
      action,
      title: prTitle,
      state: prState,
      merged: isMerged,
    });

    // Activity Log
    await ActivityService.recordActivity({
      organizationId: repoConn.organization.toString(),
      workspaceId: repoConn.workspace ? repoConn.workspace.toString() : null,
      projectId: repoConn.project ? repoConn.project.toString() : null,
      userId: repoConn.connectedBy.toString(),
      action: 'github.pull_request.updated',
      entityType: 'github_repository',
      entityId: repoConn._id.toString(),
      metadata: {
        title: `Pull Request #${prNumber} ${action}`,
        description: `PR #${prNumber} "${prTitle}" was ${action} in ${repoConn.fullName}`,
        prNumber,
        action,
        state: prState,
        merged: isMerged,
      },
    });
  }

  /**
   * Handle 'pull_request_review' event
   */
  private static async handlePullRequestReviewEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const prData = payload.pull_request;
    const reviewData = payload.review;
    if (!prData || !reviewData) return;

    const prNumber = prData.number;
    const reviewState = reviewData.state; // APPROVED, CHANGES_REQUESTED, COMMENTED, etc.

    const prDoc = await GitHubPullRequestModel.findOne({
      repositoryConnection: repoConn._id,
      githubPullRequestNumber: prNumber,
    });

    if (prDoc) {
      let mappedStatus: 'Approved' | 'Changes Requested' | 'Pending' | 'Mixed' = 'Pending';
      if (reviewState === 'APPROVED') mappedStatus = 'Approved';
      else if (reviewState === 'CHANGES_REQUESTED') mappedStatus = 'Changes Requested';

      prDoc.reviewStatus = mappedStatus;
      prDoc.lastSyncedAt = new Date();
      await prDoc.save();
    }

    // Broadcast Realtime Event
    broadcastGitHubSocketEvent('github:pull-request:updated', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      connectionId: repoConn._id.toString(),
      prNumber,
      action: `review_${action}`,
      reviewState,
      reviewer: reviewData.user?.login || 'unknown',
    });
  }

  /**
   * Handle 'repository' event
   */
  private static async handleRepositoryEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const repoData = payload.repository;
    if (!repoData) return;

    if (action === 'renamed') {
      repoConn.repositoryName = repoData.name;
      repoConn.fullName = repoData.full_name;
      repoConn.htmlUrl = repoData.html_url;
      repoConn.cloneUrl = repoData.clone_url || repoConn.cloneUrl;
      repoConn.sshUrl = repoData.ssh_url || repoConn.sshUrl;
    } else if (action === 'archived') {
      repoConn.isArchived = true;
      repoConn.status = 'Archived';
    } else if (action === 'unarchived') {
      repoConn.isArchived = false;
      repoConn.status = 'Connected';
    } else if (action === 'deleted') {
      repoConn.status = 'Disconnected';
      repoConn.syncError = 'Repository was deleted on GitHub';
    }

    repoConn.lastSyncedAt = new Date();
    await repoConn.save();

    broadcastGitHubSocketEvent('github:repository:updated', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      connectionId: repoConn._id.toString(),
      action,
      fullName: repoConn.fullName,
    });
  }

  /**
   * Handle 'release' event
   */
  private static async handleReleaseEvent(payload: any, repoConn: any) {
    const action = payload.action;
    const releaseData = payload.release;
    if (!releaseData) return;

    broadcastGitHubSocketEvent('github:release:published', {
      projectId: repoConn.project.toString(),
      organizationId: repoConn.organization.toString(),
      connectionId: repoConn._id.toString(),
      action,
      tagName: releaseData.tag_name,
      name: releaseData.name || releaseData.tag_name,
      htmlUrl: releaseData.html_url,
    });
  }
}

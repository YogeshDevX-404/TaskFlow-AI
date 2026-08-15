import { Types } from 'mongoose';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubPullRequestModel, IGitHubPullRequestPayload } from '../models/githubPullRequest.model';
import { GitHubIssueMappingModel } from '../models/githubIssueMapping.model';
import { TaskModel } from '../models/task.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { decryptToken } from '../utils/encryption.util';
import { GitHubProvider } from './githubProvider.service';
import {
  IFetchPullRequestsOptions,
  ICreatePullRequestOptions,
  IGitHubPullRequest,
  IGitHubPullRequestFile,
  IGitHubPullRequestReview,
  IGitHubCommit,
} from './githubApi.service';
import { ActivityService } from './activity.service';

export class GitHubPullRequestService {
  /**
   * Helper to retrieve decrypted token or mock token for user
   */
  private static async getAccessTokenForUser(userId: string): Promise<string> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    }).select('+accessTokenEncrypted');

    if (!connection) {
      if (GitHubProvider.isMockMode()) {
        return 'mock_access_token_dev_taskflow';
      }
      throw new Error('No connected GitHub account found. Please connect your GitHub account in Settings first.');
    }

    if (connection.accessTokenEncrypted && connection.accessTokenEncrypted !== 'REVOKED') {
      try {
        return decryptToken(connection.accessTokenEncrypted);
      } catch {
        // Fallback for mock mode / encryption issues
      }
    }

    if (GitHubProvider.isMockMode()) {
      return 'mock_access_token_dev_taskflow';
    }

    throw new Error('GitHub access token has been revoked. Please reconnect your GitHub account.');
  }

  /**
   * Helper to validate user membership in connection project organization
   */
  private static async validateConnectionAccess(
    userId: string,
    connectionId: string
  ): Promise<{ connection: any; token: string }> {
    if (!Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid repository connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findOne({
      _id: connectionId,
      status: { $ne: 'Disconnected' },
    });

    if (!connection) {
      throw new Error('Connected repository not found or has been disconnected');
    }

    const member = await OrganizationMember.findOne({
      organization: connection.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized: You do not belong to the organization associated with this repository');
    }

    const token = await this.getAccessTokenForUser(userId);
    return { connection, token };
  }

  /**
   * Helper to upsert a GitHub pull request into local database
   */
  private static async upsertPullRequestRecord(
    connection: any,
    prData: IGitHubPullRequest,
    taskId?: string | null,
    createdByUserId?: string
  ): Promise<any> {
    const isMerged = !!prData.merged || !!prData.merged_at;
    const prState = isMerged ? 'merged' : prData.state === 'closed' ? 'closed' : 'open';

    // Auto-detect reference to task or GitHub Issue
    let linkedTaskId = taskId ? new Types.ObjectId(taskId) : null;
    let linkedIssueId: Types.ObjectId | null = null;

    if (!linkedTaskId) {
      // Extract task key e.g. "DEV-101" from title or body
      const taskMatch = (prData.title + ' ' + prData.body).match(/([A-Z]{2,10}-\d+)/);
      if (taskMatch) {
        const foundTask = await TaskModel.findOne({
          project: connection.project,
          $or: [{ key: taskMatch[1] }, { key: taskMatch[1].toUpperCase() }],
        });
        if (foundTask) {
          linkedTaskId = foundTask._id as Types.ObjectId;
        }
      }
    }

    // Extract issue number e.g. "#12" or "closes #12"
    const issueMatch = (prData.title + ' ' + prData.body).match(/#(\d+)/);
    if (issueMatch) {
      const issueNum = parseInt(issueMatch[1], 10);
      const foundIssue = await GitHubIssueMappingModel.findOne({
        repositoryConnection: connection._id,
        githubIssueNumber: issueNum,
      });
      if (foundIssue) {
        linkedIssueId = foundIssue._id as Types.ObjectId;
      }
    }

    const updateDoc: any = {
      organization: connection.organization,
      workspace: connection.workspace,
      project: connection.project,
      repositoryConnection: connection._id,
      githubPullRequestId: prData.id,
      githubPullRequestNumber: prData.number,
      nodeId: prData.node_id || '',
      title: prData.title,
      body: prData.body || '',
      state: prState,
      stateReason: prData.state_reason || null,
      draft: !!prData.draft,
      merged: isMerged,
      mergeable: prData.mergeable !== false,
      author: {
        login: prData.user.login,
        name: prData.user.name || prData.user.login,
        avatar_url: prData.user.avatar_url,
        html_url: prData.user.html_url || `https://github.com/${prData.user.login}`,
      },
      reviewers: (prData.reviews || []).map((r) => ({
        login: r.user.login,
        name: r.user.name || r.user.login,
        avatar_url: r.user.avatar_url,
        state: r.state,
      })),
      reviewStatus: prData.reviewStatus || (isMerged ? 'Merged' : prData.state === 'closed' ? 'Closed' : 'Pending'),
      sourceBranch: prData.head.ref,
      targetBranch: prData.base.ref,
      sourceSha: prData.head.sha || '',
      targetSha: prData.base.sha || '',
      githubUrl: prData.html_url,
      createdAtGithub: prData.created_at ? new Date(prData.created_at) : new Date(),
      updatedAtGithub: prData.updated_at ? new Date(prData.updated_at) : new Date(),
      closedAtGithub: prData.closed_at ? new Date(prData.closed_at) : null,
      mergedAtGithub: prData.merged_at ? new Date(prData.merged_at) : null,
      lastSyncedAt: new Date(),
      syncStatus: 'Synced',
    };

    if (linkedTaskId) updateDoc.task = linkedTaskId;
    if (linkedIssueId) updateDoc.githubIssue = linkedIssueId;

    const record = await GitHubPullRequestModel.findOneAndUpdate(
      {
        repositoryConnection: connection._id,
        githubPullRequestNumber: prData.number,
        project: connection.project,
      },
      {
        $set: updateDoc,
        $setOnInsert: {
          createdBy: createdByUserId && Types.ObjectId.isValid(createdByUserId) ? new Types.ObjectId(createdByUserId) : null,
        },
      },
      { upsert: true, new: true }
    );

    return record;
  }

  /**
   * Get Pull Requests for a repository with pagination, search, and filters
   */
  public static async getPullRequests(
    userId: string,
    connectionId: string,
    options: IFetchPullRequestsOptions = {}
  ): Promise<{
    pullRequests: IGitHubPullRequestPayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const result = await GitHubProvider.getPullRequests(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      options
    );

    // Asynchronously upsert records into local DB
    for (const pr of result.pullRequests) {
      await this.upsertPullRequestRecord(connection, pr, null, userId).catch(() => {});
    }

    // Fetch local DB records to include TaskFlow task associations
    const localRecords = await GitHubPullRequestModel.find({
      repositoryConnection: connection._id,
      githubPullRequestNumber: { $in: result.pullRequests.map((p) => p.number) },
    }).populate('task', 'title key status priority');

    const localMap = new Map<number, any>();
    localRecords.forEach((rec) => {
      localMap.set(rec.githubPullRequestNumber, rec);
    });

    const payloads: IGitHubPullRequestPayload[] = result.pullRequests.map((pr) => {
      const dbRec = localMap.get(pr.number);
      if (dbRec) {
        const payload = dbRec.toPayload();
        // Return populated task info if exists
        if (dbRec.task && typeof dbRec.task === 'object' && dbRec.task._id) {
          payload.task = dbRec.task._id.toString();
        }
        return payload;
      }
      return {
        id: `github-${pr.id}`,
        organization: connection.organization.toString(),
        workspace: connection.workspace.toString(),
        project: connection.project.toString(),
        repositoryConnection: connection._id.toString(),
        task: null,
        githubIssue: null,
        githubPullRequestId: pr.id,
        githubPullRequestNumber: pr.number,
        nodeId: pr.node_id,
        title: pr.title,
        body: pr.body,
        state: pr.merged ? 'merged' : pr.state === 'closed' ? 'closed' : 'open',
        draft: pr.draft,
        merged: pr.merged,
        mergeable: pr.mergeable !== false,
        author: pr.user,
        reviewers: (pr.reviews || []).map((r) => ({
          login: r.user.login,
          name: r.user.name || r.user.login,
          avatar_url: r.user.avatar_url,
          state: r.state,
        })),
        reviewStatus: pr.reviewStatus || 'Pending',
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        sourceSha: pr.head.sha,
        targetSha: pr.base.sha,
        githubUrl: pr.html_url,
        createdAtGithub: pr.created_at,
        updatedAtGithub: pr.updated_at,
        closedAtGithub: pr.closed_at,
        mergedAtGithub: pr.merged_at,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: 'Synced',
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
      };
    });

    return {
      pullRequests: payloads,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get single Pull Request details
   */
  public static async getPullRequestDetails(
    userId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestPayload> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const pr = await GitHubProvider.getPullRequest(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      prNumber
    );

    const dbRecord = await this.upsertPullRequestRecord(connection, pr, null, userId);
    return dbRecord.toPayload();
  }

  /**
   * Get Pull Request changed files
   */
  public static async getPullRequestFiles(
    userId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestFile[]> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    return GitHubProvider.getPullRequestFiles(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      prNumber
    );
  }

  /**
   * Get Pull Request commits
   */
  public static async getPullRequestCommits(
    userId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubCommit[]> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    return GitHubProvider.getPullRequestCommits(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      prNumber
    );
  }

  /**
   * Get Pull Request reviews
   */
  public static async getPullRequestReviews(
    userId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestReview[]> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    return GitHubProvider.getPullRequestReviews(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      prNumber
    );
  }

  /**
   * Link an existing Pull Request to a TaskFlow Task
   */
  public static async linkPullRequestToTask(
    userId: string,
    taskId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestPayload> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID provided');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const prData = await GitHubProvider.getPullRequest(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      prNumber
    );

    const record = await this.upsertPullRequestRecord(connection, prData, taskId, userId);

    await ActivityService.recordActivity({
      action: 'github.pull_request.linked',
      entityType: 'github_pull_request',
      entityId: record._id.toString(),
      userId,
      organizationId: connection.organization.toString(),
      projectId: connection.project.toString(),
      taskId,
      metadata: {
        title: 'Linked GitHub Pull Request',
        description: `Linked PR #${prData.number} "${prData.title}" to task ${task.taskKey || task.title}`,
        prNumber: prData.number,
        prTitle: prData.title,
        repoName: connection.repositoryName,
      },
    });

    return record.toPayload();
  }

  /**
   * Unlink a Pull Request from a TaskFlow Task
   */
  public static async unlinkPullRequestFromTask(
    userId: string,
    taskId: string,
    prId: string
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(prId)) {
      throw new Error('Invalid parameter IDs provided');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const prRecord = await GitHubPullRequestModel.findOne({
      _id: prId,
      task: taskId,
    });

    if (!prRecord) {
      throw new Error('Pull request mapping not found or already unlinked');
    }

    const member = await OrganizationMember.findOne({
      organization: prRecord.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized: You do not belong to the organization associated with this task');
    }

    prRecord.task = null;
    await prRecord.save();

    await ActivityService.recordActivity({
      action: 'github.pull_request.unlinked',
      entityType: 'github_pull_request',
      entityId: prRecord._id.toString(),
      userId,
      organizationId: prRecord.organization.toString(),
      projectId: prRecord.project.toString(),
      taskId,
      metadata: {
        title: 'Unlinked GitHub Pull Request',
        description: `Unlinked PR #${prRecord.githubPullRequestNumber} from task ${task.taskKey || task.title}`,
        prNumber: prRecord.githubPullRequestNumber,
        prTitle: prRecord.title,
      },
    });

    return { message: 'Pull Request unlinked successfully' };
  }

  /**
   * Create a new Pull Request on GitHub from a TaskFlow Task
   */
  public static async createPullRequestFromTask(
    userId: string,
    taskId: string,
    payload: {
      connectionId: string;
      sourceBranch: string;
      targetBranch: string;
      title: string;
      body?: string;
      draft?: boolean;
    }
  ): Promise<IGitHubPullRequestPayload> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID provided');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const { connection, token } = await this.validateConnectionAccess(userId, payload.connectionId);

    const prTitle = payload.title.trim() || `feat(${task.taskKey || 'task'}): ${task.title}`;
    const prBody =
      payload.body ||
      `Created from TaskFlow AI task **${task.taskKey || task.title}**.\n\n${task.description || ''}`;

    const createdPR = await GitHubProvider.createPullRequest(
      token,
      connection.repositoryOwner,
      connection.repositoryName,
      {
        title: prTitle,
        body: prBody,
        head: payload.sourceBranch,
        base: payload.targetBranch,
        draft: payload.draft || false,
      }
    );

    const record = await this.upsertPullRequestRecord(connection, createdPR, taskId, userId);

    await ActivityService.recordActivity({
      action: 'github.pull_request.created',
      entityType: 'github_pull_request',
      entityId: record._id.toString(),
      userId,
      organizationId: connection.organization.toString(),
      projectId: connection.project.toString(),
      taskId,
      metadata: {
        title: 'Created GitHub Pull Request',
        description: `Created PR #${createdPR.number} "${createdPR.title}" on ${connection.repositoryName} from task ${task.taskKey || task.title}`,
        prNumber: createdPR.number,
        prTitle: createdPR.title,
        sourceBranch: payload.sourceBranch,
        targetBranch: payload.targetBranch,
      },
    });

    return record.toPayload();
  }

  /**
   * Manually synchronize Pull Request state from GitHub
   */
  public static async syncPullRequest(
    userId: string,
    connectionId: string,
    prNumber: number
  ): Promise<IGitHubPullRequestPayload> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    try {
      const prData = await GitHubProvider.getPullRequest(
        token,
        connection.repositoryOwner,
        connection.repositoryName,
        prNumber
      );

      const record = await this.upsertPullRequestRecord(connection, prData, null, userId);

      await ActivityService.recordActivity({
        action: 'github.pull_request.synced',
        entityType: 'github_pull_request',
        entityId: record._id.toString(),
        userId,
        organizationId: connection.organization.toString(),
        projectId: connection.project.toString(),
        metadata: {
          title: 'Synced GitHub Pull Request',
          description: `Synchronized PR #${prNumber} state from GitHub`,
          prNumber,
          repoName: connection.repositoryName,
        },
      });

      return record.toPayload();
    } catch (err: any) {
      await ActivityService.recordActivity({
        action: 'github.pull_request.sync_failed',
        entityType: 'github_repository',
        entityId: connection._id.toString(),
        userId,
        organizationId: connection.organization.toString(),
        projectId: connection.project.toString(),
        metadata: {
          title: 'Failed to Sync GitHub Pull Request',
          description: `Failed to sync PR #${prNumber}: ${err.message}`,
          prNumber,
          error: err.message,
        },
      }).catch(() => {});

      throw err;
    }
  }

  /**
   * Get all Pull Requests linked to a specific TaskFlow Task
   */
  public static async getTaskPullRequests(
    userId: string,
    taskId: string
  ): Promise<IGitHubPullRequestPayload[]> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID provided');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const member = await OrganizationMember.findOne({
      organization: task.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized: You do not belong to the organization associated with this task');
    }

    const prRecords = await GitHubPullRequestModel.find({
      task: taskId,
    }).sort({ createdAt: -1 });

    return prRecords.map((r) => r.toPayload());
  }
}

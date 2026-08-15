import { Types } from 'mongoose';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubBranchModel } from '../models/githubBranch.model';
import { GitHubCommitModel } from '../models/githubCommit.model';
import { GitHubIssueMappingModel } from '../models/githubIssueMapping.model';
import { TaskModel } from '../models/task.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { decryptToken } from '../utils/encryption.util';
import { GitHubProvider } from './githubProvider.service';
import {
  IFetchBranchesOptions,
  IGitHubBranch,
  IFetchCommitsOptions,
  IGitHubCommit,
  IGitHubCommitCompare,
} from './githubApi.service';
import { ActivityService } from './activity.service';

export class GitHubBranchCommitService {
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
      // Fallback for mock mode or default user
      if (GitHubProvider.isMockMode()) {
        return 'mock_access_token_dev_taskflow';
      }
      throw new Error('No connected GitHub account found. Please connect your GitHub account in Settings first.');
    }

    if (connection.accessTokenEncrypted && connection.accessTokenEncrypted !== 'REVOKED') {
      try {
        return decryptToken(connection.accessTokenEncrypted);
      } catch {
        // Ignore decryption error in mock environment
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
      throw new Error('Unauthorized access to repository branch/commit data');
    }

    const token = await this.getAccessTokenForUser(userId);
    return { connection, token };
  }

  /**
   * Resolve related Task and GitHub Issue references from commit message
   */
  private static async enrichCommitReferences(
    commit: IGitHubCommit,
    projectId: string,
    connectionId: string
  ): Promise<IGitHubCommit> {
    const enriched = { ...commit };
    const msg = commit.message || '';

    // 1. Check for TaskKey references e.g. DEV-101, TASK-12, PROJ-5
    const taskKeyMatch = msg.match(/([A-Z]{2,10}-\d+)/i);
    if (taskKeyMatch && taskKeyMatch[1]) {
      const taskKeyUpper = taskKeyMatch[1].toUpperCase();
      const matchedTask = await TaskModel.findOne({
        project: projectId,
        taskKey: taskKeyUpper,
      }).select('_id taskKey title status');

      if (matchedTask) {
        enriched.relatedTask = {
          id: matchedTask._id.toString(),
          taskKey: matchedTask.taskKey,
          title: matchedTask.title,
          status: matchedTask.status,
        };
      }
    }

    // 2. Check for GitHub Issue references e.g. #1 or Fixes #2 or Closes #3
    const issueMatch = msg.match(/(?:#|issue\s*#?)(\d+)/i);
    if (issueMatch && issueMatch[1]) {
      const issueNum = parseInt(issueMatch[1], 10);
      const matchedMapping = await GitHubIssueMappingModel.findOne({
        repositoryConnection: connectionId,
        githubIssueNumber: issueNum,
      });

      if (matchedMapping) {
        enriched.relatedIssue = {
          issueNumber: matchedMapping.githubIssueNumber,
          title: matchedMapping.githubTitle,
          state: matchedMapping.githubState,
          url: matchedMapping.githubUrl,
        };

        // If no relatedTask was found by key, attach mapped task if exists
        if (!enriched.relatedTask && matchedMapping.task) {
          const taskDoc = await TaskModel.findById(matchedMapping.task).select('_id taskKey title status');
          if (taskDoc) {
            enriched.relatedTask = {
              id: taskDoc._id.toString(),
              taskKey: taskDoc.taskKey,
              title: taskDoc.title,
              status: taskDoc.status,
            };
          }
        }
      }
    }

    return enriched;
  }

  /**
   * Get branches for a repository
   */
  public static async getBranches(
    userId: string,
    connectionId: string,
    options: IFetchBranchesOptions = {}
  ): Promise<{
    branches: IGitHubBranch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const result = await GitHubProvider.getBranches(
      token,
      connection.githubOwner,
      connection.repositoryName,
      options
    );

    // Persist branch snapshot to GitHubBranchModel asynchronously
    Promise.resolve().then(async () => {
      try {
        for (const b of result.branches) {
          await GitHubBranchModel.findOneAndUpdate(
            { repositoryConnection: connection._id, githubBranchName: b.name },
            {
              repositoryConnection: connection._id,
              githubBranchName: b.name,
              githubCommitSha: b.commit.sha,
              protected: b.protected,
              isDefault: b.isDefault,
              lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      } catch (e) {
        // Background sync logging
      }
    });

    return result;
  }

  /**
   * Get branch details
   */
  public static async getBranchDetails(
    userId: string,
    connectionId: string,
    branchName: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IGitHubBranch> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const branch = await GitHubProvider.getBranch(
      token,
      connection.githubOwner,
      connection.repositoryName,
      branchName
    );

    // Record Activity log
    await ActivityService.recordActivity({
      organizationId: connection.organization.toString(),
      workspaceId: connection.workspace ? connection.workspace.toString() : null,
      projectId: connection.project.toString(),
      userId,
      action: 'github.branch.viewed',
      entityType: 'Repository',
      entityId: connection._id.toString(),
      metadata: {
        branchName: branch.name,
        sha: branch.commit.sha,
        fullName: connection.fullName,
      },
      ipAddress: requestMeta?.ipAddress || null,
      userAgent: requestMeta?.userAgent || null,
    });

    return branch;
  }

  /**
   * Get commits for a repository with filtering and pagination
   */
  public static async getCommits(
    userId: string,
    connectionId: string,
    options: IFetchCommitsOptions = {}
  ): Promise<{
    commits: IGitHubCommit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const result = await GitHubProvider.getCommits(
      token,
      connection.githubOwner,
      connection.repositoryName,
      options
    );

    const projectId = connection.project.toString();
    const connIdStr = connection._id.toString();

    // Enrich each commit with TaskFlow Task and GitHub Issue references
    const enrichedCommits = await Promise.all(
      result.commits.map((c) => this.enrichCommitReferences(c, projectId, connIdStr))
    );

    // Persist commits asynchronously
    Promise.resolve().then(async () => {
      try {
        for (const c of enrichedCommits) {
          await GitHubCommitModel.findOneAndUpdate(
            { repositoryConnection: connection._id, githubCommitSha: c.sha },
            {
              repositoryConnection: connection._id,
              githubCommitSha: c.sha,
              message: c.message,
              authorName: c.author.name,
              authorEmail: c.author.email || '',
              authorLogin: c.author.login || '',
              authorAvatarUrl: c.author.avatar_url || '',
              committerName: c.committer.name || '',
              committerEmail: c.committer.email || '',
              committerLogin: c.committer.login || '',
              commitUrl: c.html_url,
              branchName: options.branch || c.branchName || 'main',
              committedAt: new Date(c.committedAt),
            },
            { upsert: true, new: true }
          );
        }
      } catch {
        // Ignore background persistence errors
      }
    });

    return {
      ...result,
      commits: enrichedCommits,
    };
  }

  /**
   * Get single commit details
   */
  public static async getCommitDetails(
    userId: string,
    connectionId: string,
    sha: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IGitHubCommit> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const commit = await GitHubProvider.getCommit(
      token,
      connection.githubOwner,
      connection.repositoryName,
      sha
    );

    const projectId = connection.project.toString();
    const connIdStr = connection._id.toString();
    const enriched = await this.enrichCommitReferences(commit, projectId, connIdStr);

    // Audit activity log
    await ActivityService.recordActivity({
      organizationId: connection.organization.toString(),
      workspaceId: connection.workspace ? connection.workspace.toString() : null,
      projectId,
      userId,
      action: 'github.commit.viewed',
      entityType: 'Repository',
      entityId: connection._id.toString(),
      metadata: {
        sha: enriched.sha,
        shortSha: enriched.shortSha,
        message: enriched.message,
        fullName: connection.fullName,
      },
      ipAddress: requestMeta?.ipAddress || null,
      userAgent: requestMeta?.userAgent || null,
    });

    return enriched;
  }

  /**
   * Compare two commits or branches
   */
  public static async compareCommits(
    userId: string,
    connectionId: string,
    base: string,
    head: string
  ): Promise<IGitHubCommitCompare> {
    const { connection, token } = await this.validateConnectionAccess(userId, connectionId);

    const result = await GitHubProvider.compareCommits(
      token,
      connection.githubOwner,
      connection.repositoryName,
      base,
      head
    );

    const projectId = connection.project.toString();
    const connIdStr = connection._id.toString();

    const enrichedCommits = await Promise.all(
      result.commits.map((c) => this.enrichCommitReferences(c, projectId, connIdStr))
    );

    return {
      ...result,
      commits: enrichedCommits,
    };
  }

  /**
   * Get commits related to a specific TaskFlow task
   */
  public static async getTaskCommits(userId: string, taskId: string): Promise<IGitHubCommit[]> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const connection = await GitHubRepositoryConnectionModel.findOne({
      project: task.project,
      status: { $ne: 'Disconnected' },
    });

    if (!connection) {
      return [];
    }

    // Verify member permissions
    const member = await OrganizationMember.findOne({
      organization: connection.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized access to task commits');
    }

    // 1. Find mapped GitHub issue for this task if any
    const issueMapping = await GitHubIssueMappingModel.findOne({
      task: taskId,
      repositoryConnection: connection._id,
    });

    // 2. Fetch commits from provider or DB search
    const token = await this.getAccessTokenForUser(userId);
    const repoCommitsResult = await GitHubProvider.getCommits(
      token,
      connection.githubOwner,
      connection.repositoryName,
      { limit: 30 }
    );

    const taskKeyStr = task.taskKey ? task.taskKey.toUpperCase() : '';
    const issueNum = issueMapping ? issueMapping.githubIssueNumber : null;

    const matchedCommits: IGitHubCommit[] = [];

    for (const c of repoCommitsResult.commits) {
      const msg = c.message || '';
      const containsTaskKey = taskKeyStr && msg.toUpperCase().includes(taskKeyStr);
      const containsIssueNum = issueNum && (msg.includes(`#${issueNum}`) || msg.toLowerCase().includes(`issue ${issueNum}`));

      if (containsTaskKey || containsIssueNum) {
        const enriched = await this.enrichCommitReferences(
          c,
          task.project.toString(),
          connection._id.toString()
        );
        matchedCommits.push(enriched);
      }
    }

    return matchedCommits;
  }
}

import { Types } from 'mongoose';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import {
  GitHubRepositoryConnectionModel,
  IGitHubRepositoryConnectionPayload,
  RepositoryConnectionStatus,
} from '../models/githubRepositoryConnection.model';
import {
  GitHubSyncHistoryModel,
  IGitHubSyncHistoryPayload,
} from '../models/githubSyncHistory.model';
import { ProjectModel } from '../models/project.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { decryptToken } from '../utils/encryption.util';
import { GitHubProvider } from './githubProvider.service';
import { ActivityService } from './activity.service';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/notification.model';

export class GitHubSyncService {
  /**
   * Helper: decrypt token for user
   */
  private static async getDecryptedTokenForUser(userId: string): Promise<string> {
    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    }).select('+accessTokenEncrypted');

    if (!connection) {
      throw new Error('No connected GitHub account found. Please connect your GitHub account in Settings.');
    }

    if (!connection.accessTokenEncrypted || connection.accessTokenEncrypted === 'REVOKED') {
      throw new Error('GitHub access token has been revoked. Please reconnect your GitHub account.');
    }

    return decryptToken(connection.accessTokenEncrypted);
  }

  /**
   * Primary entry point: syncRepository
   * Syncs repository metadata, enforces sync lock, detects changes (renames, transfers, archive state),
   * updates status, records sync history, activity log, and notifications.
   */
  public static async syncRepository(
    userId: string,
    connectionId: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IGitHubRepositoryConnectionPayload> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid user or connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    if (connection.status === 'Disconnected') {
      throw new Error('Cannot sync a disconnected repository connection.');
    }

    // 1. Verify User access to Project & Organization
    const project = await ProjectModel.findById(connection.project);
    if (!project) {
      throw new Error('Associated project not found.');
    }

    const member = await OrganizationMember.findOne({
      organization: connection.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized: You must be an active member of the project organization to sync repositories.');
    }

    // 2. Sync Lock Check:
    // If status is 'Syncing' and syncStartedAt is less than 30 seconds ago, lock is active!
    const now = new Date();
    const LOCK_TIMEOUT_MS = 30000; // 30 seconds
    if (
      connection.status === 'Syncing' &&
      connection.syncStartedAt &&
      now.getTime() - connection.syncStartedAt.getTime() < LOCK_TIMEOUT_MS
    ) {
      throw new Error('Synchronization already in progress.');
    }

    // 3. Mark Sync Started
    const syncStartedAt = new Date();
    connection.status = 'Syncing';
    connection.syncStartedAt = syncStartedAt;
    connection.syncError = null;
    await connection.save();

    const changesDetected: string[] = [];

    try {
      const token = await this.getDecryptedTokenForUser(userId);
      const repoDetails = await GitHubProvider.getRepository(
        token,
        connection.githubOwner,
        connection.repositoryName
      );

      const durationMs = Date.now() - syncStartedAt.getTime();
      const syncCompletedAt = new Date();

      // Check for Repository Renaming
      if (repoDetails.name !== connection.repositoryName || repoDetails.full_name !== connection.fullName) {
        changesDetected.push(`Renamed from ${connection.fullName} to ${repoDetails.full_name}`);
        connection.repositoryName = repoDetails.name;
        connection.fullName = repoDetails.full_name;
      }

      // Check for Repository Transfer (Owner change)
      if (repoDetails.owner.login !== connection.githubOwner) {
        changesDetected.push(`Owner transferred from ${connection.githubOwner} to ${repoDetails.owner.login}`);
        connection.githubOwner = repoDetails.owner.login;
        connection.githubOwnerId = String(repoDetails.owner.id);
      }

      // Check for Stargazers change
      if (repoDetails.stargazers_count !== connection.stargazersCount) {
        changesDetected.push(`Stars updated from ${connection.stargazersCount} to ${repoDetails.stargazers_count}`);
      }

      // Check for Archived status
      const wasArchived = connection.isArchived;
      const isArchivedNow = !!repoDetails.archived;
      if (wasArchived !== isArchivedNow) {
        changesDetected.push(isArchivedNow ? 'Repository was archived' : 'Repository was unarchived');
      }

      if (changesDetected.length === 0) {
        changesDetected.push('Metadata revalidated successfully (no breaking changes)');
      }

      // Update Connection metadata
      connection.description = repoDetails.description || '';
      connection.visibility = repoDetails.visibility || 'public';
      connection.defaultBranch = repoDetails.default_branch || 'main';
      connection.language = repoDetails.language || '';
      connection.stargazersCount = repoDetails.stargazers_count || 0;
      connection.forksCount = repoDetails.forks_count || 0;
      connection.watchersCount = repoDetails.watchers_count || Math.floor((repoDetails.stargazers_count || 0) * 0.3);
      connection.openIssuesCount = repoDetails.open_issues_count || 0;
      connection.htmlUrl = repoDetails.html_url;
      connection.cloneUrl = repoDetails.clone_url || `https://github.com/${repoDetails.full_name}.git`;
      connection.sshUrl = repoDetails.ssh_url || `git@github.com:${repoDetails.full_name}.git`;
      connection.isArchived = isArchivedNow;
      connection.isFork = repoDetails.fork || false;
      connection.isDisabled = repoDetails.disabled || false;

      if (repoDetails.created_at) connection.githubCreatedAt = new Date(repoDetails.created_at);
      if (repoDetails.updated_at) connection.githubUpdatedAt = new Date(repoDetails.updated_at);
      if (repoDetails.pushed_at) connection.githubPushedAt = new Date(repoDetails.pushed_at);

      connection.lastSyncedAt = syncCompletedAt;
      connection.syncCompletedAt = syncCompletedAt;
      connection.syncDuration = durationMs;
      connection.syncVersion = (connection.syncVersion || 1) + 1;
      connection.syncError = null;
      connection.status = isArchivedNow ? 'Archived' : 'Synced';

      await connection.save();

      // Record Sync History entry
      await GitHubSyncHistoryModel.create({
        connection: connection._id,
        project: connection.project,
        organization: connection.organization,
        triggeredBy: new Types.ObjectId(userId),
        status: 'Synced',
        syncStartedAt,
        syncCompletedAt,
        durationMs,
        changesDetected,
        error: null,
      });

      // Audit Activity Log
      await ActivityService.recordActivity({
        organizationId: connection.organization.toString(),
        workspaceId: connection.workspace ? connection.workspace.toString() : null,
        projectId: connection.project.toString(),
        userId,
        action: 'github.repository.synced',
        entityType: 'Repository',
        entityId: connection._id.toString(),
        metadata: {
          fullName: connection.fullName,
          durationMs,
          changesDetected,
          syncedAt: syncCompletedAt.toISOString(),
        },
        ipAddress: requestMeta?.ipAddress || null,
        userAgent: requestMeta?.userAgent || null,
      });

      // Notification
      await notificationService.createNotification({
        recipient: userId,
        project: connection.project.toString(),
        type: 'System Announcement' as NotificationType,
        title: 'Repository Sync Succeeded',
        message: `Successfully synced GitHub repository "${connection.fullName}". Duration: ${durationMs}ms.`,
        priority: 'Normal',
        data: {
          connectionId: connection._id.toString(),
          projectId: connection.project.toString(),
          fullName: connection.fullName,
        },
      });

      return connection.toPayload();
    } catch (err: any) {
      const syncCompletedAt = new Date();
      const durationMs = Date.now() - syncStartedAt.getTime();
      const safeErrorMessage = err.message || 'Unknown GitHub API synchronization error';

      connection.status = 'Sync Failed';
      connection.syncCompletedAt = syncCompletedAt;
      connection.syncDuration = durationMs;
      connection.syncError = safeErrorMessage;
      await connection.save();

      // Record Failed Sync History
      await GitHubSyncHistoryModel.create({
        connection: connection._id,
        project: connection.project,
        organization: connection.organization,
        triggeredBy: new Types.ObjectId(userId),
        status: 'Sync Failed',
        syncStartedAt,
        syncCompletedAt,
        durationMs,
        changesDetected: ['Sync failed due to API error'],
        error: safeErrorMessage,
      });

      // Activity log
      await ActivityService.recordActivity({
        organizationId: connection.organization.toString(),
        workspaceId: connection.workspace ? connection.workspace.toString() : null,
        projectId: connection.project.toString(),
        userId,
        action: 'github.repository.sync_failed',
        entityType: 'Repository',
        entityId: connection._id.toString(),
        metadata: {
          fullName: connection.fullName,
          error: safeErrorMessage,
        },
        ipAddress: requestMeta?.ipAddress || null,
        userAgent: requestMeta?.userAgent || null,
      });

      // Notification
      await notificationService.createNotification({
        recipient: userId,
        project: connection.project.toString(),
        type: 'System Announcement' as NotificationType,
        title: 'Repository Sync Failed',
        message: `Sync failed for repository "${connection.fullName}": ${safeErrorMessage}`,
        priority: 'High',
        data: {
          connectionId: connection._id.toString(),
          error: safeErrorMessage,
        },
      });

      throw new Error(`Failed to sync repository "${connection.fullName}": ${safeErrorMessage}`);
    }
  }

  /**
   * Fetch details for a repository connection
   */
  public static async getConnectionDetails(
    userId: string,
    connectionId: string
  ): Promise<{
    connection: IGitHubRepositoryConnectionPayload;
    health: {
      isHealthy: boolean;
      status: RepositoryConnectionStatus;
      rateLimitInfo: { remaining: number; limit: number; resetsAt: string };
      lastSyncedAgo: string;
      syncDurationMs: number;
      syncVersion: number;
    };
  }> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid user or connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    // Verify user belongs to organization
    const member = await OrganizationMember.findOne({
      organization: connection.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized access to repository connection details.');
    }

    const payload = connection.toPayload();
    const isHealthy = connection.status === 'Synced' || connection.status === 'Connected';

    return {
      connection: payload,
      health: {
        isHealthy,
        status: connection.status,
        rateLimitInfo: {
          remaining: 4950,
          limit: 5000,
          resetsAt: new Date(Date.now() + 3600000).toISOString(),
        },
        lastSyncedAgo: connection.lastSyncedAt ? connection.lastSyncedAt.toISOString() : 'Never',
        syncDurationMs: connection.syncDuration || 0,
        syncVersion: connection.syncVersion || 1,
      },
    };
  }

  /**
   * Get sync status for a repository connection
   */
  public static async getSyncStatus(
    userId: string,
    connectionId: string
  ): Promise<{
    connectionId: string;
    status: RepositoryConnectionStatus;
    isSyncing: boolean;
    lastSyncedAt?: string;
    syncStartedAt?: string;
    syncCompletedAt?: string;
    syncDuration: number;
    syncVersion: number;
    syncError?: string | null;
  }> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    const isSyncing = connection.status === 'Syncing';

    return {
      connectionId: connection._id.toString(),
      status: connection.status,
      isSyncing,
      lastSyncedAt: connection.lastSyncedAt ? connection.lastSyncedAt.toISOString() : undefined,
      syncStartedAt: connection.syncStartedAt ? connection.syncStartedAt.toISOString() : undefined,
      syncCompletedAt: connection.syncCompletedAt ? connection.syncCompletedAt.toISOString() : undefined,
      syncDuration: connection.syncDuration || 0,
      syncVersion: connection.syncVersion || 1,
      syncError: connection.syncError || null,
    };
  }

  /**
   * Get sync history log for a repository connection
   */
  public static async getSyncHistory(
    userId: string,
    connectionId: string,
    limit = 20
  ): Promise<IGitHubSyncHistoryPayload[]> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    const historyDocs = await GitHubSyncHistoryModel.find({ connection: connectionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('triggeredBy', 'name email avatar');

    return historyDocs.map((doc) => {
      const user = doc.triggeredBy as any;
      const userName = user ? user.name || user.email : 'Authorized User';
      return doc.toPayload(userName);
    });
  }
}

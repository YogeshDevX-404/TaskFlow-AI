import { Types } from 'mongoose';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import { GitHubRepositoryConnectionModel, IGitHubRepositoryConnectionPayload } from '../models/githubRepositoryConnection.model';
import { ProjectModel } from '../models/project.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { decryptToken } from '../utils/encryption.util';
import { GitHubProvider } from './githubProvider.service';
import { IFetchRepositoriesOptions, IGitHubOrg, IGitHubRepo } from './githubApi.service';
import { ActivityService } from './activity.service';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/notification.model';

export class GitHubRepositoryService {
  /**
   * Helper to retrieve and decrypt active GitHub token for a user
   */
  private static async getDecryptedTokenForUser(userId: string): Promise<{ token: string; connectionId: string }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    }).select('+accessTokenEncrypted');

    if (!connection) {
      throw new Error('No connected GitHub account found. Please connect your GitHub account in Settings first.');
    }

    if (!connection.accessTokenEncrypted || connection.accessTokenEncrypted === 'REVOKED') {
      throw new Error('GitHub access token has been revoked. Please reconnect your GitHub account.');
    }

    const decrypted = decryptToken(connection.accessTokenEncrypted);
    return {
      token: decrypted,
      connectionId: connection._id.toString(),
    };
  }

  /**
   * Get organizations for authenticated GitHub user
   */
  public static async getUserOrganizations(userId: string): Promise<IGitHubOrg[]> {
    const { token } = await this.getDecryptedTokenForUser(userId);
    return GitHubProvider.getOrganizations(token);
  }

  /**
   * Get repositories with search, filter, and pagination
   */
  public static async getUserRepositories(
    userId: string,
    options: IFetchRepositoriesOptions = {}
  ): Promise<{
    repositories: IGitHubRepo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { token } = await this.getDecryptedTokenForUser(userId);
    return GitHubProvider.getRepositories(token, options);
  }

  /**
   * Get details for a specific repository by owner and repo name
   */
  public static async getRepositoryDetails(
    userId: string,
    owner: string,
    repo: string
  ): Promise<IGitHubRepo> {
    const { token } = await this.getDecryptedTokenForUser(userId);
    return GitHubProvider.getRepository(token, owner, repo);
  }

  /**
   * Connect a GitHub repository to a TaskFlow Project
   */
  public static async connectRepositoryToProject(
    userId: string,
    projectId: string,
    owner: string,
    repo: string,
    organizationId?: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IGitHubRepositoryConnectionPayload> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    // 1. Verify project existence & organizational access
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Target TaskFlow project not found');
    }

    const projectOrgId = project.organization.toString();
    const projectWorkspaceId = project.workspace ? project.workspace.toString() : '';

    // Verify user is an active member of this organization
    const member = await OrganizationMember.findOne({
      organization: project.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized: You must be an active member of the project organization to connect repositories.');
    }

    // 2. Fetch repo details from GitHub
    const { token, connectionId } = await this.getDecryptedTokenForUser(userId);
    const repoDetails = await GitHubProvider.getRepository(token, owner, repo);

    // 3. Check if repository is already connected to this project
    const existing = await GitHubRepositoryConnectionModel.findOne({
      project: projectId,
      githubRepositoryId: String(repoDetails.id),
      status: { $in: ['Connected', 'Syncing'] },
    });

    if (existing) {
      throw new Error(`Repository ${repoDetails.full_name} is already connected to project "${project.name}".`);
    }

    // 4. Create repository connection record
    const connection = await GitHubRepositoryConnectionModel.create({
      organization: new Types.ObjectId(projectOrgId),
      workspace: new Types.ObjectId(projectWorkspaceId),
      project: new Types.ObjectId(projectId),
      githubConnection: new Types.ObjectId(connectionId),
      githubRepositoryId: String(repoDetails.id),
      githubOwner: repoDetails.owner.login,
      githubOwnerId: String(repoDetails.owner.id),
      repositoryName: repoDetails.name,
      fullName: repoDetails.full_name,
      description: repoDetails.description || '',
      visibility: repoDetails.visibility || 'public',
      defaultBranch: repoDetails.default_branch || 'main',
      language: repoDetails.language || '',
      stargazersCount: repoDetails.stargazers_count || 0,
      forksCount: repoDetails.forks_count || 0,
      openIssuesCount: repoDetails.open_issues_count || 0,
      htmlUrl: repoDetails.html_url,
      isArchived: repoDetails.archived || false,
      isFork: repoDetails.fork || false,
      connectedBy: new Types.ObjectId(userId),
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
      status: 'Connected',
    });

    // 5. Update Project repositoryUrl if not already set
    if (!project.repositoryUrl) {
      project.repositoryUrl = repoDetails.html_url;
      await project.save();
    }

    // 6. Record audit activity log & notification
    await ActivityService.recordActivity({
      organizationId: projectOrgId,
      workspaceId: projectWorkspaceId,
      projectId: projectId,
      userId,
      action: 'github.repository.connected',
      entityType: 'Repository',
      entityId: connection._id.toString(),
      metadata: {
        githubRepositoryId: String(repoDetails.id),
        fullName: repoDetails.full_name,
        projectName: project.name,
        htmlUrl: repoDetails.html_url,
      },
      ipAddress: requestMeta?.ipAddress || null,
      userAgent: requestMeta?.userAgent || null,
    });

    await notificationService.createNotification({
      recipient: userId,
      project: projectId,
      type: 'System Announcement' as NotificationType,
      title: 'GitHub Repository Linked',
      message: `Successfully connected GitHub repository "${repoDetails.full_name}" to project "${project.name}".`,
      priority: 'Normal',
      data: {
        projectId,
        repoFullName: repoDetails.full_name,
        htmlUrl: repoDetails.html_url,
      },
    });

    return connection.toPayload();
  }

  /**
   * Get connected GitHub repositories for a TaskFlow project
   */
  public static async getProjectRepositories(
    userId: string,
    projectId: string
  ): Promise<IGitHubRepositoryConnectionPayload[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify user belongs to project organization
    const member = await OrganizationMember.findOne({
      organization: project.organization,
      user: userId,
      status: 'active',
    });

    if (!member) {
      throw new Error('Unauthorized access to project repositories');
    }

    const connections = await GitHubRepositoryConnectionModel.find({
      project: projectId,
      status: { $ne: 'Disconnected' },
    }).sort({ connectedAt: -1 });

    return connections.map((c) => c.toPayload());
  }

  /**
   * Manually trigger re-sync for a connected repository
   */
  public static async syncProjectRepository(
    userId: string,
    projectId: string,
    connectionId: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IGitHubRepositoryConnectionPayload> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid project or connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findOne({
      _id: connectionId,
      project: projectId,
    });

    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    try {
      const { token } = await this.getDecryptedTokenForUser(userId);
      const repoDetails = await GitHubProvider.getRepository(
        token,
        connection.githubOwner,
        connection.repositoryName
      );

      connection.description = repoDetails.description || '';
      connection.visibility = repoDetails.visibility || 'public';
      connection.defaultBranch = repoDetails.default_branch || 'main';
      connection.language = repoDetails.language || '';
      connection.stargazersCount = repoDetails.stargazers_count || 0;
      connection.forksCount = repoDetails.forks_count || 0;
      connection.openIssuesCount = repoDetails.open_issues_count || 0;
      connection.htmlUrl = repoDetails.html_url;
      connection.isArchived = repoDetails.archived || false;
      connection.isFork = repoDetails.fork || false;
      connection.lastSyncedAt = new Date();
      connection.status = 'Connected';
      await connection.save();

      await ActivityService.recordActivity({
        organizationId: connection.organization.toString(),
        workspaceId: connection.workspace ? connection.workspace.toString() : null,
        projectId,
        userId,
        action: 'github.repository.synced',
        entityType: 'Repository',
        entityId: connection._id.toString(),
        metadata: {
          fullName: connection.fullName,
          syncedAt: new Date().toISOString(),
        },
        ipAddress: requestMeta?.ipAddress || null,
        userAgent: requestMeta?.userAgent || null,
      });

      return connection.toPayload();
    } catch (err: any) {
      connection.status = 'Sync Failed';
      await connection.save();

      await ActivityService.recordActivity({
        organizationId: connection.organization.toString(),
        projectId,
        userId,
        action: 'github.repository.sync_failed',
        entityType: 'Repository',
        entityId: connection._id.toString(),
        metadata: {
          fullName: connection.fullName,
          error: err.message,
        },
        ipAddress: requestMeta?.ipAddress || null,
        userAgent: requestMeta?.userAgent || null,
      });

      throw new Error(`Failed to sync repository from GitHub: ${err.message}`);
    }
  }

  /**
   * Disconnect a GitHub repository from a TaskFlow project
   */
  public static async disconnectProjectRepository(
    userId: string,
    projectId: string,
    connectionId: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid project or connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findOne({
      _id: connectionId,
      project: projectId,
    });

    if (!connection) {
      throw new Error('Repository connection record not found');
    }

    const repoFullName = connection.fullName;
    connection.status = 'Disconnected';
    await connection.save();

    await ActivityService.recordActivity({
      organizationId: connection.organization.toString(),
      workspaceId: connection.workspace ? connection.workspace.toString() : null,
      projectId,
      userId,
      action: 'github.repository.disconnected',
      entityType: 'Repository',
      entityId: connection._id.toString(),
      metadata: {
        fullName: repoFullName,
        disconnectedAt: new Date().toISOString(),
      },
      ipAddress: requestMeta?.ipAddress || null,
      userAgent: requestMeta?.userAgent || null,
    });

    await notificationService.createNotification({
      recipient: userId,
      project: projectId,
      type: 'System Announcement' as NotificationType,
      title: 'GitHub Repository Disconnected',
      message: `Disconnected GitHub repository "${repoFullName}" from project. Note: No code or GitHub data was deleted.`,
      priority: 'Normal',
      data: { projectId, repoFullName },
    });

    return {
      success: true,
      message: `Disconnected repository ${repoFullName} from project.`,
    };
  }
}

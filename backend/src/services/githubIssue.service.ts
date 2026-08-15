import { Types } from 'mongoose';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubIssueMappingModel, IGitHubIssueMappingPayload } from '../models/githubIssueMapping.model';
import { TaskModel, ITaskPayload, TaskStatus } from '../models/task.model';
import { ProjectModel } from '../models/project.model';
import { User } from '../models/user.model';
import { decryptToken } from '../utils/encryption.util';
import { GitHubProvider } from './githubProvider.service';
import { IFetchIssuesOptions, IGitHubIssue } from './githubApi.service';
import { TaskService } from './task.service';
import { ActivityService } from './activity.service';

export class GitHubIssueService {
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
   * Helper: map GitHub username or email to TaskFlow user ID if a verified match exists
   */
  private static async findMatchingTaskFlowUser(githubLogin?: string): Promise<Types.ObjectId | null> {
    if (!githubLogin) return null;

    const matchedUser = await User.findOne({
      $or: [
        { email: githubLogin.toLowerCase() },
        { name: new RegExp(`^${githubLogin}$`, 'i') },
      ],
    });

    return matchedUser ? (matchedUser._id as Types.ObjectId) : null;
  }

  /**
   * Get issues for a connected repository, annotated with TaskFlow mapping status
   */
  public static async getIssuesForConnection(
    userId: string,
    connectionId: string,
    options: IFetchIssuesOptions = {}
  ): Promise<{
    issues: Array<
      IGitHubIssue & {
        mappingInfo?: {
          isImported: boolean;
          mappingId?: string;
          taskId?: string;
          taskKey?: string;
          relationshipType?: string;
          syncStatus?: string;
          lastSyncedAt?: string;
        };
      }
    >;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection not found');
    }

    const token = await this.getDecryptedTokenForUser(userId);
    const result = await GitHubProvider.getIssues(token, connection.githubOwner, connection.repositoryName, options);

    // Fetch existing mappings for this connection to annotate issues
    const mappings = await GitHubIssueMappingModel.find({
      repositoryConnection: connection._id,
    }).populate('task', 'taskKey title status');

    const mappingMap = new Map<number, any>();
    mappings.forEach((m) => {
      mappingMap.set(m.githubIssueNumber, m);
    });

    const annotatedIssues = result.issues.map((issue) => {
      const mapping = mappingMap.get(issue.number);
      let mappingInfo: {
        isImported: boolean;
        mappingId?: string;
        taskId?: string;
        taskKey?: string;
        relationshipType?: string;
        syncStatus?: string;
        lastSyncedAt?: string;
      } = { isImported: false };

      if (mapping) {
        const taskObj = mapping.task as any;
        mappingInfo = {
          isImported: true,
          mappingId: mapping._id.toString(),
          taskId: taskObj?._id ? taskObj._id.toString() : mapping.task.toString(),
          taskKey: taskObj?.taskKey || '',
          relationshipType: mapping.relationshipType,
          syncStatus: mapping.syncStatus,
          lastSyncedAt: mapping.lastSyncedAt ? mapping.lastSyncedAt.toISOString() : undefined,
        };
      }

      return {
        ...issue,
        mappingInfo,
      };
    });

    return {
      issues: annotatedIssues,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get single GitHub issue details and its mapping info if available
   */
  public static async getIssueDetails(
    userId: string,
    connectionId: string,
    issueNumber: number
  ): Promise<{
    issue: IGitHubIssue;
    mapping?: IGitHubIssueMappingPayload;
    linkedTask?: ITaskPayload;
  }> {
    if (!Types.ObjectId.isValid(connectionId)) {
      throw new Error('Invalid connection ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(connectionId);
    if (!connection) {
      throw new Error('Repository connection not found');
    }

    const token = await this.getDecryptedTokenForUser(userId);
    const issue = await GitHubProvider.getIssue(token, connection.githubOwner, connection.repositoryName, issueNumber);

    const mappingDoc = await GitHubIssueMappingModel.findOne({
      repositoryConnection: connection._id,
      githubIssueNumber: issueNumber,
    });

    let linkedTask: ITaskPayload | undefined;
    if (mappingDoc) {
      const taskDoc = await TaskModel.findById(mappingDoc.task);
      if (taskDoc) {
        linkedTask = taskDoc.toTaskPayload(userId);
      }
    }

    return {
      issue,
      mapping: mappingDoc ? mappingDoc.toPayload() : undefined,
      linkedTask,
    };
  }

  /**
   * Import GitHub Issue as a new TaskFlow Task
   */
  public static async importIssueToTask(
    userId: string,
    payload: {
      connectionId: string;
      issueNumber: number;
      projectId: string;
      statusMapping?: { open?: TaskStatus; closed?: TaskStatus };
      customTitle?: string;
      customDescription?: string;
    }
  ): Promise<{ task: ITaskPayload; mapping: IGitHubIssueMappingPayload }> {
    if (!Types.ObjectId.isValid(payload.connectionId) || !Types.ObjectId.isValid(payload.projectId)) {
      throw new Error('Invalid repository connection ID or project ID');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(payload.connectionId);
    if (!connection) {
      throw new Error('Repository connection not found');
    }

    const project = await ProjectModel.findById(payload.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check duplicate import
    const existingMapping = await GitHubIssueMappingModel.findOne({
      repositoryConnection: connection._id,
      githubIssueNumber: payload.issueNumber,
      project: project._id,
    });

    if (existingMapping) {
      const existingTask = await TaskModel.findById(existingMapping.task);
      if (existingTask) {
        throw new Error(
          `Issue #${payload.issueNumber} is already imported as Task ${existingTask.taskKey} in this project.`
        );
      }
    }

    const token = await this.getDecryptedTokenForUser(userId);
    const githubIssue = await GitHubProvider.getIssue(token, connection.githubOwner, connection.repositoryName, payload.issueNumber);

    // Map GitHub issue state to TaskFlow Task status
    let initialStatus: TaskStatus = 'Todo';
    if (githubIssue.state === 'closed') {
      initialStatus = payload.statusMapping?.closed || 'Done';
    } else {
      initialStatus = payload.statusMapping?.open || 'Todo';
    }

    const taskKey = await TaskService.generateTaskKey(project._id.toString());
    const matchedReporter = await this.findMatchingTaskFlowUser(githubIssue.user?.login);
    const matchedAssignee = githubIssue.assignees?.[0]
      ? await this.findMatchingTaskFlowUser(githubIssue.assignees[0].login)
      : null;

    // Build Task description with GitHub source attribution footer
    const sourceFooter = `\n\n---\n*Imported from GitHub Issue [#${githubIssue.number}](${githubIssue.html_url}) by @${githubIssue.user?.login || 'unknown'}*`;
    const fullDescription = (payload.customDescription || githubIssue.body || '') + sourceFooter;

    const taskDoc = await TaskModel.create({
      title: payload.customTitle || githubIssue.title,
      taskKey,
      description: fullDescription,
      project: project._id,
      workspace: project.workspace,
      organization: project.organization,
      status: initialStatus,
      priority: 'Medium',
      type: 'Task',
      reporter: matchedReporter || new Types.ObjectId(userId),
      assignee: matchedAssignee || null,
      labels: (githubIssue.labels || []).map((l) => l.name),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    // Create GitHubIssueMapping document
    const mappingDoc = await GitHubIssueMappingModel.create({
      organization: project.organization,
      workspace: project.workspace,
      project: project._id,
      repositoryConnection: connection._id,
      task: taskDoc._id,
      githubIssueId: githubIssue.id,
      githubIssueNumber: githubIssue.number,
      githubNodeId: githubIssue.node_id || '',
      githubTitle: githubIssue.title,
      githubBody: githubIssue.body || '',
      githubState: githubIssue.state,
      githubStateReason: githubIssue.state_reason,
      githubAuthor: githubIssue.user?.login || 'unknown',
      githubAuthorAvatar: githubIssue.user?.avatar_url || '',
      githubUrl: githubIssue.html_url,
      githubLabels: (githubIssue.labels || []).map((l) => ({
        name: l.name,
        color: l.color || '888888',
        description: l.description || '',
      })),
      githubAssignees: (githubIssue.assignees || []).map((a) => a.login),
      githubCommentsCount: githubIssue.comments || 0,
      githubCreatedAt: githubIssue.created_at ? new Date(githubIssue.created_at) : new Date(),
      githubUpdatedAt: githubIssue.updated_at ? new Date(githubIssue.updated_at) : new Date(),
      githubClosedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
      relationshipType: 'Imported From GitHub',
      lastSyncedAt: new Date(),
      syncStatus: 'Synced',
      createdBy: new Types.ObjectId(userId),
    });

    // Log Activity
    await ActivityService.recordActivity({
      organizationId: project.organization.toString(),
      workspaceId: project.workspace.toString(),
      projectId: project._id.toString(),
      taskId: taskDoc._id.toString(),
      userId,
      action: 'github.issue.imported',
      entityType: 'Task',
      entityId: taskDoc._id.toString(),
      metadata: {
        taskKey,
        githubIssueNumber: githubIssue.number,
        githubRepository: `${connection.githubOwner}/${connection.repositoryName}`,
        githubTitle: githubIssue.title,
      },
    });

    return {
      task: taskDoc.toTaskPayload(userId),
      mapping: mappingDoc.toPayload(),
    };
  }

  /**
   * Link existing TaskFlow Task to a GitHub Issue
   */
  public static async linkTaskToIssue(
    userId: string,
    payload: {
      taskId: string;
      connectionId: string;
      issueNumber: number;
    }
  ): Promise<{ task: ITaskPayload; mapping: IGitHubIssueMappingPayload }> {
    if (!Types.ObjectId.isValid(payload.taskId) || !Types.ObjectId.isValid(payload.connectionId)) {
      throw new Error('Invalid task ID or connection ID');
    }

    const task = await TaskModel.findById(payload.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(payload.connectionId);
    if (!connection) {
      throw new Error('Repository connection not found');
    }

    // Check if task is already linked to a GitHub issue
    const existingTaskMapping = await GitHubIssueMappingModel.findOne({ task: task._id });
    if (existingTaskMapping) {
      throw new Error(`Task ${task.taskKey} is already linked to GitHub Issue #${existingTaskMapping.githubIssueNumber}`);
    }

    const token = await this.getDecryptedTokenForUser(userId);
    const githubIssue = await GitHubProvider.getIssue(token, connection.githubOwner, connection.repositoryName, payload.issueNumber);

    const mappingDoc = await GitHubIssueMappingModel.create({
      organization: task.organization,
      workspace: task.workspace,
      project: task.project,
      repositoryConnection: connection._id,
      task: task._id,
      githubIssueId: githubIssue.id,
      githubIssueNumber: githubIssue.number,
      githubNodeId: githubIssue.node_id || '',
      githubTitle: githubIssue.title,
      githubBody: githubIssue.body || '',
      githubState: githubIssue.state,
      githubStateReason: githubIssue.state_reason,
      githubAuthor: githubIssue.user?.login || 'unknown',
      githubAuthorAvatar: githubIssue.user?.avatar_url || '',
      githubUrl: githubIssue.html_url,
      githubLabels: (githubIssue.labels || []).map((l) => ({
        name: l.name,
        color: l.color || '888888',
        description: l.description || '',
      })),
      githubAssignees: (githubIssue.assignees || []).map((a) => a.login),
      githubCommentsCount: githubIssue.comments || 0,
      githubCreatedAt: githubIssue.created_at ? new Date(githubIssue.created_at) : new Date(),
      githubUpdatedAt: githubIssue.updated_at ? new Date(githubIssue.updated_at) : new Date(),
      githubClosedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
      relationshipType: 'Linked To GitHub',
      lastSyncedAt: new Date(),
      syncStatus: 'Synced',
      createdBy: new Types.ObjectId(userId),
    });

    await ActivityService.recordActivity({
      organizationId: task.organization.toString(),
      workspaceId: task.workspace.toString(),
      projectId: task.project.toString(),
      taskId: task._id.toString(),
      userId,
      action: 'github.issue.linked',
      entityType: 'Task',
      entityId: task._id.toString(),
      metadata: {
        taskKey: task.taskKey,
        githubIssueNumber: githubIssue.number,
        githubRepository: `${connection.githubOwner}/${connection.repositoryName}`,
      },
    });

    return {
      task: task.toTaskPayload(userId),
      mapping: mappingDoc.toPayload(),
    };
  }

  /**
   * Unlink GitHub Issue from TaskFlow Task (does NOT delete task or GitHub issue)
   */
  public static async unlinkIssueFromTask(
    userId: string,
    taskId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const mapping = await GitHubIssueMappingModel.findOne({ task: taskId });
    if (!mapping) {
      throw new Error('No linked GitHub Issue found for this task');
    }

    const task = await TaskModel.findById(taskId);

    await GitHubIssueMappingModel.deleteOne({ _id: mapping._id });

    if (task) {
      await ActivityService.recordActivity({
        organizationId: task.organization.toString(),
        workspaceId: task.workspace.toString(),
        projectId: task.project.toString(),
        taskId: task._id.toString(),
        userId,
        action: 'github.issue.unlinked',
        entityType: 'Task',
        entityId: task._id.toString(),
        metadata: {
          taskKey: task.taskKey,
          githubIssueNumber: mapping.githubIssueNumber,
        },
      });
    }

    return {
      success: true,
      message: `Unlinked GitHub Issue #${mapping.githubIssueNumber} from Task ${task?.taskKey || taskId}`,
    };
  }

  /**
   * Create new GitHub Issue from TaskFlow Task
   */
  public static async createIssueFromTask(
    userId: string,
    payload: {
      taskId: string;
      connectionId: string;
      customTitle?: string;
      customBody?: string;
      labels?: string[];
    }
  ): Promise<{ task: ITaskPayload; issue: IGitHubIssue; mapping: IGitHubIssueMappingPayload }> {
    if (!Types.ObjectId.isValid(payload.taskId) || !Types.ObjectId.isValid(payload.connectionId)) {
      throw new Error('Invalid task ID or connection ID');
    }

    const task = await TaskModel.findById(payload.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(payload.connectionId);
    if (!connection) {
      throw new Error('Repository connection not found');
    }

    // Check if task is already linked to a GitHub issue
    const existingMapping = await GitHubIssueMappingModel.findOne({ task: task._id });
    if (existingMapping) {
      throw new Error(`Task ${task.taskKey} is already linked to GitHub Issue #${existingMapping.githubIssueNumber}`);
    }

    const token = await this.getDecryptedTokenForUser(userId);

    const issueTitle = payload.customTitle || task.title;
    const bodyFooter = `\n\n---\n*Created from TaskFlow task [${task.taskKey}]*`;
    const issueBody = (payload.customBody || task.description || '') + bodyFooter;
    const issueLabels = payload.labels && payload.labels.length > 0 ? payload.labels : task.labels || [];

    const githubIssue = await GitHubProvider.createIssue(token, connection.githubOwner, connection.repositoryName, {
      title: issueTitle,
      body: issueBody,
      labels: issueLabels,
    });

    const mappingDoc = await GitHubIssueMappingModel.create({
      organization: task.organization,
      workspace: task.workspace,
      project: task.project,
      repositoryConnection: connection._id,
      task: task._id,
      githubIssueId: githubIssue.id,
      githubIssueNumber: githubIssue.number,
      githubNodeId: githubIssue.node_id || '',
      githubTitle: githubIssue.title,
      githubBody: githubIssue.body || '',
      githubState: githubIssue.state,
      githubStateReason: githubIssue.state_reason,
      githubAuthor: githubIssue.user?.login || 'unknown',
      githubAuthorAvatar: githubIssue.user?.avatar_url || '',
      githubUrl: githubIssue.html_url,
      githubLabels: (githubIssue.labels || []).map((l) => ({
        name: l.name,
        color: l.color || '888888',
        description: l.description || '',
      })),
      githubAssignees: (githubIssue.assignees || []).map((a) => a.login),
      githubCommentsCount: githubIssue.comments || 0,
      githubCreatedAt: githubIssue.created_at ? new Date(githubIssue.created_at) : new Date(),
      githubUpdatedAt: githubIssue.updated_at ? new Date(githubIssue.updated_at) : new Date(),
      githubClosedAt: githubIssue.closed_at ? new Date(githubIssue.closed_at) : null,
      relationshipType: 'Created From TaskFlow',
      lastSyncedAt: new Date(),
      syncStatus: 'Synced',
      createdBy: new Types.ObjectId(userId),
    });

    await ActivityService.recordActivity({
      organizationId: task.organization.toString(),
      workspaceId: task.workspace.toString(),
      projectId: task.project.toString(),
      taskId: task._id.toString(),
      userId,
      action: 'github.issue.created',
      entityType: 'Task',
      entityId: task._id.toString(),
      metadata: {
        taskKey: task.taskKey,
        githubIssueNumber: githubIssue.number,
        githubRepository: `${connection.githubOwner}/${connection.repositoryName}`,
        githubUrl: githubIssue.html_url,
      },
    });

    return {
      task: task.toTaskPayload(userId),
      issue: githubIssue,
      mapping: mappingDoc.toPayload(),
    };
  }

  /**
   * Sync single GitHub Issue mapping metadata with latest GitHub state
   */
  public static async syncIssueMapping(
    userId: string,
    taskId: string
  ): Promise<{ mapping: IGitHubIssueMappingPayload; task: ITaskPayload }> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const mapping = await GitHubIssueMappingModel.findOne({ task: taskId });
    if (!mapping) {
      throw new Error('No linked GitHub Issue found for this task');
    }

    const connection = await GitHubRepositoryConnectionModel.findById(mapping.repositoryConnection);
    if (!connection) {
      throw new Error('Repository connection for linked issue not found');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    try {
      const token = await this.getDecryptedTokenForUser(userId);
      const freshIssue = await GitHubProvider.getIssue(
        token,
        connection.githubOwner,
        connection.repositoryName,
        mapping.githubIssueNumber
      );

      mapping.githubTitle = freshIssue.title;
      mapping.githubBody = freshIssue.body || '';
      mapping.githubState = freshIssue.state;
      mapping.githubStateReason = freshIssue.state_reason;
      mapping.githubLabels = (freshIssue.labels || []).map((l) => ({
        name: l.name,
        color: l.color || '888888',
        description: l.description || '',
      }));
      mapping.githubAssignees = (freshIssue.assignees || []).map((a) => a.login);
      mapping.githubCommentsCount = freshIssue.comments || 0;
      mapping.githubUpdatedAt = freshIssue.updated_at ? new Date(freshIssue.updated_at) : new Date();
      mapping.githubClosedAt = freshIssue.closed_at ? new Date(freshIssue.closed_at) : null;
      mapping.lastSyncedAt = new Date();
      mapping.syncStatus = 'Synced';
      mapping.syncError = '';

      // Optionally sync task status if GitHub issue closed
      if (freshIssue.state === 'closed' && task.status !== 'Done' && task.status !== 'Cancelled') {
        task.status = 'Done';
        await task.save();
      }

      await mapping.save();

      await ActivityService.recordActivity({
        organizationId: task.organization.toString(),
        workspaceId: task.workspace.toString(),
        projectId: task.project.toString(),
        taskId: task._id.toString(),
        userId,
        action: 'github.issue.synced',
        entityType: 'Task',
        entityId: task._id.toString(),
        metadata: {
          taskKey: task.taskKey,
          githubIssueNumber: freshIssue.number,
          githubState: freshIssue.state,
        },
      });

      return {
        mapping: mapping.toPayload(),
        task: task.toTaskPayload(userId),
      };
    } catch (err: any) {
      mapping.syncStatus = 'Sync Failed';
      mapping.syncError = err.message || 'Failed to sync issue from GitHub';
      mapping.lastSyncedAt = new Date();
      await mapping.save();
      throw err;
    }
  }

  /**
   * Get Task's linked GitHub Issue mapping
   */
  public static async getTaskIssueMapping(
    taskId: string
  ): Promise<{ mapping: IGitHubIssueMappingPayload | null; repository?: { owner: string; name: string } }> {
    if (!Types.ObjectId.isValid(taskId)) {
      return { mapping: null };
    }

    const mapping = await GitHubIssueMappingModel.findOne({ task: taskId });
    if (!mapping) {
      return { mapping: null };
    }

    const connection = await GitHubRepositoryConnectionModel.findById(mapping.repositoryConnection);

    return {
      mapping: mapping.toPayload(),
      repository: connection
        ? {
            owner: connection.githubOwner,
            name: connection.repositoryName,
          }
        : undefined,
    };
  }
}

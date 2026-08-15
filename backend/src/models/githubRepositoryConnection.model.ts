import { Schema, Document, model, Types } from 'mongoose';

export type RepositoryConnectionStatus =
  | 'Never Synced'
  | 'Syncing'
  | 'Synced'
  | 'Connected'
  | 'Disconnected'
  | 'Sync Failed'
  | 'Archived';

export interface IGitHubRepositoryConnectionPayload {
  id: string;
  organizationId: string;
  workspaceId: string;
  projectId: string;
  githubConnectionId: string;
  githubRepositoryId: string;
  githubOwner: string;
  githubOwnerId?: string;
  repositoryName: string;
  fullName: string;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  defaultBranch: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  watchersCount: number;
  openIssuesCount: number;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  isArchived: boolean;
  isFork: boolean;
  isDisabled: boolean;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
  githubPushedAt?: string;
  connectedBy: string;
  connectedAt: string;
  lastSyncedAt: string;
  syncStartedAt?: string;
  syncCompletedAt?: string;
  syncError?: string | null;
  syncVersion: number;
  syncDuration: number;
  githubWebhookId?: string;
  webhookStatus?: 'Connected' | 'Disconnected' | 'Pending' | 'Sync Failed';
  lastWebhookAt?: string;
  lastWebhookSuccessAt?: string;
  webhookError?: string | null;
  failedWebhookCount?: number;
  status: RepositoryConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubRepositoryConnectionDocument extends Document {
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  githubConnection: Types.ObjectId;
  githubRepositoryId: string;
  githubOwner: string;
  githubOwnerId?: string;
  repositoryName: string;
  fullName: string;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  defaultBranch: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  watchersCount: number;
  openIssuesCount: number;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  isArchived: boolean;
  isFork: boolean;
  isDisabled: boolean;
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  githubPushedAt?: Date;
  connectedBy: Types.ObjectId;
  connectedAt: Date;
  lastSyncedAt: Date;
  syncStartedAt?: Date;
  syncCompletedAt?: Date;
  syncError?: string;
  syncVersion: number;
  syncDuration: number;
  githubWebhookId?: string;
  webhookStatus?: 'Connected' | 'Disconnected' | 'Pending' | 'Sync Failed';
  lastWebhookAt?: Date;
  lastWebhookSuccessAt?: Date;
  webhookError?: string;
  failedWebhookCount?: number;
  status: RepositoryConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IGitHubRepositoryConnectionPayload;
}

const GitHubRepositoryConnectionSchema = new Schema<IGitHubRepositoryConnectionDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true,
    },
    githubConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubConnection',
      required: [true, 'GitHub Connection reference is required'],
      index: true,
    },
    githubRepositoryId: {
      type: String,
      required: [true, 'GitHub Repository ID is required'],
      index: true,
    },
    githubOwner: {
      type: String,
      required: [true, 'GitHub Owner is required'],
      trim: true,
    },
    githubOwnerId: {
      type: String,
      default: '',
    },
    repositoryName: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full repository name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal'],
      default: 'public',
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    language: {
      type: String,
      default: '',
    },
    stargazersCount: {
      type: Number,
      default: 0,
    },
    forksCount: {
      type: Number,
      default: 0,
    },
    openIssuesCount: {
      type: Number,
      default: 0,
    },
    watchersCount: {
      type: Number,
      default: 0,
    },
    htmlUrl: {
      type: String,
      required: [true, 'Repository HTML URL is required'],
      trim: true,
    },
    cloneUrl: {
      type: String,
      default: '',
      trim: true,
    },
    sshUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isFork: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    githubCreatedAt: {
      type: Date,
    },
    githubUpdatedAt: {
      type: Date,
    },
    githubPushedAt: {
      type: Date,
    },
    connectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Connected user is required'],
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    syncStartedAt: {
      type: Date,
    },
    syncCompletedAt: {
      type: Date,
    },
    syncError: {
      type: String,
      default: null,
    },
    syncVersion: {
      type: Number,
      default: 1,
    },
    syncDuration: {
      type: Number,
      default: 0,
    },
    githubWebhookId: {
      type: String,
      default: '',
    },
    webhookStatus: {
      type: String,
      enum: ['Connected', 'Disconnected', 'Pending', 'Sync Failed'],
      default: 'Pending',
    },
    lastWebhookAt: {
      type: Date,
    },
    lastWebhookSuccessAt: {
      type: Date,
    },
    webhookError: {
      type: String,
      default: null,
    },
    failedWebhookCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Never Synced', 'Syncing', 'Synced', 'Connected', 'Disconnected', 'Sync Failed', 'Archived'],
      default: 'Connected',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for organizational isolation and project lookups
GitHubRepositoryConnectionSchema.index({ organization: 1, project: 1, status: 1 });
GitHubRepositoryConnectionSchema.index({ project: 1, githubRepositoryId: 1, status: 1 });

GitHubRepositoryConnectionSchema.methods.toPayload = function (): IGitHubRepositoryConnectionPayload {
  return {
    id: this._id.toString(),
    organizationId: this.organization ? this.organization.toString() : '',
    workspaceId: this.workspace ? this.workspace.toString() : '',
    projectId: this.project ? this.project.toString() : '',
    githubConnectionId: this.githubConnection ? this.githubConnection.toString() : '',
    githubRepositoryId: this.githubRepositoryId || '',
    githubOwner: this.githubOwner || '',
    githubOwnerId: this.githubOwnerId || '',
    repositoryName: this.repositoryName || '',
    fullName: this.fullName || '',
    description: this.description || '',
    visibility: this.visibility || 'public',
    defaultBranch: this.defaultBranch || 'main',
    language: this.language || '',
    stargazersCount: this.stargazersCount || 0,
    forksCount: this.forksCount || 0,
    watchersCount: this.watchersCount || 0,
    openIssuesCount: this.openIssuesCount || 0,
    htmlUrl: this.htmlUrl || '',
    cloneUrl: this.cloneUrl || '',
    sshUrl: this.sshUrl || '',
    isArchived: !!this.isArchived,
    isFork: !!this.isFork,
    isDisabled: !!this.isDisabled,
    githubCreatedAt: this.githubCreatedAt ? this.githubCreatedAt.toISOString() : undefined,
    githubUpdatedAt: this.githubUpdatedAt ? this.githubUpdatedAt.toISOString() : undefined,
    githubPushedAt: this.githubPushedAt ? this.githubPushedAt.toISOString() : undefined,
    connectedBy: this.connectedBy ? this.connectedBy.toString() : '',
    connectedAt: this.connectedAt ? this.connectedAt.toISOString() : new Date().toISOString(),
    lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : new Date().toISOString(),
    syncStartedAt: this.syncStartedAt ? this.syncStartedAt.toISOString() : undefined,
    syncCompletedAt: this.syncCompletedAt ? this.syncCompletedAt.toISOString() : undefined,
    syncError: this.syncError || null,
    syncVersion: this.syncVersion || 1,
    syncDuration: this.syncDuration || 0,
    githubWebhookId: this.githubWebhookId || undefined,
    webhookStatus: this.webhookStatus || 'Pending',
    lastWebhookAt: this.lastWebhookAt ? this.lastWebhookAt.toISOString() : undefined,
    lastWebhookSuccessAt: this.lastWebhookSuccessAt ? this.lastWebhookSuccessAt.toISOString() : undefined,
    webhookError: this.webhookError || null,
    failedWebhookCount: this.failedWebhookCount || 0,
    status: this.status || 'Connected',
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubRepositoryConnectionModel = model<IGitHubRepositoryConnectionDocument>(
  'GitHubRepositoryConnection',
  GitHubRepositoryConnectionSchema
);

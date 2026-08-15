import { Schema, Document, model, Types } from 'mongoose';

export type GitHubPRReviewStatus = 'Pending' | 'Approved' | 'Changes Requested' | 'Mixed' | 'Merged' | 'Closed';

export interface IGitHubPullRequestPayload {
  id: string;
  organization: string;
  workspace: string;
  project: string;
  repositoryConnection: string;
  task?: string | null;
  githubIssue?: string | null;
  githubPullRequestId: number;
  githubPullRequestNumber: number;
  nodeId?: string;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  stateReason?: string | null;
  draft: boolean;
  merged: boolean;
  mergeable?: boolean;
  author: {
    login: string;
    name?: string;
    avatar_url: string;
    html_url?: string;
  };
  reviewers: Array<{
    login: string;
    name?: string;
    avatar_url: string;
    state: string;
  }>;
  reviewStatus: GitHubPRReviewStatus;
  sourceBranch: string;
  targetBranch: string;
  sourceSha?: string;
  targetSha?: string;
  githubUrl: string;
  createdAtGithub?: string;
  updatedAtGithub?: string;
  closedAtGithub?: string | null;
  mergedAtGithub?: string | null;
  lastSyncedAt: string;
  syncStatus: 'Synced' | 'Sync Failed' | 'Pending';
  syncError?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubPullRequestDocument extends Document {
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  repositoryConnection: Types.ObjectId;
  task?: Types.ObjectId | null;
  githubIssue?: Types.ObjectId | null;
  githubPullRequestId: number;
  githubPullRequestNumber: number;
  nodeId?: string;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  stateReason?: string | null;
  draft: boolean;
  merged: boolean;
  mergeable?: boolean;
  author: {
    login: string;
    name?: string;
    avatar_url: string;
    html_url?: string;
  };
  reviewers: Array<{
    login: string;
    name?: string;
    avatar_url: string;
    state: string;
  }>;
  reviewStatus: GitHubPRReviewStatus;
  sourceBranch: string;
  targetBranch: string;
  sourceSha?: string;
  targetSha?: string;
  githubUrl: string;
  createdAtGithub?: Date;
  updatedAtGithub?: Date;
  closedAtGithub?: Date | null;
  mergedAtGithub?: Date | null;
  lastSyncedAt: Date;
  syncStatus: 'Synced' | 'Sync Failed' | 'Pending';
  syncError?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  toPayload(): IGitHubPullRequestPayload;
}

const GitHubPullRequestSchema = new Schema<IGitHubPullRequestDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    repositoryConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    githubIssue: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubIssueMapping',
      default: null,
      index: true,
    },
    githubPullRequestId: {
      type: Number,
      required: true,
    },
    githubPullRequestNumber: {
      type: Number,
      required: true,
    },
    nodeId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      enum: ['open', 'closed', 'merged'],
      default: 'open',
      required: true,
    },
    stateReason: {
      type: String,
      default: null,
    },
    draft: {
      type: Boolean,
      default: false,
    },
    merged: {
      type: Boolean,
      default: false,
    },
    mergeable: {
      type: Boolean,
      default: true,
    },
    author: {
      login: { type: String, required: true },
      name: { type: String, default: '' },
      avatar_url: { type: String, default: '' },
      html_url: { type: String, default: '' },
    },
    reviewers: [
      {
        login: { type: String, required: true },
        name: { type: String, default: '' },
        avatar_url: { type: String, default: '' },
        state: { type: String, default: 'PENDING' },
      },
    ],
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Changes Requested', 'Mixed', 'Merged', 'Closed'],
      default: 'Pending',
    },
    sourceBranch: {
      type: String,
      required: true,
    },
    targetBranch: {
      type: String,
      required: true,
    },
    sourceSha: {
      type: String,
      default: '',
    },
    targetSha: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      required: true,
    },
    createdAtGithub: {
      type: Date,
      default: Date.now,
    },
    updatedAtGithub: {
      type: Date,
      default: Date.now,
    },
    closedAtGithub: {
      type: Date,
      default: null,
    },
    mergedAtGithub: {
      type: Date,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ['Synced', 'Sync Failed', 'Pending'],
      default: 'Synced',
    },
    syncError: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate mappings for same PR on same repository connection and project
GitHubPullRequestSchema.index(
  { repositoryConnection: 1, githubPullRequestNumber: 1, project: 1 },
  { unique: true }
);

GitHubPullRequestSchema.methods.toPayload = function (): IGitHubPullRequestPayload {
  return {
    id: this._id.toString(),
    organization: this.organization ? this.organization.toString() : '',
    workspace: this.workspace ? this.workspace.toString() : '',
    project: this.project ? this.project.toString() : '',
    repositoryConnection: this.repositoryConnection ? this.repositoryConnection.toString() : '',
    task: this.task ? this.task.toString() : null,
    githubIssue: this.githubIssue ? this.githubIssue.toString() : null,
    githubPullRequestId: this.githubPullRequestId,
    githubPullRequestNumber: this.githubPullRequestNumber,
    nodeId: this.nodeId || undefined,
    title: this.title,
    body: this.body || '',
    state: this.state,
    stateReason: this.stateReason,
    draft: !!this.draft,
    merged: !!this.merged,
    mergeable: this.mergeable,
    author: this.author,
    reviewers: this.reviewers || [],
    reviewStatus: this.reviewStatus,
    sourceBranch: this.sourceBranch,
    targetBranch: this.targetBranch,
    sourceSha: this.sourceSha || undefined,
    targetSha: this.targetSha || undefined,
    githubUrl: this.githubUrl,
    createdAtGithub: this.createdAtGithub ? this.createdAtGithub.toISOString() : undefined,
    updatedAtGithub: this.updatedAtGithub ? this.updatedAtGithub.toISOString() : undefined,
    closedAtGithub: this.closedAtGithub ? this.closedAtGithub.toISOString() : null,
    mergedAtGithub: this.mergedAtGithub ? this.mergedAtGithub.toISOString() : null,
    lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : new Date().toISOString(),
    syncStatus: this.syncStatus,
    syncError: this.syncError || undefined,
    createdBy: this.createdBy ? this.createdBy.toString() : undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubPullRequestModel = model<IGitHubPullRequestDocument>(
  'GitHubPullRequest',
  GitHubPullRequestSchema
);

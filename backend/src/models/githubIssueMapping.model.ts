import { Schema, Document, model, Types } from 'mongoose';

export type GitHubIssueRelationshipType =
  | 'Imported From GitHub'
  | 'Linked To GitHub'
  | 'Created From TaskFlow';

export type GitHubIssueSyncStatus = 'Synced' | 'Sync Failed' | 'Pending';

export interface IGitHubIssueLabelPayload {
  name: string;
  color?: string;
  description?: string;
}

export interface IGitHubIssueMappingPayload {
  id: string;
  organization: string;
  workspace: string;
  project: string;
  repositoryConnection: string;
  task: string;
  githubIssueId: number;
  githubIssueNumber: number;
  githubNodeId?: string;
  githubTitle: string;
  githubBody: string;
  githubState: 'open' | 'closed';
  githubStateReason?: string | null;
  githubAuthor: string;
  githubAuthorAvatar?: string;
  githubUrl: string;
  githubLabels: IGitHubIssueLabelPayload[];
  githubAssignees: string[];
  githubCommentsCount: number;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
  githubClosedAt?: string | null;
  relationshipType: GitHubIssueRelationshipType;
  lastSyncedAt: string;
  syncStatus: GitHubIssueSyncStatus;
  syncError?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubIssueMappingDocument extends Document {
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  repositoryConnection: Types.ObjectId;
  task: Types.ObjectId;
  githubIssueId: number;
  githubIssueNumber: number;
  githubNodeId?: string;
  githubTitle: string;
  githubBody: string;
  githubState: 'open' | 'closed';
  githubStateReason?: string | null;
  githubAuthor: string;
  githubAuthorAvatar?: string;
  githubUrl: string;
  githubLabels: IGitHubIssueLabelPayload[];
  githubAssignees: string[];
  githubCommentsCount: number;
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  githubClosedAt?: Date | null;
  relationshipType: GitHubIssueRelationshipType;
  lastSyncedAt: Date;
  syncStatus: GitHubIssueSyncStatus;
  syncError?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  toPayload(): IGitHubIssueMappingPayload;
}

const GitHubIssueMappingSchema = new Schema<IGitHubIssueMappingDocument>(
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
      required: true,
      index: true,
    },
    githubIssueId: {
      type: Number,
      required: true,
    },
    githubIssueNumber: {
      type: Number,
      required: true,
    },
    githubNodeId: {
      type: String,
      default: '',
    },
    githubTitle: {
      type: String,
      required: true,
      trim: true,
    },
    githubBody: {
      type: String,
      default: '',
    },
    githubState: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      required: true,
    },
    githubStateReason: {
      type: String,
      default: null,
    },
    githubAuthor: {
      type: String,
      required: true,
      trim: true,
    },
    githubAuthorAvatar: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },
    githubLabels: [
      {
        name: { type: String, required: true },
        color: { type: String, default: '888888' },
        description: { type: String, default: '' },
      },
    ],
    githubAssignees: [
      {
        type: String,
      },
    ],
    githubCommentsCount: {
      type: Number,
      default: 0,
    },
    githubCreatedAt: {
      type: Date,
      default: Date.now,
    },
    githubUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    githubClosedAt: {
      type: Date,
      default: null,
    },
    relationshipType: {
      type: String,
      enum: ['Imported From GitHub', 'Linked To GitHub', 'Created From TaskFlow'],
      default: 'Imported From GitHub',
      required: true,
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

// Unique compound index to prevent duplicate import of the same issue into the same project
GitHubIssueMappingSchema.index(
  { repositoryConnection: 1, githubIssueNumber: 1, project: 1 },
  { unique: true }
);

GitHubIssueMappingSchema.methods.toPayload = function (): IGitHubIssueMappingPayload {
  return {
    id: this._id.toString(),
    organization: this.organization ? this.organization.toString() : '',
    workspace: this.workspace ? this.workspace.toString() : '',
    project: this.project ? this.project.toString() : '',
    repositoryConnection: this.repositoryConnection ? this.repositoryConnection.toString() : '',
    task: this.task ? this.task.toString() : '',
    githubIssueId: this.githubIssueId,
    githubIssueNumber: this.githubIssueNumber,
    githubNodeId: this.githubNodeId || undefined,
    githubTitle: this.githubTitle,
    githubBody: this.githubBody || '',
    githubState: this.githubState,
    githubStateReason: this.githubStateReason,
    githubAuthor: this.githubAuthor,
    githubAuthorAvatar: this.githubAuthorAvatar || undefined,
    githubUrl: this.githubUrl,
    githubLabels: (this.githubLabels || []).map((lbl: any) => ({
      name: lbl.name,
      color: lbl.color,
      description: lbl.description,
    })),
    githubAssignees: this.githubAssignees || [],
    githubCommentsCount: this.githubCommentsCount || 0,
    githubCreatedAt: this.githubCreatedAt ? this.githubCreatedAt.toISOString() : undefined,
    githubUpdatedAt: this.githubUpdatedAt ? this.githubUpdatedAt.toISOString() : undefined,
    githubClosedAt: this.githubClosedAt ? this.githubClosedAt.toISOString() : null,
    relationshipType: this.relationshipType,
    lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : new Date().toISOString(),
    syncStatus: this.syncStatus,
    syncError: this.syncError || undefined,
    createdBy: this.createdBy ? this.createdBy.toString() : undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubIssueMappingModel = model<IGitHubIssueMappingDocument>(
  'GitHubIssueMapping',
  GitHubIssueMappingSchema
);

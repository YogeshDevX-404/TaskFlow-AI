import { Schema, Document, model, Types } from 'mongoose';

export type SyncHistoryStatus = 'Synced' | 'Sync Failed';

export interface IGitHubSyncHistoryPayload {
  id: string;
  connectionId: string;
  projectId: string;
  organizationId: string;
  triggeredBy: string;
  triggeredByName?: string;
  status: SyncHistoryStatus;
  syncStartedAt: string;
  syncCompletedAt: string;
  durationMs: number;
  changesDetected: string[];
  error?: string | null;
  createdAt: string;
}

export interface IGitHubSyncHistoryDocument extends Document {
  connection: Types.ObjectId;
  project: Types.ObjectId;
  organization: Types.ObjectId;
  triggeredBy: Types.ObjectId;
  status: SyncHistoryStatus;
  syncStartedAt: Date;
  syncCompletedAt: Date;
  durationMs: number;
  changesDetected: string[];
  error?: string;
  createdAt: Date;
  toPayload(triggeredByName?: string): IGitHubSyncHistoryPayload;
}

const GitHubSyncHistorySchema = new Schema<IGitHubSyncHistoryDocument>(
  {
    connection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      required: [true, 'Repository connection ID is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Triggered by user is required'],
    },
    status: {
      type: String,
      enum: ['Synced', 'Sync Failed'],
      required: true,
    },
    syncStartedAt: {
      type: Date,
      required: true,
    },
    syncCompletedAt: {
      type: Date,
      required: true,
    },
    durationMs: {
      type: Number,
      required: true,
      default: 0,
    },
    changesDetected: {
      type: [String],
      default: [],
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

GitHubSyncHistorySchema.index({ connection: 1, createdAt: -1 });

GitHubSyncHistorySchema.methods.toPayload = function (
  triggeredByName?: string
): IGitHubSyncHistoryPayload {
  return {
    id: this._id.toString(),
    connectionId: this.connection ? this.connection.toString() : '',
    projectId: this.project ? this.project.toString() : '',
    organizationId: this.organization ? this.organization.toString() : '',
    triggeredBy: this.triggeredBy ? this.triggeredBy.toString() : '',
    triggeredByName: triggeredByName || 'Authorized User',
    status: this.status,
    syncStartedAt: this.syncStartedAt ? this.syncStartedAt.toISOString() : new Date().toISOString(),
    syncCompletedAt: this.syncCompletedAt ? this.syncCompletedAt.toISOString() : new Date().toISOString(),
    durationMs: this.durationMs || 0,
    changesDetected: this.changesDetected || [],
    error: this.error || null,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubSyncHistoryModel = model<IGitHubSyncHistoryDocument>(
  'GitHubSyncHistory',
  GitHubSyncHistorySchema
);

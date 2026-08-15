import { Schema, Document, model, Types } from 'mongoose';

export type WebhookEventStatus = 'Received' | 'Processing' | 'Processed' | 'Ignored' | 'Failed' | 'Retrying';

export interface IGitHubWebhookEventPayload {
  id: string;
  deliveryId: string;
  eventType: string;
  action?: string;
  repositoryConnectionId?: string;
  repositoryId?: string;
  repositoryFullName?: string;
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  payloadHash: string;
  sender?: {
    login: string;
    id?: number;
    avatar_url?: string;
  };
  status: WebhookEventStatus;
  ignoreReason?: string;
  error?: string;
  attempts: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubWebhookEventDocument extends Document {
  deliveryId: string;
  eventType: string;
  action?: string;
  repositoryConnection?: Types.ObjectId;
  repositoryId?: string;
  repositoryFullName?: string;
  organization?: Types.ObjectId;
  workspace?: Types.ObjectId;
  project?: Types.ObjectId;
  payloadHash: string;
  sender?: {
    login: string;
    id?: number;
    avatar_url?: string;
  };
  status: WebhookEventStatus;
  ignoreReason?: string;
  error?: string;
  attempts: number;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IGitHubWebhookEventPayload;
}

const GitHubWebhookEventSchema = new Schema<IGitHubWebhookEventDocument>(
  {
    deliveryId: {
      type: String,
      required: [true, 'GitHub Delivery ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      index: true,
      trim: true,
    },
    action: {
      type: String,
      default: '',
      trim: true,
    },
    repositoryConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      index: true,
    },
    repositoryId: {
      type: String,
      default: '',
      index: true,
    },
    repositoryFullName: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    payloadHash: {
      type: String,
      required: [true, 'Payload hash is required'],
    },
    sender: {
      login: { type: String, default: '' },
      id: { type: Number },
      avatar_url: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Received', 'Processing', 'Processed', 'Ignored', 'Failed', 'Retrying'],
      default: 'Received',
      index: true,
    },
    ignoreReason: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GitHubWebhookEventSchema.index({ createdAt: -1 });
GitHubWebhookEventSchema.index({ repositoryFullName: 1, eventType: 1 });

GitHubWebhookEventSchema.methods.toPayload = function (): IGitHubWebhookEventPayload {
  return {
    id: this._id.toString(),
    deliveryId: this.deliveryId || '',
    eventType: this.eventType || '',
    action: this.action || undefined,
    repositoryConnectionId: this.repositoryConnection ? this.repositoryConnection.toString() : undefined,
    repositoryId: this.repositoryId || undefined,
    repositoryFullName: this.repositoryFullName || undefined,
    organizationId: this.organization ? this.organization.toString() : undefined,
    workspaceId: this.workspace ? this.workspace.toString() : undefined,
    projectId: this.project ? this.project.toString() : undefined,
    payloadHash: this.payloadHash || '',
    sender: this.sender ? { ...this.sender } : undefined,
    status: this.status || 'Received',
    ignoreReason: this.ignoreReason || undefined,
    error: this.error || undefined,
    attempts: this.attempts || 1,
    processedAt: this.processedAt ? this.processedAt.toISOString() : undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubWebhookEventModel = model<IGitHubWebhookEventDocument>(
  'GitHubWebhookEvent',
  GitHubWebhookEventSchema
);

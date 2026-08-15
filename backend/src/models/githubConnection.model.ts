import { Schema, Document, model, Types } from 'mongoose';

export type GitHubConnectionStatus =
  | 'Connected'
  | 'Disconnected'
  | 'Connection Failed'
  | 'Revoked'
  | 'Expired/Invalid';

export interface IGitHubConnectionPayload {
  id: string;
  userId: string;
  githubUserId: string;
  githubUsername: string;
  githubName: string;
  githubAvatarUrl: string;
  githubProfileUrl: string;
  githubEmail: string;
  scope: string;
  status: GitHubConnectionStatus;
  connectedAt: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubConnectionDocument extends Document {
  user: Types.ObjectId;
  githubUserId: string;
  githubUsername: string;
  githubName: string;
  githubAvatarUrl: string;
  githubProfileUrl: string;
  githubEmail: string;
  accessTokenEncrypted: string;
  scope: string;
  connectedAt: Date;
  lastSyncedAt: Date;
  status: GitHubConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IGitHubConnectionPayload;
}

const GitHubConnectionSchema = new Schema<IGitHubConnectionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    githubUserId: {
      type: String,
      required: [true, 'GitHub User ID is required'],
      index: true,
    },
    githubUsername: {
      type: String,
      required: [true, 'GitHub Username is required'],
      trim: true,
      index: true,
    },
    githubName: {
      type: String,
      default: '',
      trim: true,
    },
    githubAvatarUrl: {
      type: String,
      default: '',
    },
    githubProfileUrl: {
      type: String,
      default: '',
    },
    githubEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    accessTokenEncrypted: {
      type: String,
      required: [true, 'Encrypted access token is required'],
      select: false, // Hidden by default from queries to prevent token leaks
    },
    scope: {
      type: String,
      default: 'read:user user:email repo',
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Connected', 'Disconnected', 'Connection Failed', 'Revoked', 'Expired/Invalid'],
      default: 'Connected',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.accessTokenEncrypted; // Extra safeguard: never serialize token
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.accessTokenEncrypted;
        return ret;
      },
    },
  }
);

// Compound indexes for user lookups and account matching
GitHubConnectionSchema.index({ user: 1, status: 1 });
GitHubConnectionSchema.index({ githubUserId: 1, status: 1 });

GitHubConnectionSchema.methods.toPayload = function (): IGitHubConnectionPayload {
  return {
    id: this._id ? this._id.toString() : this.id,
    userId: this.user ? this.user.toString() : '',
    githubUserId: this.githubUserId || '',
    githubUsername: this.githubUsername || '',
    githubName: this.githubName || this.githubUsername || '',
    githubAvatarUrl: this.githubAvatarUrl || '',
    githubProfileUrl: this.githubProfileUrl || '',
    githubEmail: this.githubEmail || '',
    scope: this.scope || '',
    status: this.status,
    connectedAt: this.connectedAt ? this.connectedAt.toISOString() : new Date().toISOString(),
    lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : new Date().toISOString(),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubConnectionModel = model<IGitHubConnectionDocument>(
  'GitHubConnection',
  GitHubConnectionSchema
);

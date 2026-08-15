import { Schema, Document, model, Types } from 'mongoose';

export interface IGitHubBranchPayload {
  id: string;
  repositoryConnectionId: string;
  githubBranchName: string;
  githubCommitSha: string;
  protected: boolean;
  isDefault: boolean;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubBranchDocument extends Document {
  repositoryConnection: Types.ObjectId;
  githubBranchName: string;
  githubCommitSha: string;
  protected: boolean;
  isDefault: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IGitHubBranchPayload;
}

const GitHubBranchSchema = new Schema<IGitHubBranchDocument>(
  {
    repositoryConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      required: [true, 'Repository connection reference is required'],
      index: true,
    },
    githubBranchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    githubCommitSha: {
      type: String,
      required: [true, 'Commit SHA is required'],
      trim: true,
    },
    protected: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per repository connection and branch name
GitHubBranchSchema.index(
  { repositoryConnection: 1, githubBranchName: 1 },
  { unique: true }
);

GitHubBranchSchema.methods.toPayload = function (): IGitHubBranchPayload {
  return {
    id: this._id.toString(),
    repositoryConnectionId: this.repositoryConnection ? this.repositoryConnection.toString() : '',
    githubBranchName: this.githubBranchName,
    githubCommitSha: this.githubCommitSha,
    protected: !!this.protected,
    isDefault: !!this.isDefault,
    lastSyncedAt: this.lastSyncedAt ? this.lastSyncedAt.toISOString() : new Date().toISOString(),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubBranchModel = model<IGitHubBranchDocument>(
  'GitHubBranch',
  GitHubBranchSchema
);

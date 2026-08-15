import { Schema, Document, model, Types } from 'mongoose';

export interface IGitHubCommitPayload {
  id: string;
  repositoryConnectionId: string;
  githubCommitSha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  authorLogin?: string;
  authorAvatarUrl?: string;
  committerName?: string;
  committerEmail?: string;
  committerLogin?: string;
  commitUrl: string;
  branchName?: string;
  committedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGitHubCommitDocument extends Document {
  repositoryConnection: Types.ObjectId;
  githubCommitSha: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  authorLogin?: string;
  authorAvatarUrl?: string;
  committerName?: string;
  committerEmail?: string;
  committerLogin?: string;
  commitUrl: string;
  branchName?: string;
  committedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IGitHubCommitPayload;
}

const GitHubCommitSchema = new Schema<IGitHubCommitDocument>(
  {
    repositoryConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      required: [true, 'Repository connection reference is required'],
      index: true,
    },
    githubCommitSha: {
      type: String,
      required: [true, 'Commit SHA is required'],
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Commit message is required'],
      trim: true,
    },
    authorName: {
      type: String,
      default: '',
      trim: true,
    },
    authorEmail: {
      type: String,
      default: '',
      trim: true,
    },
    authorLogin: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    authorAvatarUrl: {
      type: String,
      default: '',
    },
    committerName: {
      type: String,
      default: '',
      trim: true,
    },
    committerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    committerLogin: {
      type: String,
      default: '',
      trim: true,
    },
    commitUrl: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    committedAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying repository commits
GitHubCommitSchema.index(
  { repositoryConnection: 1, githubCommitSha: 1 },
  { unique: true }
);

GitHubCommitSchema.methods.toPayload = function (): IGitHubCommitPayload {
  const sha = this.githubCommitSha || '';
  return {
    id: this._id.toString(),
    repositoryConnectionId: this.repositoryConnection ? this.repositoryConnection.toString() : '',
    githubCommitSha: sha,
    shortSha: sha.substring(0, 7),
    message: this.message,
    authorName: this.authorName || '',
    authorEmail: this.authorEmail || '',
    authorLogin: this.authorLogin || '',
    authorAvatarUrl: this.authorAvatarUrl || '',
    committerName: this.committerName || '',
    committerEmail: this.committerEmail || '',
    committerLogin: this.committerLogin || '',
    commitUrl: this.commitUrl,
    branchName: this.branchName || '',
    committedAt: this.committedAt ? this.committedAt.toISOString() : new Date().toISOString(),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const GitHubCommitModel = model<IGitHubCommitDocument>(
  'GitHubCommit',
  GitHubCommitSchema
);

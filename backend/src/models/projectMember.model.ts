import { Schema, Document, model, Types } from 'mongoose';

export type ProjectMemberRole =
  | 'Project Owner'
  | 'Project Admin'
  | 'Developer'
  | 'Tester'
  | 'Viewer';

export type ProjectMemberStatus = 'active' | 'pending' | 'suspended';

export interface IProjectMemberPayload {
  id: string;
  project: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    githubUsername?: string;
  } | string;
  organization: string;
  workspace: string;
  role: ProjectMemberRole;
  joinedAt: Date;
  addedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  status: ProjectMemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectMemberDocument extends Document {
  project: Types.ObjectId;
  user: Types.ObjectId;
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  role: ProjectMemberRole;
  joinedAt: Date;
  addedBy?: Types.ObjectId;
  status: ProjectMemberStatus;
  createdAt: Date;
  updatedAt: Date;
  toProjectMemberPayload(): IProjectMemberPayload;
}

const ProjectMemberSchema = new Schema<IProjectMemberDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
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
    role: {
      type: String,
      enum: ['Project Owner', 'Project Admin', 'Developer', 'Tester', 'Viewer'],
      default: 'Developer',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user is added only once per project
ProjectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
ProjectMemberSchema.index({ project: 1, role: 1 });
ProjectMemberSchema.index({ project: 1, status: 1 });

ProjectMemberSchema.methods.toProjectMemberPayload = function (): IProjectMemberPayload {
  const isUserPopulated =
    this.user && typeof this.user === 'object' && 'email' in (this.user as any);
  const isAddedByPopulated =
    this.addedBy && typeof this.addedBy === 'object' && 'email' in (this.addedBy as any);

  return {
    id: this._id.toString(),
    project: this.project ? this.project.toString() : '',
    user: isUserPopulated
      ? {
          id: (this.user as any)._id.toString(),
          firstName: (this.user as any).firstName || '',
          lastName: (this.user as any).lastName || '',
          email: (this.user as any).email || '',
          avatar: (this.user as any).avatar || '',
          githubUsername: (this.user as any).githubUsername || '',
        }
      : this.user.toString(),
    organization: this.organization ? this.organization.toString() : '',
    workspace: this.workspace ? this.workspace.toString() : '',
    role: this.role,
    joinedAt: this.joinedAt,
    addedBy: isAddedByPopulated
      ? {
          id: (this.addedBy as any)._id.toString(),
          firstName: (this.addedBy as any).firstName || '',
          lastName: (this.addedBy as any).lastName || '',
          email: (this.addedBy as any).email || '',
        }
      : this.addedBy
      ? this.addedBy.toString()
      : undefined,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ProjectMemberModel = model<IProjectMemberDocument>(
  'ProjectMember',
  ProjectMemberSchema
);

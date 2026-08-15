import { Schema, Document, model, Types } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectVisibility = 'private' | 'workspace' | 'organization';

export interface IProjectPayload {
  id: string;
  name: string;
  projectKey: string;
  description: string;
  icon: string;
  coverImage: string;
  workspace: string | any;
  organization: string | any;
  owner: string | any;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  repositoryUrl: string;
  websiteUrl: string;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  favoritesCount: number;
  pinnedCount: number;
  createdBy?: string | any;
  updatedBy?: string | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends Document {
  name: string;
  projectKey: string;
  description: string;
  icon: string;
  coverImage: string;
  workspace: Types.ObjectId;
  organization: Types.ObjectId;
  owner: Types.ObjectId;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  repositoryUrl: string;
  websiteUrl: string;
  startDate?: Date;
  endDate?: Date;
  isArchived: boolean;
  favorites: Types.ObjectId[];
  pinnedBy: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toProjectPayload(currentUserId?: string): IProjectPayload;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    projectKey: {
      type: String,
      required: [true, 'Project key is required'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'Project key cannot exceed 20 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    icon: {
      type: String,
      default: 'briefcase',
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'workspace', 'organization'],
      default: 'workspace',
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pinnedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Unique projectKey inside an organization
ProjectSchema.index({ organization: 1, projectKey: 1 }, { unique: true });

ProjectSchema.methods.toProjectPayload = function (
  currentUserId?: string
): IProjectPayload {
  const favoritesArray = this.favorites || [];
  const pinnedArray = this.pinnedBy || [];

  const isFav = currentUserId
    ? favoritesArray.some((id: any) => id.toString() === currentUserId.toString())
    : false;

  const isPin = currentUserId
    ? pinnedArray.some((id: any) => id.toString() === currentUserId.toString())
    : false;

  return {
    id: this._id.toString(),
    name: this.name,
    projectKey: this.projectKey,
    description: this.description || '',
    icon: this.icon || 'briefcase',
    coverImage: this.coverImage || '',
    workspace:
      this.workspace && typeof this.workspace === 'object' && '_id' in this.workspace
        ? {
            id: (this.workspace as any)._id.toString(),
            name: (this.workspace as any).name,
            slug: (this.workspace as any).slug,
          }
        : this.workspace
        ? this.workspace.toString()
        : '',
    organization:
      this.organization && typeof this.organization === 'object' && '_id' in this.organization
        ? {
            id: (this.organization as any)._id.toString(),
            name: (this.organization as any).name,
            slug: (this.organization as any).slug,
          }
        : this.organization
        ? this.organization.toString()
        : '',
    owner:
      this.owner && typeof this.owner === 'object' && '_id' in this.owner
        ? {
            id: (this.owner as any)._id.toString(),
            name: (this.owner as any).name,
            email: (this.owner as any).email,
            avatar: (this.owner as any).avatar,
          }
        : this.owner
        ? this.owner.toString()
        : '',
    visibility: this.visibility || 'workspace',
    status: this.status || 'active',
    repositoryUrl: this.repositoryUrl || '',
    websiteUrl: this.websiteUrl || '',
    startDate: this.startDate ? this.startDate.toISOString() : undefined,
    endDate: this.endDate ? this.endDate.toISOString() : undefined,
    isArchived: !!this.isArchived,
    isFavorite: isFav,
    isPinned: isPin,
    favoritesCount: favoritesArray.length,
    pinnedCount: pinnedArray.length,
    createdBy: this.createdBy
      ? typeof this.createdBy === 'object' && '_id' in this.createdBy
        ? {
            id: (this.createdBy as any)._id.toString(),
            name: (this.createdBy as any).name,
          }
        : this.createdBy.toString()
      : undefined,
    updatedBy: this.updatedBy
      ? typeof this.updatedBy === 'object' && '_id' in this.updatedBy
        ? {
            id: (this.updatedBy as any)._id.toString(),
            name: (this.updatedBy as any).name,
          }
        : this.updatedBy.toString()
      : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ProjectModel = model<IProjectDocument>('Project', ProjectSchema);

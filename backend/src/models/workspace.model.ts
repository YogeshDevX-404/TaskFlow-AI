import { Schema, Document, model, Types } from 'mongoose';

export type WorkspaceVisibility = 'private' | 'organization' | 'public';

export interface IWorkspacePayload {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  organization: string | any;
  owner: string | any;
  visibility: WorkspaceVisibility;
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

export interface IWorkspaceDocument extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  organization: Types.ObjectId;
  owner: Types.ObjectId;
  visibility: WorkspaceVisibility;
  isArchived: boolean;
  favorites: Types.ObjectId[];
  pinnedBy: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toWorkspacePayload(currentUserId?: string): IWorkspacePayload;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Workspace slug is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: 'layout',
      trim: true,
    },
    color: {
      type: String,
      default: '#4f46e5',
      trim: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace owner is required'],
      index: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'organization', 'public'],
      default: 'organization',
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

// Unique slug per organization
WorkspaceSchema.index({ organization: 1, slug: 1 }, { unique: true });

WorkspaceSchema.methods.toWorkspacePayload = function (
  currentUserId?: string
): IWorkspacePayload {
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
    slug: this.slug,
    description: this.description || '',
    icon: this.icon || 'layout',
    color: this.color || '#4f46e5',
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
    visibility: this.visibility || 'organization',
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

export const Workspace = model<IWorkspaceDocument>('Workspace', WorkspaceSchema);

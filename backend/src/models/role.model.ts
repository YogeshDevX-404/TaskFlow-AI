import { Schema, Document, model, Types } from 'mongoose';
import { IPermissionPayload } from './permission.model';

export interface IRolePayload {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: (IPermissionPayload | string)[];
  organization?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleDocument extends Document {
  name: string;
  slug: string;
  description: string;
  permissions: Types.ObjectId[];
  organization?: Types.ObjectId | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  toRolePayload(): IRolePayload;
}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ organization: 1, name: 1 }, { unique: true });

RoleSchema.methods.toRolePayload = function (): IRolePayload {
  const isPopulated =
    Array.isArray(this.permissions) &&
    this.permissions.length > 0 &&
    typeof this.permissions[0] === 'object' &&
    'name' in (this.permissions[0] as any);

  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    description: this.description,
    permissions: isPopulated
      ? this.permissions.map((p: any) =>
          typeof p === 'object' && 'toPermissionPayload' in p
            ? p.toPermissionPayload()
            : typeof p === 'object' && 'name' in p
            ? {
                id: p._id.toString(),
                name: p.name,
                description: p.description,
                module: p.module,
                action: p.action,
              }
            : p.toString()
        )
      : this.permissions.map((p) => p.toString()),
    organization: this.organization ? this.organization.toString() : null,
    isSystem: this.isSystem,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Role = model<IRoleDocument>('Role', RoleSchema);

import { Schema, Document, model, Types } from 'mongoose';

export type OrganizationMemberRole =
  | 'owner'
  | 'admin'
  | 'project_manager'
  | 'developer'
  | 'tester'
  | 'viewer'
  | 'member'
  | 'guest'
  | string;
export type OrganizationMemberStatus = 'active' | 'suspended';

export interface IOrganizationMemberPayload {
  id: string;
  organization: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  } | string;
  role: OrganizationMemberRole;
  joinedAt: Date;
  status: OrganizationMemberStatus;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationMemberDocument extends Document {
  organization: Types.ObjectId;
  user: Types.ObjectId;
  role: OrganizationMemberRole;
  joinedAt: Date;
  status: OrganizationMemberStatus;
  invitedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toMemberPayload(): IOrganizationMemberPayload;
}

const OrganizationMemberSchema = new Schema<IOrganizationMemberDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    role: {
      type: String,
      required: true,
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user is only added once per organization
OrganizationMemberSchema.index({ organization: 1, user: 1 }, { unique: true });
OrganizationMemberSchema.index({ organization: 1, role: 1 });
OrganizationMemberSchema.index({ organization: 1, status: 1 });

OrganizationMemberSchema.methods.toMemberPayload = function (): IOrganizationMemberPayload {
  const isUserPopulated = this.user && typeof this.user === 'object' && 'email' in (this.user as any);
  const isInvitedByPopulated =
    this.invitedBy && typeof this.invitedBy === 'object' && 'email' in (this.invitedBy as any);

  return {
    id: this._id.toString(),
    organization: this.organization.toString(),
    user: isUserPopulated
      ? {
          id: (this.user as any)._id.toString(),
          firstName: (this.user as any).firstName || '',
          lastName: (this.user as any).lastName || '',
          email: (this.user as any).email || '',
          avatar: (this.user as any).avatar || '',
        }
      : this.user.toString(),
    role: this.role,
    joinedAt: this.joinedAt,
    status: this.status,
    invitedBy: isInvitedByPopulated
      ? {
          id: (this.invitedBy as any)._id.toString(),
          firstName: (this.invitedBy as any).firstName || '',
          lastName: (this.invitedBy as any).lastName || '',
          email: (this.invitedBy as any).email || '',
        }
      : this.invitedBy
      ? this.invitedBy.toString()
      : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const OrganizationMember = model<IOrganizationMemberDocument>(
  'OrganizationMember',
  OrganizationMemberSchema
);

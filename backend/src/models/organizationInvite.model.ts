import { Schema, Document, model, Types } from 'mongoose';
import { OrganizationMemberRole } from './organizationMember.model';

export type OrganizationInviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface IOrganizationInvitePayload {
  id: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
    slug: string;
  } | string;
  email: string;
  token: string;
  role: OrganizationMemberRole;
  status: OrganizationInviteStatus;
  expiresAt: Date;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationInviteDocument extends Document {
  organization: Types.ObjectId;
  email: string;
  token: string;
  role: OrganizationMemberRole;
  status: OrganizationInviteStatus;
  expiresAt: Date;
  invitedBy: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toInvitePayload(): IOrganizationInvitePayload;
}

const OrganizationInviteSchema = new Schema<IOrganizationInviteDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Invited email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Invitation token is required'],
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'guest'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter user is required'],
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

OrganizationInviteSchema.index({ organization: 1, email: 1, status: 1 });

OrganizationInviteSchema.methods.toInvitePayload = function (): IOrganizationInvitePayload {
  const isOrgPopulated =
    this.organization && typeof this.organization === 'object' && 'name' in (this.organization as any);
  const isInvitedByPopulated =
    this.invitedBy && typeof this.invitedBy === 'object' && 'email' in (this.invitedBy as any);

  return {
    id: this._id.toString(),
    organization: isOrgPopulated
      ? {
          id: (this.organization as any)._id.toString(),
          name: (this.organization as any).name || '',
          logo: (this.organization as any).logo || '',
          slug: (this.organization as any).slug || '',
        }
      : this.organization.toString(),
    email: this.email,
    token: this.token,
    role: this.role,
    status: this.status,
    expiresAt: this.expiresAt,
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
    acceptedAt: this.acceptedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const OrganizationInvite = model<IOrganizationInviteDocument>(
  'OrganizationInvite',
  OrganizationInviteSchema
);

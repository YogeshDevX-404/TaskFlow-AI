import { Schema, Document, model } from 'mongoose';

export type OrganizationStatus = 'active' | 'archived' | 'suspended';

export interface IOrganizationPayload {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  industry: string;
  companySize: string;
  timezone: string;
  country: string;
  owner: string;
  status: OrganizationStatus;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationDocument extends Document {
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  industry: string;
  companySize: string;
  timezone: string;
  country: string;
  owner: Schema.Types.ObjectId;
  status: OrganizationStatus;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  toOrganizationPayload(): IOrganizationPayload;
}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    companySize: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    country: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organization owner is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'suspended'],
      default: 'active',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrganizationSchema.index({ owner: 1, isArchived: 1 });
OrganizationSchema.index({ name: 'text', description: 'text', industry: 'text' });

OrganizationSchema.methods.toOrganizationPayload = function (): IOrganizationPayload {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    logo: this.logo || '',
    description: this.description || '',
    website: this.website || '',
    industry: this.industry || '',
    companySize: this.companySize || '',
    timezone: this.timezone || 'UTC',
    country: this.country || '',
    owner: this.owner.toString(),
    status: this.status || 'active',
    isArchived: Boolean(this.isArchived),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Organization = model<IOrganizationDocument>('Organization', OrganizationSchema);

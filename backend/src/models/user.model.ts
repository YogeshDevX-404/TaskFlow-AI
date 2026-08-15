import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, IUserPayload } from '../types';

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  provider?: string;
  providerId?: string;
  githubUsername?: string;
  githubProfileUrl?: string;
  googleId?: string;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toUserPayload(): IUserPayload;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      default: 'local',
    },
    providerId: {
      type: String,
      default: '',
    },
    githubUsername: {
      type: String,
      default: '',
    },
    githubProfileUrl: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// Pre-save hook: Hash password if modified
UserSchema.pre<IUserDocument>('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password instance method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform to standardized user payload
UserSchema.methods.toUserPayload = function (): IUserPayload {
  return {
    id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    avatar: this.avatar || '',
    role: this.role,
    isVerified: this.isVerified,
    isActive: this.isActive,
    provider: this.provider || 'local',
    providerId: this.providerId || '',
    githubUsername: this.githubUsername || '',
    githubProfileUrl: this.githubProfileUrl || '',
    googleId: this.googleId || '',
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

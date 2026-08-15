import { Schema, Document, model, Types } from 'mongoose';

export interface INotificationPreferencePayload {
  id: string;
  user: any;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  taskNotifications: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
  projectNotifications: boolean;
  sprintNotifications: boolean;
  releaseNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPreferenceDocument extends Document {
  user: Types.ObjectId;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  taskNotifications: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
  projectNotifications: boolean;
  sprintNotifications: boolean;
  releaseNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): INotificationPreferencePayload;
}

const NotificationPreferenceSchema = new Schema<INotificationPreferenceDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
    taskNotifications: { type: Boolean, default: true },
    commentNotifications: { type: Boolean, default: true },
    mentionNotifications: { type: Boolean, default: true },
    projectNotifications: { type: Boolean, default: true },
    sprintNotifications: { type: Boolean, default: true },
    releaseNotifications: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

NotificationPreferenceSchema.methods.toPayload = function (): INotificationPreferencePayload {
  return {
    id: this._id ? this._id.toString() : this.id,
    user: this.user,
    emailNotifications: !!this.emailNotifications,
    inAppNotifications: !!this.inAppNotifications,
    taskNotifications: !!this.taskNotifications,
    commentNotifications: !!this.commentNotifications,
    mentionNotifications: !!this.mentionNotifications,
    projectNotifications: !!this.projectNotifications,
    sprintNotifications: !!this.sprintNotifications,
    releaseNotifications: !!this.releaseNotifications,
    dailyDigest: !!this.dailyDigest,
    weeklyDigest: !!this.weeklyDigest,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const NotificationPreferenceModel = model<INotificationPreferenceDocument>(
  'NotificationPreference',
  NotificationPreferenceSchema
);

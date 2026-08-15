import { Schema, Document, model, Types } from 'mongoose';

export type NotificationType =
  | 'Task Assigned'
  | 'Task Updated'
  | 'Task Completed'
  | 'Task Deleted'
  | 'Assignment Created'
  | 'Assignment Reassigned'
  | 'Assignment Due Soon'
  | 'Assignment Overdue'
  | 'Changes Requested'
  | 'Assignment Submitted'
  | 'Assignment Completed'
  | 'Assignment Blocked'
  | 'Assignment Comment'
  | 'Comment Added'
  | 'Mention'
  | 'Attachment Uploaded'
  | 'Project Updated'
  | 'Sprint Started'
  | 'Sprint Completed'
  | 'Release Published'
  | 'Member Invited'
  | 'Member Joined'
  | 'Role Changed'
  | 'Due Date Reminder'
  | 'Deadline Passed'
  | 'System Notification';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type DeliveryStatus = 'Pending' | 'Delivered' | 'Failed';

export interface INotificationPayload {
  id: string;
  organization?: any;
  workspace?: any;
  project?: any;
  task?: any;
  recipient: any;
  sender?: any;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  deliveryStatus: DeliveryStatus;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationDocument extends Document {
  organization?: Types.ObjectId;
  workspace?: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  readAt?: Date;
  deliveryStatus: DeliveryStatus;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): INotificationPayload;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user is required'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'Task Assigned',
        'Task Updated',
        'Task Completed',
        'Task Deleted',
        'Comment Added',
        'Mention',
        'Attachment Uploaded',
        'Project Updated',
        'Sprint Started',
        'Sprint Completed',
        'Release Published',
        'Member Invited',
        'Member Joined',
        'Role Changed',
        'Due Date Reminder',
        'Deadline Passed',
        'System Notification',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Critical'],
      default: 'Normal',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Delivered', 'Failed'],
      default: 'Delivered',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isMuted: {
      type: Boolean,
      default: false,
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
        return ret;
      },
    },
  }
);

NotificationSchema.methods.toPayload = function (): INotificationPayload {
  return {
    id: this._id ? this._id.toString() : this.id,
    organization: this.organization,
    workspace: this.workspace,
    project: this.project,
    task: this.task,
    recipient: this.recipient,
    sender: this.sender,
    type: this.type,
    title: this.title,
    message: this.message,
    data: this.data || {},
    priority: this.priority || 'Normal',
    read: !!this.read,
    readAt: this.readAt ? this.readAt.toISOString() : undefined,
    deliveryStatus: this.deliveryStatus || 'Delivered',
    isArchived: !!this.isArchived,
    isPinned: !!this.isPinned,
    isMuted: !!this.isMuted,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const NotificationModel = model<INotificationDocument>('Notification', NotificationSchema);

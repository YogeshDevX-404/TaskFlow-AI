import { Schema, Document, model, Types } from 'mongoose';

export type EmailLogStatus = 'Queued' | 'Sent' | 'Failed' | 'Skipped';

export interface IEmailLogPayload {
  id: string;
  recipient: string;
  sender?: string;
  type: string;
  subject: string;
  status: EmailLogStatus;
  provider: string;
  messageId?: string;
  idempotencyKey?: string;
  entityType?: string;
  entityId?: string;
  error?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEmailLogDocument extends Document {
  recipient: string;
  sender?: string;
  type: string;
  subject: string;
  status: EmailLogStatus;
  provider: string;
  messageId?: string;
  idempotencyKey?: string;
  entityType?: string;
  entityId?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IEmailLogPayload;
}

const EmailLogSchema = new Schema<IEmailLogDocument>(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    sender: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Queued', 'Sent', 'Failed', 'Skipped'],
      default: 'Sent',
      index: true,
    },
    provider: {
      type: String,
      default: 'development',
    },
    messageId: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      index: true,
    },
    entityType: {
      type: String,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

EmailLogSchema.methods.toPayload = function (): IEmailLogPayload {
  return {
    id: this._id ? this._id.toString() : this.id,
    recipient: this.recipient,
    sender: this.sender,
    type: this.type,
    subject: this.subject,
    status: this.status,
    provider: this.provider,
    messageId: this.messageId,
    idempotencyKey: this.idempotencyKey,
    entityType: this.entityType,
    entityId: this.entityId,
    error: this.error,
    sentAt: this.sentAt ? this.sentAt.toISOString() : undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const EmailLogModel = model<IEmailLogDocument>('EmailLog', EmailLogSchema);

import { Schema, Document, model, Types } from 'mongoose';

export type AttachmentCategory = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';

export interface IAttachmentPayload {
  id: string;
  task: string | any;
  project: string | any;
  workspace: string | any;
  organization: string | any;
  uploadedBy: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: AttachmentCategory;
  mimeType: string;
  fileSize: number;
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IAttachmentDocument extends Document {
  task: Types.ObjectId;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  organization: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: AttachmentCategory;
  mimeType: string;
  fileSize: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IAttachmentPayload;
}

const AttachmentSchema = new Schema<IAttachmentDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user reference is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'archive', 'other'],
      required: true,
      default: 'other',
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
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
    toObject: {
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

AttachmentSchema.index({ task: 1, createdAt: -1 });

AttachmentSchema.methods.toPayload = function (): IAttachmentPayload {
  let uploaderObj: any = this.uploadedBy;
  if (typeof this.uploadedBy === 'object' && this.uploadedBy && (this.uploadedBy as any)._id) {
    const userDoc: any = this.uploadedBy;
    uploaderObj = {
      id: userDoc._id.toString(),
      name:
        userDoc.name ||
        `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() ||
        'User',
      email: userDoc.email,
      avatar: userDoc.avatar,
    };
  } else if (typeof this.uploadedBy === 'object' && (this.uploadedBy as any).id) {
    uploaderObj = {
      id: (this.uploadedBy as any).id,
      name: (this.uploadedBy as any).name || 'User',
      email: (this.uploadedBy as any).email,
      avatar: (this.uploadedBy as any).avatar,
    };
  }

  return {
    id: this._id ? this._id.toString() : this.id,
    task: typeof this.task === 'object' && (this.task as any)._id ? (this.task as any)._id.toString() : this.task,
    project: typeof this.project === 'object' && (this.project as any)._id ? (this.project as any)._id.toString() : this.project,
    workspace: typeof this.workspace === 'object' && (this.workspace as any)._id ? (this.workspace as any)._id.toString() : this.workspace,
    organization: typeof this.organization === 'object' && (this.organization as any)._id ? (this.organization as any)._id.toString() : this.organization,
    uploadedBy: uploaderObj,
    fileName: this.fileName,
    originalName: this.originalName,
    fileUrl: this.fileUrl,
    publicId: this.publicId,
    fileType: this.fileType,
    mimeType: this.mimeType,
    fileSize: this.fileSize,
    version: this.version || 1,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const AttachmentModel = model<IAttachmentDocument>('Attachment', AttachmentSchema);

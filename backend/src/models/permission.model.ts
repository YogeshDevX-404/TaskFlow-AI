import { Schema, Document, model } from 'mongoose';

export interface IPermissionPayload {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface IPermissionDocument extends Document {
  name: string;
  description: string;
  module: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
  toPermissionPayload(): IPermissionPayload;
}

const PermissionSchema = new Schema<IPermissionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Permission description is required'],
      trim: true,
    },
    module: {
      type: String,
      required: [true, 'Permission module is required'],
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Permission action is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PermissionSchema.methods.toPermissionPayload = function (): IPermissionPayload {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    module: this.module,
    action: this.action,
  };
};

export const Permission = model<IPermissionDocument>('Permission', PermissionSchema);

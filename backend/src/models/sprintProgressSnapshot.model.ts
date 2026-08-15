import { Schema, Document, model, Types } from 'mongoose';

export interface ISprintProgressSnapshotDocument extends Document {
  sprintId: Types.ObjectId;
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  date: Date;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const SprintProgressSnapshotSchema = new Schema<ISprintProgressSnapshotDocument>(
  {
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    completedPoints: {
      type: Number,
      default: 0,
    },
    remainingPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate snapshots per sprint on the same calendar day
SprintProgressSnapshotSchema.index({ sprintId: 1, date: 1 }, { unique: true });

export const SprintProgressSnapshot = model<ISprintProgressSnapshotDocument>(
  'SprintProgressSnapshot',
  SprintProgressSnapshotSchema
);

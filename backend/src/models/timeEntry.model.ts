import { Schema, Document, model, Types } from 'mongoose';

export type TimeEntrySource = 'Manual' | 'Timer' | 'Imported';
export type TimeEntryStatus = 'running' | 'paused' | 'stopped';

export interface ITimeEntryPayload {
  id: string;
  user: string | any;
  organization?: string | any;
  workspace?: string | any;
  project?: string | any;
  task?: string | any;
  assignment?: string | any;
  description: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  duration: number; // in seconds
  isBillable: boolean;
  billableRate: number;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  pausedAt?: string | Date | null;
  accumulatedTime: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeEntryDocument extends Document {
  user: Types.ObjectId;
  organization?: Types.ObjectId;
  workspace?: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  assignment?: Types.ObjectId;
  description: string;
  startTime: Date;
  endTime?: Date | null;
  duration: number; // in seconds
  isBillable: boolean;
  billableRate: number;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  pausedAt?: Date | null;
  accumulatedTime: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
  toPayload(): ITimeEntryPayload;
}

const TimeEntrySchema = new Schema<ITimeEntryDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'WorkAssignment',
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // Duration in seconds
      min: 0,
    },
    isBillable: {
      type: Boolean,
      default: true,
    },
    billableRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: ['Manual', 'Timer', 'Imported'],
      default: 'Manual',
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'stopped'],
      default: 'stopped',
      index: true,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    accumulatedTime: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TimeEntrySchema.index({ user: 1, status: 1 });
TimeEntrySchema.index({ user: 1, startTime: -1 });
TimeEntrySchema.index({ project: 1, startTime: -1 });
TimeEntrySchema.index({ task: 1, startTime: -1 });
TimeEntrySchema.index({ assignment: 1, startTime: -1 });
TimeEntrySchema.index({ workspace: 1, startTime: -1 });
TimeEntrySchema.index({ organization: 1, startTime: -1 });

TimeEntrySchema.methods.toPayload = function (): ITimeEntryPayload {
  return {
    id: this._id.toString(),
    user: this.user,
    organization: this.organization,
    workspace: this.workspace,
    project: this.project,
    task: this.task,
    assignment: this.assignment,
    description: this.description,
    startTime: this.startTime,
    endTime: this.endTime,
    duration: this.duration,
    isBillable: this.isBillable,
    billableRate: this.billableRate,
    source: this.source as TimeEntrySource,
    status: this.status as TimeEntryStatus,
    pausedAt: this.pausedAt,
    accumulatedTime: this.accumulatedTime,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const TimeEntry = model<ITimeEntryDocument>('TimeEntry', TimeEntrySchema);

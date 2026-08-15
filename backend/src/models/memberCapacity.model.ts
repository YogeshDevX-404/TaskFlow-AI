import { Schema, Document, model, Types } from 'mongoose';
import { WORKLOAD_DEFAULTS } from '../constants';

export interface IMemberCapacityPayload {
  id: string;
  user: string | any;
  organization: string | any;
  workspace?: string | any;
  weeklyCapacityHours: number;
  dailyCapacityHours: number;
  workingDays: string[];
  timezone: string;
  startOfWeek: string;
  endOfWeek: string;
  createdBy?: string | any;
  updatedBy?: string | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberCapacityDocument extends Document {
  user: Types.ObjectId;
  organization: Types.ObjectId;
  workspace?: Types.ObjectId;
  weeklyCapacityHours: number;
  dailyCapacityHours: number;
  workingDays: string[];
  timezone: string;
  startOfWeek: string;
  endOfWeek: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toPayload(): IMemberCapacityPayload;
}

const MemberCapacitySchema = new Schema<IMemberCapacityDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    weeklyCapacityHours: {
      type: Number,
      default: WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS,
      min: [0, 'Weekly capacity cannot be negative'],
    },
    dailyCapacityHours: {
      type: Number,
      default: WORKLOAD_DEFAULTS.DAILY_CAPACITY_HOURS,
      min: [0, 'Daily capacity cannot be negative'],
    },
    workingDays: {
      type: [String],
      default: [...WORKLOAD_DEFAULTS.WORKING_DAYS],
    },
    timezone: {
      type: String,
      default: WORKLOAD_DEFAULTS.TIMEZONE,
    },
    startOfWeek: {
      type: String,
      default: WORKLOAD_DEFAULTS.START_OF_WEEK,
    },
    endOfWeek: {
      type: String,
      default: WORKLOAD_DEFAULTS.END_OF_WEEK,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per user & organization
MemberCapacitySchema.index({ user: 1, organization: 1 }, { unique: true });
MemberCapacitySchema.index({ organization: 1, workspace: 1 });

MemberCapacitySchema.methods.toPayload = function (): IMemberCapacityPayload {
  return {
    id: this._id.toString(),
    user: this.user,
    organization: this.organization,
    workspace: this.workspace,
    weeklyCapacityHours: this.weeklyCapacityHours ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS,
    dailyCapacityHours: this.dailyCapacityHours ?? WORKLOAD_DEFAULTS.DAILY_CAPACITY_HOURS,
    workingDays: this.workingDays || [...WORKLOAD_DEFAULTS.WORKING_DAYS],
    timezone: this.timezone || WORKLOAD_DEFAULTS.TIMEZONE,
    startOfWeek: this.startOfWeek || WORKLOAD_DEFAULTS.START_OF_WEEK,
    endOfWeek: this.endOfWeek || WORKLOAD_DEFAULTS.END_OF_WEEK,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const MemberCapacity = model<IMemberCapacityDocument>(
  'MemberCapacity',
  MemberCapacitySchema
);
